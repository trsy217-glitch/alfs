import { asset } from '../lib/asset.js'

// 7단계 순환 엔진 — 마지막 단계(파트너 확장)가 다시 첫 단계로 고객을 데려오는 구조
export const engineSteps = [
  { t: '제품 발굴', img: 'images/engine/step1.webp', icon: 'images/engine/icon1.webp', alt: '돋보기로 제품을 살펴보는 모습', d: '매일 쓰고 다시 찾는 제품을 고릅니다' },
  { t: '콘텐츠 제작', img: 'images/engine/step2.webp', icon: 'images/engine/icon2.webp', alt: '삼각대 휴대폰으로 제품을 촬영하는 모습', d: '영상·SNS·상세페이지를 표준화합니다' },
  { t: '체험 고객 확보', img: 'images/engine/step3.webp', icon: 'images/engine/icon3.webp', alt: '체험 음료를 권하는 모습', d: '체험 카페·세미나로 첫 경험을 만듭니다' },
  { t: '상담·판매', img: 'images/engine/step4.webp', icon: 'images/engine/icon4.webp', alt: '고객에게 제품을 설명하고 결제하는 모습', d: '파트너샵과 공동구매로 판매합니다' },
  { t: '고객 DB', img: 'images/engine/step5.webp', icon: 'images/engine/icon5.webp', alt: '노트북에서 고객 목록을 살펴보는 모습', d: '누가, 언제, 왜 샀는지 쌓습니다' },
  { t: '재구매 관리', img: 'images/engine/step6.webp', icon: 'images/engine/icon6.webp', alt: '휴대폰으로 재구매 안내를 보내는 모습', d: '다시 찾을 때를 놓치지 않습니다' },
  { t: '파트너 확장', img: 'images/engine/step7.webp', icon: 'images/engine/icon7.webp', alt: '파트너와 악수하는 모습', d: '재구매 고객이 새 고객과 파트너가 됩니다' },
]

export default function EngineLoop() {
  const cx = 280, cy = 280, r = 200, nr = 56 // nr: 단계 원 반지름 (안에 아이콘)
  const n = engineSteps.length
  const pts = engineSteps.map((_, i) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180)
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  })
  const gap = 20 // 원과 화살표 사이 각도
  return (
    <svg viewBox="0 0 560 560" role="img" aria-label="알프스 재구매 엔진: 제품 발굴부터 파트너 확장까지 7단계가 순환합니다">
      <defs>
        <marker id="eng-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1 1L9 5L1 9z" fill="#A9D3EE" />
        </marker>
        {pts.map((p, i) => <clipPath key={i} id={`eng-c${i}`}><circle cx={p.x} cy={p.y} r={nr - 2} /></clipPath>)}
      </defs>
      {engineSteps.map((_, i) => {
        const step = 360 / n
        const a1 = (-90 + step * i + gap) * (Math.PI / 180)
        const a2 = (-90 + step * (i + 1) - gap) * (Math.PI / 180)
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1)
        const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2)
        return <path key={`a${i}`} d={`M${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke="#A9D3EE" strokeWidth="1.6" markerEnd="url(#eng-arrow)" />
      })}
      {pts.map((p, i) => {
        const last = i === n - 1
        const bx = p.x + nr * 0.72, by = p.y - nr * 0.72 // 번호 배지 (오른쪽 위)
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={nr} fill={last ? '#A9D3EE' : '#F2F3EE'} stroke={last ? '#A9D3EE' : 'rgba(242,243,238,.5)'} strokeWidth="2" />
            <image href={asset(engineSteps[i].icon)} x={p.x - nr * 0.92} y={p.y - nr * 0.86} width={nr * 1.84} height={nr * 1.84} preserveAspectRatio="xMidYMin meet" clipPath={`url(#eng-c${i})`} />
            <circle cx={bx} cy={by} r="15" fill={last ? '#F2F3EE' : '#4B2752'} stroke="#A9D3EE" strokeWidth="1.5" />
            <text x={bx} y={by + 5} textAnchor="middle" fontFamily="Unbounded, sans-serif" fontWeight="600" fontSize="14" fill={last ? '#33193A' : '#F2F3EE'}>{i + 1}</text>
          </g>
        )
      })}
      <text x={cx} y={cy - 18} textAnchor="middle" fill="#F2F3EE" fontSize="22" fontWeight="800">한 번 팔고 끝나지 않는</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#F2F3EE" fontSize="22" fontWeight="800">재구매 엔진</text>
      <text x={cx} y={cy + 46} textAnchor="middle" fill="rgba(242,243,238,.7)" fontSize="15">재구매 → 추천 → 파트너</text>
    </svg>
  )
}
