// ─────────────────────────────────────────────────────────────
// 검색 노출(SEO·GEO) 설정 — 페이지별 제목·설명, 구조화 데이터, 자주 묻는 질문
// 화면(브라우저)과 배포 때 만드는 정적 HTML(scripts/prerender.mjs)이 같은 내용을 씁니다.
// ⚠️ 식품표시광고법: 오륜미네랄 문구에 질병 예방·치료, 기능성 효능, 흡수율 비교, 효능 후기를 넣지 않습니다.
// ─────────────────────────────────────────────────────────────

import { visibleEnzymeProducts, shippingText } from './config/enzyme.js'
import { cafeRecipes } from './config/cafe.js'
import { company, product as mineral } from './config/site.js'

export const SITE_URL = 'https://alfs.kr'
export const SITE_NAME = '알프스 ALFS'
// 알프스.샵 네이버 스마트스토어 (효소세상 제품을 실제로 판매하는 공식 스토어)
export const STORE_URL = 'https://smartstore.naver.com/gunban-kimchi'
const OG_IMAGE = `${SITE_URL}/og-image.jpg`
// 전화번호는 표시용(010-9190-0906)과 국가번호 형태(+82-10-9190-0906)를 함께 둡니다.
const TEL = `+82-${company.phone.replace(/^0/, '').replace(/-/g, '-')}`

