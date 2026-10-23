// ─────────────────────────────────────────────────────────────
// 홍보 문구 자동 만들기
// 1) 배포 사이트에 AI가 연결돼 있으면(/api/generate-copy) 사진과 설명을 함께 보고 만듭니다.
// 2) 연결이 없거나 실패하면 브라우저 안의 기본 도우미가 설명 글에서 문구를 뽑아 만듭니다.
// ─────────────────────────────────────────────────────────────
import { sanitizeCopy, clip, isRisky, tidy, LIMITS } from './copyRules.js'

// 사진을 작게 줄여 JPEG 데이터로 (AI 전송용, 긴 변 768px)
export function imageToJpeg(img, maxSide = 768) {
  const s = Math.min(1, maxSide / Math.max(img.width, img.height))
  const c = document.createElement('canvas')
  c.width = Math.round(img.width * s); c.height = Math.round(img.height * s)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height)
  ctx.drawImage(img, 0, 0, c.width, c.height)
  return c.toDataURL('image/jpeg', 0.82)
}

// 'AI로 홍보 문구 다듬기'
// 1) AI 연결이 있으면: 설명 + 상품 사진 + 설명서 사진을 함께 보내 템플릿 칸(작은 글자·왼쪽·오른쪽 문구·영문·안내)에 맞춰 받음
// 2) 없으면: 설명서 사진은 브라우저 OCR로 글자를 읽고, 설명과 합쳐 기본 도우미로 나눠 넣음
export async function generateCopy({ description = '', image = null, docs = [], productName = '', onStep }) {
  try {
    onStep?.('AI에게 보내는 중…')
    const res = await fetch(apiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: description.slice(0, 1200), productName,
        image: image ? imageToJpeg(image, 768) : '',
        docs: docs.slice(0, 3).map((d) => imageToJpeg(d, 1280)),
      }),
      signal: AbortSignal.timeout?.(45000),
    })
    if (res.ok) {
      const data = sanitizeCopy(await res.json())
      if (data.copyL || data.copyR) return { ...data, source: 'ai', ocrText: '' }
    }
  } catch { /* 연결 없음 → 기본 도우미 */ }
  let ocrText = ''
  if (docs.length) {
    onStep?.('설명서 사진에서 글자를 읽는 중… (처음 한 번은 10초쯤 걸려요)')
    try {
      const { readText } = await import('./ocr.js')
      ocrText = await readText(docs)
    } catch { ocrText = '' }
  }
  const text = [description, ocrText].filter((x) => x?.trim()).join('\n')
  return { ...basicCopy(text, productName), source: 'basic', ocrText }
}

function apiUrl() {
  // 해시 라우터 미리보기(파일·임시 주소)에서도 사이트 루트의 /api 를 부르도록
  return new URL('/api/generate-copy', window.location.origin).toString()
}

// ── 기본 도우미 (AI 없이 설명 글로 템플릿 칸 채우기) ─────────────────────
// 업종을 알아보고 그 업종에 맞는 '왼쪽+오른쪽' 문구 조합을 고르고, 설명에서 짧은 이름·표시 정보를 뽑습니다.
const CATEGORY = [
  { re: /미네랄|mineral/i, back: 'MINERAL', pairs: [['매일', '한 잔'], ['물에 타서', '한 잔'], ['가볍게', '미네랄']] },
  { re: /효소|발효/, back: 'ENZYME', pairs: [['하루', '한 포'], ['매일', '가볍게'], ['간편하게', '한 포']] },
  { re: /커피|원두|라떼|아메리카노/, back: 'COFFEE', pairs: [['향긋하게', '한 잔'], ['오늘도', '커피 한 잔'], ['진하게', '한 모금']] },
  { re: /에이드|주스|음료|청\b|수제청|스무디|쉐이크|탄산|콜라|사이다|티\b|차\b/, back: 'REFRESH', pairs: [['시원하게', '한 잔'], ['상큼하게', '한 모금'], ['오늘은', '이 맛']] },
  { re: /빵|베이커리|케이크|쿠키|디저트|떡|마카롱|도넛/, back: 'SWEET', pairs: [['달콤하게', '한 입'], ['갓 구운', '행복'], ['오늘의', '디저트']] },
  { re: /화장품|크림|세럼|스킨|뷰티|피부|에스테틱|앰플|로션/, back: 'BEAUTY', pairs: [['촉촉하게', '매일'], ['나를 위한', '시간'], ['오늘도', '반짝']] },
  { re: /꽃|플라워|부케/, back: 'FLOWER', pairs: [['마음을', '담아'], ['오늘', '한 다발'], ['향기로', '전해요']] },
  { re: /식당|메뉴|요리|한식|고기|밥|국밥|면|찌개|도시락/, back: 'TASTE', pairs: [['든든하게', '한 끼'], ['오늘은', '이 맛'], ['따뜻하게', '한 그릇']] },
]
const DEFAULT = { back: 'SPECIAL', pairs: [['오늘', '바로 이것'], ['지금', '만나보세요'], ['새롭게', '시작']] }
const INFO = /^(제조원|제조사|제조업소|판매원|판매처|원산지|식품유형|내용량|유통기한|소비기한|품목보고번호)\s*[:：]?/u

export function basicCopy(description = '', productName = '') {
  const lines = String(description).split(/\n+/)
    .map((l) => l.replace(/^[\s·ㆍ•\-*▶■□◆◇●○※]+/u, '').trim()).filter(Boolean)
  const info = lines.filter((l) => INFO.test(l)).map((l) => l.replace(/\s*[:：]\s*/u, ': '))
  const body = lines.filter((l) => !INFO.test(l))
  const text = body.join(' ')

  // 상품명: 직접 넣은 이름 → 첫 줄이 짧고 문장이 아니면 그 줄
  let name = clip(productName, LIMITS.productName)
  const first = tidy(body[0] || '')
  if (!name && first && [...first].length <= 12 && !/[다요서고게며.,]$/u.test(first)) name = first

  const cat = CATEGORY.find((c) => c.re.test(text + ' ' + name)) || DEFAULT
  const pairs = cat.pairs.map(([l, r]) => ({ copyL: l, copyR: r }))
  // 이름이 짧으면 '왼쪽 문구 + 상품 이름' 조합을 맨 앞에
  if (name && [...name].length <= 7) pairs.unshift({ copyL: cat.pairs[0][0], copyR: name })

  const smallLabel = /수제|직접|손으로|핸드메이드/.test(text) ? 'HANDMADE'
    : /신선|당일|갓\s|매일\s?아침/.test(text) ? 'FRESH'
      : /국산|국내산/.test(text) ? '국산 원료' : 'NEW'

  return sanitizeCopy({
    productName: name,
    smallLabel,
    copyL: pairs[0].copyL, copyR: pairs[0].copyR,
    options: pairs.slice(1).filter((o) => !isRisky(o.copyL + o.copyR)),
    backWord: cat.back,
    note: info.join(' · '),
  })
}

// 설명을 적는 대로 템플릿 칸에 반영 (업주가 직접 고친 칸은 그대로 둠)
export function syncFromDescription(form) {
  const touched = form.touched || {}
  const out = basicCopy(form.description, touched.productName ? form.productName : '')
  const keep = (k) => (touched[k] ? form[k] : out[k] || form[k])
  return {
    ...form,
    productName: touched.productName ? form.productName : out.productName,
    smallLabel: keep('smallLabel'),
    copyL: keep('copyL'),
    copyR: keep('copyR'),
    backWord: keep('backWord'),
    note: out.note && !touched.note ? out.note : form.note,
    options: out.options,
  }
}
