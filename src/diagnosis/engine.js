// 우리가게 진단 — 답변을 점수·강점·없는 것·보완점·실행 계획으로 바꾸는 분석 엔진
import { AREAS, STEPS, CATEGORIES, categoryById, questionsOf } from './questions.js'

export const ENGINE_VERSION = 1

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

const MINERAL_BASE = { health: 90, cafe: 85, fitness: 85, pharmacy: 85, beauty: 80, spa: 80, community: 80, grocery: 75, online: 75, hair: 70, restaurant: 70 }

export function diagnose(answers) {
  const category = answers.category
  const cat = categoryById(category)
  const idx = questionIndex(category)
  const isOffline = answers.size !== 'none' && answers.m_area !== 'online'

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
  if (isOffline) {
    bucket.offline.push(clamp(ft.reduce((n, c) => n + (OFFLINE_W[c] || 0), 0) * 1.25))
    if (!ft.includes('member')) add('missing', 'offline', '쿠폰·스탬프·멤버십 같은 재방문 장치가 없습니다.', '종이 스탬프나 카카오톡 채널 쿠폰처럼 바로 시작할 수 있는 방식부터 쓰세요.', 2)
    if (!ft.includes('trial')) add('weak', 'offline', '손님이 직접 경험해 볼 시식·체험 기회가 없습니다.', '월 1회 체험 데이를 열어 새 상품을 맛보게 하세요.', 2)
    if (!ft.includes('partner') && ft.length) add('weak', 'offline', '주변 가게와 손님을 나누는 제휴가 없습니다.', '고객층이 겹치지만 경쟁하지 않는 이웃 가게 한 곳과 쿠폰을 교환하세요.', 3)
    if (ft.length >= 4) add('strength', 'offline', '매장 안팎의 홍보 수단을 고르게 쓰고 있습니다.')
  }

  // 2) 서로 엮인 답변 규칙
  if (answers.m_price === 'high' && answers.m_diff === 'clear') add('strength', 'market', '가격이 높아도 그만한 이유를 손님에게 설명할 수 있습니다.')
  if (answers.m_price === 'high' && answers.m_diff !== 'clear') add('weak', 'market', '가격은 높은데 그 이유가 손님에게 전달되지 않습니다.', '재료·과정·서비스 중 가격을 설명하는 근거 하나를 메뉴판과 상세 소개에 적으세요.', 1)
  if (answers.m_price === 'low' && ['down', 'drop'].includes(answers.s_trend)) add('weak', 'sales', '가격이 낮은데도 매출이 줄고 있어 가격 외 이유가 필요합니다.', '가격 할인보다 경험(체험·서비스·분위기)을 더하는 쪽으로 방향을 바꿔 보세요.', 2)
  if (answers.p_price && ['30', '31'].includes(answers.p_price) && answers.p_entry !== 'yes') add('weak', 'product', '주력 상품 가격이 높은데 입문 상품이 분명하지 않습니다.', '고가 상품일수록 체험·소용량 상품이 첫 구매를 만듭니다.', 1)
  if (answers.k_time === '0' && ['0', '1'].includes(answers.k_budget)) add('weak', 'capacity', '마케팅에 쓸 시간과 예산이 모두 부족합니다.', '돈보다 시간이 덜 드는 일(리뷰 답글, 카카오 채널 친구 모으기)부터 자동화하세요.', 1)

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
    answers.m_area && `상권: ${L('m_area')}`,
    answers.m_comp && `같은 업종 경쟁점: ${L('m_comp')}`,
    answers.m_trend && `최근 1년 분위기: ${L('m_trend')}`,
    answers.m_price && `주변 대비 가격: ${L('m_price')}`,
    answers.m_diff && `차별점: ${L('m_diff')}`,
  ].filter(Boolean)
  const sales = [
    answers.s_monthly && `월 평균 매출: ${L('s_monthly')}`,
    answers.s_trend && `최근 6개월: ${L('s_trend')}`,
    answers.s_season && `계절 편차: ${L('s_season')}`,
    answers.s_repeat && `단골 매출 비중: ${L('s_repeat')}`,
    answers.s_ticket && `객단가: ${L('s_ticket')}`,
  ].filter(Boolean)

  // 7) 상품군 분석
  const st = (v, good, mid) => (good.includes(v) ? 'good' : mid.includes(v) ? 'mid' : 'bad')
  const ages = optionLabel(idx, 'c_age', answers.c_age)
  const product = {
    main: answers.p_main || '',
    cells: [
      { k: '입문 상품', v: L('p_entry') || '-', s: st(answers.p_entry, ['yes'], ['vague']),
        note: answers.p_entry === 'yes' ? '첫 구매 문턱이 낮습니다.' : '처음 온 손님이 가볍게 고를 상품이 필요합니다.' },
      { k: '재구매율', v: L('p_rebuy') || '-', s: st(answers.p_rebuy, ['50', '30'], ['10']),
        note: ['50', '30'].includes(answers.p_rebuy) ? '다시 사는 손님이 매출을 받칩니다.' : '두 번째 구매를 만드는 장치가 필요합니다.' },
      { k: '가격대', v: L('p_price') || '-', s: 'info',
        note: ['30', '31'].includes(answers.p_price) ? '고가 주력이라 체험·상담이 구매를 결정합니다.' : answers.p_price === '1' ? '저가 주력이라 방문 빈도와 객단가를 함께 올려야 합니다.' : '주력 가격대 위아래로 선택지를 두면 객단가가 올라갑니다.' },
      { k: '타깃', v: [L('p_target'), ages && `주 고객 ${ages}`, answers.c_gender && L('c_gender')].filter(Boolean).join(' · ') || '-',
        s: st(answers.p_target, ['clear'], ['rough']),
        note: answers.p_target === 'clear' ? '메시지를 한 사람에게 맞출 수 있습니다.' : '가장 많이 사는 손님 한 유형으로 좁혀 보세요.' },
    ],
    ladder: [
      { k: '입문', d: '체험·소용량·첫 방문 상품', has: answers.p_entry === 'yes' },
      { k: '주력', d: answers.p_main || '대표 상품', has: true },
      { k: '정기', d: '회원권·정기구매·패키지', has: answers.p_sub === 'yes' || answers.p_ladder === 'ladder' },
    ],
  }

  // 8) 미네랄 샵인샵 적합도 (참고용)
  let fit = MINERAL_BASE[category] ?? 70
  const reasons = []
  if (answers.k_space === 'yes') { fit += 10; reasons.push('진열·체험 공간 여유가 있습니다.') }
  if (answers.k_space === 'no') { fit -= 15; reasons.push('진열 공간이 부족해 카운터 소형 진열부터 맞습니다.') }
  if (answers.k_new === 'yes') { fit += 5; reasons.push('새 상품 도입에 적극적입니다.') }
  if (answers.k_new === 'no') { fit -= 20; reasons.push('당분간 새 상품 도입 계획이 없습니다.') }
  if (answers.p_health === 'now') { fit += 5; reasons.push('건강·웰니스 상품 판매 경험이 있습니다.') }
  if (answers.p_health === 'never') { fit -= 5; reasons.push('건강 상품은 처음이라 판매 교육이 함께 필요합니다.') }
  if (['30', '40', '50', '60'].some((a) => (answers.c_age || []).includes(a))) reasons.push('주 고객층이 생활 습관 상품에 관심이 많은 연령대를 포함합니다.')
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
      years: L('years'), size: L('size'), staff: L('staff'),
      worry: answers.k_worry || '',
    },
    total, grade,
    summary: best && worst && best.id !== worst.id
      ? `${josa(best.label, '이', '가')} 가장 강하고, ${worst.label}부터 손보면 효과가 가장 큽니다.`
      : '영역별 점수가 고르게 나왔습니다.',
    areas, strengths, missing, weak, plan, market, sales, product, mineral, help,
  }
}

export { CATEGORIES }