// 페이지별 제목·설명 (검색 결과에 보이는 문구)
export const ROUTES = {
  '/': {
    title: '알프스 ALFS | 오륜미네랄 유통 · 소상공인 AI 마케팅',
    description: '알프스(ALFS, Alpha Food Store)는 오륜미네랄 유통과 샵인샵 파트너샵 공급, 소상공인 SNS·AI 마케팅을 함께 하는 웰니스 유통 회사입니다. 잘 팔리고 다시 찾는 제품이 시장에 자리 잡도록 체험·판매·재구매까지 함께 운영합니다.',
  },
  '/company': {
    title: '회사 소개 | 오륜미네랄 유통 구조와 네 개의 판매 채널 — 알프스 ALFS',
    description: '알프스 ALFS는 물건만 넘기는 데서 끝나지 않고 판매 채널·콘텐츠·고객 데이터·확장까지 상품이 팔리는 구조를 만드는 유통·마케팅 파트너입니다. 제조사 유디아미네랄에서 파트너샵·소비자까지 이어지는 유통 경로와 체험 카페·파트너샵·공동구매·온라인 스토어 네 채널, 단계별 확장 계획을 함께 안내합니다.',
  },
  '/products': {
    title: '오륜미네랄 | 뽕잎·누에 원료 액상 미네랄 — 알프스 ALFS',
    description: '오륜미네랄은 충북 보은 제조사 유디아미네랄이 어린 뽕잎과 누에를 원료로 만든 액상 미네랄(기타가공품, 1,000ml)입니다. 원액을 물에 10~30배 희석해 하루 한 잔 마십니다. 알프스가 유통합니다.',
  },
  '/mineral-guide': {
    title: '미네랄 고르는 법 — 액상 미네랄 추천 전에 확인할 5가지 | 알프스 ALFS',
    description: '미네랄 제품을 고를 때는 원료 출처, 제조사, 식품 유형, 먹는 방법, 꾸준히 챙길 수 있는지를 봅니다. 오륜미네랄을 예로 다섯 가지 기준을 정리했습니다.',
  },
  '/products/enzyme': {
    title: '효소세상 발효 음료 · 1.3fit 클렌즈 · 클린바이옴 | 알프스 ALFS',
    description: '효소세상이 만든 발효 효소·미생물 발효 음료를 알프스가 유통합니다. 1.3fit 30일·3일 클렌즈 프로그램, 클린바이옴 자몽 6병·1병. 구성과 판매가, 제품 뒷면 표시사항(성분표) 사진, 섭취 방법을 확인하고 비회원 카드 결제로 주문할 수 있습니다. 5만 원 이상 무료배송.',
  },
  '/products/cafe': {
    title: '미네랄 카페 레시피 6종 | 오륜미네랄 홈카페 음료 — 알프스 ALFS',
    description: '오륜미네랄 60ml를 넣어 만드는 홈카페 음료 6종입니다. 키위벨벳·토마선셋·아보바나스무디·블루바나넛츠·키위브리츠·아보베리요거의 재료와 만드는 순서를 카드 이미지와 함께 안내합니다. 레시피는 무료 음용·활용 가이드이고, 판매 상품은 오륜미네랄 1,000ml(220,000원)입니다.',
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
  '/terms': {
    title: '이용약관 | 알프스(AL.F.S) alfs.kr',
    description: '알프스(AL.F.S)가 운영하는 alfs.kr의 이용약관입니다. 회원가입, 구매신청, 대금지급, 배송, 청약철회·환불, 분쟁해결 조항을 안내합니다.',
  },
  '/privacy': {
    title: '개인정보처리방침 | 알프스(AL.F.S) alfs.kr',
    description: '알프스(AL.F.S)가 처리하는 개인정보 항목과 목적, 보유 기간, 제3자 제공·처리 위탁, 정보주체의 권리, 개인정보 보호책임자를 안내합니다.',
  },
  '/refund-policy': {
    title: '배송·교환·환불 정책 | 알프스(AL.F.S) alfs.kr',
    description: '오륜미네랄 1,000ml(기본 배송비 3,000원)와 효소세상 제품(기본 배송비 4,000원)의 판매가·배송비, 5만 원 이상 무료배송, 제주·도서 산간 추가 배송비 6,000원, 출고 일정, 교환·반품·환불 기준을 안내합니다.',
  },
  '/video-maker': {
    title: '10초 제품 홍보영상 만들기 (체험용) | 알프스 ALFS',
    description: '제품 사진 한 장으로 배경을 지우고 문구를 넣어 10초 홍보영상을 만들어 볼 수 있는 무료 체험 도구입니다.',
  },
  // 토스페이먼츠 결제창이 돌려보내는 화면 — 검색에는 내보내지 않습니다(NOINDEX).
  '/payment/success': {
    title: '결제 결과 안내 | 알프스(AL.F.S) alfs.kr',
    description: '토스페이먼츠 카드 결제의 승인 결과와 주문 내용을 안내합니다.',
  },
  '/payment/fail': {
    title: '결제 결과 안내 | 알프스(AL.F.S) alfs.kr',
    description: '카드 결제가 완료되지 않았을 때의 안내입니다.',
  },
}
// 검색에 내보내지 않는 화면
export const NOINDEX = ['/login', '/my', '/diagnosis/new', '/diagnosis/result', '/payment']

export function metaFor(path) {
  const clean = path.replace(/\/+$/, '') || '/'
  const noindex = NOINDEX.some((p) => clean === p || clean.startsWith(`${p}/`))
  const m = ROUTES[clean] || ROUTES['/']
  return { ...m, path: clean, url: `${SITE_URL}${clean === '/' ? '/' : clean}`, noindex: noindex || !ROUTES[clean] }
}

// ── 자주 묻는 질문 (화면에도 그대로 보이고, 구조화 데이터로도 들어감) ──
// AI 검색이 인용하기 좋은 단위로, 구성·용량·가격·음용법·구매처·배송비·교환/반품을 한 질문에 하나씩 둡니다.
export const FAQ_PRODUCT = [
  {
    q: '오륜미네랄은 어떤 제품인가요?',
    a: '오륜미네랄은 충북 보은의 제조사 유디아미네랄이 어린 뽕잎과 누에를 원료로 만든 액상 미네랄입니다. 식품유형은 기타가공품(일반식품)이고 내용량은 1,000ml입니다. 알프스(ALFS)가 유통합니다.',
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
    a: '알프스 파트너샵(건강·뷰티·카페·헬스샵 등)과 alfs.kr 제품 페이지에서 구매할 수 있습니다. 제품 페이지의 구매하기를 누르면 주문서가 열리고, 배송지와 연락처를 적은 뒤 신용·체크카드로 바로 결제하실 수 있습니다(회원가입·로그인 없이 가능). 카드 결제가 어려우면 전화·카카오톡·이메일로 주문할 수도 있습니다.',
  },
  {
    q: '가격과 배송비는 얼마인가요?',
    a: `오륜미네랄 ${mineral.volume} 1병 판매가는 ${mineral.price.toLocaleString('ko-KR')}원입니다. 기본 배송비는 ${mineral.shippingFee.toLocaleString('ko-KR')}원이고 ${mineral.freeShippingOver.toLocaleString('ko-KR')}원 이상 구매하면 무료배송이라, 1병만 주문해도 배송비는 들지 않습니다. 택배는 ${mineral.carrier}이며, 제주·도서 산간 지역은 추가 배송비 6,000원이 있습니다. 결제 확인 후 영업일 기준 1~3일 이내에 출고합니다.`,
  },
  {
    q: '교환·반품은 어떻게 하나요?',
    a: `상품을 받은 날부터 7일 이내에 전화(${company.phone})나 이메일(${company.email})로 주문 정보와 사유를 알려 주시면 접수합니다. 단순 변심은 반품·교환 배송비를 구매자가 부담하고(반품 편도 3,000원, 무료배송 주문은 왕복 6,000원, 교환 왕복 6,000원), 상품 불량·오배송·배송 중 파손은 판매자 부담입니다. 식품이라 포장을 개봉했거나 섭취한 경우에는 교환·반품이 제한됩니다. 자세한 기준은 배송·교환·환불 정책 페이지에 적혀 있습니다.`,
  },
]
// '미네랄 고르는 법' 화면에 보이는 질문 (제품 페이지 FAQ 가운데 3개만 골라 씁니다)
export const FAQ_GUIDE = FAQ_PRODUCT.filter((f) => /효과 좋은|다시 구매|어디서/.test(f.q))

export const FAQ_ENZYME = [
  {
    q: '효소세상 제품은 어떤 제품인가요?',
    a: '효소세상이 만든 발효 효소·미생물 발효 음료입니다. 1.3fit(일쩜삼) 30일·3일 클렌즈 프로그램과 클린바이옴 자몽 6병·1병을 알프스가 유통합니다. 모두 의약품이 아니며 질병의 예방이나 치료를 위한 제품이 아닙니다.',
  },
  {
    q: '가격과 배송비는 얼마인가요?',
    a: '판매가는 알프스.샵 네이버 스마트스토어의 판매가와 같습니다. 1.3fit 30일 프로그램 396,000원, 1.3fit 3일 클렌즈 99,000원, 클린바이옴 자몽 6병 107,100원, 클린바이옴 1병 19,950원입니다. 스토어 배송 정책은 5만 원 이상 무료배송, 5만 원 미만 배송비 4,000원이고 제주·도서지역은 추가 6,000원입니다. 네이버 쿠폰과 멤버십 적립은 스토어 정책을 따릅니다.',
  },
  {
    q: '어떻게 주문하나요? 카드 결제도 되나요?',
    a: '상품의 구매하기를 누르면 주문서가 열립니다. 배송지와 연락처를 적고 신용·체크카드로 결제하시면 토스페이먼츠 결제창에서 카드 결제가 이루어집니다. 회원가입이나 로그인 없이 비회원으로 결제할 수 있고, 결제가 끝나면 주문이 접수됩니다. 카드 결제가 어려우면 전화·카카오톡·이메일로 주문하실 수도 있습니다.',
  },
  {
    q: '30일 프로그램과 3일 클렌즈는 무엇이 다른가요?',
    a: '1.3fit 30일 프로그램은 엔자임밀 200ml 9포와 클린바이옴 100ml 3병 구성으로 30일 동안 나눠 쓰는 상품(396,000원)이고, 3일 클렌즈는 같은 엔자임밀·클린바이옴을 3일 분량으로 묶은 상품(99,000원)입니다. 처음 써 보시려면 3일 구성을 권합니다.',
  },
  {
    q: '어떻게 마시나요?',
    a: '섭취 방법은 제품 라벨의 안내를 따라 주세요. 클린바이옴 자몽은 상온의 물 300~500ml에 한 병을 희석해 5분 안에 마시고, 식후 2시간 이후나 공복에 마시도록 안내하고 있습니다. 섭취 중 이상이 느껴지면 섭취를 중단하고 전문가와 상담하세요.',
  },
  {
    q: '네이버 스토어에서도 살 수 있나요?',
    a: '네, 각 상품의 상세 화면에 있는 네이버 스토어 링크로 알프스.샵 스마트스토어 상품 페이지에서 바로 구매하실 수 있습니다. 스토어에서 쓰는 쿠폰과 적립은 스토어 결제 화면 기준입니다.',
  },
  {
    q: '1.3fit과 클린바이옴은 무엇이 다른가요?',
    a: '1.3fit은 엔자임밀 파우치와 클린바이옴 병을 묶어 기간별로 나눠 쓰는 프로그램 상품입니다(30일 프로그램 엔자임밀 200ml 9포 + 클린바이옴 100ml 3병 396,000원, 3일 클렌즈 99,000원). 클린바이옴은 자몽 맛 미생물 발효 음료 100ml 병 상품으로 6병 107,100원, 1병 19,950원입니다. 모두 의약품·건강기능식품이 아닌 일반식품이며, 섭취 방법은 제품 라벨 안내를 따릅니다.',
  },
  {
    q: '교환·반품은 어떻게 하나요?',
    a: `상품을 받은 날부터 7일 이내에 전화(${company.phone})나 이메일(${company.email})로 주문 정보와 사유를 알려 주시면 접수합니다. 단순 변심은 반품·교환 배송비를 구매자가 부담하고(반품 편도 3,000원, 무료배송 주문은 왕복 6,000원, 교환 왕복 6,000원), 상품 불량·오배송·배송 중 파손은 판매자 부담입니다. 식품이라 포장을 개봉했거나 섭취한 경우에는 교환·반품이 제한됩니다. 자세한 기준은 배송·교환·환불 정책 페이지에 적혀 있습니다.`,
  },
]

export const FAQ_CAFE = [
  {
    q: '미네랄 카페 레시피는 어떤 페이지인가요?',
    a: '오륜미네랄 60ml를 넣어 만드는 홈카페 음료 6종의 레시피를 카드 이미지와 재료 목록으로 정리한 페이지입니다. 키위벨벳, 토마선셋, 아보바나스무디, 블루바나넛츠, 키위브리츠, 아보베리요거 6종이며, 레시피는 누구나 볼 수 있는 무료 음용·활용 가이드입니다.',
  },
  {
    q: '레시피 6종을 주문하면 오나요?',
    a: '아닙니다. 이 페이지에서 판매하는 상품은 오륜미네랄 1,000ml(220,000원) 한 가지입니다. 레시피는 그 제품을 물 대신 음료에 넣어 마시는 방법을 안내하는 글이고, 완성된 음료나 재료를 판매하지는 않습니다.',
  },
  {
    q: '오륜미네랄은 어떤 제품인가요?',
    a: '충북 보은의 제조사 유디아미네랄이 어린 뽕잎과 누에를 원료로 만든 액상 미네랄입니다. 식품유형은 기타가공품(일반식품), 내용량은 1,000ml이고, 알프스(ALFS)가 유통합니다. 질병의 예방이나 치료를 위한 제품이 아니며 효능·효과를 표방하지 않습니다.',
  },
  {
    q: '레시피에 달걀이 들어가는데 그대로 마셔도 되나요?',
    a: '키위벨벳·토마선셋·아보바나스무디·아보베리요거 네 가지는 카드에 적힌 대로 달걀 2개를 넣습니다. 신선한 달걀을 사용하고, 임산부·어린이·고령자·면역력이 약한 분은 달걀을 빼거나 익힌 재료로 바꾸는 편이 안전합니다. 달걀·견과류·유제품 알레르기가 있으면 해당 재료를 빼고 만드세요.',
  },
  {
    q: '레시피 재료를 바꿔도 되나요?',
    a: '과일과 요구르트·두유는 집에 있는 것으로 바꿔도 됩니다. 오륜미네랄 60ml는 카드에 적힌 양을 그대로 넣고, 처음 만든다면 40ml부터 넣어 보고 입맛에 맞게 늘려도 좋습니다.',
  },
  {
    q: '오륜미네랄은 어떻게 마시나요?',
    a: '원액을 물에 10~30배 희석해 하루 한 잔 마십니다. 레시피처럼 음료에 60ml를 넣어 마시기도 합니다. 농도와 양은 취향에 맞게 조절하고, 섭취 중 이상이 느껴지면 섭취를 중단하고 전문가와 상담하세요.',
  },
]

export const FAQ_COMPANY = [
  {
    q: '알프스(ALFS)는 어떤 회사인가요?',
    a: '알프스(ALFS, Alpha Food Store)는 미네랄·건강식품 유통과 소상공인 SNS·AI 마케팅 컨설팅을 함께 하는 회사입니다. 첫 유통 제품은 제조사 유디아미네랄의 오륜미네랄입니다.',
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
// 공통 조각: 배송·교환/반품 기준 (배송·교환·환불 정책 페이지와 같은 값)
const deliveryTime = {
  '@type': 'ShippingDeliveryTime',
  handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
  transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
}
const returnPolicyLd = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'KR',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 7,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/ReturnShippingFees',
  merchantReturnLink: `${SITE_URL}/refund-policy`,
}
const shippingLd = (fee) => ({
  '@type': 'OfferShippingDetails',
  shippingRate: { '@type': 'MonetaryAmount', value: String(fee), currency: 'KRW' },
  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'KR' },
  deliveryTime,
})

const org = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#org`,
  name: '알프스',
  legalName: company.legalName,
  alternateName: ['ALFS', '알프스 ALFS', '알프스(AL.F.S)', '알프스 유통', company.fullNameEn],
  url: `${SITE_URL}/`,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/apple-touch-icon.png` },
  image: OG_IMAGE,
  description: '오륜미네랄 유통과 샵인샵 파트너샵 공급, 소상공인 SNS·AI 마케팅 컨설팅을 함께 하는 웰니스 유통 회사',
  founder: { '@type': 'Person', name: company.ceo },
  // 아래 사업자 정보·연락처는 사업자 정보 표시(전자상거래법)로 이미 사이트 하단에 공개된 값입니다.
  address: {
    '@type': 'PostalAddress',
    streetAddress: company.address,
    addressLocality: '마포구',
    addressRegion: '서울특별시',
    addressCountry: 'KR',
  },
  telephone: TEL,
  email: company.email,
  identifier: [
    { '@type': 'PropertyValue', name: '사업자등록번호', value: company.bizNumber },
    { '@type': 'PropertyValue', name: '통신판매업 신고번호', value: company.mailOrderNumber },
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: TEL,
      email: company.email,
      areaServed: 'KR',
      availableLanguage: ['ko'],
      hoursAvailable: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '18:00' },
    },
  ],
  areaServed: { '@type': 'Country', name: '대한민국' },
  knowsAbout: ['오륜미네랄', '유디아미네랄', '효소세상', '1.3fit (일쩜삼)', '클린바이옴', '자이모젠', '바이오에너지', '미네랄 유통', '샵인샵', '건강식품 유통', '소상공인 마케팅', 'AI 마케팅 자동화'],
  sameAs: ['https://pf.kakao.com/_JdTPX', 'https://www.instagram.com/mineral_detox_cafe', 'https://www.youtube.com/@alfs_official', STORE_URL],
}

// 판매가 이루어지는 두 곳: alfs.kr 자체 스토어와 알프스.샵 네이버 스마트스토어
const onlineStore = {
  '@type': 'OnlineStore',
  '@id': `${SITE_URL}/#store`,
  name: '알프스(AL.F.S) alfs.kr 온라인 스토어',
  url: `${SITE_URL}/products`,
  parentOrganization: { '@id': `${SITE_URL}/#org` },
  areaServed: { '@type': 'Country', name: '대한민국' },
  telephone: TEL,
  email: company.email,
}
const naverStore = {
  '@type': 'Store',
  '@id': `${SITE_URL}/#naver-store`,
  name: '알프스.샵 네이버 스마트스토어',
  url: STORE_URL,
  parentOrganization: { '@id': `${SITE_URL}/#org` },
  areaServed: { '@type': 'Country', name: '대한민국' },
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
  name: mineral.name,
  alternateName: ['오륜 미네랄', 'Oryun Mineral'],
  description: `충북 보은 유디아미네랄이 어린 뽕잎과 누에를 원료로 만든 액상 미네랄. 원액을 물에 10~30배 희석해 마시는 기타가공품(일반식품), ${mineral.volume}.`,
  image: OG_IMAGE,
  category: '기타가공품',
  size: mineral.volume,
  brand: { '@type': 'Brand', name: '오륜미네랄' },
  manufacturer: { '@type': 'Organization', name: '유디아미네랄', address: { '@type': 'PostalAddress', addressRegion: '충청북도', addressLocality: '보은군', addressCountry: 'KR' } },
  countryOfOrigin: 'KR',
  offers: {
    '@type': 'Offer',
    price: String(mineral.price),
    priceCurrency: 'KRW',
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    url: `${SITE_URL}/products`,
    seller: { '@id': `${SITE_URL}/#org` },
    // 1병 판매가가 이미 5만 원을 넘어 단독 주문도 무료배송입니다.
    shippingDetails: shippingLd(0),
    hasMerchantReturnPolicy: returnPolicyLd,
  },
  additionalProperty: [
    { '@type': 'PropertyValue', name: '내용량', value: mineral.volume },
    { '@type': 'PropertyValue', name: '섭취 방법', value: '원액을 물에 10~30배 희석' },
    { '@type': 'PropertyValue', name: '배송비', value: `기본 ${mineral.shippingFee.toLocaleString('ko-KR')}원 · ${mineral.freeShippingOver.toLocaleString('ko-KR')}원 이상 무료배송 · ${mineral.carrier}` },
    { '@type': 'PropertyValue', name: '유통', value: '알프스(ALFS) 유통' },
  ],
}
const crumbs = (path, title) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '알프스 ALFS', item: `${SITE_URL}/` },
    ...(path === '/' ? [] : [{ '@type': 'ListItem', position: 2, name: title.split('|')[0].split('—')[0].trim(), item: `${SITE_URL}${path}` }]),
  ],
})

