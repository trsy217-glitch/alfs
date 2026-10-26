import { useEffect, useRef, useState } from 'react'
import { prepareBase, autoMask, applyMask } from './cutout.js'
import { trim } from './image.js'

// 자동 누끼 → 결과(상품만)만 보여 줍니다. 편집 도구 없음.
export default function CutResult({ image, onResult, onBusy }) {
  const ref = useRef(null)
  const [state, setState] = useState('working') // working · done · fail
  const [out, setOut] = useState(null)

  useEffect(() => {
    if (!image) return
    let alive = true
    setState('working'); onBusy?.(true)
    ;(async () => {
      try {
        const base = prepareBase(image)
        const { mask } = await autoMask(base)
        const c = applyMask(base, mask)
        if (!alive) return
        setOut(c); onResult(c); setState('done')
      } catch {
        if (!alive) return
        const c = trim(image) // 실패하면 원본 그대로
        setOut(c); onResult(c); setState('fail')
      } finally {
        if (alive) onBusy?.(false)
      }
    })()
    return () => { alive = false }
  }, [image]) // eslint-disable-line react-hooks/exhaustive-deps

  // 결과 미리보기 (체크무늬 = 투명)
  useEffect(() => {
    const v = ref.current
    if (!v || !out) return
    const h = 220, w = Math.max(60, Math.round((out.width / out.height) * h))
    v.width = w * 2; v.height = h * 2
    v.style.width = `${w}px`; v.style.height = `${h}px`
    const ctx = v.getContext('2d')
    ctx.clearRect(0, 0, v.width, v.height)
    ctx.drawImage(out, 0, 0, v.width, v.height)
  }, [out])

  return (
    <div className="cutres">
      {state === 'working'
        ? <p className="cutres__busy" role="status"><span className="vm__dot" /> 상품만 남기는 중… 처음 한 번은 10~30초 걸려요.</p>
        : <div className="cutres__img"><canvas ref={ref} aria-label="배경을 지운 상품 (체크무늬는 투명한 부분)" /></div>}
      {state === 'fail' && <p className="hint">이 기기에서는 자동 누끼를 하지 못해 원본 사진을 그대로 썼어요. 배경을 지운 PNG를 올리면 더 깔끔합니다.</p>}
    </div>
  )
}
