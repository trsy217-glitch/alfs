// ─────────────────────────────────────────────────────────────
// 알프스 사이트 설정 — 이 파일만 고치면 연락처·채널·사업자 정보가 전체에 반영됩니다.
// 값이 비어 있는('') 채널은 화면에 표시되지 않습니다.
// ─────────────────────────────────────────────────────────────

export const company = {
  nameKo: '알프스',
  // 사업자등록증상 영문 약칭은 AL.F.S 입니다. 브랜드 워드마크(ALFS)와 구분해 주세요.
  nameEn: 'AL.F.S',
  legalName: '알프스(AL.F.S)',
  fullNameEn: 'Alpha Food Store',
  ceo: '이소영',
  // 전자상거래법상 사이트 하단 표시 정보 — 사업자등록증명과 일치해야 합니다.
  bizNumber: '523-70-00224',
  mailOrderNumber: '제 2025-서울마포-1175호',
  address: '서울특별시 마포구 월드컵북로 434, 지하 1층 136호(상암동, 상암 IT Tower)',
  phone: '010-9190-0906',
  // 고객센터 이메일: 알프스 전용 메일함 alfs.ai.2026@gmail.com 을 씁니다.
  // (alfs.kr 도메인에는 메일 서버(MX)가 없어 hello@alfs.kr 같은 도메인 주소로는 받을 수 없습니다.
  //  호스팅케이알에서 메일함이나 포워딩을 열면 이 값을 alfs.kr 주소로 바꿀 수 있습니다.)
  email: 'alfs.ai.2026@gmail.com',
  hours: '평일 10:00 – 18:00 (주말·공휴일 휴무)',
  // 정책 문서 시행일
  policyEffectiveDate: '2026년 11월 16일',
}

// ── 판매 상품 (PG 심사용 표시 정보) ──
export const product = {
  name: '오륜미네랄',
  volume: '1,000ml',
  price: 220000,          // 판매가 (원)
  shippingFee: 3000,      // 기본 배송비 (원)
  freeShippingOver: 50000, // 이 금액 이상 구매 시 무료배송 (원)
  carrier: '한진택배',
  maxQty: 10,
  url: '/products',
}

