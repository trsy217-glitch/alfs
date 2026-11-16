// ─────────────────────────────────────────────────────────────
// 미네랄 카페 레시피 6종 — 소영 님이 만든 오륜미네랄 카페 레시피 카드(2026-11-16)를
// 카드 이미지 그대로 싣고, 같은 내용을 글자로도 적었습니다.
//  · 재료·분량은 카드에 적힌 그대로입니다. (확인되지 않은 재료·효능은 넣지 않음)
//  · 카드 이미지는 public/images/cafe/ 에 webp 로 변환해 두었습니다. (원본 그대로, 합성·보정 없음)
// ⚠️ 식품표시광고법·PG 심사: 레시피는 '음용·활용 가이드'일 뿐 판매 상품이 아닙니다.
//    질병 예방·치료, 기능성, 다이어트 같은 효능 표현은 쓰지 않습니다.
//    판매 상품은 오륜미네랄 1,000ml(220,000원) 한 가지입니다.
// ─────────────────────────────────────────────────────────────

// 레시피마다 공통으로 들어가는 오륜미네랄 분량
export const CAFE_MINERAL_ML = 60

export const cafeRecipes = [
  {
    id: 'kiwi-velvet',
    slug: 'kiwi-velvet',
    name: '키위벨벳',
    nameEn: 'Kiwi Velvet',
    tag: '상큼',
    line: '키위와 사과, 요구르트, 달걀을 함께 갈아 상큼하고 부드러운 한 잔.',
    ingredients: ['키위 2개', '사과 반쪽', '달걀 2개', '요구르트 1개', `오륜미네랄 ${CAFE_MINERAL_ML}ml`],
    image: 'images/cafe/kiwi-velvet.webp',
    imageAlt: '키위벨벳 레시피 카드 — 키위와 사과, 요구르트로 만든 연분홍 빛 음료',
  },
  {
    id: 'toma-sunset',
    slug: 'toma-sunset',
    name: '토마선셋',
    nameEn: 'Toma Sunset',
    tag: '컬러',
    line: '붉게 물든 토마토의 풍부한 컬러로 완성하는 특별한 한 잔.',
    ingredients: ['토마토 1개', '레몬 반개 (레몬즙용)', '달걀 2개', `오륜미네랄 ${CAFE_MINERAL_ML}ml`],
    image: 'images/cafe/toma-sunset.webp',
    imageAlt: '토마선셋 레시피 카드 — 토마토와 레몬으로 만든 붉은 빛 음료',
  },
  {
    id: 'avo-banana-smoothie',
    slug: 'avo-banana-smoothie',
    name: '아보바나스무디',
    nameEn: 'Avobana Smooth',
    tag: '고소',
    line: '아보카도와 바나나에 두유를 더해 진하고 고소하게 갈아 낸 스무디.',
    ingredients: ['아보카도 1개', '바나나 1개', '달걀 2개', '두유 1팩', `오륜미네랄 ${CAFE_MINERAL_ML}ml`],
    image: 'images/cafe/avo-banana-smoothie.webp',
    imageAlt: '아보바나스무디 레시피 카드 — 아보카도와 바나나로 만든 연두빛 스무디',
  },
  {
    id: 'blue-bana-nuts',
    slug: 'blue-bana-nuts',
    name: '블루바나넛츠',
    nameEn: 'Blue Bana Nuts',
    tag: '든든',
    line: '바나나와 블루베리, 견과 한 봉지를 요구르트와 갈아 든든하게.',
    ingredients: ['바나나 1개', '블루베리 100g', '견과 1봉지', '요구르트 1개', `오륜미네랄 ${CAFE_MINERAL_ML}ml`],
    image: 'images/cafe/blue-bana-nuts.webp',
    imageAlt: '블루바나넛츠 레시피 카드 — 블루베리와 견과를 갈아 만든 보랏빛 음료',
  },
  {
    id: 'kiwi-brits',
    slug: 'kiwi-brits',
    name: '키위브리츠',
    nameEn: 'Kiwi Britz',
    tag: '가볍게',
    line: '키위와 사과를 물과 함께 가볍게 갈아 마시는 한 잔.',
    ingredients: ['키위 1개', '사과 반쪽', '물 150ml', `오륜미네랄 ${CAFE_MINERAL_ML}ml`],
    image: 'images/cafe/kiwi-brits.webp',
    imageAlt: '키위브리츠 레시피 카드 — 키위와 사과를 갈아 만든 연한 초록빛 음료',
  },
  {
    id: 'avo-berry-yogeo',
    slug: 'avo-berry-yogeo',
    name: '아보베리요거',
    nameEn: 'Avo Berry Yogeo',
    tag: '산뜻',
    line: '상큼한 베리와 부드러운 아보카도, 요거트가 만나 완성되는 산뜻한 한 잔.',
    ingredients: ['사과 반쪽', '달걀 2개', '요구르트 1개', '블루베리 100g', '아보카도 1개', `오륜미네랄 ${CAFE_MINERAL_ML}ml`],
    image: 'images/cafe/avo-berry-yogeo.webp',
    imageAlt: '아보베리요거 레시피 카드 — 블루베리와 아보카도를 갈아 만든 보랏빛 음료',
  },
]

// 만드는 순서 (모든 레시피 공통)
export const cafeSteps = [
  {
    t: '재료 손질',
    d: '과일은 씻어 껍질과 씨를 정리하고, 레몬즙이 필요한 레시피는 미리 짜 둡니다. 달걀·견과·유제품 알레르기가 있으면 그 재료는 빼고 만드세요.',
  },
  {
    t: '오륜미네랄 60ml',
    d: '레시피마다 오륜미네랄 60ml를 넣습니다. 처음 만든다면 40ml부터 넣어 보고 입맛에 맞게 늘려도 좋습니다.',
  },
  {
    t: '믹서에 함께 갈기',
    d: '재료를 모두 믹서에 넣고 매끄러워질 때까지 30초~1분 갑니다. 얼음을 넣으면 더 차갑게 즐길 수 있습니다.',
  },
  {
    t: '바로 마시기',
    d: '갈아서 바로 마시는 것이 가장 좋습니다. 남으면 밀폐 용기에 담아 냉장 보관하고 그날 안에 드세요.',
  },
]

// 레시피에 대한 안내 (사실만)
export const cafeNotes = [
  '이 페이지의 레시피 6종은 오륜미네랄을 활용하는 음용·활용 가이드입니다. 레시피 자체는 판매 상품이 아니며, 이 페이지에서 판매하는 상품은 오륜미네랄 1,000ml(220,000원) 한 가지입니다.',
  '오륜미네랄은 기타가공품(일반식품)이며, 질병의 예방이나 치료를 위한 제품이 아닙니다. 효능·효과를 표방하지 않습니다.',
  '달걀을 그대로 넣는 레시피(키위벨벳·토마선셋·아보바나스무디·아보베리요거)는 신선한 달걀을 사용하세요. 임산부·어린이·고령자·면역력이 약한 분은 달걀을 빼거나 익힌 재료로 바꾸는 편이 안전합니다.',
  '달걀·견과류·유제품(요구르트·두유) 알레르기가 있는 분은 해당 재료를 빼고 만들어 주세요.',
  '재료의 크기와 믹서 성능에 따라 완성량과 맛이 달라질 수 있습니다. 카드에 적힌 분량은 1잔 기준입니다.',
]
