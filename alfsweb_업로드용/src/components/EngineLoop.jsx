// 7단계 순환 엔진 — 마지막 단계(파트너 확장)가 다시 첫 단계로 고객을 데려오는 구조
export const engineSteps = [
  { t: '제품 발굴', d: '매일 쓰고 다시 찾는 제품을 고릅니다' },
  { t: '콘텐츠 제작', d: '영상·SNS·상세페이지를 표준화합니다' },
  { t: '체험 고객 확보', d: '체험 카페·세미나로 첫 경험을 만듭니다' },
  { t: '상담·판매', d: '파트너샵과 공동구매로 판매합니다' },
  { t: '고객 DB', d: '누가, 언제, 왜 샀는지 쌓습니다' },
  { t: '재구매 관리', d: '다시 찾을 때를 놓치지 않습니다' },
  { t: '파트너 확장', d: '재구매 고객이 새 고객과 파트너가 됩니다' },
]

export default function EngineLoop() {
  const cx = 260, cy = 260, r = 190
  const pts = engineSteps.map((_, i) => {
    const a = (-90 + (360 / engineSteps.length) * i) * (Math.PI / 180)
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  })
  return (
    <svg viewBox="0 0 520 520" role="img" aria-label="알프스 재구매 엔진: 제품 발굴부터 파트너 확장까지 7단계가 순환합니다">
      <defs>
        <marker id="eng-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1 1L9 5L1 9z" fill="#A9D3EE" />
        </marker>
      </defs>
            {engineSteps.map((_, i) => {
        const step = 360 / engineSteps.length
        const a1 = (-90 + step * i + 15) * (Math.PI / 180)
        const a2 = (-90 + step * (i + 1) - 15) * (Math.PI / 180)
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1)
        const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2)
        return <path key={`a${i}`} d={`M${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke="#A9D3EE" strokeWidth="1.6" markerEnd="url(#eng-arrow)" />
      })}
      {pts.map((p, i) => (
        <g key={i}>
          <ellipse cx={p.x} cy={p.y} rx="34" ry="40" fill={i === 6 ? '#A9D3EE' : '#4B2752'} stroke={i === 6 ? '#A9D3EE' : 'rgba(242,243,238,.35)'} />
          <text x={p.x} y={p.y + 7} textAnchor="middle" fontFamily="Unbounded, sans-serif" fontWeight="600" fontSize="18" fill={i === 6 ? '#33193A' : '#F2F3EE'}>{i + 1}</text>
        </g>
      ))}
      <text x={cx} y={cy - 18} textAnchor="middle" fill="#F2F3EE" fontSize="22" fontWeight="800">한 번 팔고 끝나지 않는</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#F2F3EE" fontSize="22" fontWeight="800">재구매 엔진</text>
      <text x={cx} y={cy + 46} textAnchor="middle" fill="rgba(242,243,238,.7)" fontSize="15">재구매 → 추천 → 파트너</text>
    </svg>
  )
}
