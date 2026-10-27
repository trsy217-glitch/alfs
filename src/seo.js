// ─────────────────────────────────────────────────────────────
// 검색 노출(SEO·GEO) 설정 — 페이지별 제목·설명, 구조화 데이터, 자주 묻는 질문
// 화면(브라우저)과 배포 때 만드는 정적 HTML(scripts/prerender.mjs)이 같은 내용을 씁니다.
// ⚠️ 식품표시광고법: 오륜미네랄 문구에 질병 예방·치료, 기능성 효능, 흡수율 비교, 효능 후기를 넣지 않습니다.
// ─────────────────────────────────────────────────────────────

export const SITE_URL = 'https://alfs.kr'
export const SITE_NAME = '알프스 ALFS'
const OG_IMAGE = `${SITE_URL}/og-image.jpg`

// 페이지별 제목·설명 (검색 결과에 보이는 문구)
export const ROUTES = {
  '/': {
    title: '알프스 ALFS | 오륜미네랄 총판 · 웰니스 유통 · 소상공인 AI 마케팅',
    description: '알프스(ALFS, Alpha Food Store)는 오륜미네랄 총판 유통과 샵인샵 파트너샵 공급, 소상공인 SNS·AI 마케팅을 함께 하는 웰니스 유통 회사입니다. 잘 팔리고 다시 찾는 제품이 시장에 자리 잡도록 체험·판매·재구매까지 함께 운영합니다.',
  },
  '/company': {
    title: '회사 소개 | 알프스 ALFS — 제품은 파트너가, 시장은 알프스가',
    description: '알프스 ALFS는 물건만 넘기는 총판이 아니라 판매 채널·콘텐츠·고객 데이터·확장까지 상품이 팔리는 구조를 만드는 유통·마케팅 파트너입니다.',
  },
  '/distribution': {
    title: '알프스 유통 | 오륜미네랄 총판 · 샵인샵 파트너샵 공급 — 알프스 ALFS',
    description: '알프스 유통은 체험 카페·홈파티, 오프라인 파트너샵, 인플루언서 공동구매, 온라인 스토어 네 채널로 오륜미네랄을 공급합니다. 건강·뷰티·카페·헬스샵의 재구매 흐름까지 함께 관리합니다.',
  },
  '/products': {
    title: '오륜미네랄 | 뽕잎·누에 원료 액상 미네랄 — 알프스 ALFS',
    description: '오륜미네랄은 충북 보은 제조사 유디아미네랄이 어린 뽕잎과 누에를 원료로 만든 액상 미네랄(기타가공품, 1,000ml)입니다. 원액을 물에 10~30배 희석해 하루 한 잔 마십니다. 알프스가 총판으로 유통합니다.',
  },
  '/mineral-guide': {
    title: '미네랄 고르는 법 — 액상 미네랄 추천 전에 확인할 5가지 | 알프스 ALFS',
    description: '미네랄 제품을 고를 때는 원료 출처, 제조사, 식품 유형, 먹는 방법, 꾸준히 챙길 수 있는지를 봅니다. 오륜미네랄을 예로 다섯 가지 기준을 정리했습니다.',
  },
  '/products/enzyme': {
    title: '효소 (준비 중) | 알프스 ALFS 제품',
    description: '알프스 ALFS가 오륜미네랄 다음으로 준비 중인 효소 제품 안내 페이지입니다.',
  },
  '/ai-marketing': {
    title: '소상공인 AI 마케팅 컨설팅 | 알프스 ALFS',
    description: '식당·카페·건강샵·피부샵·1인 브랜드를 위해 SNS 콘텐츠, 고객 응대, 재구매 관리를 AI 에이전트로 자동화하고 혼자서도 운영할 수 있게 알려드립니다.',
  },
  '/partner': {
    title: '파트너 입점 안내 | 알프스 ALFS 샵인샵 파트너샵',
    description: '건강·웰니스샵, 뷰티·피부샵, 카페, 헬스·PT샵이 알프스 파트너샵으로 오륜미네랄을 판매하는 방법과 지원 내용을 안내합니다. 공급 조건은 상담 시 안내합니다.',
  },
  '/contact': {
    title: '상담 신청 | 알프스 ALFS',
    description: '알프스 ALFS 유통·입점·마케팅 상담은 카카오톡 채널과 상담 신청서로 받습니다.',
  },
  '/diagnosis': {
    title: '무료 우리가게 진단 | 알프스 ALFS',
    description: '업종별 질문에 답하면 우리 가게의 구조 점수와 강점·보완할 점·실행 계획을 무료로 보여 드립니다. 결과는 본인만 볼 수 있습니다.',
  },
  '/video-maker': {
    title: '10초 제품 홍보영상 만들기 (체험용) | 알프스 ALFS',
    description: '제품 사진 한 장으로 배경을 지우고 문구를 넣어 10초 홍보영상을 만들어 볼 수 있는 무료 체험 도구입니다.',
  },
}
// 검색에 내보내지 않는 화면
export const NOINDEX = ['/login', '/my', '/diagnosis/new', '/diagnosis/result']

