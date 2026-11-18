// ─────────────────────────────────────────────────────────────
// AI 엔진 호출 (문구 생성)
// · Gemini · ChatGPT · Claude : 알프스 /api/generate-copy 를 거쳐 방문자 키로 중계
//   (키는 서버에 저장·기록하지 않고 그 요청 한 번에만 씁니다)
// · LM Studio · Ollama : 브라우저에서 방문자 PC의 로컬 주소로 바로 호출
// ─────────────────────────────────────────────────────────────
import { SYSTEM_PROMPT } from './copyRules.js'

export const LOCAL_HELP = 'LM Studio에서 서버를 켜고(Local Server → Start), 모델을 하나 불러와 주세요. Ollama는 `ollama serve` 뒤 `ollama pull llama3.1:8b` 처럼 모델을 받아 두면 됩니다. 브라우저가 https 사이트에서 내 PC 주소를 막으면 Ollama는 OLLAMA_ORIGINS=* 로 실행해 주세요.'

// 로컬 주소 정리: http://127.0.0.1:11434 → http://127.0.0.1:11434/v1
export function localBase(baseUrl = '') {
  const base = String(baseUrl || '').trim().replace(/\s+/g, '').replace(/\/+$/, '')
  if (!base) return ''
  if (/\/v1$/i.test(base)) return base
  if (/\/v1\//i.test(base)) return base.replace(/\/v1\/.*$/i, '/v1')
  return base + '/v1'
}

export function userPrompt({ description = '', productName = '', ocrText = '', photoCount = 0 }) {
  return [
    productName && `상품·가게 이름: ${productName}`,
    description.trim() ? `업주가 쓴 설명:\n${description.trim()}` : '',
    ocrText.trim() ? `사진에서 읽은 글자(설명서·라벨):\n${ocrText.trim()}` : '',
    !description.trim() && !ocrText.trim() && photoCount
      ? '설명은 없습니다. 사진에 보이는 것만 근거로 쓰세요.'
      : '',
    '위 내용으로 홍보영상 문구 JSON을 만들어 주세요.',
  ].filter(Boolean).join('\n\n')
}

// AI가 코드블록이나 군더더기를 붙여도 JSON만 꺼내기
export function extractJson(text = '') {
  const s = String(text)
  const a = s.indexOf('{'), b = s.lastIndexOf('}')
  if (a < 0 || b <= a) return null
  try { return JSON.parse(s.slice(a, b + 1)) } catch { return null }
}

async function readError(res) {
  try {
    const data = await res.json()
    return { message: String(data?.error || ''), code: data?.code || '' }
  } catch { return { message: '', code: '' } }
}

// 클라우드 엔진: 알프스 서버 중계 (CORS 문제 없이 모든 엔진이 같은 방식으로 동작)
export async function askCloud({ provider, apiKey = '', model = '', description = '', productName = '', image = '', docs = [] }) {
  const res = await fetch(new URL('/api/generate-copy', window.location.origin).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider, apiKey, model,
      description: String(description).slice(0, 1200),
      productName: String(productName).slice(0, 30),
      image: image || '',
      docs: Array.isArray(docs) ? docs.slice(0, 3) : [],
    }),
    signal: AbortSignal.timeout?.(60000),
  })
  if (!res.ok) {
    const { message, code } = await readError(res)
    const err = new Error(message || 'AI 응답을 받지 못했습니다.')
    err.code = code || `http_${res.status}`
    err.status = res.status
    throw err
  }
  return res.json()
}

// 로컬 엔진 연결 확인 (LM Studio · Ollama 모두 OpenAI 호환 /models 를 제공)
export async function probeLocal(baseUrl) {
  const base = localBase(baseUrl)
  if (!base) return { ok: false, models: [], error: '내 PC의 AI 주소를 먼저 넣어 주세요.' }
  try {
    const res = await fetch(`${base}/models`, { signal: AbortSignal.timeout?.(8000) })
    if (!res.ok) return { ok: false, models: [], error: `로컬 AI가 응답했지만 주소를 확인해 주세요. (${res.status})` }
    const data = await res.json().catch(() => ({}))
    const models = (data?.data || data?.models || [])
      .map((m) => (typeof m === 'string' ? m : m?.id || m?.name || ''))
      .filter(Boolean)
    return { ok: true, models }
  } catch {
    return { ok: false, models: [], error: '내 PC의 로컬 AI에 연결하지 못했습니다. 서버가 켜져 있는지, 주소가 맞는지 확인해 주세요.' }
  }
}

// 로컬 엔진: 브라우저 → 방문자 PC (키 없음, OpenAI 호환 /chat/completions)
export async function askLocal({ baseUrl, model = '', description = '', productName = '', ocrText = '', photoCount = 0 }) {
  const base = localBase(baseUrl)
  if (!base) throw Object.assign(new Error('AI 설정에서 내 PC의 AI 주소를 넣어 주세요.'), { code: 'local_no_base' })
  let res
  try {
    res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || undefined,
        temperature: 0.7,
        max_tokens: 800,
        stream: false,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt({ description, productName, ocrText, photoCount }) },
        ],
      }),
      signal: AbortSignal.timeout?.(90000),
    })
  } catch {
    throw Object.assign(new Error('내 PC의 로컬 AI에 연결하지 못했습니다. 서버가 켜져 있는지, 주소가 맞는지 확인해 주세요.'), { code: 'local_unreachable' })
  }
  if (!res.ok) {
    const { message } = await readError(res)
    throw Object.assign(new Error(message || '로컬 AI가 응답하지 않았습니다. 모델 이름을 확인해 주세요.'), { code: `local_http_${res.status}` })
  }
  const data = await res.json().catch(() => null)
  const text = data?.choices?.[0]?.message?.content
    || data?.message?.content // Ollama 네이티브 형식으로 답한 경우
    || ''
  const json = extractJson(typeof text === 'string' ? text : '')
  if (!json) throw Object.assign(new Error('로컬 AI의 답을 문구로 읽지 못했습니다. 모델을 바꾸거나 기본 문구를 써 주세요.'), { code: 'local_bad_json' })
  return json
}
