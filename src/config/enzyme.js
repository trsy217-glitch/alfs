// ─────────────────────────────────────────────────────────────
// 효소세상 제품 6종 — 알프스.샵(네이버 스마트스토어) 판매 페이지에서 확인한 값만 적었습니다.
//  · 판매가 = 스토어 '상품 가격'(쿠폰 적용 전). 정가(listPrice)는 스토어 '할인 전 가격'.
//  · 원산지·용량·포장수량은 스토어 상품정보 고시에 적힌 값입니다.
//  · 확인되지 않은 값은 비워 두고 spec 에 넣지 않습니다. (지어내지 않음)
// ⚠️ 식품표시광고법·PG 심사: 질병 예방·치료, 기능성, 다이어트 효과, 숙변 제거 같은
//    효능 표현은 쓰지 않습니다. 제품명은 스토어에서 식별되는 이름만 남기고
//    설명은 구성·용량·섭취 방법 같은 사실 위주로 적습니다.
// ─────────────────────────────────────────────────────────────

const STORE = 'https://smartstore.naver.com/gunban-kimchi/products'

// 스토어 배송 정책: 기본 배송비 4,000원, 5만 원 이상 무료배송, 제주·도서지역 추가 6,000원.
// 5만 원이 넘는 상품(1.3fit·바이오에너지·자이모젠·클린바이옴 6병)은 무료배송이고,
// 19,950원짜리 클린바이옴 1병만 5만 원 미만이라 배송비 4,000원이 붙습니다.
export const enzymeShipping = {
  fee: 4000,
  freeOver: 50000,
  // 알프스 스마트스토어 출고 택배사와 같이 한진택배로 표기합니다.
  carrier: '한진택배',
  note: '5만 원 이상 무료배송 · 5만 원 미만 배송비 4,000원 · 제주·도서지역은 추가 6,000원',
}

// 상품 카드·상세에 쓰는 배송비 표기 (상품에 배송비를 적지 않으면 무료배송)
export const shippingText = (p) => {
  const fee = p.shippingFee || 0
  if (!fee) return '무료배송'
  const over = p.freeShippingOver || 0
  return over
    ? `배송비 ${fee.toLocaleString()}원 · ${over.toLocaleString()}원 이상 무료`
    : `배송비 ${fee.toLocaleString()}원`
}