export const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`

// ── 배송·교환·환불 기준 (상품 화면·주문서·정책 페이지가 같은 문구를 씁니다) ──
// 토스페이먼츠 가맹 심사 요구 사항: 모든 상품 화면과 주문서에 배송 기간과
// 교환·환불 기준이 바로 보여야 합니다. 값을 바꾸면 /refund-policy 와 푸터,
// public/llms.txt 의 같은 문구도 함께 맞춰 주세요.
export const delivery = {
  carrier: product.carrier, // 한진택배
  leadTime: '결제 확인 후 영업일 기준 1~3일 이내 출고',
  leadTimeNote: '주말·공휴일 제외',
  transit: '출고 후 1~3영업일 (도서·산간은 1~2일 추가)',
  islandFee: 6000, // 제주·도서산간 추가 배송비
}

export const refundSummary = {
  withdraw: '상품을 받은 날부터 7일 이내 청약철회 가능',
  changeOfMind: '단순 변심은 왕복 배송비 구매자 부담(편도 3,000원 · 왕복 6,000원)',
  defect: '상품 하자·오배송·배송 중 파손은 무료 반품(판매자 부담)',
  refundTime: '반품 상품 확인 후 3영업일 이내 환급',
  limit: '식품 특성상 포장을 개봉했거나 섭취한 경우 교환·반품이 제한됩니다',
}

// 상품 정보 표(제품 상세) 아래에 공통으로 붙는 행
// (오륜미네랄·효소세상 제품 모두 같은 기준을 씁니다)
export const deliveryRows = [
  ['배송 방법', delivery.carrier],
  ['출고', `${delivery.leadTime} (${delivery.leadTimeNote})`],
  ['배송 기간', delivery.transit],
  ['교환·환불', `${refundSummary.withdraw}. ${refundSummary.changeOfMind}. ${refundSummary.defect}`],
]

// 수량에 따른 배송비 (무료배송 기준 적용)
export const shippingFor = (amount) => (amount >= product.freeShippingOver ? 0 : product.shippingFee)

// 화면·정책에 공통으로 쓰는 배송비 안내 문구
export const shippingSummary = `기본 ${won(product.shippingFee)} · ${won(product.freeShippingOver)} 이상 무료배송 · ${product.carrier}`

// 배송 기간을 한 줄로 (상품 카드·주문서 요약용)
export const deliveryLine = `${delivery.leadTime} (${delivery.leadTimeNote}) · ${delivery.transit}`

// ── 결제 서비스 미제공 카테고리 고지 ──
// 토스페이먼츠 가맹 심사 요청(2026-11-24): AI 마케팅·체험단·파트너 입점 같은 서비스는
// 온라인 카드결제(PG) 제공 대상이 아니며, 사이트 안에서 결제가 이루어지지 않는다는 점을 함께 기재.
// 문구를 바꾸면 /ai-marketing · /partner · 홈 · 푸터 · public/llms.txt 를 함께 맞춰 주세요.
export const servicePaymentNotice =
  '※ 본 페이지에서 안내하는 AI 마케팅·체험단·파트너십 프로그램은 온라인 카드결제 서비스 제공 대상이 아니며, 본 사이트에서 해당 서비스의 온라인 결제가 이루어지지 않습니다. 진행 여부와 비용은 상담과 별도 계약으로 정합니다.'
export const servicePaymentNoticeFooter =
  'AI 마케팅·체험단·파트너 입점 등 서비스는 온라인 카드결제 서비스 제공 대상이 아니며, 본 사이트에서 온라인 결제를 받지 않습니다. 카드결제는 일반식품(오륜미네랄·효소세상) 구매에만 적용됩니다.'

// 상담 채널. url이 비어 있으면 숨겨집니다.
export const channels = [
  {
    id: 'kakao',
    label: '카카오톡 채널 상담',
    desc: '가장 빠른 답변 · 평일 1시간 이내',
    // 알프스 카카오톡 채널 (채널 홈 → '채팅' 버튼으로 상담)
    url: 'https://pf.kakao.com/_JdTPX',
    primary: true,
  },
  {
    id: 'naver',
    label: '네이버 톡톡',
    desc: '스마트스토어 구매 문의',
    // 예: 'https://talk.naver.com/ct/wxxxxx'
    url: '',
  },
  {
    id: 'instagram',
    label: '인스타그램 DM · 미네랄카페',
    desc: '레시피·체험 카페 소식',
    url: 'https://www.instagram.com/mineral_detox_cafe?psln=dnp6cTV1ZHdlZ2xt',
  },
  {
    id: 'youtube',
    label: '유튜브 · 알프스 웰니스',
    desc: '제품 이야기와 영상 콘텐츠',
    url: 'https://www.youtube.com/@alfs_official',
  },
  {
    id: 'phone',
    label: '전화 상담',
    desc: company.hours,
    url: `tel:${company.phone.replace(/-/g, '')}`,
  },
  {
    id: 'email',
    label: '이메일 문의',
    desc: '주문·제휴 문의 접수',
    url: `mailto:${company.email}`,
  },
]

// 상담 신청서 수신 주소 (선택).
// Google Apps Script 웹앱 URL을 넣으면 신청 내용이 구글 시트로 저장됩니다. README 참고.
// 비워 두면 '카카오톡으로 이어서 상담' + 이메일 보내기 방식으로 동작합니다.
export const formEndpoint = ''

export const commerce = {
  // 구매 버튼이 연결될 온라인 스토어 주소 (지금은 사이트 안 주문서로 접수)
  smartstore: '',
  coupang: '',
}

// 로그인은 Firebase Google 계정 로그인 하나만 씁니다 (src/lib/firebase.js · README 참고).
