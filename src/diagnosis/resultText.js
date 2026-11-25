// 진단 결과를 글로 옮깁니다 — 화면의 '결과 복사'와 알프스 시트 기록이 같은 내용을 씁니다.
const fmtDate = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`
}

const fixes = (list) => (list || []).map((x) => x.fix).filter(Boolean)
const texts = (list) => (list || []).map((x) => x.text).filter(Boolean)

// 알프스 시트에 남길 결과 목록 (이메일 + 결과물만)
export function resultFields(r) {
  const plan = r?.plan || {}
  return {
    category: r?.profile?.categoryName || '',
    total: r?.total ?? '',
    grade: r?.grade || '',
    summary: r?.summary || '',
    areas: (r?.areas || []).map((a) => ({ label: a.label, score: a.score })),
    value: r?.value ? `${r.value.value.toFixed(2)} (${r.value.level})` : '',
    mineral: r?.mineral ? `${r.mineral.score} (${r.mineral.level})` : '',
    strengths: texts(r?.strengths).join('\n'),
    missing: texts(r?.missing).join('\n'),
    weak: texts(r?.weak).join('\n'),
    planNow: fixes(plan.now).join('\n'),
    planMonth: fixes(plan.month).join('\n'),
    planQuarter: fixes(plan.quarter).join('\n'),
    product: (r?.product?.cells || []).map((c) => `${c.k}: ${c.v}`).join(' / '),
  }
}

// 화면에서 복사해 카카오톡·메모에 붙여 넣을 수 있는 글
export function resultText(r, createdAt) {
  if (!r) return ''
  const f = resultFields(r)
  const L = []
  L.push('[알프스 우리가게 진단 결과]')
  L.push(`가게: ${r.profile?.shopName || '우리 가게'}${f.category ? ` · ${f.category}` : ''}`)
  if (createdAt || r.createdAt) L.push(`진단일: ${fmtDate(createdAt || r.createdAt)}`)
  L.push('')
  L.push(`총점: ${f.total}점 · ${f.grade}`)
  if (f.value) L.push(`구조 점수: ${f.value}`)
  L.push('')
  L.push('영역별 점수')
  ;(r.areas || []).forEach((a) => L.push(`- ${a.label} ${a.score} (${a.level})`))
  if (r.strengths?.length) {
    L.push('', '강점')
    r.strengths.forEach((x) => L.push(`- ${x.text}`))
  }
  if (r.missing?.length) {
    L.push('', '없는 것')
    r.missing.forEach((x) => L.push(`- ${x.text}${x.fix ? ` → ${x.fix}` : ''}`))
  }
  if (r.weak?.length) {
    L.push('', '부족해서 보완할 것')
    r.weak.forEach((x) => L.push(`- ${x.text}${x.fix ? ` → ${x.fix}` : ''}`))
  }
  const plan = r.plan || {}
  const cols = [['이번 주', plan.now], ['한 달 안', plan.month], ['석 달 계획', plan.quarter]]
  if (cols.some(([, v]) => v?.length)) {
    L.push('', '실행 계획')
    cols.forEach(([t, v]) => {
      if (!v?.length) return
      L.push(`${t}`)
      v.forEach((x) => L.push(`- ${x.fix}`))
    })
  }
  if (f.mineral) L.push('', `미네랄 샵인샵 적합도: ${f.mineral}`)
  L.push('', '※ 사장님 응답을 바탕으로 한 자가진단이며 참고용입니다. 매출이나 성과를 보장하지 않습니다.')
  return L.join('\n')
}
