// Vercel 서버리스 함수: POST /api/partner-sheet
// alfs.kr/partner 의 '대리점·총판 입점 상담' 창에서 보낸 내용을 알프스 구글 시트에 한 줄로 남깁니다.
//    브라우저 → 이 함수(검증·정리) → 구글 Apps Script 웹 앱 → 시트 '접수'
// 시트 주소와 비밀값은 서버에만 있고 브라우저 코드에는 들어가지 않습니다.
//
// 환경 변수 (Vercel → Settings → Environment Variables). 없으면 아래 기본값으로 동작합니다.
//   PARTNER_SHEET_URL     Apps Script 웹 앱 주소
//   PARTNER_SHEET_SECRET  Apps Script 의 SECRET 과 같은 값
// 값을 바꿀 때는 Apps Script 의 SECRET 을 먼저 바꾸고, 같은 값을 환경 변수에 넣은 뒤 Redeploy 하세요.

const DEFAULT_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyDg5GmmL1qTLpGrqAHVK45KeHiZP-wxuk4kkb8_0FMYq-LbDQKsItkoFUsl0f6N_vb/exec'
const DEFAULT_SHEET_SECRET = 'alfs-partner-2026-7f3k9q'

const KINDS = ['대리점', '총판', '샵인샵', '기타']

// 같은 서버 인스턴스 안에서 IP당 1시간 10건까지 (간단한 남용 방지)
const hits = new Map()
const LIMIT = 10, WINDOW = 60 * 60 * 1000

// 제어문자 제거 + 길이 제한
const S = (v, n = 300) =>
  String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, n)

const phoneOk = (p) => /^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(String(p).replace(/\s/g, ''))

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method' }) }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW)
  if (list.length >= LIMIT) return res.status(429).json({ ok: false, error: 'rate_limited' })
  list.push(now); hits.set(ip, list)

  const b = typeof req.body === 'string' ? safeJson(req.body) : req.body || {}

  // 숨은 칸(허니팟)에 값이 있으면 사람이 쓴 글이 아님 → 조용히 성공으로 응답하고 저장하지 않습니다.
  if (S(b.company, 40)) return res.status(200).json({ ok: true })

  const name = S(b.name, 60)
  const phone = S(b.phone, 20)
  if (!name) return res.status(400).json({ ok: false, error: 'name' })
  if (!phoneOk(phone)) return res.status(400).json({ ok: false, error: 'phone' })

  const row = {
    secret: process.env.PARTNER_SHEET_SECRET || DEFAULT_SHEET_SECRET,
    id: S(b.id, 60) || randomId(),
    kind: KINDS.includes(S(b.kind, 10)) ? S(b.kind, 10) : '기타',
    product: S(Array.isArray(b.product) ? b.product.join(', ') : b.product, 120),
    name,
    phone,
    region: S(b.region, 80),
    message: S(b.message, 1500),
    page: S(b.page, 200),
  }

  const url = process.env.PARTNER_SHEET_URL || DEFAULT_SHEET_URL
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(row),
      redirect: 'follow',
    })
    const text = (await r.text()).trim().slice(0, 120)
    let ok = false
    try { ok = !!JSON.parse(text)?.ok } catch { ok = text === 'ok' }
    if (!ok) console.error('[partner-sheet] Apps Script 응답 이상', r.status, text || '(빈 응답)')
    if (!ok) return res.status(502).json({ ok: false, error: 'sheet_failed' })
    return res.status(200).json({ ok: true, id: row.id })
  } catch (e) {
    console.error('[partner-sheet] Apps Script 전송 실패', e?.message || e)
    return res.status(502).json({ ok: false, error: 'sheet_unreachable' })
  }
}

function safeJson(s) { try { return JSON.parse(s) } catch { return {} } }
function randomId() {
  try { return 'p' + globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 20) } catch { return 'p' + Date.now().toString(36) }
}
