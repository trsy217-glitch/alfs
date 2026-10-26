// 우리가게 진단 — 답변을 점수·강점·없는 것·보완점·실행 계획으로 바꾸는 분석 엔진
import { AREAS, STEPS, CATEGORIES, VALUE_FACTORS, categoryById, questionsOf } from './questions.js'

export const ENGINE_VERSION = 2 // 2: 구조 점수 추가, 문항 24개로 축소

// 받침 유무에 맞춰 조사를 고릅니다 (예: 경쟁력이 / 건강도가)
const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 ? w + a : w + b }
const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n))
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null)

// 문항 id → 문항 (업종 추가 문항 포함)
function questionIndex(category) {
  const idx = {}
  STEPS.forEach((s) => questionsOf(s, category).forEach((q) => { idx[q.id] = q }))
  return idx
}

export function optionLabel(idx, id, v) {
  const q = idx[id]
  if (!q || v == null) return ''
  if (Array.isArray(v)) return v.map((x) => q.o?.find((o) => o.v === x)?.l).filter(Boolean).join(', ')
  return q.o?.find((o) => o.v === v)?.l || ''
}

export const levelOf = (s) => (s >= 80 ? '강점' : s >= 60 ? '양호' : s >= 40 ? '보완 필요' : '부족')

// 온라인 채널 가중치: 매장형 가게는 네이버 플레이스와 카카오톡 채널이 기본입니다.
const CHANNEL_W = { place: 25, insta: 20, kakao: 15, blog: 12, short: 15, store: 10, karrot: 8 }
const OFFLINE_W = { sign: 12, pop: 10, flyer: 8, trial: 20, partner: 14, member: 22, class: 14 }

// 구조 점수 항목별 진단 문구
const VS_TEXT = {
  v_core: { good: '상품·서비스를 계속 더 좋게 만들 수 있는 구조입니다.', bad: '상품을 더 좋게 만들 여지가 적어 가격 경쟁에 휘말리기 쉽습니다.' },
  v_rebuy: { good: '한 번 산 손님이 다시 사는 구조입니다. 구조 점수에서 가장 무거운 항목(×4.5)입니다.', bad: '한 번 팔고 끝나는 구조라 매번 새 손님을 찾아야 합니다.' },
  v_scale: { good: '사장님이 없어도 팔리는 구조가 있습니다.', bad: '사장님이 직접 해야만 매출이 생겨 더 크게 키우기 어렵습니다.' },
  v_cost: { good: '원가 부담이 낮아 팔수록 남습니다.', bad: '원가 비중이 높아 많이 팔아도 남는 게 적습니다.' },
  v_stock: { good: '버려지는 재고 걱정이 적습니다.', bad: '안 팔리면 버려지는 재고가 그대로 손실이 됩니다.' },
  v_dist: { good: '손님에게 닿기까지 드는 비용이 적습니다.', bad: '배달·수수료 같은 유통비가 이익을 깎습니다.' },
  v_comp: { good: '나만큼 잘하는 경쟁자가 적습니다.', bad: '비슷하게 잘하는 경쟁자가 많아 가격으로 밀리기 쉽습니다.' },
}

