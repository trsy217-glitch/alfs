// 캔버스 애니메이션을 실시간으로 녹화해 영상 파일(MP4 또는 WebM)로 만듭니다.
import { drawFrame, FPS } from './adScene.js'

export function pickMime() {
  const list = [
    ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'mp4'],
    ['video/mp4;codecs=avc1,mp4a', 'mp4'],
    ['video/mp4', 'mp4'],
    ['video/webm;codecs=vp9,opus', 'webm'],
    ['video/webm;codecs=vp8,opus', 'webm'],
    ['video/webm', 'webm'],
  ]
  if (typeof MediaRecorder === 'undefined') return null
  for (const [m, ext] of list) if (MediaRecorder.isTypeSupported(m)) return { mime: m, ext }
  return null
}

let audioCtx = null
const bufferCache = {}
export async function loadMusic(url) {
  audioCtx ||= new (window.AudioContext || window.webkitAudioContext)()
  if (!bufferCache[url]) {
    const res = await fetch(url)
    if (!res.ok) throw new Error('배경음악 파일을 불러오지 못했습니다.')
    bufferCache[url] = await audioCtx.decodeAudioData(await res.arrayBuffer())
  }
  return { ctx: audioCtx, buffer: bufferCache[url] }
}

// opts: drawFrame 옵션 + { musicUrl } · onProgress(0~1)
export async function record(canvas, opts, onProgress) {
  const picked = pickMime()
  if (!picked || !canvas.captureStream) throw new Error('이 브라우저는 영상 저장을 지원하지 않습니다. 크롬·엣지·사파리 최신 버전에서 열어 주세요.')
  const ctx = canvas.getContext('2d')
  const stream = canvas.captureStream(FPS)
  let source = null
  if (opts.musicUrl) {
    const { ctx: ac, buffer } = await loadMusic(opts.musicUrl)
    if (ac.state === 'suspended') await ac.resume()
    const dest = ac.createMediaStreamDestination()
    source = ac.createBufferSource(); source.buffer = buffer; source.connect(dest)
    dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t))
  }
  const rec = new MediaRecorder(stream, { mimeType: picked.mime, videoBitsPerSecond: 8_000_000, audioBitsPerSecond: 160_000 })
  const chunks = []
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
  const done = new Promise((resolve) => { rec.onstop = resolve })
  const totalMs = (opts.durationFrames / FPS) * 1000

  drawFrame(ctx, 0, opts)
  rec.start(250)
  if (source) source.start()
  const t0 = performance.now()
  await new Promise((resolve) => {
    const tick = () => {
      const ms = performance.now() - t0
      const f = Math.min(opts.durationFrames - 1, Math.floor((ms / 1000) * FPS))
      drawFrame(ctx, f, opts)
      onProgress?.(Math.min(1, ms / totalMs))
      if (ms >= totalMs + 120) resolve()
      else requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  rec.stop()
  try { source?.stop() } catch { /* 이미 끝남 */ }
  await done
  stream.getTracks().forEach((t) => t.stop())
  return { blob: new Blob(chunks, { type: picked.mime.split(';')[0] }), ext: picked.ext }
}
