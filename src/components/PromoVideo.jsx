import { useEffect, useRef, useState } from 'react'
import { asset } from '../lib/asset.js'

// 오륜미네랄 10초 홍보 영상 (5초 버전 파일도 public/video 에 함께 있습니다) — 페이지에 들어오면 소리 없이 바로 반복 재생됩니다.
// 영상 원본 코드: video/src/OryunPromo.tsx (Remotion). 다시 만들려면 video 폴더에서 npm run render · npm run render:webm
export default function PromoVideo() {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    // 움직임 줄이기 설정을 켠 사람에게는 자동 재생하지 않고 첫 화면만 보여 줍니다.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    v.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [])

  const toggle = () => {
    const v = ref.current
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {})
    else { v.pause(); setPlaying(false) }
  }

  return (
    <figure className="promo">
      <video
        ref={ref}
        className="promo__video"
        poster={asset('video/oryun-promo-poster.webp')}
        muted
        loop
        playsInline
        preload="auto"
        width="1280"
        height="720"
        aria-label="오륜미네랄 10초 홍보 영상"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={asset('video/oryun-promo-10s.webm')} type="video/webm" />
        <source src={asset('video/oryun-promo-10s.mp4')} type="video/mp4" />
      </video>
      <button type="button" className="promo__toggle" onClick={toggle} aria-label={playing ? '영상 일시정지' : '영상 재생'}>
        {playing
          ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>}
      </button>
      <figcaption className="sr-only">
        오륜미네랄 병이 떠오르고, 양옆에 9대 한의 가문의 비방, 뽕잎 먹은 누에에서, 국제 발명전 금메달, 50여 종 바이오 미네랄, 발명특허 제1541516호, 물·요리·쉐이크로 매일 문구가 차례로 나타납니다. 마지막에 생명의 원소, 오륜미네랄. 수상과 특허는 제조사 유디아미네랄이 보유한 것입니다.
      </figcaption>
    </figure>
  )
}