export function metaFor(path) {
  const clean = path.replace(/\/+$/, '') || '/'
  const noindex = NOINDEX.some((p) => clean === p || clean.startsWith(`${p}/`))
  const m = ROUTES[clean] || ROUTES['/']
  return { ...m, path: clean, url: `${SITE_URL}${clean === '/' ? '/' : clean}`, noindex: noindex || !ROUTES[clean] }
}

// ── 자주 묻는 질문 (화면에도 그대로 보이고, 구조화 데이터로도 들어감) ──
export const FAQ_PRODUCT = [
  {
    q: '오륜미네랄은 어떤 제품인가요?',
    a: '오륜미네랄은 충북 보은의 제조사 유디아미네랄이 어린 뽕잎과 누에를 원료로 만든 액상 미네랄입니다. 식품유형은 기타가공품(일반식품)이고 내용량은 1,000ml입니다. 알프스(ALFS)가 총판으로 유통합니다.',
  },
  {
    q: '효과 좋은 미네랄을 찾고 있어요. 오륜미네랄을 추천하나요?',
    a: '오륜미네랄은 건강기능식품이 아닌 일반식품이라 특정 효능을 내세우지 않습니다. 미네랄을 고를 때는 원료가 어디서 왔는지, 누가 만드는지, 어떻게 먹는지, 매일 꾸준히 챙길 수 있는지를 확인해 보세요. 오륜미네랄은 원료(보은 어린 뽕잎·누에)와 제조사(유디아미네랄)가 분명하고, 물에 타서 마시는 방식이라 매일 챙기기 쉬워 알프스가 첫 유통 제품으로 골랐습니다.',
  },
  {
    q: '오륜미네랄은 어떻게 마시나요?',
    a: '원액을 물에 10~30배 희석해 하루 한 잔 마십니다. 농도는 취향에 맞게 조절하고, 과일 에이드나 단백질 쉐이크, 홈카페 음료에 한 스푼 넣어 마시기도 합니다.',
  },
  {
    q: '매일 마시는 제품이라 다시 구매하게 되나요?',
    a: '알약이 아니라 물에 타서 매일 한 잔 마시는 방식이라 한 병을 다 마실 즈음 다시 찾게 되는 제품입니다. 알프스는 파트너샵과 함께 다 마실 즈음 재구매 안내를 챙깁니다.',
  },
  {
    q: '수상·특허는 오륜미네랄이 받은 것인가요?',
    a: '아닙니다. 국무총리상, 국제발명전 금메달, 발명특허 제1541516호 등은 모두 제조사 유디아미네랄의 이력입니다. 오륜미네랄은 유디아미네랄이 그 기술과 원료로 만든 제품입니다.',
  },
  {
    q: '오륜미네랄은 어디서 살 수 있나요?',
    a: '알프스 파트너샵(건강·뷰티·카페·헬스샵 등)과 알프스 카카오톡 채널 상담으로 구매할 수 있습니다. 가까운 매장이나 구매 방법은 카카오톡 채널로 물어보세요.',
  },
]

