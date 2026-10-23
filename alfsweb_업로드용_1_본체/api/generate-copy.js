// Vercel 서버리스 함수: POST /api/generate-copy
// 업주가 올린 상품 사진(작게 줄인 JPEG)과 설명을 Claude에게 보내 홍보영상 문구를 받습니다.
// 필요한 환경 변수 (Vercel → Settings → Environment Variables):
//   ANTHROPIC_API_KEY   필수. 없으면 501을 돌려주고, 화면은 브라우저 기본 도우미로 문구를 만듭니다.
//   ANTHROPIC_MODEL     선택. 기본 claude-haiku-5-5 (빠르고 저렴, 사진 인식 가능)
import { SYSTEM_PROMPT, sanitizeCopy } from '../src/videomaker/copyRules.js'

const hits = new Map() // 같은 서버 인스턴스 안에서 IP당 1시간 30회까지 (간단한 남용 방지)
const LIMIT = 30, WINDOW = 60 * 60 * 1000

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'POST만 받습니다.' }) }
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return res.status(501).json({ error: 'AI 문구 생성이 아직 연결되지 않았습니다.' })

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW)
  if (list.length >= LIMIT) return res.status(429).json({ error: '잠시 후 다시 시도해 주세요.' })
  list.push(now); hits.set(ip, list)

  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body || {}
  const description = String(body.description || '').slice(0, 1200)
  const productName = String(body.productName || '').slice(0, 30)
  // 상품 사진 1장 + 설명서·라벨 사진 최대 3장
  const pics = [body.image, ...(Array.isArray(body.docs) ? body.docs.slice(0, 3) : [])]
    .map((x) => String(x || '').match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/))
    .filter(Boolean)
  if (!description.trim() && !pics.length) return res.status(400).json({ error: '사진이나 설명이 필요합니다.' })
  if (pics.reduce((n, m) => n + m[2].length, 0) > 4_000_000) return res.status(413).json({ error: '사진이 너무 큽니다.' })

  const content = []
  pics.forEach((m, i) => {
    content.push({ type: 'text', text: i === 0 && body.image ? '[상품 사진]' : '[설명서·라벨 사진]' })
    content.push({ type: 'image', source: { type: 'base64', media_type: m[1], data: m[2] } })
  })
  content.push({
    type: 'text',
    text: [
      productName && `상품·가게 이름: ${productName}`,
      description.trim() ? `업주가 쓴 설명:\n${description}` : '설명은 없습니다. 사진에 보이는 것만 근거로 쓰세요.',
      '위 내용으로 홍보영상 문구 JSON을 만들어 주세요.',
    ].filter(Boolean).join('\n\n'),
  })

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content }],
      }),
    })
    if (!r.ok) {
      console.error('anthropic', r.status, (await r.text()).slice(0, 300))
      return res.status(502).json({ error: 'AI 응답을 받지 못했습니다.' })
    }
    const data = await r.json()
    const text = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('')
    const json = safeJson(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1))
    if (!json) return res.status(502).json({ error: 'AI 응답을 읽지 못했습니다.' })
    return res.status(200).json(sanitizeCopy(json))
  } catch (err) {
    console.error(err)
    return res.status(502).json({ error: 'AI 연결에 실패했습니다.' })
  }
}

function safeJson(s) { try { return JSON.parse(s) } catch { return null } }
