// ─────────────────────────────────────────────────────────────
// 토스페이먼츠 결제창 설정 (v2 표준 SDK · 결제창(구버전) 방식)
//  · 결제창 스크립트: https://js.tosspayments.com/v2/standard
//  · 비회원 결제: customerKey 에 TossPayments.ANONYMOUS 를 넣습니다. (로그인 불필요)
//  · 클라이언트 키는 Vercel 환경변수 VITE_TOSS_CLIENT_KEY 하나로 갈아끼웁니다.
//    값이 없으면 토스페이먼츠 공식 문서의 테스트 키로 결제창이 열립니다(실제 결제 없음).
//  · 실제 승인(매출 확정)은 서버 함수 api/toss/confirm.js 가 TOSS_SECRET_KEY 로 처리합니다.
//    키를 바꿀 때는 클라이언트 키와 시크릿 키를 같은 상점(테스트/라이브) 것으로 함께 바꿔야 합니다.
// ─────────────────────────────────────────────────────────────

// 토스페이먼츠 개발자센터(trsy217@gmail.com 계정) → API 키 → 테스트 → 'API 개별 연동 키'(기존 결제창) 클라이언트 키.
// 우리가 쓰는 결제창(구버전) 방식이 이 키를 씁니다. (주문서형·결제창형 키 test_gck_… 는 다른 제품이라 쓰지 않습니다)
// 상점 고유 MID 키는 전자결제 계약이 끝난 뒤 이 자리에 들어가므로, 그때 Vercel 환경변수 VITE_TOSS_CLIENT_KEY 로 갈아끼우면 됩니다.
export const TOSS_TEST_CLIENT_KEY = 'test_ck_vZnjEJeQVxJKewQ5jeZ98PmOoBN0'

const fromEnv = (import.meta.env?.VITE_TOSS_CLIENT_KEY || '').trim()

export const TOSS_CLIENT_KEY = fromEnv || TOSS_TEST_CLIENT_KEY
// 테스트 키로 동작 중인지 (테스트 결제는 실제로 청구되지 않습니다)
export const TOSS_IS_TEST = TOSS_CLIENT_KEY.startsWith('test_')
export const TOSS_SDK_URL = 'https://js.tosspayments.com/v2/standard'

// 결제창 스크립트를 한 번만 불러옵니다.
let loading = null
export function loadTossPayments() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no_window'))
  if (window.TossPayments) return Promise.resolve(window.TossPayments)
  if (loading) return loading
  loading = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = TOSS_SDK_URL
    s.async = true
    s.onload = () => (window.TossPayments ? resolve(window.TossPayments) : reject(new Error('sdk_missing')))
    s.onerror = () => { loading = null; reject(new Error('sdk_load_failed')) }
    document.head.appendChild(s)
  })
  return loading
}

// 토스 주문번호: 영문 대소문자·숫자·- _ = 로 6~64자
export const newOrderId = () =>
  `alfs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

// ── 주문 내용 보관 ──
// 결제창에서 돌아온 뒤(성공·실패 화면) 주문 내용을 보여 주고, 결제 금액을 다시 대조하는 데 씁니다.
// 같은 브라우저의 주문만 읽고, 하루가 지난 기록은 지웁니다.
const KEY = (orderId) => `alfs.order.${orderId}`
const DAY = 24 * 60 * 60 * 1000

export function saveOrder(draft) {
  if (typeof window === 'undefined' || !draft?.orderId) return
  try {
    localStorage.setItem(KEY(draft.orderId), JSON.stringify({ ...draft, savedAt: Date.now() }))
    // 묵은 기록 정리 (실패해도 주문 진행에는 영향 없음)
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const k = localStorage.key(i)
      if (!k || !k.startsWith('alfs.order.')) continue
      try {
        const v = JSON.parse(localStorage.getItem(k) || 'null')
        if (!v?.savedAt || Date.now() - v.savedAt > DAY) localStorage.removeItem(k)
      } catch { localStorage.removeItem(k) }
    }
  } catch { /* 저장 공간이 없는 브라우저는 화면 표시만으로 진행 */ }
}

export function readOrder(orderId) {
  if (typeof window === 'undefined' || !orderId) return null
  try {
    const v = JSON.parse(localStorage.getItem(KEY(orderId)) || 'null')
    return v && typeof v === 'object' ? v : null
  } catch { return null }
}

// 결제 실패 화면에서 "무엇을 주문하려 했는지" 보여 줄 때 쓰는 마지막 주문
export const LAST_ORDER_KEY = 'alfs.order.last'
export const rememberLastOrder = (orderId) => {
  try { localStorage.setItem(LAST_ORDER_KEY, orderId) } catch { /* 무시 */ }
}
