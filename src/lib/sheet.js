// 진단 결과를 알프스 구글 시트에 한 줄로 남깁니다 (고객 화면에는 표시하지 않음).
// 흐름: 브라우저 → /api/diagnosis-sheet → 구글 Apps Script 웹 앱 → 시트 '진단리포트'
// 남기는 것: 이메일 주소 + 진단 결과 목록만. 이름·전화번호·가게 이름·지역 등은 보내지 않습니다.
// 시트 주소·비밀값은 서버 환경 변수에만 있어 브라우저 코드에 드러나지 않습니다.
import { resultFields } from '../diagnosis/resultText.js'

export async function sendToSheet({ id, email, result }) {
  try {
    if (!email) return
    const f = resultFields(result)
    const body = { id, email, ...f }
    const resp = await fetch('/api/diagnosis-sheet', {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    // 고객 화면에는 알리지 않지만, 회사 측 시트 기록이 실패하면 개발자 도구 콘솔에 남깁니다.
    if (!resp.ok) console.warn('[alfs] 진단 시트 기록 실패', resp.status, await resp.text().catch(() => ''))
  } catch (e) { console.warn('[alfs] 진단 시트 기록 실패', e?.message || e) }
}