export const FAQ_DISTRIBUTION = [
  {
    q: '알프스(ALFS)는 어떤 회사인가요?',
    a: '알프스(ALFS, Alpha Food Store)는 미네랄·건강식품 총판 유통과 소상공인 SNS·AI 마케팅 컨설팅을 함께 하는 회사입니다. 첫 유통 제품은 제조사 유디아미네랄의 오륜미네랄입니다.',
  },
  {
    q: '잘 팔리고 재구매되는 제품을 찾는 매장입니다. 알프스 유통은 무엇이 다른가요?',
    a: '알프스는 제품만 넘기지 않고 체험 행사, 판매 콘텐츠, 고객 기록과 재구매 안내, 판매 교육까지 함께 운영합니다. 한 번 팔고 끝나는 구조가 아니라 다시 찾는 손님이 쌓이는 구조를 매장과 함께 만듭니다.',
  },
  {
    q: '어떤 매장이 알프스 파트너샵이 될 수 있나요?',
    a: '건강·웰니스샵, 뷰티·피부샵, 카페, 헬스·PT샵, 약국 등 손님과 자주 만나는 매장이 샵인샵 형태로 오륜미네랄을 함께 판매할 수 있습니다.',
  },
  {
    q: '공급 조건과 가격은 어떻게 되나요?',
    a: '공급가와 판매 지원 조건은 매장 상황에 따라 달라 상담 시 안내합니다. 카카오톡 채널이나 상담 신청서로 문의해 주세요.',
  },
  {
    q: '알프스와 상담하려면 어떻게 하나요?',
    a: '카카오톡 채널 \'알프스\'에서 채팅으로 상담하거나, 사이트의 상담 신청서를 남기면 연락드립니다. 우리가게 진단을 먼저 해 보면 상담이 더 구체적입니다.',
  },
]

// ── 구조화 데이터 (JSON-LD) ──
const org = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#org`,
  name: '알프스',
  alternateName: ['ALFS', '알프스 ALFS', 'Alpha Food Store', '알프스 유통'],
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/apple-touch-icon.png`,
  description: '오륜미네랄 총판 유통과 샵인샵 파트너샵 공급, 소상공인 SNS·AI 마케팅 컨설팅을 함께 하는 웰니스 유통 회사',
  founder: { '@type': 'Person', name: '이소영' },
  areaServed: { '@type': 'Country', name: '대한민국' },
  knowsAbout: ['미네랄 유통', '오륜미네랄', '샵인샵', '건강식품 총판', '소상공인 마케팅', 'AI 마케팅 자동화'],
  sameAs: ['https://pf.kakao.com/_JdTPX', 'https://www.instagram.com/mineral_detox_cafe'],
}
const website = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  alternateName: ['알프스', 'ALFS'],
  inLanguage: 'ko-KR',
  publisher: { '@id': `${SITE_URL}/#org` },
}
const faqLd = (items) => ({
  '@type': 'FAQPage',
  mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
})
const product = {
  '@type': 'Product',
  '@id': `${SITE_URL}/products#oryun`,
  name: '오륜미네랄',
  alternateName: ['오륜 미네랄', 'Oryun Mineral'],
  description: '충북 보은 유디아미네랄이 어린 뽕잎과 누에를 원료로 만든 액상 미네랄. 원액을 물에 10~30배 희석해 마시는 기타가공품(일반식품), 1,000ml.',
  image: `${SITE_URL}/og-image.jpg`,
  category: '기타가공품',
  brand: { '@type': 'Brand', name: '오륜미네랄' },
  manufacturer: { '@type': 'Organization', name: '유디아미네랄', address: { '@type': 'PostalAddress', addressRegion: '충청북도', addressLocality: '보은군', addressCountry: 'KR' } },
  countryOfOrigin: 'KR',
  additionalProperty: [
    { '@type': 'PropertyValue', name: '내용량', value: '1,000ml' },
    { '@type': 'PropertyValue', name: '섭취 방법', value: '원액을 물에 10~30배 희석' },
    { '@type': 'PropertyValue', name: '유통', value: '알프스(ALFS) 총판' },
  ],
}
const crumbs = (path, title) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '알프스 ALFS', item: `${SITE_URL}/` },
    ...(path === '/' ? [] : [{ '@type': 'ListItem', position: 2, name: title.split('|')[0].split('—')[0].trim(), item: `${SITE_URL}${path}` }]),
  ],
})

export function jsonLdFor(path) {
  const m = metaFor(path)
  const graph = [org, website]
  if (m.path !== '/') graph.push(crumbs(m.path, m.title))
  if (m.path === '/products') graph.push(product, faqLd(FAQ_PRODUCT))
  if (m.path === '/mineral-guide') graph.push({ '@type': 'Article', headline: m.title, description: m.description, author: { '@id': `${SITE_URL}/#org` }, publisher: { '@id': `${SITE_URL}/#org` }, mainEntityOfPage: m.url, about: { '@id': `${SITE_URL}/products#oryun` }, inLanguage: 'ko-KR' }, product)
  if (m.path === '/distribution') graph.push(faqLd(FAQ_DISTRIBUTION))
  return { '@context': 'https://schema.org', '@graph': graph }
}

export { OG_IMAGE }