// 효소세상 발효 음료 — 구매 페이지가 따로 없어 이 화면의 상세 섹션으로 연결합니다.
const enzymeProductLd = (p) => ({
  '@type': 'Product',
  '@id': `${SITE_URL}/products/enzyme#${p.slug}`,
  name: p.name,
  description: p.summary,
  image: `${SITE_URL}/${p.image}`,
  size: p.option,
  brand: { '@type': 'Brand', name: p.brand },
  manufacturer: { '@type': 'Organization', name: '효소세상' },
  countryOfOrigin: 'KR',
  ...(p.storeUrl ? { sameAs: [p.storeUrl] } : {}),
  offers: {
    '@type': 'Offer',
    price: String(p.price),
    priceCurrency: 'KRW',
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    url: `${SITE_URL}/products/enzyme#p-${p.slug}`,
    seller: { '@id': `${SITE_URL}/#org` },
    // 5만 원 미만인 상품(클린바이옴 1병)만 배송비가 붙습니다.
    shippingDetails: shippingLd(p.shippingFee || 0),
    hasMerchantReturnPolicy: returnPolicyLd,
  },
  additionalProperty: [
    { '@type': 'PropertyValue', name: '구성', value: p.option },
    { '@type': 'PropertyValue', name: '배송비', value: shippingText(p) },
    { '@type': 'PropertyValue', name: '판매처', value: `알프스.샵 네이버 스마트스토어 (${STORE_URL})` },
  ],
})
const enzymeListLd = {
  '@type': 'ItemList',
  name: '효소세상 발효 음료',
  url: `${SITE_URL}/products/enzyme`,
  numberOfItems: visibleEnzymeProducts.length,
  itemListElement: visibleEnzymeProducts.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: enzymeProductLd(p) })),
}

