// 상품 사진 불러오기 · 단색 배경 지우기 · 여백 자르기 (모두 브라우저 안에서 처리, 서버 전송 없음)

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('이미지를 열 수 없습니다. PNG·JPG 파일인지 확인해 주세요.'))
    img.src = src
  })
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = () => reject(new Error('파일을 읽지 못했습니다.'))
    r.readAsDataURL(file)
  })
}

// 가장자리에서 시작해 비슷한 색(배경)을 투명하게 만듭니다. tolerance 0~100
export function removeBackground(img, tolerance = 28, maxSide = 1400) {
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
  const w = Math.round(img.width * scale), h = Math.round(img.height * scale)
  const c = document.createElement('canvas'); c.width = w; c.height = h
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, w, h)
  const data = ctx.getImageData(0, 0, w, h)
  const px = data.data
  // 테두리 평균색 = 배경색
  let r = 0, g = 0, b = 0, n = 0
  const sample = (x, y) => { const i = (y * w + x) * 4; r += px[i]; g += px[i + 1]; b += px[i + 2]; n++ }
  for (let x = 0; x < w; x += 4) { sample(x, 0); sample(x, h - 1) }
  for (let y = 0; y < h; y += 4) { sample(0, y); sample(w - 1, y) }
  r /= n; g /= n; b /= n
  const limit = (tolerance / 100) * 441 // 441 = RGB 공간 최대 거리
  const soft = limit * 0.35
  const dist = (i) => Math.hypot(px[i] - r, px[i + 1] - g, px[i + 2] - b)
  const seen = new Uint8Array(w * h)
  const stack = []
  const push = (x, y) => { const p = y * w + x; if (!seen[p]) { seen[p] = 1; stack.push(p) } }
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1) }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y) }
  while (stack.length) {
    const p = stack.pop(); const i = p * 4
    const d = dist(i)
    if (d > limit) continue
    // 경계 근처는 반투명으로 부드럽게
    px[i + 3] = d < limit - soft ? 0 : Math.round(px[i + 3] * ((d - (limit - soft)) / soft))
    const x = p % w, y = (p / w) | 0
    if (x > 0) push(x - 1, y); if (x < w - 1) push(x + 1, y)
    if (y > 0) push(x, y - 1); if (y < h - 1) push(x, y + 1)
  }
  ctx.putImageData(data, 0, 0)
  return trim(c)
}

// 투명 여백 잘라내기
export function trim(canvasOrImg) {
  let c = canvasOrImg
  if (!(c instanceof HTMLCanvasElement)) {
    c = document.createElement('canvas'); c.width = canvasOrImg.width; c.height = canvasOrImg.height
    c.getContext('2d').drawImage(canvasOrImg, 0, 0)
  }
  const ctx = c.getContext('2d', { willReadFrequently: true })
  const { data } = ctx.getImageData(0, 0, c.width, c.height)
  let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (data[(y * c.width + x) * 4 + 3] > 16) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
    }
  }
  if (x1 < 0) return c
  const out = document.createElement('canvas'); out.width = x1 - x0 + 1; out.height = y1 - y0 + 1
  out.getContext('2d').drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height)
  return out
}
