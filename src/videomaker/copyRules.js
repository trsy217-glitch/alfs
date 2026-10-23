// ─────────────────────────────────────────────────────────────
// 홍보 문구 규칙 (브라우저 도우미와 /api/generate-copy 가 함께 씀)
// 식품표시광고법 등: 질병 예방·치료, 효능·효과, 최상급·비교 표현은 영상에 넣지 않습니다.
// ─────────────────────────────────────────────────────────────

export const LIMITS = { copyL: 10, copyR: 10, smallLabel: 12, backWord: 10, note: 70, productName: 16 }

// 걸러낼 표현 (문구 안에 있으면 그 문구는 버림)
const FORBIDDEN = [
  /치료|완치|예방|처방|약효|질병|질환|병이\s?낫|낫는|증상/,
  /효능|효과|면역|개선|회복|강화|재생|해독|디톡스|정화/,
  /혈압|혈당|당뇨|콜레스테롤|항암|(^|[^가-힣])암([^가-힣]|$)|관절|골다공|변비|불면|탈모|노화\s?방지|항산화/,
  /다이어트|살\s?빠|체지방|감량|붓기|부기/,
  /흡수율|흡수\s?잘|최고|최초|최상|1위|넘버\s?원|유일|100\s?%|부작용\s?없/,
]

export const isRisky = (s = '') => FORBIDDEN.some((re) => re.test(s))

// 문구 끝 말투 정리: "~입니다", "~해요" 같은 서술어를 떼서 광고 문구처럼 짧게
export function tidy(s = '') {
  return String(s)
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/["“”‘’'`]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/(입니다|이에요|예요|이죠|합니다|해요|됩니다|돼요|있습니다|있어요|드립니다|드려요|이다|하다)[.!~ ]*$/u, '')
    .replace(/[.!?~,·\s]+$/u, '')
    .trim()
}

// 글자 수에 맞게 자르기 (가능하면 띄어쓰기에서)
export function clip(s = '', max) {
  s = tidy(s)
  if ([...s].length <= max) return s
  const chars = [...s].slice(0, max)
  const cut = chars.lastIndexOf(' ')
  return (cut >= Math.floor(max * 0.55) ? chars.slice(0, cut) : chars).join('').trim()
}

// 생성 결과를 영상 템플릿 칸에 맞게 정리 (문구 조합 후보 options 포함)
export function sanitizeCopy(raw = {}) {
  const safe = (v, max) => { const t = clip(v || '', max); return isRisky(t) ? '' : t }
  const seen = new Set()
  const options = [{ copyL: raw.copyL, copyR: raw.copyR }, ...(Array.isArray(raw.options) ? raw.options : [])]
    .map((o) => ({ copyL: safe(o?.copyL, LIMITS.copyL), copyR: safe(o?.copyR, LIMITS.copyR) }))
    .filter((o) => (o.copyL || o.copyR) && !seen.has(o.copyL + '|' + o.copyR) && seen.add(o.copyL + '|' + o.copyR))
    .slice(0, 4)
  const label = safe(raw.smallLabel, LIMITS.smallLabel)
  return {
    productName: safe(raw.productName, LIMITS.productName),
    smallLabel: /^[\x20-\x7E]+$/.test(label) ? label.toUpperCase() : label,
    copyL: options[0]?.copyL || '',
    copyR: options[0]?.copyR || '',
    backWord: String(raw.backWord || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').trim().slice(0, LIMITS.backWord),
    note: safe(raw.note, LIMITS.note),
    options,
  }
}

// AI에게 줄 지시문
export const SYSTEM_PROMPT = `당신은 소상공인 상품의 6~10초 제품 광고 영상에 들어갈 한국어 문구를 쓰는 카피라이터입니다.
영상 구성: 가운데에서 상품이 솟아오르고, 상품 왼쪽에 작은 글자(smallLabel)와 큰 문구(copyL), 오른쪽에 큰 문구(copyR)가 들어옵니다.
copyL 과 copyR 는 이어 읽으면 한 문장이 됩니다. 예: '시원하게' + '한 캔', '매일 아침' + '한 잔', '갓 구운' + '행복'.
뒤에는 큰 영어 단어(backWord)가 윤곽선으로 깔리고, 왼쪽 아래에 작은 안내 한 줄(note)이 나옵니다.

업주가 준 설명·상품 사진·설명서(라벨) 사진만 근거로 씁니다. 사진의 글자도 읽어서 씁니다. 근거에 없는 사실(수상, 숫자, 원산지, 인증)은 지어내지 않습니다.

반드시 지킬 것 (식품 등의 표시·광고에 관한 법률, 표시광고법):
- 질병의 예방·치료·완화, 효능·효과, 면역·혈압·혈당·다이어트·해독 같은 건강 기능 표현 금지
- '최고', '최초', '1위', '유일', '100%' 같은 최상급·비교 표현 금지

형식:
- copyL: 2~6자 (최대 8자). 느낌·때·방법 (예: 시원하게, 매일 아침, 갓 구운)
- copyR: 2~6자 (최대 8자). 상품을 가리키는 짧은 말 (예: 한 잔, 한 캔, 레몬청)
- options: copyL·copyR 다른 조합 3개 (서로 다른 매력)
- smallLabel: copyL 위 작은 글자. 영어 대문자 3~9자(NEW, FRESH, HANDMADE) 또는 한국어 2~6자
- backWord: 영어 한 단어 대문자 3~9자 (예: REFRESH, MINERAL)
- productName: 상품·가게 이름 (모르면 빈칸)
- note: 40자 이내. 사진·설명에 제조원·원산지·용량·식품유형 같은 표시 정보가 있으면 그것으로. 수상·특허가 제조사의 것이면 '수상·특허: 제조사 OO 보유'처럼. 없으면 빈칸
마침표·이모지·따옴표는 쓰지 않습니다.

JSON 하나만 출력합니다:
{"productName":"","smallLabel":"","copyL":"","copyR":"","options":[{"copyL":"","copyR":""}],"backWord":"","note":""}`