// 미네랄 카페 레시피 6종 — 레시피 자체는 판매 상품이 아니므로 Offer 없이 Recipe 로만 적습니다.
const cafeRecipeLd = (p) => ({
  '@type': 'Recipe',
  '@id': `${SITE_URL}/products/cafe#${p.slug}`,
  name: p.name,
  alternateName: p.nameEn,
  image: `${SITE_URL}/${p.image}`,
  description: p.line,
  recipeCategory: '음료',
  recipeCuisine: '한국',
  recipeYield: '1잔',
  recipeIngredient: p.ingredients,
  recipeInstructions: [
    { '@type': 'HowToStep', text: '재료를 손질해 믹서에 넣고 오륜미네랄 60ml와 함께 매끄러워질 때까지 갑니다.' },
    { '@type': 'HowToStep', text: '갈아서 바로 마십니다. 남으면 냉장 보관하고 그날 안에 드세요.' },
  ],
  author: { '@id': `${SITE_URL}/#org` },
  inLanguage: 'ko-KR',
})
const cafeListLd = {
  '@type': 'ItemList',
  name: '오륜미네랄 카페 레시피 6종',
  url: `${SITE_URL}/products/cafe`,
  numberOfItems: cafeRecipes.length,
  itemListElement: cafeRecipes.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: cafeRecipeLd(p) })),
}

export function jsonLdFor(path) {
  const m = metaFor(path)
  const graph = [org, website, onlineStore, naverStore]
  if (m.path !== '/') graph.push(crumbs(m.path, m.title))
  if (m.path === '/products') graph.push(product, faqLd(FAQ_PRODUCT))
  if (m.path === '/mineral-guide') graph.push({ '@type': 'Article', headline: m.title, description: m.description, author: { '@id': `${SITE_URL}/#org` }, publisher: { '@id': `${SITE_URL}/#org` }, mainEntityOfPage: m.url, about: { '@id': `${SITE_URL}/products#oryun` }, inLanguage: 'ko-KR' }, faqLd(FAQ_GUIDE), product)
  if (m.path === '/company') graph.push(faqLd(FAQ_COMPANY))
  if (m.path === '/products/enzyme') graph.push(enzymeListLd, faqLd(FAQ_ENZYME))
  if (m.path === '/products/cafe') graph.push(cafeListLd, faqLd(FAQ_CAFE))
  return { '@context': 'https://schema.org', '@graph': graph }
}

export { OG_IMAGE }
