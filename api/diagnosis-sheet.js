// Vercel 서버리스 함수: POST /api/diagnosis-sheet
// 로그인한 고객이 진단을 마치면 그 결과를 알프스 구글 시트(시트 '진단리포트')에 한 줄로 남깁니다.
// - 고객 화면에는 아무것도 보여 주지 않습니다 (성공·실패 모두 조용히).
// - 실제 Google 로그인 토큰을 Firebase 로 확인한 사람의 것만 받습니다. 이메일은 토큰에서 꺼내므로 위조할 수 없습니다.
// 필요한 환경 변수 (Vercel → Settings → Environment Variables):
//   DIAG_SHEET_URL      필수. 구글 Apps Script 웹 앱 주소 (docs/diagnosis-sheet.gs 를 배포해서 나온 주소)
//   DIAG_SHEET_SECRET   필수. 아무 긴 문자열. Apps Script 코드의 SECRET 과 똑같이 맞춥니다.
//   VITE_FIREBASE_API_KEY  (이미 있는 값 그대로 사용)

const S = (v, n = 300) => String(v ?? '').slice(0, n)

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end() }
  const url = process.env.DIAG_SHEET_URL, secret = process.env.DIAG_SHEET_SECRET
  const apiKey = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY
  if (!url || !secret || !apiKey) return res.status(204).end()

  // 1) 로그인 토큰 확인 → 이메일·uid 는 Firebase 가 돌려준 값만 씀
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).end()
  let who
  try {
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: token }),
    })
    who = (await r.json())?.users?.[0]
  } catch { /* 아래에서 401 */ }
  if (!who?.localId) return res.status(401).end()

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
  try {
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(row), redirect: 'follow' })
  } catch { /* 시트가 잠시 안 되면 건너뜀 (원본은 Firestore 에 그대로 있음) */ }
  return res.status(204).end()
}

function safeJson(s) { try { return JSON.parse(s) } catch { return {} } }
