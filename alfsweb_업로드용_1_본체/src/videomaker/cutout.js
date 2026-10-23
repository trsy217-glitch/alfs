// ─────────────────────────────────────────────────────────────
// 누끼 엔진 (상품만 남기고 배경 지우기) — 모두 브라우저 안에서 처리, 사진은 서버로 보내지 않음
//
// 1) 정밀 모델: IS-Net general-use (DIS, Apache-2.0) 를 8비트로 줄인 것 (46MB)
//    public/models/isnet-q.0~2.bin  ← GitHub 웹 업로드(25MB)·미리보기(16MB) 제한 때문에 셋으로 나눔
// 2) 예비 모델: U²-Net 경량(u2netp, Apache-2.0, 4.6MB) — 정밀 모델을 못 돌리는 기기(메모리 부족 등)에서 사용
// 3) 뒷정리: 작은 얼룩(떨어진 조각) 지우기 + 상품 안쪽 작은 구멍 메우기 + 가장자리 또렷하게
// 4) 영역 지정: 사용자가 상자를 그리면 그 안만 다시 계산 → 옆에 놓인 다른 물건은 빠짐
// 처음 한 번 모델을 내려받고 이후에는 브라우저 캐시를 씁니다.
// ─────────────────────────────────────────────────────────────
import { asset } from '../lib/asset.js'
import { trim } from './image.js'

export const WORK_MAX = 1600 // 편집·결과 해상도 (긴 변)

const MODELS = {
  isnet: { parts: ['models/isnet-q.0', 'models/isnet-q.1', 'models/isnet-q.2'], exts: ['.bin', '.wasm'], size: 1024, mean: [0.485, 0.456, 0.406], std: [1, 1, 1] },
  u2netp: { parts: ['models/u2netp'], exts: ['.onnx', '.wasm'], size: 320, mean: [0.485, 0.456, 0.406], std: [0.229, 0.224, 0.225] },
}
const sessions = {}
let ortPromise = null

const abs = (p) => new URL(asset(p), window.location.href).href

function getOrt() {
  if (!ortPromise) {
    ortPromise = import('onnxruntime-web/wasm').then((ort) => { ort.env.wasm.numThreads = 1; return ort })
    ortPromise.catch(() => { ortPromise = null })
  }
  return ortPromise
}

// 나눠 둔 모델 파일을 받아 이어 붙임 (미리보기 서버용 .wasm 이름도 시도)
async function fetchPart(base, exts) {
  for (const ext of exts) {
    try {
      const r = await fetch(abs(base + ext))
      if (!r.ok) continue
      const buf = new Uint8Array(await r.arrayBuffer())
      if (buf.length > 100_000) return buf
    } catch { /* 다음 이름 */ }
  }
  throw new Error('모델 파일을 받지 못했어요.')
}

function getSession(name) {
  if (!sessions[name]) {
    sessions[name] = (async () => {
      const ort = await getOrt()
      const m = MODELS[name]
      const parts = await Promise.all(m.parts.map((p) => fetchPart(p, m.exts)))
      const all = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
      let o = 0
      for (const p of parts) { all.set(p, o); o += p.length }
      const session = await ort.InferenceSession.create(all, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' })
      return { ort, session, m }
    })()
    sessions[name].catch(() => { delete sessions[name] })
  }
  return sessions[name]
}

// 원본 → 작업용 캔버스 (긴 변 1600px)
export function prepareBase(img) {
  const k = Math.min(1, WORK_MAX / Math.max(img.width, img.height))
  const c = document.createElement('canvas')
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
  return c
}

async function predict(name, src, rect) {
  const { ort, session, m } = await getSession(name)
  const S = m.size
  const c = document.createElement('canvas'); c.width = S; c.height = S
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src, rect.x, rect.y, rect.w, rect.h, 0, 0, S, S)
  const px = ctx.getImageData(0, 0, S, S).data
  let max = 1
  for (let i = 0; i < px.length; i += 4) max = Math.max(max, px[i], px[i + 1], px[i + 2])
  const N = S * S
  const input = new Float32Array(3 * N)
  for (let i = 0; i < N; i++) for (let ch = 0; ch < 3; ch++) input[ch * N + i] = (px[i * 4 + ch] / max - m.mean[ch]) / m.std[ch]
  const out = await session.run({ [session.inputNames[0]]: new ort.Tensor('float32', input, [1, 3, S, S]) })
  const pred = out[session.outputNames[0]].data
  let lo = Infinity, hi = -Infinity
  for (let i = 0; i < N; i++) { if (pred[i] < lo) lo = pred[i]; if (pred[i] > hi) hi = pred[i] }
  const a = new Float32Array(N)
  for (let i = 0; i < N; i++) a[i] = (pred[i] - lo) / (hi - lo || 1)
  return { a, S }
}

