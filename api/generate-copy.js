// Vercel 서버리스 함수: POST /api/generate-copy
// 방문자가 고른 AI 엔진에 상품 사진(작게 줄인 JPEG)과 설명을 보내 홍보영상 문구를 받습니다.
//
// 비용 원칙: 알프스(사이트 운영자)는 과금되지 않습니다.
//   - 방문자가 자기 키(apiKey)를 보내면 그 키로만 중계하고, 키는 저장·기록하지 않습니다.
//   - 방문자 키가 없으면 서버 환경 변수 키가 있을 때만 그 키를 씁니다(운영자가 직접 넣은 경우).
//   - 둘 다 없으면 501과 함께 안내를 돌려주고, 화면은 브라우저 기본 도우미로 문구를 만듭니다.
//
// 선택 환경 변수 (없어도 방문자 키로 동작):
//   ANTHROPIC_API_KEY / ANTHROPIC_MODEL
//   OPENAI_API_KEY    / OPENAI_MODEL
//   GEMINI_API_KEY (또는 GOOGLE_API_KEY) / GEMINI_MODEL
import { SYSTEM_PROMPT, sanitizeCopy } from '../src/videomaker/copyRules.js'

const hits = new Map() // 같은 서버 인스턴스 안에서 IP당 1시간 30회까지 (간단한 남용 방지)
const LIMIT = 30, WINDOW = 60 * 60 * 1000

const ENV_KEY = {
  anthropic: () => process.env.ANTHROPIC_API_KEY,
  openai: () => process.env.OPENAI_API_KEY,
  gemini: () => process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
}

// 모델 이름이 바뀌어도 멈추지 않도록: 방문자 지정 → 서버 지정 → 기본 후보 순으로 시도
const MODELS = {
  anthropic: (m) => [m, process.env.ANTHROPIC_MODEL, 'claude-3-5-haiku-latest', 'claude-3-5-haiku-20241022', 'claude-3-haiku-20240307'],
  openai: (m) => [m, process.env.OPENAI_MODEL, 'gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4o'],
  gemini: (m) => [m, process.env.GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash'],
}

const NAMES = { anthropic: 'Claude', openai: 'ChatGPT', gemini: 'Gemini' }

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'POST만 받습니다.' }) }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW)
  if (list.length >= LIMIT) return res.status(429).json({ error: '잠시 후 다시 시도해 주세요.', code: 'rate_limited' })
  list.push(now); hits.set(ip, list)

  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body || {}
  if (!body || typeof body !== 'object') return res.status(400).json({ error: '요청을 읽지 못했습니다.' })

  const description = String(body.description || '').slice(0, 1200)
  const productName = String(body.productName || '').slice(0, 30)
  // 상품 사진 1장 + 설명서·라벨 사진 최대 3장
  const pics = [body.image, ...(Array.isArray(body.docs) ? body.docs.slice(0, 3) : [])]
    .map((x) => String(x || '').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/))
    .filter(Boolean)
  if (!description.trim() && !pics.length) return res.status(400).json({ error: '사진이나 설명이 필요합니다.' })
  if (pics.reduce((n, m) => n + m[2].length, 0) > 4_000_000) return res.status(413).json({ error: '사진이 너무 큽니다.' })

  // 방문자 키가 있으면 그 키만 사용. (형식이 이상하면 쓰지 않고 400)
  const visitorKey = String(body.apiKey || '').trim()
  if (visitorKey && (visitorKey.length < 8 || visitorKey.length > 300 || /\s/.test(visitorKey))) {
    return res.status(400).json({ error: '키 형식을 확인해 주세요.', code: 'bad_key' })
  }
  const provider = ['gemini', 'openai', 'anthropic'].includes(String(body.provider)) ? String(body.provider) : 'anthropic'
  const key = visitorKey || ENV_KEY[provider]?.() || ''
  if (!key) {
    return res.status(501).json({
      error: 'AI 문구 생성이 아직 연결되지 않았습니다. 영상 만들기 화면의 AI 설정에서 내 키를 넣어 주세요.',
      code: 'no_server_key',
    })
  }

  const contentText = [
    productName && `상품·가게 이름: ${productName}`,
    description.trim() ? `업주가 쓴 설명:\n${description}` : '설명은 없습니다. 사진에 보이는 것만 근거로 쓰세요.',
    '위 내용으로 홍보영상 문구 JSON을 만들어 주세요.',
  ].filter(Boolean).join('\n\n')

  const models = MODELS[provider](String(body.model || '').trim().slice(0, 60)).filter(Boolean)
    .filter((m, i, a) => a.indexOf(m) === i)

  try {
    let last = { status: 0, text: '' }
    for (const model of models) {
      const r = await callProvider(provider, key, model, pics, contentText)
      if (r.ok) {
        const json = extractJson(r.text)
        if (!json) return res.status(502).json({ error: 'AI 응답을 읽지 못했습니다.', code: 'bad_ai_json' })
        return res.status(200).json({ ...sanitizeCopy(json), provider, model })
      }
      last = { status: r.status, text: r.text }
      // 모델 이름이 없어서 난 오류일 때만 다음 후보로 (키·한도 오류는 그대로 안내)
      const notFound = r.status === 404 || /model_not_found|not found|NOT_FOUND|does not exist/i.test(r.text)
      if (!notFound) break
      console.error('generate-copy', provider, 'model fallback', r.status)
    }
    // 키는 로그·응답 어디에도 남기지 않습니다. 상태 코드만 남깁니다.
    console.error('generate-copy', provider, last.status)
    return res.status(statusFor(last.status)).json({ error: messageFor(provider, last.status), code: `upstream_${last.status || 'error'}` })
  } catch (err) {
    console.error('generate-copy', provider, 'exception', err?.name || 'error')
    return res.status(502).json({ error: 'AI 연결에 실패했습니다.', code: 'upstream_exception' })
  }
}

