import { useEffect, useRef, useState } from 'react'
import { asset } from '../lib/asset.js'

// 첫 화면 맨 위 3D 'ALFS 알프스' 로고 영상 (블렌더 EEVEE 렌더 · 1920×1080 · 7초)
// 페이지에 들어오면 소리 없이 한 번 재생하고, 끝나면 로고가 완성된 마지막 장면에서 멈춥니다.
// '동작 줄이기' 설정이면 재생하지 않고 완성된 로고 장면(poster)만 보여 줍니다.
// 파일: public/video/alfs-logo-3d.{webm,mp4} · alfs-logo-3d-poster.webp
export default function LogoFilm() {
  const ref = useRef(null)
  const [ended, setEnded] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setEnded(true); return }
    v.play().catch(() => setEnded(true))
  }, [])

  const replay = () => {
    const v = ref.current
    v.currentTime = 0
    v.play().then(() => setEnded(false)).catch(() => {})
  }

  return (
    <section className="logofilm">
      <video
        ref={ref}
        className="logofilm__video"
        poster={asset('video/alfs-logo-3d-poster.webp')}
        muted
        playsInline
        preload="auto"
        width="1920"
        height="1080"
        aria-label="ALFS 알프스 3D 로고 영상"
        onEnded={() => setEnded(true)}
      >
        <source src={asset('video/alfs-logo-3d.webm')} type="video/webm" />
        <source src={asset('video/alfs-logo-3d.mp4')} type="video/mp4" />
      </video>
      {ended && (
        <button type="button" className="promo__toggle" onClick={replay} aria-label="로고 영상 다시 보기">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
        </button>
      )}
    </section>
  )
}
