// Vercel 서버리스 함수: POST /api/diagnosis-sheet
// 무료 가게 진단을 마친 고객의 결과를 알프스 구글 시트(시트 '진단리포트')에 한 줄로 남깁니다.
// - 고객 화면에는 아무것도 보여 주지 않습니다 (성공·실패 모두 조용히).
// - 2026-11-25: 구글 로그인 없이 이메일만 입력하는 방식으로 바뀌었습니다.
//   남기는 값은 '이메일 + 진단 결과 목록'뿐이며, 이름·전화번호·가게 이름·지역은 받지도 저장하지도 않습니다.
//
// 환경 변수 (Vercel → Settings → Environment Variables) — 없으면 아래 기본값으로 동작합니다.
//   DIAG_SHEET_URL      구글 Apps Script 웹 앱 주소 (docs/diagnosis-sheet.gs 를 배포해서 나온 주소)
//   DIAG_SHEET_SECRET   Apps Script 코드의 SECRET 과 같은 값
// 비밀값을 바꿀 때는 Apps Script 의 SECRET 을 먼저 바꾸고, 같은 값을 DIAG_SHEET_SECRET 환경 변수에 넣은 뒤 Redeploy 하세요.
// (환경 변수가 있으면 항상 환경 변수가 우선입니다.)

const DEFAULT_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxXMNmVRABroM3PPHmhxqxRC7geTYfNYHzjrVh2d8Ksvs9tJVen_FFFIvppeJMqC_gV/exec'
const DEFAULT_SHEET_SECRET = 'asdfghjklpoiuytrewq'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/

// 제어문자 제거 + 길이 제한
const S = (v, n = 300) =>
  String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, n)

// 같은 서버 인스턴스 안에서 IP당 1시간 20건까지 (간단한 남용 방지)
const hits = new Map()
const LIMIT = 20, WINDOW = 60 * 60 * 1000

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method' }) }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown'
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < WINDOW)
  if (list.length >= LIMIT) return res.status(429).json({ ok: false, error: 'rate_limited' })
  list.push(now); hits.set(ip, list)

  const b = typeof req.body === 'string' ? safeJson(req.body) : req.body || {}
  const email = S(b.email, 120)
  if (!EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: 'email' })

  // 시트로 보낼 한 줄 — 이메일과 진단 결과 목록만 담습니다.
  const row = {
    secret: process.env.DIAG_SHEET_SECRET || DEFAULT_SHEET_SECRET,
    id: S(b.id, 60),
    email,
    category: S(b.category, 40),
    total: S(b.total, 6),
    grade: S(b.grade, 30),
    summary: S(b.summary, 300),
    areas: (Array.isArray(b.areas) ? b.areas : []).slice(0, 10).map((a) => ({ label: S(a?.label, 20), score: S(a?.score, 6) })),
    value: S(b.value, 40),
    mineral: S(b.mineral, 40),
    strengths: S(b.strengths, 1200),
    missing: S(b.missing, 1200),
    weak: S(b.weak, 1200),
    planNow: S(b.planNow, 800),
    planMonth: S(b.planMonth, 800),
    planQuarter: S(b.planQuarter, 800),
    product: S(b.product, 400),
  }

  const url = process.env.DIAG_SHEET_URL || DEFAULT_SHEET_URL
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(row), redirect: 'follow' })
    const text = (await r.text()).trim().slice(0, 40)
    const ok = r.ok && (text === 'ok' || text === 'dup' || text.indexOf('"ok":true') !== -1)
    if (!ok) console.error('[diagnosis-sheet] Apps Script 응답 이상', r.status, text || '(빈 응답)')
    return res.status(ok ? 200 : 502).json({ ok, sheet: text || null, status: r.status })
  } catch (e) {
    console.error('[diagnosis-sheet] Apps Script 전송 실패', e?.message || e)
    return res.status(502).json({ ok: false, error: 'sheet_unreachable' })
  }
}

function safeJson(s) { try { return JSON.parse(s) } catch { return {} } }