export const enzymeProducts = [
  {
    id: 'fit30',
    slug: 'fit-30',
    name: '1.3fit 30일 클렌즈 프로그램',
    brand: '1.3fit (일쩜삼)',
    tag: '30일',
    option: '엔자임밀 200ml 9포 + 클린바이옴 100ml 3병',
    price: 396000,
    listPrice: 600000,
    image: 'images/enzyme/13fit-30d.webp',
    imageAlt: '1.3fit 30일 클렌즈 프로그램 박스와 엔자임밀 파우치, 클린바이옴 병',
    summary:
      '미생물 발효 효소 엔자임밀과 클린바이옴을 30일 동안 나눠 마시는 구성입니다. 파우치와 병으로 나뉘어 있어 하루 분량을 챙기기 쉽고, 설탕을 넣지 않은 제품입니다.',
    points: ['엔자임밀 파우치 9포', '클린바이옴 병 3병', '무설탕 · 실온보관'],
    spec: [
      ['판매가', '396,000원'],
      ['정가', '600,000원'],
      ['구성', '엔자임밀 200ml × 9포 + 클린바이옴 100ml × 3병'],
      ['제조사', '효소세상'],
      ['브랜드', '1.3fit (일쩜삼)'],
      ['원산지', '국산(경기도 여주시)'],
      ['용기', '파우치'],
      ['특징', '무설탕'],
      ['보관방법', '실온보관 (직사광선을 피해 서늘한 곳)'],
      ['배송비', '무료배송'],
    ],
    usage: [
      { t: '하루 분량씩', d: '엔자임밀 파우치와 클린바이옴 병을 하루 분량으로 나눠 챙깁니다.' },
      { t: '물과 함께', d: '파우치는 물에 풀어 마시고, 클린바이옴은 물에 희석해 마시는 제품입니다. 비율은 제품 라벨 안내를 따르세요.' },
      { t: '실온보관', d: '직사광선을 피해 서늘한 곳에 두고, 개봉한 뒤에는 안내된 방법대로 보관합니다.' },
    ],
    labels: [
      { src: 'images/labels/enzymemeal-label.jpg', caption: '엔자임밀 200ml 파우치 뒷면 표시사항', alt: '엔자임밀 200ml 파우치 뒷면 — 제품명, 품목보고번호, 원재료 및 함량, 섭취방법, 제조원 표시사항' },
      { src: 'images/labels/cleanbiome-label.jpg', caption: '클린바이옴 100ml 병 뒷면 표시사항', alt: '클린바이옴 100ml 병 뒷면 — 제품명, 품목보고번호, 원재료 및 함량, 섭취방법, 제조원 표시사항' },
    ],
    storeUrl: `${STORE}/11894887217`,
    storeId: '11894887217',
  },
  {
    id: 'fit3',
    slug: 'fit-3',
    name: '1.3fit 3일 클렌즈',
    brand: '1.3fit (일쩜삼)',
    tag: '3일',
    option: '3일 구성 (엔자임밀 + 클린바이옴)',
    price: 99000,
    listPrice: 150000,
    image: 'images/enzyme/13fit-3d.webp',
    imageAlt: '1.3fit 3일 클렌즈 박스와 엔자임밀 파우치, 클린바이옴 병',
    summary:
      '30일 프로그램과 같은 엔자임밀·클린바이옴을 3일 분량으로 묶은 구성입니다. 처음 써 보거나 짧게 시험해 보려는 분들이 찾는 상품입니다.',
    points: ['3일 분량 구성', '엔자임밀 + 클린바이옴', '무료배송'],
    spec: [
      ['판매가', '99,000원'],
      ['정가', '150,000원'],
      ['구성', '3일 분량 (엔자임밀 · 클린바이옴)'],
      ['브랜드', '1.3fit (일쩜삼)'],
      ['배송비', '무료배송'],
    ],
    usage: [{ t: '라벨 안내대로', d: '섭취 방법과 보관 방법은 제품 라벨의 안내를 따라 주세요.' }],
    labels: [
      { src: 'images/labels/enzymemeal-label.jpg', caption: '엔자임밀 200ml 파우치 뒷면 표시사항', alt: '엔자임밀 200ml 파우치 뒷면 — 제품명, 품목보고번호, 원재료 및 함량, 섭취방법, 제조원 표시사항' },
      { src: 'images/labels/cleanbiome-label.jpg', caption: '클린바이옴 100ml 병 뒷면 표시사항', alt: '클린바이옴 100ml 병 뒷면 — 제품명, 품목보고번호, 원재료 및 함량, 섭취방법, 제조원 표시사항' },
    ],
    storeUrl: `${STORE}/11790100246`,
    storeId: '11790100246',
    note: '세부 원재료·원산지 등 상품 고시 정보는 스토어 상품 페이지와 제품 라벨에서 확인하실 수 있습니다.',
  },
  {
    id: 'bioenergy',
    slug: 'bioenergy',
    // 2026-11-23 임시 숨김: 제품 뒷면 표시사항(성분표) 사진이 아직 없어 사이트에 노출하지 않습니다.
    // 사진을 받으면 이 줄만 지우면 다시 목록·상세에 나타납니다. (데이터는 그대로 둡니다)
    hidden: true,
    name: '바이오에너지 클렌즈 프로그램',
    brand: '바이오에너지',
    tag: '8포',
    option: '200ml × 8포 (파우치)',
    price: 220000,
    listPrice: null,
    image: 'images/enzyme/bioenergy.webp',
    imageAlt: '바이오에너지 클렌즈 프로그램 박스와 파우치 8포',
    summary:
      '발효 효소를 파우치에 담은 8포 구성입니다. K·I·L 클린과 L-케어 파우치가 한 상자에 들어 있어, 하루 한 포씩 챙겨 마시는 방식으로 쓰입니다.',
    points: ['200ml 파우치 8포', '발효 효소', '무설탕 · 실온보관'],
    spec: [
      ['판매가', '220,000원'],
      ['구성', '200ml × 8포'],
      ['제조사', '효소세상'],
      ['브랜드', '바이오에너지'],
      ['원산지', '국산(경기도 이천시)'],
      ['용기', '파우치'],
      ['특징', '무설탕'],
      ['보관방법', '실온보관 (직사광선을 피해 서늘한 곳)'],
      ['배송비', '무료배송'],
    ],
    usage: [{ t: '라벨 안내대로', d: '섭취 방법과 보관 방법은 제품 라벨의 안내를 따라 주세요.' }],
    storeUrl: `${STORE}/11791440289`,
    storeId: '11791440289',
  },
  {
    id: 'zymogen',
    slug: 'zymogen',
    // 2026-11-23 임시 숨김: 제품 뒷면 표시사항(성분표) 사진이 아직 없어 사이트에 노출하지 않습니다.
    // 사진을 받으면 이 줄만 지우면 다시 목록·상세에 나타납니다. (데이터는 그대로 둡니다)
    hidden: true,
    name: '자이모젠',
    brand: '자이모젠 (Zymogen)',
    tag: '10병',
    option: '100ml × 10병 (1,000ml)',
    price: 180000,
    listPrice: null,
    image: 'images/enzyme/zymogen.webp',
    imageAlt: '자이모젠 박스와 병 제품',
    imageDetail: 'images/enzyme/zymogen-set.webp',
    imageDetailAlt: '자이모젠 박스와 병 구성 전체',
    summary:
      '효소세상의 미생물 발효 음용 제품입니다. 100ml 병 10병이 한 상자에 담겨 오는 구성으로, 한 병씩 꺼내 마시면 됩니다.',
    points: ['100ml 10병 (1,000ml)', '박스 포장', '실온보관'],
    spec: [
      ['판매가', '180,000원'],
      ['구성', '100ml × 10병 (1,000ml)'],
      ['제조', '효소세상'],
      ['브랜드', '자이모젠 (Zymogen)'],
      ['원산지', '국산(경기도 여주시)'],
      ['배송비', '무료배송'],
    ],
    usage: [{ t: '라벨 안내대로', d: '섭취 방법과 보관 방법은 제품 라벨의 안내를 따라 주세요.' }],
    storeUrl: `${STORE}/11803452794`,
    storeId: '11803452794',
    note: '스토어 상품정보에는 병 수량 표기가 없어, 확인해 주신 100ml 10병(1,000ml) 구성으로 안내합니다.',
  },
  {
    id: 'cleanbiome',
    slug: 'cleanbiome',
    name: '클린바이옴 자몽',
    brand: '클린바이옴',
    tag: '6병',
    option: '100ml × 6병',
    price: 107100,
    listPrice: 126000,
    image: 'images/enzyme/cleanbiome-grapefruit.webp',
    imageAlt: '클린바이옴 자몽 미생물 발효 음료 100ml 병',
    summary:
      '자몽 맛 미생물 발효 음료 100ml 6병 구성입니다. 상온의 물에 한 병을 희석해 마시는 방식이라, 물만으로는 심심할 때 챙기기 좋습니다.',
    points: ['100ml 6병', '자몽 맛', '물에 희석해 마시는 음료'],
    spec: [
      ['판매가', '107,100원'],
      ['정가', '126,000원'],
      ['구성', '100ml × 6병'],
      ['브랜드', '클린바이옴'],
      ['원산지', '국산'],
      ['배송비', '무료배송'],
    ],
    usage: [
      { t: '물에 희석', d: '상온의 물 300~500ml에 한 병을 풀어 주세요.' },
      { t: '5분 안에', d: '희석한 뒤 5분 안에 마시도록 안내하고 있습니다.' },
      { t: '마시는 때', d: '식후 2시간 이후나 공복에 마시는 것을 권하고 있습니다.' },
    ],
    labels: [
      { src: 'images/labels/cleanbiome-label.jpg', caption: '클린바이옴 100ml 병 뒷면 표시사항', alt: '클린바이옴 100ml 병 뒷면 — 제품명, 품목보고번호, 원재료 및 함량, 섭취방법, 제조원 표시사항' },
    ],
    storeUrl: `${STORE}/11901292751`,
    storeId: '11901292751',
  },
  {
    id: 'cleanbiome1',
    slug: 'cleanbiome-1',
    name: '클린바이옴 1병',
    brand: '클린바이옴',
    tag: '1병',
    option: '100ml × 1병',
    price: 19950,
    listPrice: 21000,
    image: 'images/enzyme/cleanbiome-1bottle.webp',
    imageAlt: '클린바이옴 미생물 발효 음료 100ml 병 1병',
    summary:
      '위의 클린바이옴 6병 구성과 같은 100ml 병을 한 병만 담은 상품입니다. 여섯 병을 한 번에 사기 전에 한 병만 먼저 써 보려는 분들이 찾습니다.',
    points: ['100ml 1병', '물에 희석해 마시는 음료', '5만 원 미만은 배송비 4,000원'],
    spec: [
      ['판매가', '19,950원'],
      ['정가', '21,000원'],
      ['구성', '100ml × 1병'],
      ['브랜드', '클린바이옴'],
      ['원산지', '국산(경기도 여주시)'],
      ['배송비', '4,000원 (50,000원 이상 무료배송)'],
    ],
    usage: [
      { t: '물에 희석', d: '상온의 물 300~500ml에 한 병을 풀어 주세요.' },
      { t: '5분 안에', d: '희석한 뒤 5분 안에 마시도록 안내하고 있습니다.' },
      { t: '마시는 때', d: '식후 2시간 이후나 공복에 마시는 것을 권하고 있습니다.' },
    ],
    labels: [
      { src: 'images/labels/cleanbiome-label.jpg', caption: '클린바이옴 100ml 병 뒷면 표시사항', alt: '클린바이옴 100ml 병 뒷면 — 제품명, 품목보고번호, 원재료 및 함량, 섭취방법, 제조원 표시사항' },
    ],
    shippingFee: 4000,
    freeShippingOver: 50000,
    storeUrl: `${STORE}/11803613417`,
    storeId: '11803613417',
    note: '스토어 상품명은 “한병으로 장내 가스, 숙변제거 장건강 음료, 특허받은 미생물발효 다이어트 효소음료”로 등록되어 있습니다. 사이트에는 효능 표현 없이 제품명과 구성만 적었습니다.',
  },
]

// 화면에 노출하는 제품 — hidden: true 인 제품은 목록·상세에서 빠집니다.
export const visibleEnzymeProducts = enzymeProducts.filter((p) => !p.hidden)

export const enzymeBySlug = (slug) => visibleEnzymeProducts.find((p) => p.slug === slug)

// 주문서(BuySheet)에 넘기는 형태로 바꿔 줍니다.
export const toOrderItem = (p) => ({
  id: p.id,
  name: p.name,
  volume: p.option,
  price: p.price,
  listPrice: p.listPrice,
  image: p.image,
  maxQty: 5,
  shippingFee: p.shippingFee || 0,
  freeShippingOver: p.freeShippingOver || 0,
  carrier: enzymeShipping.carrier,
})

export const discountRate = (p) => (p.listPrice && p.listPrice > p.price ? Math.round((1 - p.price / p.listPrice) * 100) : 0)
