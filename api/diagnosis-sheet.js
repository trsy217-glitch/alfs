// Vercel 서버리스 함수: POST /api/diagnosis-sheet
// 로그인한 고객이 진단을 마치면 그 결과를 알프스 구글 시트(시트 '진단리포트')에 한 줄로 남깁니다.
// - 고객 화면에는 아무것도 보여 주지 않습니다 (성공·실패 모두 조용히).
// - 실제 Google 로그인 토큰을 Firebase 로 확인한 사람의 것만 받습니다. 이메일은 토큰에서 꺼내므로 위조할 수 없습니다.
//
// 환경 변수 (Vercel → Settings → Environment Variables) — 없으면 아래 기본값으로 동작합니다.
//   DIAG_SHEET_URL      구글 Apps Script 웹 앱 주소 (docs/diagnosis-sheet.gs 를 배포해서 나온 주소)
//   DIAG_SHEET_SECRET   Apps Script 코드의 SECRET 과 같은 값
//   FIREBASE_API_KEY    (없으면 VITE_FIREBASE_API_KEY, 그것도 없으면 아래 기본값)
// 비밀값을 바꿀 때는 Apps Script 의 SECRET 을 먼저 바꾸고, 같은 값을 DIAG_SHEET_SECRET 환경 변수에 넣은 뒤 Redeploy 하세요.
// (환경 변수가 있으면 항상 환경 변수가 우선입니다.)

const DEFAULT_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxXMNmVRABroM3PPHmhxqxRC7geTYfNYHzjrVh2d8Ksvs9tJVen_FFFIvppeJMqC_gV/exec'
const DEFAULT_SHEET_SECRET = 'asdfghjklpoiuytrewq'
const DEFAULT_FIREBASE_API_KEY = 'AIzaSyCye3Pxjp2-XVHGqq_wlc4-QV0SZCbTC5k'

const S = (v, n = 300) => String(v ?? '').slice(0, n)

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
  const url = process.env.DIAG_SHEET_URL || DEFAULT_SHEET_URL
  const secret = process.env.DIAG_SHEET_SECRET || DEFAULT_SHEET_SECRET
  const apiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_API_KEY
  const usingDefault = !process.env.DIAG_SHEET_SECRET

  // 1) 로그인 토큰 확인 → 이메일·uid 는 Firebase 가 돌려준 값만 씀
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ ok: false, error: 'no_token' })
  let who
  try {
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token }),
    })
    who = (await r.json())?.users?.[0]
  } catch { /* 아래에서 401 */ }
  if (!who?.localId) return res.status(401).json({ ok: false, error: 'invalid_token' })

  // 2) 시트로 보낼 한 줄
  const b = typeof req.body === 'string' ? safeJson(req.body) : req.body || {}
  const row = {
    secret,
    id: S(b.id, 60), uid: who.localId, email: S(who.email, 120), name: S(b.name || who.displayName, 60),
    shopName: S(b.shopName, 60), region: S(b.region, 60), category: S(b.category, 40), size: S(b.size, 40), worry: S(b.worry, 200),
    total: S(b.total, 6), grade: S(b.grade, 30), summary: S(b.summary, 300),
    areas: (Array.isArray(b.areas) ? b.areas : []).slice(0, 10).map((a) => ({ label: S(a?.label, 20), score: S(a?.score, 6) })),
    value: b.value ? `${S(b.value.value, 8)} (${S(b.value.level, 30)})` : '',
    mineral: S(b.mineral, 40),
    qa: (Array.isArray(b.qa) ? b.qa : []).slice(0, 40).map((x) => `${S(x?.[0], 120)}: ${S(x?.[1], 200)}`).join('\n'),
  }

  // 3) Apps Script 웹 앱으로 전달 — 결과를 확인해서 실패는 숨기지 않고 남깁니다 (고객 화면은 그대로).
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(row), redirect: 'follow' })
    const text = (await r.text()).trim().slice(0, 40)
    const ok = r.ok && (text === 'ok' || text === 'dup')
    if (!ok) console.error('[diagnosis-sheet] Apps Script 응답 이상', r.status, text || '(빈 응답)', usingDefault ? '(기본 비밀값 사용 중)' : '')
    return res.status(ok ? 200 : 502).json({ ok, sheet: text || null, status: r.status })
  } catch (e) {
    console.error('[diagnosis-sheet] Apps Script 전송 실패', e?.message || e)
    return res.status(502).json({ ok: false, error: 'sheet_unreachable' })
  }
}

function safeJson(s) { try { return JSON.parse(s) } catch { return {} } }