// 구조 점수 = (품질향상×2.5 + 재구매율×4.5 + 확장성×3.5) ÷ (원가×2.5 + 재고×1 + 유통비×2 + (6−시장성)×4)
export function valueScore(answers) {
  const val = (id) => { const n = Number(answers[id]); return n >= 1 && n <= 5 ? n : 3 }
  const calc = (get) => {
    const num = VALUE_FACTORS.filter((f) => f.side === 'up').reduce((n, f) => n + get(f) * f.w, 0)
    const den = VALUE_FACTORS.filter((f) => f.side === 'down').reduce((n, f) => n + get(f) * f.w, 0)
    return { num, den, v: num / den }
  }
  const base = calc((f) => val(f.id))
  // 한 단계만 바꿨을 때 점수가 가장 많이 오르는 항목 = 가장 효과 큰 지렛대
  const levers = VALUE_FACTORS.map((f) => {
    const cur = val(f.id)
    const next = f.side === 'up' ? Math.min(5, cur + 1) : Math.max(1, cur - 1)
    if (next === cur) return null
    const after = calc((g) => (g.id === f.id ? next : val(g.id))).v
    return { id: f.id, k: f.k, side: f.side, invert: !!f.invert, gain: Math.round((after - base.v) * 100) / 100, after: Math.round(after * 100) / 100, tip: f.tip }
  }).filter(Boolean).sort((a, b) => b.gain - a.gain).slice(0, 3)
  const v = Math.round(base.v * 100) / 100
  const level = v >= 1.8 ? '팔수록 남는 구조' : v >= 1.2 ? '남는 구조 · 더 키울 여지' : v >= 0.9 ? '본전 구조 · 구조 보완 필요' : '팔수록 힘든 구조'
  return {
    value: v, level, tone: v >= 1.8 ? 'a' : v >= 1.2 ? 'b' : v >= 0.9 ? 'c' : 'd',
    numerator: base.num, denominator: base.den,
    answered: VALUE_FACTORS.every((f) => answers[f.id] != null),
    factors: VALUE_FACTORS.map((f) => ({ id: f.id, k: f.k, w: f.w, side: f.side, invert: !!f.invert, v: val(f.id), shown: f.invert ? 6 - val(f.id) : val(f.id), weighted: val(f.id) * f.w })),
    levers,
  }
}

const MINERAL_BASE = { health: 90, cafe: 85, fitness: 85, pharmacy: 85, beauty: 80, spa: 80, community: 80, grocery: 75, online: 75, hair: 70, restaurant: 70 }

