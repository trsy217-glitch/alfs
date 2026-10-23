// ─────────────────────────────────────────────────────────────
// 설명서·라벨 사진에서 글자 읽기 (AI 연결이 없을 때 쓰는 브라우저 OCR)
// tesseract.js (Apache-2.0) · 한국어+영어 · 파일은 모두 이 사이트(public/ocr/)에서 받음
// AI(ANTHROPIC_API_KEY)가 연결돼 있으면 이 단계 없이 AI가 사진을 직접 읽습니다.
// ─────────────────────────────────────────────────────────────
import { asset } from '../lib/asset.js'

const abs = (p) => new URL(asset(p), window.location.href).href
let workerPromise = null

function getWorker(onProgress) {
  if (!workerPromise) {
    workerPromise = import('tesseract.js').then(({ createWorker }) => createWorker(['kor', 'eng'], 1, {
      workerPath: abs('ocr/worker.min.js'),
      corePath: abs('ocr/core'),
      langPath: abs('ocr/lang'),
      gzip: true,
      workerBlobURL: false,
      logger: (m) => onProgress?.(m),
    }))
    workerPromise.catch(() => { workerPromise = null })
  }
  return workerPromise
}

// 작은 사진은 키워서 읽어야 정확도가 올라감
function toCanvas(img) {
  const long = Math.max(img.width, img.height)
  const k = long < 1400 ? 1400 / long : long > 2400 ? 2400 / long : 1
  const c = document.createElement('canvas')
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
  const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height)
  ctx.drawImage(img, 0, 0, c.width, c.height)
  return c
}

export async function readText(images, onProgress) {
  const w = await getWorker(onProgress)
  const out = []
  for (const img of images) {
    const { data } = await w.recognize(toCanvas(img))
    out.push(cleanOcr(data.text))
  }
  return out.filter(Boolean).join('\n')
}

// 깨진 줄 정리: 한글·영문·숫자가 거의 없는 줄은 버리고, 한글 사이 띄어쓰기 오류를 줄임
export function cleanOcr(text = '') {
  return text.split('\n')
    .map((l) => l.replace(/[|_~^`<>{}[\]\\]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter((l) => (l.match(/[가-힣A-Za-z0-9]/g) || []).length >= 3)
    .map((l) => l.replace(/([가-힣])\s(?=[가-힣](?:\s|$))/g, '$1'))
    .join('\n')
}
