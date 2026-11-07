// 진단이 끝나면 알프스 구글 시트에 한 줄로 남깁니다 (고객 화면에는 표시하지 않음).
// 흐름: 브라우저 → /api/diagnosis-sheet (로그인 토큰 확인) → 구글 Apps Script 웹 앱 → 시트 '진단리포트'
// 시트 주소·비밀값은 서버 환경 변수에만 있어 브라우저 코드에 드러나지 않습니다.
import { auth } from './firebase.js'
import { STEPS, questionsOf, categoryById } from '../diagnosis/questions.js'

// 문항 → 사람이 읽을 수 있는 "질문: 답" 목록
function readable(answers) {
  const out = []
  STEPS.forEach((s) => questionsOf(s, answers.category).forEach((q) => {
    const v = answers[q.id]
    if (v == null || v === '' || (Array.isArray(v) && !v.length)) return
    let a = v
    if (q.type === 'category') a = categoryById(v)?.name || v
    else if (q.o) a = (Array.isArray(v) ? v : [v]).map((x) => q.o.find((o) => o.v === x)?.l || x).join(', ')
    out.push([q.q, String(a)])
  }))
  return out
}

export async function sendToSheet(id, answers, result) {
  try {
    const u = auth?.currentUser
    if (!u) return
    const token = await u.getIdToken()
    const r = result || {}
    const body = {
      id,
      name: u.displayName || '',
      shopName: r.profile?.shopName || answers.shopName || '',
      region: r.profile?.region || '',
      category: r.profile?.categoryName || answers.category || '',
      size: r.profile?.size || '',
      worry: r.profile?.worry || '',
      total: r.total ?? '',
      grade: r.grade || '',
      summary: r.summary || '',
      areas: (r.areas || []).map((a) => ({ label: a.label, score: a.score })),
      value: r.value ? { value: r.value.value, level: r.value.level } : null,
      mineral: r.mineral ? `${r.mineral.score} (${r.mineral.level})` : '',
      qa: readable(answers),
    }
    await fetch('/api/diagnosis-sheet', {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
  } catch { /* 조용히 무시 — 고객 진단 흐름은 그대로 */ }
}
