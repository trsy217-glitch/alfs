import { useEffect, useRef, useState } from 'react'
import { asset } from '../lib/asset.js'

// 네 단계가 서로 이어져 굴러가는 순환 카드
//   1 ──▶ 2
//   ▲  ↻  │
//   │     ▼
//   4 ◀── 3
// 사진이 주인공이고 글은 부가 설명. 강조가 1→2→3→4→1 순서로 돌고, 화면 밖이거나 '동작 줄이기'면 멈춥니다.
export default function LoopCycle({ items, label = '순환 단계' }) {
  const [active, setActive] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    let timer = null
    const start = () => { if (!timer) timer = setInterval(() => setActive((a) => (a + 1) % items.length), 2600) }
    const stop = () => { clearInterval(timer); timer = null }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.25 })
    if (ref.current) io.observe(ref.current)
    return () => { stop(); io.disconnect() }
  }, [items.length])

  // 그리드 자리: 시계 방향으로 1(왼위) 2(오위) 3(오아래) 4(왼아래)
  const slots = ['c1', 'c2', 'c3', 'c4']
  const arrows = [
    { cls: 'a12', dir: 'right' }, { cls: 'a23', dir: 'down' }, { cls: 'a34', dir: 'left' }, { cls: 'a41', dir: 'up' },
  ]
  return (
    <div className="loop" ref={ref} role="list" aria-label={label}>
      {items.map((it, i) => (
        <figure key={it.t} role="listitem" className={`loop__card loop__${slots[i]} ${i === active ? 'on' : ''}`}
          onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} tabIndex={0}>
          <div className="loop__img"><img src={asset(it.img)} alt={it.alt} width="960" height="640" loading="lazy" /></div>
          <figcaption>
            <span className="loop__n">{String(i + 1).padStart(2, '0')} · {it.en}</span>
            <b>{it.t}</b>
            <span className="loop__d">{it.d}</span>
          </figcaption>
        </figure>
      ))}
      {arrows.map((a, i) => (
        <span key={a.cls} className={`loop__arrow loop__${a.cls} loop__arrow--${a.dir} ${i === active ? 'on' : ''}`} aria-hidden="true">
          <svg viewBox="0 0 48 48"><path d="M8 24h28M26 13l11 11-11 11" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
      ))}
      <span className="loop__hub" aria-hidden="true">
        <svg viewBox="0 0 64 64"><path d="M50 32a18 18 0 1 1-5.3-12.7" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /><path d="M46 10v10H36" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    </div>
  )
}