// ── 엔진별 요청 (모두 방문자/서버 키를 그 요청 한 번에만 씀) ──────────────
async function callProvider(provider, key, model, pics, contentText) {
  if (provider === 'gemini') {
    const parts = []
    pics.forEach((m, i) => {
      parts.push({ text: i === 0 && pics.length ? '[상품 사진]' : '[설명서·라벨 사진]' })
      parts.push({ inlineData: { mimeType: m[1], data: m[2] } })
    })
    parts.push({ text: contentText })
    return post(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      'content-type': 'application/json',
      'x-goog-api-key': key, // 주소창·로그에 키가 남지 않도록 헤더로
    }, {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1200, responseMimeType: 'application/json' },
    }, (data) => (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join(''))
  }

  if (provider === 'openai') {
    const content = []
    pics.forEach((m) => content.push({ type: 'image_url', image_url: { url: `data:${m[1]};base64,${m[2]}` } }))
    content.push({ type: 'text', text: contentText })
    return post('https://api.openai.com/v1/chat/completions', {
      'content-type': 'application/json',
      authorization: `Bearer ${key}`,
    }, {
      model, max_tokens: 1000, temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content }],
    }, (data) => data.choices?.[0]?.message?.content || '')
  }

  const content = []
  pics.forEach((m, i) => {
    content.push({ type: 'text', text: i === 0 && pics.length ? '[상품 사진]' : '[설명서·라벨 사진]' })
    content.push({ type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } })
  })
  content.push({ type: 'text', text: contentText })
  return post('https://api.anthropic.com/v1/messages', {
    'content-type': 'application/json',
    'x-api-key': key,
    'anthropic-version': '2023-06-01',
  }, {
    model, max_tokens: 1000, system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content }],
  }, (data) => (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join(''))
}

async function post(url, headers, body, readText) {
  const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
  if (!r.ok) {
    const text = await r.text().catch(() => '')
    return { ok: false, status: r.status, text: String(text).slice(0, 400) }
  }
  const data = await r.json().catch(() => null)
  return { ok: true, status: 200, text: data ? String(readText(data) || '') : '', data }
}

function statusFor(status) {
  if (status === 401 || status === 403) return 401
  if (status === 429) return 429
  return 502
}

function messageFor(provider, status) {
  const name = NAMES[provider] || 'AI'
  if (status === 401 || status === 403) return `${name} 키가 올바르지 않거나 사용 권한이 없습니다. AI 설정에서 키를 다시 확인해 주세요.`
  if (status === 429) return `${name} 사용 한도에 걸렸습니다. 잠시 후 다시 시도해 주세요.`
  return `${name} 응답을 받지 못했습니다. 잠시 후 다시 시도해 주세요.`
}

function extractJson(text) {
  const s = String(text || '')
  const a = s.indexOf('{'), b = s.lastIndexOf('}')
  if (a < 0 || b <= a) return null
  return safeJson(s.slice(a, b + 1))
}

function safeJson(s) { try { return JSON.parse(s) } catch { return null } }
