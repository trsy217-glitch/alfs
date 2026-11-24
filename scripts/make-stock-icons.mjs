// 알프스 재고관리 앱 아이콘 생성 (외부 라이브러리 없이 PNG 직접 작성)
// - public/stock-icon-192.png, stock-icon-512.png (any)
// - public/stock-icon-512-maskable.png (maskable: 안전 영역 안에 그림)
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', 'public')

const GREEN = [47, 93, 74]
const GREEN_D = [35, 72, 58]
const WHITE = [255, 255, 255]

function crc32(buf) {
  let c
  const table = crc32.table || (crc32.table = (() => {
    const t = new Int32Array(256)
    for (let n = 0; n < 256; n++) {
      c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      t[n] = c
    }
    return t
  })())
  let crc = -1
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff]
  return (crc ^ -1) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function png(width, height, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8      // bit depth
  ihdr[9] = 6      // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// 도형: 값 < 0 이면 안쪽
const roundRect = (x, y, cx, cy, hw, hh, r) => {
  const dx = Math.abs(x - cx) - (hw - r)
  const dy = Math.abs(y - cy) - (hh - r)
  const ax = Math.max(dx, 0), ay = Math.max(dy, 0)
  return Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(dx, dy), 0) - r
}
const box = (x, y, cx, cy, hw, hh, r) => Math.abs(roundRect(x, y, cx, cy, hw, hh, r)) // 테두리만(선)

function draw(size, maskable) {
  const S = 4 // 슈퍼샘플링
  const N = size * S
  const px = Buffer.alloc(size * size * 4)
  const scale = maskable ? 0.68 : 0.82 // 가운데 그림 크기
  const c = size / 2
  // 상자
  const bw = (size * scale) / 2
  const bh = (size * scale * 0.78) / 2
  const stroke = size * 0.052
  // 위로 향한 화살표
  const aw = size * scale * 0.20      // 화살표 반폭
  const aTop = c - bh * 0.42
  const aBot = c + bh * 0.46
  const shaftHW = size * 0.045

  for (let py = 0; py < size; py++) {
    for (let pxi = 0; pxi < size; pxi++) {
      let r = 0, g = 0, b = 0, a = 0
      for (let sy = 0; sy < S; sy++) {
        for (let sx = 0; sx < S; sx++) {
          const x = pxi + (sx + 0.5) / S
          const y = py + (sy + 0.5) / S
          // 배경(위→아래 살짝 그라데이션)
          const t = y / size
          let col = [
            GREEN[0] + (GREEN_D[0] - GREEN[0]) * t,
            GREEN[1] + (GREEN_D[1] - GREEN[1]) * t,
            GREEN[2] + (GREEN_D[2] - GREEN[2]) * t,
          ]
          // 상자 테두리
          const dBox = box(x, y, c, c + size * 0.02, bw, bh, size * 0.06)
          if (dBox < stroke / 2) col = WHITE
          // 화살표 (세로대 + 삼각형 머리)
          const inShaft = Math.abs(x - c) < shaftHW && y > aTop + size * 0.12 && y < aBot
          const headT = (y - aTop) / (size * 0.24) // 0..1
          const inHead = y >= aTop && y <= aTop + size * 0.24 && Math.abs(x - c) < aw * headT
          if (inShaft || inHead) col = WHITE
          r += col[0]; g += col[1]; b += col[2]; a += 255
        }
      }
      const n = S * S
      const o = (py * size + pxi) * 4
      px[o] = Math.round(r / n)
      px[o + 1] = Math.round(g / n)
      px[o + 2] = Math.round(b / n)
      px[o + 3] = Math.round(a / n)
    }
  }
  return png(size, size, px)
}

fs.mkdirSync(OUT, { recursive: true })
fs.writeFileSync(path.join(OUT, 'stock-icon-192.png'), draw(192, false))
fs.writeFileSync(path.join(OUT, 'stock-icon-512.png'), draw(512, false))
fs.writeFileSync(path.join(OUT, 'stock-icon-512-maskable.png'), draw(512, true))
console.log('icons written:', fs.readdirSync(OUT).filter((f) => f.startsWith('stock-icon')).join(', '))
