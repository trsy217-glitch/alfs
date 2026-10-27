import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// 사이트를 새로 열면(PC·모바일 모두) 항상 홈 화면부터 보여 줍니다.
// - 브라우저 탭에서 처음 연 순간에만 홈으로 보내고, 그다음 사이트 안 이동은 그대로 둡니다.
// - 주소 끝에 ?stay 를 붙이면 그 페이지에 그대로 머뭅니다 (예: 홍보용 링크 /video-maker?stay).
// - 로그인 화면(Google 로그인 후 돌아오는 곳)은 예외입니다.
// - 검색(구글·네이버·다음·빙 등)이나 AI 검색에서 들어온 사람, 검색 로봇은 찾던 페이지에 그대로 둡니다.
const KEY = 'alfs_opened'
const BOT = /bot|crawl|spider|slurp|yeti|daum|bingpreview|google|naver|lighthouse|headless/i
const SEARCH = /(google|naver|daum|bing|yahoo|zum|duckduckgo|chatgpt|openai|perplexity|claude|gemini|copilot)\./i
const fromSearch = () => {
  if (BOT.test(navigator.userAgent || '')) return true
  try { return SEARCH.test(new URL(document.referrer).hostname) } catch { return false }
}

export default function HomeFirst() {
  const nav = useNavigate()
  const { pathname, search } = useLocation()
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'
    let first = true
    try { first = !sessionStorage.getItem(KEY); sessionStorage.setItem(KEY, '1') } catch { /* 저장소를 못 쓰는 환경은 매번 처음으로 봄 */ }
    if (first && !fromSearch() && pathname !== '/' && pathname !== '/login' && !new URLSearchParams(search).has('stay')) nav('/', { replace: true })
    window.scrollTo(0, 0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
