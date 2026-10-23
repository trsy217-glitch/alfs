// 7개 영역 점수를 한눈에 보는 방사형 차트 (0~100 한 가지 척도)
export default function RadarChart({ areas, size = 360 }) {
  const n = areas.length
  const c = size / 2, r = size / 2 - 64
  const pt = (i, v) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180)
    return [c + r * (v / 100) * Math.cos(a), c + r * (v / 100) * Math.sin(a)]
  }
  const ring = (v) => areas.map((_, i) => pt(i, v).join(',')).join(' ')
  const shape = areas.map((a, i) => pt(i, a.score).join(',')).join(' ')
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="radar" role="img" aria-label={`영역별 점수: ${areas.map((a) => `${a.label} ${a.score}점`).join(', ')}`}>
      {[25, 50, 75, 100].map((v) => (
        <polygon key={v} points={ring(v)} fill="none" stroke="var(--line)" strokeWidth="1" />
      ))}
      {areas.map((_, i) => {
        const [x, y] = pt(i, 100)
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="var(--line)" strokeWidth="1" />
      })}
      <polygon points={shape} fill="var(--leaf)" fillOpacity="0.16" stroke="var(--leaf)" strokeWidth="2" strokeLinejoin="round" />
      {areas.map((a, i) => {
        const [x, y] = pt(i, a.score)
        return <circle key={a.id} cx={x} cy={y} r="4" fill={a.score < 60 ? 'var(--warn)' : 'var(--leaf)'} />
      })}
      {areas.map((a, i) => {
        const [x, y] = pt(i, 122)
        const anchor = Math.abs(x - c) < 8 ? 'middle' : x > c ? 'start' : 'end'
        return (
          <text key={a.id} x={x} y={y} textAnchor={anchor} fontSize="12.5" fill="var(--ink)">
            <tspan fontWeight="700">{a.label}</tspan>
            <tspan x={x} dy="16" fontSize="12" fill={a.score < 60 ? 'var(--warn)' : 'var(--ink-2)'} fontWeight="700">{a.score}점</tspan>
          </text>
        )
      })}
    </svg>
  )
}
