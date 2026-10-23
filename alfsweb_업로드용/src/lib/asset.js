// 배포 경로(base)에 상관없이 public 폴더 파일을 가리킵니다
export const asset = (p) => import.meta.env.BASE_URL + p.replace(/^\//, '')

// 같은 페이지 안의 섹션으로 부드럽게 이동 (해시 라우터와 충돌하지 않도록 # 링크 대신 사용)
export const scrollToId = (id) => {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
