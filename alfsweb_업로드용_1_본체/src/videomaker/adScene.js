// ─────────────────────────────────────────────────────────────
// '영상 만들기' 자동생성 템플릿 (브라우저 캔버스)
// 참고 코드(Remotion, 180프레임·1280×720 제품 광고)를 캔버스로 그대로 옮겼습니다.
//   배경 방사형 그라데이션 → 회전 빛줄기 → 뒤 큰 영문 글자 → 제품이 아래에서 스프링으로 솟아오름(기울기·둥실)
//   → 착지 번쩍 → 빛 쓸기·반짝이 → 양옆 큰 문구가 미끄러져 들어옴 → 오른쪽 밑줄 → 왼쪽 아래 안내 문구
// 바뀌는 값만 opts 로 받습니다: 제품 이미지·색·문구·크기·길이·화면 비율
// 오륜미네랄 샘플 영상은 이 템플릿이 아니라 처음 만든 영상 파일(public/video/*)을 그대로 보여 줍니다.
// ─────────────────────────────────────────────────────────────

export const FPS = 30
export const BASE_FRAMES = 180 // 참고 코드 길이 (6초)

export const SIZES = {
  wide: { w: 1280, h: 720, label: '가로 16:9 (유튜브·웹)' },
  tall: { w: 720, h: 1280, label: '세로 9:16 (릴스·쇼츠)' },
}

// 색 프리셋 (main = 가운데, mid = 45% 지점, deep = 바깥)
export const THEMES = {
  red: { name: '레드', main: '#E4002B', mid: '#9C0018', deep: '#3A0008' }, // 참고 코드 색
  forest: { name: '숲', main: '#2F6B4A', mid: '#1F4D34', deep: '#0B1F14' },
  berry: { name: '오디', main: '#7A3B86', mid: '#4A1F52', deep: '#170A1A' },
  ocean: { name: '바다', main: '#1F78B4', mid: '#124B73', deep: '#061A2A' },
  sunset: { name: '노을', main: '#E8743B', mid: '#A3401C', deep: '#3A1206' },
  noir: { name: '블랙골드', main: '#4A443E', mid: '#24211E', deep: '#060606' },
}

export const FONT = "'Pretendard Variable', Pretendard, 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif"

// 대표색 하나 → 세 단계 색 (참고 코드 비율: 가운데 100%, 중간 약 68%, 바깥 약 25% 밝기)
export function themeFromColor(hex) {
  const n = parseInt(hex.slice(1), 16)
  const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  const mul = (k) => '#' + rgb.map((c) => Math.round(c * k).toString(16).padStart(2, '0')).join('')
  return { main: hex, mid: mul(0.68), deep: mul(0.25) }
}

// 제품 사진에서 대표색 뽑기 (채도 높은 픽셀 위주) → 광고 배경에 맞게 밝기·채도 보정
export function colorFromImage(img) {
  const S = 64
  const c = document.createElement('canvas'); c.width = S; c.height = S
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, S, S)
  const d = ctx.getImageData(0, 0, S, S).data
  let r = 0, g = 0, b = 0, w = 0
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue
    const [h, s, l] = rgbToHsl(d[i], d[i + 1], d[i + 2])
    void h
    const weight = s * s * (l > 0.12 && l < 0.92 ? 1 : 0.05) + 0.002
    r += d[i] * weight; g += d[i + 1] * weight; b += d[i + 2] * weight; w += weight
  }
  if (!w) return null
  const [h, s] = rgbToHsl(r / w, g / w, b / w)
  if (s < 0.18) return null // 흰색·회색 위주 제품 → 자동 색 대신 기본 테마
  return hslToHex(h, Math.min(1, Math.max(s, 0.62)), 0.44)
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2
  if (mx === mn) return [0, 0, l]
  const d = mx - mn
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn)
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h / 6, s, l]
}
function hslToHex(h, s, l) {
  const f = (n) => {
    const k = (n + h * 12) % 12
    const a = s * Math.min(l, 1 - l)
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// Remotion spring() 과 같은 감쇠 진동 (stiffness 100)
function spring(frame, { damping = 10, mass = 1, stiffness = 100 } = {}) {
  if (frame <= 0) return 0
  const t = frame / FPS
  const w0 = Math.sqrt(stiffness / mass)
  const z = damping / (2 * Math.sqrt(stiffness * mass))
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z)
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t))
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t)
}
const clamp01 = (x) => Math.max(0, Math.min(1, x))
// Remotion interpolate: clamp=true 면 끝값 고정, 아니면 바깥으로 그대로 연장
function lerp(f, [a, b], [x, y], clamp = false) {
  let p = (f - a) / (b - a)
  if (clamp) p = clamp01(p)
  return x + (y - x) * p
}
function seeded(seed) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return ((h >>> 0) % 100000) / 100000
}
const SPARKS = Array.from({ length: 14 }, (_, i) => ({
  x: 0.15 + seeded(`sx${i}`) * 0.7, y: 0.08 + seeded(`sy${i}`) * 0.84, size: 10 + seeded(`ss${i}`) * 16, delay: seeded(`sd${i}`) * 60,
}))

