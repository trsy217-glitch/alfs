import { useCallback, useEffect, useRef, useState } from 'react'
import { prepareBase, autoMask, applyMask } from './cutout.js'

// 누끼 편집기
// - 사진을 받으면 자동으로 상품만 남김
// - '상품 영역 지정': 상품 둘레에 상자를 그리면 그 안만 다시 계산 (옆 물건·받침대 제외)
// - '지우개' / '살리기' 붓으로 남은 배경을 지우거나 잘린 부분을 되살림
// - 되돌리기(최대 15번), 처음 상태로
const TOOLS = [
  { id: 'box', label: '상품 영역 지정' },
  { id: 'erase', label: '지우개' },
  { id: 'restore', label: '살리기' },
]

export default function CutEditor({ image, onResult, onBusy }) {
  const viewRef = useRef(null)
  const baseRef = useRef(null)
  const maskRef = useRef(null)
  const firstMask = useRef(null)
  const history = useRef([])
  const drag = useRef(null)
  const [tool, setTool] = useState('box')
  const [brush, setBrush] = useState(28)
  const [ghost, setGhost] = useState(true)
  const [status, setStatus] = useState({ state: 'working', msg: '' })
  const [, setTick] = useState(0)

  const emit = useCallback(() => {
    if (baseRef.current && maskRef.current) onResult(applyMask(baseRef.current, maskRef.current))
  }, [onResult])

  // 화면 그리기: 체크무늬(CSS) 위에 흐린 원본 + 누끼 결과 + 그리는 중인 상자
  const paint = useCallback((cursor) => {
    const v = viewRef.current, base = baseRef.current, mask = maskRef.current
    if (!v || !base) return
    const ctx = v.getContext('2d')
    ctx.clearRect(0, 0, v.width, v.height)
    if (ghost || !mask) { ctx.globalAlpha = mask ? 0.22 : 1; ctx.drawImage(base, 0, 0); ctx.globalAlpha = 1 }
    if (mask) {
      const tmp = document.createElement('canvas'); tmp.width = base.width; tmp.height = base.height
      const t = tmp.getContext('2d'); t.drawImage(base, 0, 0); t.globalCompositeOperation = 'destination-in'; t.drawImage(mask, 0, 0)
      ctx.drawImage(tmp, 0, 0)
    }
    const d = drag.current
    if (d?.box) {
      ctx.save(); ctx.strokeStyle = '#E2C47A'; ctx.lineWidth = Math.max(2, v.width / 300); ctx.setLineDash([12, 8])
      ctx.strokeRect(d.box.x, d.box.y, d.box.w, d.box.h); ctx.restore()
    }
    if (cursor && tool !== 'box') {
      ctx.save(); ctx.strokeStyle = tool === 'erase' ? '#E5484D' : '#2F6B4A'; ctx.lineWidth = Math.max(2, v.width / 400)
      ctx.beginPath(); ctx.arc(cursor.x, cursor.y, brushPx(), 0, Math.PI * 2); ctx.stroke(); ctx.restore()
    }
  }, [ghost, tool]) // eslint-disable-line react-hooks/exhaustive-deps

  const brushPx = () => (brush / 400) * Math.max(baseRef.current?.width || 1, baseRef.current?.height || 1)

  const run = useCallback(async (box) => {
    const base = baseRef.current
    setStatus({ state: 'working', msg: '' }); onBusy?.(true)
    try {
      const { mask, model } = await autoMask(base, box)
      if (maskRef.current) pushHistory()
      maskRef.current = mask
      if (!box) firstMask.current = cloneCanvas(mask)
      setStatus({ state: 'ready', msg: model === 'u2netp' ? '이 기기에서는 정밀 모델을 돌리지 못해 가벼운 모델로 땄어요. 남은 부분은 지우개로 다듬어 주세요.' : '' })
      emit()
    } catch {
      if (!maskRef.current) { // 실패하면 원본 전체를 남기고 붓으로 다듬게
        const m = document.createElement('canvas'); m.width = base.width; m.height = base.height
        const c = m.getContext('2d'); c.fillStyle = '#fff'; c.fillRect(0, 0, m.width, m.height)
        maskRef.current = m; firstMask.current = cloneCanvas(m); emit()
      }
      setStatus({ state: 'fail', msg: '자동 누끼를 하지 못했어요. 지우개로 배경을 지워 주세요. (오래된 휴대폰은 메모리가 부족할 수 있어요)' })
    }
    onBusy?.(false); paint()
  }, [emit, onBusy, paint]) // eslint-disable-line react-hooks/exhaustive-deps

  // 새 사진
  useEffect(() => {
    if (!image) return
    const base = prepareBase(image)
    baseRef.current = base; maskRef.current = null; history.current = []
    const v = viewRef.current; v.width = base.width; v.height = base.height
    setTool('box'); paint(); run(null)
  }, [image]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { paint() }, [paint])

  function pushHistory() {
    history.current.push(cloneCanvas(maskRef.current))
    if (history.current.length > 15) history.current.shift()
    setTick((t) => t + 1)
  }
  const undo = () => {
    const prev = history.current.pop()
    if (!prev) return
    maskRef.current = prev; setTick((t) => t + 1); paint(); emit()
  }
  const reset = () => {
    if (!firstMask.current) return
    pushHistory(); maskRef.current = cloneCanvas(firstMask.current); paint(); emit()
  }

  const toImage = (e) => {
    const v = viewRef.current, r = v.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * v.width, y: ((e.clientY - r.top) / r.height) * v.height }
  }
  const stroke = (from, to) => {
    const c = maskRef.current.getContext('2d')
    c.save()
    c.globalCompositeOperation = tool === 'erase' ? 'destination-out' : 'source-over'
    c.strokeStyle = '#fff'; c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = brushPx() * 2
    c.beginPath(); c.moveTo(from.x, from.y); c.lineTo(to.x, to.y); c.stroke()
    c.restore()
  }
  const busy = status.state === 'working'

  const onDown = (e) => {
    if (busy || !maskRef.current) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const p = toImage(e)
    if (tool === 'box') drag.current = { start: p, box: { x: p.x, y: p.y, w: 0, h: 0 } }
    else { pushHistory(); drag.current = { last: p }; stroke(p, p); paint(p) }
  }
  const onMove = (e) => {
    const p = toImage(e)
    const d = drag.current
    if (!d) { if (tool !== 'box' && e.pointerType === 'mouse') paint(p); return }
    if (tool === 'box') {
      d.box = { x: Math.min(d.start.x, p.x), y: Math.min(d.start.y, p.y), w: Math.abs(p.x - d.start.x), h: Math.abs(p.y - d.start.y) }
      paint()
    } else { stroke(d.last, p); d.last = p; paint(p) }
  }
  const onUp = () => {
    const d = drag.current
    drag.current = null
    if (!d) return
    if (tool === 'box') {
      if (d.box.w > 20 && d.box.h > 20) run(d.box)
      else paint()
    } else emit()
  }

  return (
    <div className="cut">
      <div className="cut__tools" role="toolbar" aria-label="누끼 편집 도구">
        {TOOLS.map((t) => (
          <button type="button" key={t.id} className={`cut__tool ${tool === t.id ? 'on' : ''}`} aria-pressed={tool === t.id} onClick={() => setTool(t.id)} disabled={busy}>{t.label}</button>
        ))}
        <button type="button" className="cut__tool" onClick={undo} disabled={busy || !history.current.length}>되돌리기</button>
        <button type="button" className="cut__tool" onClick={reset} disabled={busy}>처음 상태로</button>
      </div>
      <div className="cut__stage">
        <canvas ref={viewRef} className={`cut__view cut__view--${tool}`} aria-label="누끼 편집 화면 (체크무늬는 투명한 부분)"
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={() => !drag.current && paint()} />
        {busy && <div className="cut__busy" role="status"><span className="vm__dot" /> 상품만 남기는 중… 처음 한 번은 모델을 받느라 10~30초 걸려요.</div>}
      </div>
      <div className="cut__opts">
        {tool !== 'box' && (
          <label className="vm__range">붓 크기
            <input type="range" min="6" max="80" value={brush} onChange={(e) => setBrush(Number(e.target.value))} />
          </label>
        )}
        <label className="consent"><input type="checkbox" checked={ghost} onChange={(e) => setGhost(e.target.checked)} /> <span>지워진 부분 흐리게 보기</span></label>
      </div>
      <p className="hint">
        {status.msg || (tool === 'box'
          ? '옆에 다른 물건이나 받침대까지 남았다면, 상품 둘레에 상자를 그려 보세요. 상자 안만 다시 땁니다.'
          : tool === 'erase' ? '남은 배경을 문질러 지우세요. 체크무늬가 투명한 부분입니다.' : '잘려 나간 상품 부분을 문질러 되살리세요.')}
      </p>
    </div>
  )
}

function cloneCanvas(c) {
  const n = document.createElement('canvas'); n.width = c.width; n.height = c.height
  n.getContext('2d').drawImage(c, 0, 0)
  return n
}