// 뒷정리: 큰 덩어리만 남기고 작은 얼룩 제거, 안쪽 작은 구멍 메우기, 가장자리 또렷하게
export function cleanAlpha(a, S) {
  const N = S * S
  const label = new Int32Array(N).fill(-1)
  const stack = new Int32Array(N)
  const flood = (start, inside, id) => {
    let sp = 0, area = 0, touches = false
    stack[sp++] = start; label[start] = id
    while (sp) {
      const i = stack[--sp]; area++
      const x = i % S, y = (i - x) / S
      if (x === 0 || y === 0 || x === S - 1 || y === S - 1) touches = true
      const nb = [x > 0 ? i - 1 : -1, x < S - 1 ? i + 1 : -1, y > 0 ? i - S : -1, y < S - 1 ? i + S : -1]
      for (const j of nb) if (j >= 0 && label[j] === -1 && (a[j] > 0.5) === inside) { label[j] = id; stack[sp++] = j }
    }
    return { area, touches }
  }
  // 상품 덩어리
  const comps = []
  for (let i = 0; i < N; i++) if (label[i] === -1 && a[i] > 0.5) comps.push({ id: comps.length, ...flood(i, true, comps.length) })
  if (!comps.length) return a
  const biggest = Math.max(...comps.map((c) => c.area))
  const keep = new Uint8Array(comps.length)
  comps.forEach((c) => { keep[c.id] = c.area >= Math.max(biggest * 0.06, N * 0.0015) ? 1 : 0 })
  // 배경 쪽 덩어리 중 테두리에 안 닿는 작은 구멍 → 메움
  const holes = []
  const base = comps.length
  for (let i = 0; i < N; i++) if (label[i] === -1) { const id = base + holes.length; holes.push({ id, ...flood(i, false, id) }) }
  const fill = new Set(holes.filter((h) => !h.touches && h.area < biggest * 0.015).map((h) => h.id))
  // 남길 영역(+2px 여유)
  const kept = new Uint8Array(N)
  for (let i = 0; i < N; i++) kept[i] = (label[i] < base && keep[label[i]]) || fill.has(label[i]) ? 1 : 0
  let near = kept
  for (let r = 0; r < 2; r++) {
    const nx = new Uint8Array(N)
    for (let i = 0; i < N; i++) {
      if (near[i]) { nx[i] = 1; continue }
      const x = i % S
      if ((x > 0 && near[i - 1]) || (x < S - 1 && near[i + 1]) || (i >= S && near[i - S]) || (i < N - S && near[i + S])) nx[i] = 1
    }
    near = nx
  }
  const out = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    let v = fill.has(label[i]) ? 1 : near[i] ? a[i] : 0
    v = Math.max(0, Math.min(1, (v - 0.12) / 0.76)) // 가장자리 반투명을 줄여 또렷하게
    out[i] = v * v * (3 - 2 * v)
  }
  return out
}

// 자동 누끼 → 작업용 캔버스와 같은 크기의 마스크(흰색+알파) 캔버스
// box: {x,y,w,h} (작업용 캔버스 좌표) 를 주면 그 안만 계산
export async function autoMask(base, box = null) {
  const W = base.width, H = base.height
  let rect = { x: 0, y: 0, w: W, h: H }
  if (box && box.w > 8 && box.h > 8) {
    const px = box.w * 0.04, py = box.h * 0.04
    const x0 = Math.max(0, box.x - px), y0 = Math.max(0, box.y - py)
    rect = { x: x0, y: y0, w: Math.min(W, box.x + box.w + px) - x0, h: Math.min(H, box.y + box.h + py) - y0 }
  }
  let res, model = 'isnet'
  try { res = await predict('isnet', base, rect) } catch { model = 'u2netp'; res = await predict('u2netp', base, rect) }
  const a = cleanAlpha(res.a, res.S)
  const S = res.S
  const small = document.createElement('canvas'); small.width = S; small.height = S
  const sc = small.getContext('2d')
  const id = sc.createImageData(S, S)
  for (let i = 0; i < S * S; i++) { id.data[i * 4] = 255; id.data[i * 4 + 1] = 255; id.data[i * 4 + 2] = 255; id.data[i * 4 + 3] = Math.round(a[i] * 255) }
  sc.putImageData(id, 0, 0)
  const mask = document.createElement('canvas'); mask.width = W; mask.height = H
  const mc = mask.getContext('2d')
  mc.imageSmoothingQuality = 'high'
  mc.drawImage(small, rect.x, rect.y, rect.w, rect.h)
  return { mask, model }
}

// 작업용 캔버스 + 마스크 → 배경이 투명하고 여백을 잘라낸 결과
export function applyMask(base, mask) {
  const c = document.createElement('canvas'); c.width = base.width; c.height = base.height
  const ctx = c.getContext('2d')
  ctx.drawImage(base, 0, 0)
  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(mask, 0, 0)
  return trim(c)
}

// 미리 받아 두기
export const warmUp = () => getSession('isnet').then(() => true, () => false)