const off = typeof document !== 'undefined' ? { rays: document.createElement('canvas'), sweep: document.createElement('canvas') } : null

// 글자 폭이 넘치면 크기를 줄여 맞춤
function fitFont(ctx, text, weight, size, maxW, min = 28) {
  ctx.font = `${weight} ${size}px ${FONT}`
  while (text && ctx.measureText(text).width > maxW && size > min) { size -= 2; ctx.font = `${weight} ${size}px ${FONT}` }
  return size
}

// 한 프레임 그리기
// opts: { image, theme:{main,mid,deep}, smallLabel, copyL, copyR, backWord, note, productScale, durationFrames }
export function drawFrame(ctx, frame, opts) {
  const { width: CW, height: CH } = ctx.canvas
  const tall = CH > CW
  const k = (opts.durationFrames || BASE_FRAMES) / BASE_FRAMES
  const f = frame / k // 참고 코드 기준 프레임 (10초면 천천히)
  const th = opts.theme
  const img = opts.image
  const ratio = img ? img.width / img.height : 0.41

  // 제품 크기·위치 (가로: 참고 코드 그대로 · 세로: 가운데 아래쪽)
  const scale = Math.max(0.4, Math.min(1.6, opts.productScale || 1))
  let PH = (tall ? 640 : 560) * scale
  let PW = PH * ratio
  const maxW = tall ? CW * 0.8 : CW * 0.46
  if (PW > maxW) { PW = maxW; PH = PW / ratio }
  const cx = CW / 2
  const cy = tall ? 700 : CH / 2 + 10

  ctx.save()
  ctx.clearRect(0, 0, CW, CH)

  // 배경: radial-gradient(circle at 50% 55%, MAIN 0%, MID 45%, DEEP 100%)
  const gx = CW / 2, gy = CH * 0.55
  const R = Math.hypot(Math.max(gx, CW - gx), Math.max(gy, CH - gy))
  const bg = ctx.createRadialGradient(gx, gy, 0, gx, gy, R)
  bg.addColorStop(0, th.main); bg.addColorStop(0.45, th.mid); bg.addColorStop(1, th.deep)
  ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH)

  // 회전 빛줄기 (6° 밝음 · 12° 비움 반복, 가운데만 보이게)
  const rays = lerp(f, [0, 30], [0, 1], true)
  if (off && rays > 0) {
    const rc = off.rays
    if (rc.width !== CW || rc.height !== CH) { rc.width = CW; rc.height = CH }
    const r = rc.getContext('2d')
    r.clearRect(0, 0, CW, CH)
    r.save(); r.translate(CW / 2, CH / 2); r.rotate((f * 0.35 * Math.PI) / 180)
    r.fillStyle = 'rgba(255,255,255,0.22)'
    const RR = Math.hypot(CW, CH) * 1.8
    for (let a = 0; a < 360; a += 18) {
      r.beginPath(); r.moveTo(0, 0); r.arc(0, 0, RR, ((a - 90) * Math.PI) / 180, ((a - 84) * Math.PI) / 180); r.closePath(); r.fill()
    }
    r.restore()
    r.globalCompositeOperation = 'destination-in'
    const mr = Math.hypot(CW / 2, CH / 2) * 0.45 * 1.8
    const m = r.createRadialGradient(CW / 2, CH / 2, 0, CW / 2, CH / 2, mr)
    m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)')
    r.fillStyle = m; r.fillRect(0, 0, CW, CH)
    r.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = rays * 0.5; ctx.drawImage(rc, 0, 0); ctx.globalAlpha = 1
  }

  // 제품 뒤 큰 글자 (윤곽선만)
  if (opts.backWord) {
    // 글자 간격(0.04em)과 시작 확대(1.15배)까지 넣어 화면 안에 맞춤
    let size = tall ? 170 : 230
    const widthAt = (z) => { ctx.font = `900 ${z}px ${FONT}`; return ctx.measureText(opts.backWord).width + z * 0.04 * opts.backWord.length }
    while (widthAt(size) * 1.15 > CW * 0.98 && size > 50) size -= 4
    ctx.save()
    ctx.globalAlpha = lerp(f, [20, 45], [0, 1], true)
    const y = tall ? 470 : 70 + size * 0.62
    const s = lerp(f, [20, 180], [1.15, 1])
    ctx.translate(CW / 2, y); ctx.scale(s, s)
    ctx.font = `900 ${size}px ${FONT}`
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * 0.04}px`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.28)'
    ctx.strokeText(opts.backWord, 0, 0)
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
    ctx.restore()
  }

  // 제품 등장
  const rise = spring(f - 8, { damping: 13, mass: 1.1 })
  const y = lerp(rise, [0, 1], [tall ? 820 : 620, 0])
  const tilt = lerp(rise, [0, 1], [-18, -6]) + Math.sin(f / 22) * 1.2
  const float = Math.sin(f / 18) * 6

  // 바닥 그림자
  const floorY = cy + PH / 2 + 20 // 참고 코드: 제품 아래 300×40 타원
  ctx.save()
  ctx.globalAlpha = clamp01(rise)
  const shw = Math.max(150, PW * 0.65)
  ctx.translate(cx, floorY); ctx.scale(1, 20 / shw)
  const sh = ctx.createRadialGradient(0, 0, 0, 0, 0, shw)
  sh.addColorStop(0, 'rgba(0,0,0,0.55)'); sh.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = sh; ctx.beginPath(); ctx.arc(0, 0, shw, 0, Math.PI * 2); ctx.fill()
  ctx.restore()

  // 제품 + 빛 쓸기 + 반짝이
  if (img) {
    const sweep = lerp(f, [55, 90], [-60, 160], true)
    ctx.save()
    ctx.translate(cx, cy + y + float)
    ctx.rotate((tilt * Math.PI) / 180)
    ctx.translate(-PW / 2, -PH / 2)
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 30
    ctx.drawImage(img, 0, 0, PW, PH)
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
    if (off && sweep > -50 && sweep < 150) {
      const sc = off.sweep
      const sw = Math.ceil(PW), shh = Math.ceil(PH)
      if (sc.width !== sw || sc.height !== shh) { sc.width = sw; sc.height = shh }
      const s = sc.getContext('2d')
      s.globalCompositeOperation = 'source-over'; s.clearRect(0, 0, sw, shh)
      s.drawImage(img, 0, 0, sw, shh)
      s.globalCompositeOperation = 'source-in'
      // CSS linear-gradient(110deg, …) 와 같은 방향·길이
      const ang = (110 * Math.PI) / 180, dx = Math.sin(ang), dy = -Math.cos(ang)
      const len = Math.abs(sw * dx) + Math.abs(shh * dy)
      const g = s.createLinearGradient(sw / 2 - (dx * len) / 2, shh / 2 - (dy * len) / 2, sw / 2 + (dx * len) / 2, shh / 2 + (dy * len) / 2)
      const st = (p) => clamp01(p / 100)
      g.addColorStop(0, 'rgba(255,255,255,0)')
      g.addColorStop(st(sweep - 18), 'rgba(255,255,255,0)')
      g.addColorStop(st(sweep), 'rgba(255,255,255,0.85)')
      g.addColorStop(st(sweep + 18), 'rgba(255,255,255,0)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      s.fillStyle = g; s.fillRect(0, 0, sw, shh)
      ctx.globalCompositeOperation = 'screen'; ctx.drawImage(sc, 0, 0, PW, PH); ctx.globalCompositeOperation = 'source-over'
    }
    SPARKS.forEach((sp) => {
      const t = (f - 50 - sp.delay) / 30
      const o = t > 0 ? Math.max(0, Math.sin(t * Math.PI)) * (t < 3 ? 1 : 0) : 0
      if (o <= 0.01) return
      const size = sp.size * (0.4 + o), q = size / 2
      ctx.save(); ctx.translate(sp.x * PW, sp.y * PH)
      ctx.globalAlpha = o; ctx.shadowColor = '#fff'; ctx.shadowBlur = 4; ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.moveTo(0, -q); ctx.quadraticCurveTo(q * 0.1, -q * 0.1, q, 0); ctx.quadraticCurveTo(q * 0.1, q * 0.1, 0, q)
      ctx.quadraticCurveTo(-q * 0.1, q * 0.1, -q, 0); ctx.quadraticCurveTo(-q * 0.1, -q * 0.1, 0, -q)
      ctx.fill(); ctx.restore()
    })
    ctx.restore()
  }

  // 양옆 문구 (가로: 제품 왼쪽·오른쪽 / 세로: 제품 위·아래)
  const txt = (d) => spring(f - d, { damping: 16 })
  const shadowText = () => { ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 6 }
  const noShadow = () => { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0 }
  const lp = txt(70), rp = txt(80)
  const underline = lerp(f, [95, 120], [0, 180], true)

  if (!tall) {
    const leftEdge = cx - PW / 2 - 36, rightEdge = cx + PW / 2 + 36
    // 왼쪽: 작은 글자(NEW) + 큰 문구, 오른쪽 정렬
    if (lp > 0.001 && (opts.copyL || opts.smallLabel)) {
      ctx.save(); ctx.globalAlpha = clamp01(lp); ctx.translate((1 - lp) * -120, 0)
      ctx.fillStyle = '#fff'; ctx.textAlign = 'right'; ctx.textBaseline = 'top'
      if (opts.smallLabel) {
        ctx.font = `800 22px ${FONT}`; ctx.globalAlpha = clamp01(lp) * 0.85
        if ('letterSpacing' in ctx) ctx.letterSpacing = '6.6px'
        ctx.fillText(opts.smallLabel, leftEdge + 6.6, 400 + 2)
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
        ctx.globalAlpha = clamp01(lp)
      }
      const size = fitFont(ctx, opts.copyL, 900, 84, leftEdge - 24)
      shadowText(); ctx.font = `900 ${size}px ${FONT}`
      ctx.fillText(opts.copyL || '', leftEdge, 400 + 26 + (84 - size) * 0.5)
      ctx.restore()
    }
    // 오른쪽: 큰 문구 + 밑줄
    if (rp > 0.001 && opts.copyR) {
      ctx.save(); ctx.globalAlpha = clamp01(rp); ctx.translate((1 - rp) * 120, 0)
      ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'
      const size = fitFont(ctx, opts.copyR, 900, 84, CW - rightEdge - 24)
      shadowText(); ctx.font = `900 ${size}px ${FONT}`
      ctx.fillText(opts.copyR, rightEdge, 426 + (84 - size) * 0.5)
      noShadow()
      if (underline > 0) roundRect(ctx, rightEdge, 426 + size * 1.05 + 14, underline, 6, 3)
      ctx.restore()
    }
  } else {
    // 세로: 위쪽 가운데에 작은 글자 + 왼쪽 문구(왼쪽에서 들어옴), 제품 아래에 오른쪽 문구(오른쪽에서 들어옴)
    if (lp > 0.001 && (opts.copyL || opts.smallLabel)) {
      ctx.save(); ctx.globalAlpha = clamp01(lp); ctx.translate((1 - lp) * -120, 0)
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      if (opts.smallLabel) {
        ctx.font = `800 24px ${FONT}`; ctx.globalAlpha = clamp01(lp) * 0.85
        if ('letterSpacing' in ctx) ctx.letterSpacing = '7px'
        ctx.fillText(opts.smallLabel, cx + 3.5, 150)
        if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
        ctx.globalAlpha = clamp01(lp)
      }
      const size = fitFont(ctx, opts.copyL, 900, 96, CW - 64)
      shadowText(); ctx.font = `900 ${size}px ${FONT}`
      ctx.fillText(opts.copyL || '', cx, 186)
      ctx.restore()
    }
    if (rp > 0.001 && opts.copyR) {
      ctx.save(); ctx.globalAlpha = clamp01(rp); ctx.translate((1 - rp) * 120, 0)
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      const size = fitFont(ctx, opts.copyR, 900, 96, CW - 64)
      const ty = Math.min(CH - 190, floorY + 40)
      shadowText(); ctx.font = `900 ${size}px ${FONT}`
      ctx.fillText(opts.copyR, cx, ty)
      noShadow()
      if (underline > 0) roundRect(ctx, cx - underline / 2, ty + size * 1.05 + 14, underline, 6, 3)
      ctx.restore()
    }
  }

  // 착지 순간 번쩍
  const flash = f <= 40 ? 0 : f <= 44 ? 0.55 * ((f - 40) / 4) : f <= 60 ? 0.55 * (1 - (f - 44) / 16) : 0
  if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${flash})`; ctx.fillRect(0, 0, CW, CH) }

  // 왼쪽 아래 안내 문구
  if (opts.note) {
    let size = tall ? 18 : 17
    ctx.font = `600 ${size}px ${FONT}`
    while (ctx.measureText(opts.note).width > CW - 52 && size > 10) { size -= 1; ctx.font = `600 ${size}px ${FONT}` }
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
    ctx.fillText(opts.note, 26, CH - 20 - size * 0.2)
  }
  ctx.restore()
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, Math.min(r, w / 2))
  else ctx.rect(x, y, w, h)
  ctx.fill()
}