export function diagnose(answers) {
  const category = answers.category
  const cat = categoryById(category)
  const idx = questionIndex(category)
  const isOffline = answers.size !== 'none'

  const bucket = Object.fromEntries(AREAS.map((a) => [a.id, []]))
  const flags = []
  const add = (t, area, text, fix, p) => flags.push({ t, area, text, fix, p })

  // 1) 문항별 점수와 진단 메모
  Object.values(idx).forEach((q) => {
    const v = answers[q.id]
    if (v == null || v === '' || !q.area) return
    if (q.type === 'single') {
      const o = q.o.find((x) => x.v === v)
      if (!o) return
      if (typeof o.s === 'number') bucket[q.area].push(o.s)
      if (o.f) add(o.f.t, q.area, o.f.text, o.f.fix, o.f.p)
    }
    if (q.type === 'scale') {
      bucket[q.area].push(clamp(Number(v) * 20))
      if (Number(v) <= 2) add('weak', q.area, '사진·글 올리는 일이 부담스러운 상태입니다.', '촬영 각도·문구 템플릿을 정해 두고, 글 초안은 AI 에이전트가 쓰게 하세요.', 2)
      if (Number(v) >= 4) add('strength', q.area, '스마트폰으로 직접 콘텐츠를 만들 수 있습니다.')
    }
  })

  // 구조 점수 항목별 강점·보완
  VALUE_FACTORS.forEach((f) => {
    const n = Number(answers[f.id])
    if (!n) return
    const good = f.side === 'up' ? n >= 4 : n <= 2
    const bad = f.side === 'up' ? n <= 2 : n >= 4
    if (good) add('strength', f.area, `${f.k}: ${VS_TEXT[f.id].good}`)
    if (bad) add('weak', f.area, `${f.k}: ${VS_TEXT[f.id].bad}`, f.tip, f.id === 'v_rebuy' || f.id === 'v_comp' ? 1 : 2)
  })

  // 온라인 채널 (복수 선택)
  const ch = (answers.o_channels || []).filter((x) => x !== 'none')
  bucket.online.push(clamp(ch.reduce((n, c) => n + (CHANNEL_W[c] || 0), 0) * (isOffline ? 1 : 1.15)))
  if (isOffline && !ch.includes('place')) add('missing', 'online', '네이버 플레이스에 가게가 등록·관리되고 있지 않습니다.', '스마트플레이스에 가게를 등록하고 사진·메뉴·영업시간을 채우세요. 동네 손님이 가장 먼저 보는 곳입니다.', 1)
  if (!ch.includes('kakao')) add('missing', 'customer', '손님과 다시 연결되는 카카오톡 채널이 없습니다.', '카카오톡 채널을 열어 상담·예약·소식 알림 창구로 쓰세요.', 1)
  if (ch.length && !ch.includes('short')) add('weak', 'online', '요즘 가장 많이 퍼지는 짧은 영상(릴스·쇼츠)이 없습니다.', '15초 영상 하나(만드는 과정, 매장 하루)를 주 1회 올리세요.', 2)
  if (!isOffline && !ch.includes('store')) add('missing', 'online', '온라인 판매 창구가 없습니다.', '스마트스토어 등 판매 창구를 열어 상품을 올리세요.', 1)
  if (ch.length >= 4) add('strength', 'online', `온라인 채널을 ${ch.length}곳 운영하고 있습니다.`)
  if (!ch.length) add('missing', 'online', '운영 중인 온라인 채널이 없습니다.', '네이버 플레이스와 인스타그램 두 곳부터 시작하세요.', 1)

  // 오프라인 홍보 (복수 선택)
  const ft = (answers.f_tools || []).filter((x) => x !== 'none')
  if (isOffline && answers.f_tools) { // 예전 진단(오프라인 홍보 복수 선택 문항이 있던 버전)만
    bucket.offline.push(clamp(ft.reduce((n, c) => n + (OFFLINE_W[c] || 0), 0) * 1.25))
    if (!ft.includes('member')) add('missing', 'offline', '쿠폰·스탬프·멤버십 같은 재방문 장치가 없습니다.', '종이 스탬프나 카카오톡 채널 쿠폰처럼 바로 시작할 수 있는 방식부터 쓰세요.', 2)
    if (!ft.includes('trial')) add('weak', 'offline', '손님이 직접 경험해 볼 시식·체험 기회가 없습니다.', '월 1회 체험 데이를 열어 새 상품을 맛보게 하세요.', 2)
    if (!ft.includes('partner') && ft.length) add('weak', 'offline', '주변 가게와 손님을 나누는 제휴가 없습니다.', '고객층이 겹치지만 경쟁하지 않는 이웃 가게 한 곳과 쿠폰을 교환하세요.', 3)
    if (ft.length >= 4) add('strength', 'offline', '매장 안팎의 홍보 수단을 고르게 쓰고 있습니다.')
  }

  // 2) 서로 엮인 답변 규칙
  if (answers.v_rebuy && Number(answers.v_rebuy) <= 2 && answers.p_sub !== 'yes') add('missing', 'sales', '다시 사게 만드는 정기구매·회원권 상품이 없습니다.', '구조 점수에서 가장 무거운 재구매율을 올리는 가장 빠른 방법입니다. 3회권·월 정기 세트를 시험해 보세요.', 1)
  if (answers.m_diff !== 'clear' && Number(answers.v_comp) >= 4) add('weak', 'market', '경쟁이 많은데 우리 가게만의 이유가 분명하지 않습니다.', '경쟁점이 하지 않는 한 가지를 정해 간판·플레이스·프로필 첫 줄에 똑같이 적으세요.', 1)
  if (answers.k_time === '0' && Number(answers.v_scale) <= 2) add('weak', 'capacity', '사장님 시간이 없는데 사장님 없이는 팔리지 않는 구조입니다.', '예약·주문·문의 응답부터 자동화해 사장님 손을 덜어 내세요.', 1)

  // 3) 영역 점수
  const areas = AREAS.map((a) => {
    const raw = avg(bucket[a.id])
    const score = raw == null ? null : Math.round(raw)
    return { ...a, score, level: score == null ? '-' : levelOf(score) }
  }).filter((a) => a.score != null)

  const total = Math.round(avg(areas.map((a) => a.score)))
  const grade = total >= 80 ? '탄탄한 가게' : total >= 60 ? '성장하는 가게' : total >= 40 ? '보완이 필요한 가게' : '기초부터 다질 가게'
  const sorted = [...areas].sort((a, b) => b.score - a.score)
  const best = sorted[0], worst = sorted[sorted.length - 1]

  // 4) 강점 · 없는 것 · 보완할 것 (중복 제거, 약한 영역 먼저)
  const score = (id) => areas.find((a) => a.id === id)?.score ?? 50
  const uniq = (arr) => arr.filter((x, i) => arr.findIndex((y) => y.text === x.text) === i)
  const strengths = uniq(flags.filter((f) => f.t === 'strength')).sort((a, b) => score(b.area) - score(a.area))
  // 강점 메모가 적으면 점수가 좋은 영역을 강점으로 보충합니다.
  sorted.filter((a) => a.score >= 60 && !strengths.some((x) => x.area === a.id)).slice(0, Math.max(0, 3 - strengths.length))
    .forEach((a) => strengths.push({ t: 'strength', area: a.id, text: `${josa(a.label, '은', '는')} ${a.score}점으로 다른 영역보다 탄탄합니다.` }))
  const missing = uniq(flags.filter((f) => f.t === 'missing')).sort((a, b) => (a.p || 3) - (b.p || 3) || score(a.area) - score(b.area))
  const weak = uniq(flags.filter((f) => f.t === 'weak')).sort((a, b) => (a.p || 3) - (b.p || 3) || score(a.area) - score(b.area))

  // 5) 실행 계획: 이번 주 · 한 달 안 · 석 달 계획
  const todo = [...missing, ...weak].filter((f) => f.fix)
  const pick = (p) => todo.filter((f) => (f.p || 3) === p)
  const plan = { now: pick(1).slice(0, 4), month: pick(2).slice(0, 4), quarter: pick(3).slice(0, 4) }
  const leftovers = [...pick(1).slice(4), ...pick(2).slice(4)]
  while (plan.quarter.length < 2 && leftovers.length) plan.quarter.push(leftovers.shift())

  // 6) 시장 · 매출 요약
  const L = (id) => optionLabel(idx, id, answers[id])
  const market = [
    answers.region && `지역: ${answers.region}`,
    answers.v_comp && `나만큼 잘하는 집: ${L('v_comp')}`,
    answers.m_diff && `차별점: ${L('m_diff')}`,
    answers.size && `가게 형태: ${L('size')}`,
  ].filter(Boolean)
  const sales = [
    answers.s_trend && `최근 6개월: ${L('s_trend')}`,
    answers.v_rebuy && `재구매: ${L('v_rebuy')}`,
    answers.v_cost && `원가 비중: ${L('v_cost')}`,
    answers.v_dist && `유통비: ${L('v_dist')}`,
  ].filter(Boolean)

  // 7) 상품군 분석
  const st = (v, good, mid) => (good.includes(v) ? 'good' : mid.includes(v) ? 'mid' : 'bad')
  const product = {
    main: '',
    cells: [
      { k: '입문 상품', v: L('p_entry') || '-', s: st(answers.p_entry, ['yes'], ['vague']),
        note: answers.p_entry === 'yes' ? '첫 구매 문턱이 낮습니다.' : '처음 온 손님이 가볍게 고를 상품이 필요합니다.' },
      { k: '재구매', v: L('v_rebuy') || '-', s: st(answers.v_rebuy, ['5', '4'], ['3']),
        note: Number(answers.v_rebuy) >= 4 ? '다시 사는 손님이 매출을 받칩니다.' : '두 번째 구매를 만드는 장치가 필요합니다.' },
      { k: '원가 구조', v: L('v_cost') || '-', s: st(answers.v_cost, ['1', '2'], ['3']),
        note: Number(answers.v_cost) >= 4 ? '원가율이 낮은 상품(체험·클래스·세트)을 함께 팔면 평균이 내려갑니다.' : '원가 부담이 크지 않아 판매량이 곧 이익이 됩니다.' },
      { k: '시장성', v: L('v_comp') || '-', s: st(answers.v_comp, ['1', '2'], ['3']),
        note: Number(answers.v_comp) >= 4 ? '가격 말고 나만의 이유를 앞세워야 합니다.' : '경쟁이 적어 시장성이 좋은 자리를 지키고 있습니다.' },
    ],
    ladder: [
      { k: '입문', d: '체험·소용량·첫 방문 상품', has: answers.p_entry === 'yes' },
      { k: '주력', d: '대표 상품', has: true },
      { k: '정기', d: '회원권·정기구매·패키지', has: answers.p_sub === 'yes' },
    ],
  }

  // 8) 미네랄 샵인샵 적합도 (참고용)
  let fit = MINERAL_BASE[category] ?? 70
  const reasons = []
  if (answers.k_space === 'yes') { fit += 10; reasons.push('진열·체험 공간 여유가 있습니다.') }
  if (answers.k_space === 'no') { fit -= 15; reasons.push('진열 공간이 부족해 카운터 소형 진열부터 맞습니다.') }
  if (answers.k_new === 'yes') { fit += 5; reasons.push('새 상품 도입에 적극적입니다.') }
  if (answers.k_new === 'no') { fit -= 20; reasons.push('당분간 새 상품 도입 계획이 없습니다.') }
  if (Number(answers.v_rebuy) <= 2) reasons.push('매일 마시는 소모품이라 재구매 상품을 더하는 효과가 큽니다.')
  fit = clamp(fit)
  const mineral = { score: fit, level: fit >= 80 ? '높음' : fit >= 60 ? '보통' : '낮음', reasons, idea: cat?.idea || '' }

  // 9) 알프스가 도울 수 있는 것 (약한 영역 기준)
  const help = []
  if (score('online') < 60 || score('capacity') < 60) help.push({ to: '/ai-marketing', title: 'AI 에이전트로 SNS 자동화', text: '게시물·블로그 초안과 리뷰 답글을 에이전트가 준비하고 사장님은 확인만 합니다.' })
  if (score('customer') < 60) help.push({ to: '/ai-marketing', title: '고객 DB와 재방문 알림 세팅', text: '카카오톡 채널 친구 모으기부터 재구매 시점 안내까지 자동으로 이어 드립니다.' })
  if (score('product') < 60 || score('offline') < 60) help.push({ to: '/partner', title: '파트너샵 입점으로 체험·정기 상품 추가', text: '체험 키트, 진열 가이드, 판매 교육을 함께 받는 샵인샵 입점을 검토해 보세요.' })
  if (!help.length) help.push({ to: '/partner', title: '다음 성장 상품 더하기', text: '기반이 탄탄한 가게일수록 새 상품이 빠르게 자리 잡습니다. 파트너샵 입점을 검토해 보세요.' })

  return {
    version: ENGINE_VERSION,
    createdAt: new Date().toISOString(),
    profile: {
      shopName: answers.shopName || '우리 가게',
      region: answers.region || '',
      category, categoryName: cat?.name || '',
      size: L('size'),
      worry: answers.k_worry || '',
    },
    total, grade,
    summary: best && worst && best.id !== worst.id
      ? `${josa(best.label, '이', '가')} 가장 강하고, ${worst.label}부터 손보면 효과가 가장 큽니다.`
      : '영역별 점수가 고르게 나왔습니다.',
    value: valueScore(answers),
    areas, strengths, missing, weak, plan, market, sales, product, mineral, help,
  }
}

export { CATEGORIES }
