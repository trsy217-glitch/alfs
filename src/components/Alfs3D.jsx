import { useEffect, useMemo, useRef, useState } from 'react'
import { parsePath, translatePath } from '@remotion/paths'
import { extrudeAndTransformElement, reduceMatrices, rotateX, rotateY, scaled, threeDIntoSvgPath, transformPath, translateZ } from '@remotion/svg-3d-engine'

// ─────────────────────────────────────────────────────────────
// 첫 화면 3D 'ALFS' 글자
// 참고 코드(@remotion/svg-3d-engine 예제)와 같은 방식: 평면 SVG 글자에 두께를 주고 3D로 돌려 그림 (WebGL 없이 순수 SVG)
//   1) 처음 1초 동안 두께 1 → 60 으로 튀어나오기 (ease-out cubic)
//   2) 좌우로 흔들(rotateY) + 살짝 내려다보기(rotateX)
//   3) 옆면은 먼 것부터, 앞면은 마지막에 그림
// Remotion 프레임 대신 브라우저 애니메이션(requestAnimationFrame)으로 돌리고,
// 화면 밖이거나 '동작 줄이기' 설정이면 멈춥니다.
// ─────────────────────────────────────────────────────────────

// 글자 높이 200, 획 두께 약 40의 각진 글꼴. 전체 가운데(345, 100)를 (0, 0)으로 옮겨 가운데 축으로 회전
const LETTERS = [
  // A (왼쪽 기둥 · 오른쪽 기둥 · 가로줄)
  'M 0 200 L 62 0 L 100 0 L 42 200 Z',
  'M 100 0 L 138 0 L 200 200 L 158 200 Z',
  'M 48 118 L 152 118 L 142 152 L 58 152 Z',
  // L
  'M 230 0 L 272 0 L 272 160 L 360 160 L 360 200 L 230 200 Z',
  // F
  'M 390 0 L 520 0 L 520 40 L 432 40 L 432 82 L 505 82 L 505 120 L 432 120 L 432 200 L 390 200 Z',
  // S (각진 S)
  'M 550 0 L 690 0 L 690 40 L 592 40 L 592 80 L 690 80 L 690 200 L 550 200 L 550 160 L 648 160 L 648 120 L 550 120 Z',
].map((d) => translatePath(d, -345, -100))

// 알프스 로고의 블랙·골드
const FRONT = '#E2C47A'
const FRONT_LINE = '#F6E3A8'
const SIDE = '#9A7426'
const SIDE_LINE = '#5E4714'

const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3)

function buildScene(t, intro) {
  const depth = 1 + 59 * easeOutCubic(Math.min(1, Math.max(0, intro)))
  const matrix = reduceMatrices([
    scaled(0.95),
    rotateY(Math.sin(t * 1.2) * 0.8),
    rotateX(-0.35 + Math.sin(t * 0.8) * 0.15),
  ])
  const sides = LETTERS.flatMap((d) =>
    extrudeAndTransformElement({ points: parsePath(d), depth, pressInDepth: 0, sideColor: SIDE, crispEdges: false, transformations: matrix }),
  )
  const zOf = (face) => face.points.reduce((sum, p) => sum + p.point[2], 0) / face.points.length
  sides.sort((a, b) => zOf(b) - zOf(a)) // 먼 것부터
  return {
    sides: sides.map((face) => ({ d: threeDIntoSvgPath(face.points), fill: face.color })),
    fronts: LETTERS.map((d) => transformPath({ path: d, transformation: reduceMatrices([translateZ(-depth / 2), matrix]) })),
  }
}

export default function Alfs3D() {
  const ref = useRef(null)
  const reduce = useMemo(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches, [])
  // 동작 줄이기: 살짝 돌아간 자세로 고정
  const [scene, setScene] = useState(() => (reduce ? buildScene(0.35, 1) : buildScene(0, 0)))

  useEffect(() => {
    if (reduce) return
    let raf = 0, visible = true, start = performance.now(), paused = 0, pausedAt = 0
    const loop = (now) => {
      const t = (now - start - paused) / 1000
      setScene(buildScene(t, t)) // 첫 1초: 튀어나오기
      raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !visible) { visible = true; paused += performance.now() - pausedAt; raf = requestAnimationFrame(loop) }
      if (!e.isIntersecting && visible) { visible = false; pausedAt = performance.now(); cancelAnimationFrame(raf) }
    })
    if (ref.current) io.observe(ref.current)
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); io.disconnect() }
  }, [reduce])

  return (
    <div className="alfs3d" ref={ref}>
      <svg viewBox="-370 -200 740 400" role="img" aria-label="ALFS">
        {scene.sides.map((f, i) => <path key={i} d={f.d} fill={f.fill} stroke={SIDE_LINE} strokeWidth={0.6} />)}
        {scene.fronts.map((d, i) => <path key={`f${i}`} d={d} fill={FRONT} stroke={FRONT_LINE} strokeWidth={1.5} strokeLinejoin="round" />)}
      </svg>
    </div>
  )
}
