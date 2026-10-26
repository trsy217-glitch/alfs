import RadarChart from './RadarChart.jsx'

const fmtDate = (iso) => {
  const d = new Date(iso)
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`
}

const AREA_LABEL = {
  market: '시장', sales: '매출', online: '온라인', offline: '오프라인', customer: '고객', product: '상품', capacity: '여건',
}

// 진단 결과 리포트 본문. PDF·이미지로 내려받을 때 이 영역을 그대로 찍습니다.
export default function Report({ r, createdAt, delta }) {
  const p = r.profile
  return (
    <article className="report">
      <header className="report__head" data-break>
        <div className="report__brand"><span className="logo__en">ALFS</span><span>우리가게 진단표</span></div>
        <div className="report__meta">
          <h2>{p.shopName}</h2>
          <p>{[p.categoryName, p.region, p.years && `운영 ${p.years}`, p.size, p.staff].filter(Boolean).join(' · ')}</p>
          <p className="muted">진단일 {fmtDate(createdAt || r.createdAt)}</p>
        </div>
        <div className="report__score">
          <span className="report__total">{r.total}<small>점</small></span>
          <b>{r.grade}</b>
          {r.value && <span className="report__vs">구조 점수 {r.value.value.toFixed(2)}</span>}
          {typeof delta === 'number' && <span className={`delta ${delta >= 0 ? 'up' : 'down'}`}>지난 진단보다 {delta >= 0 ? '+' : ''}{delta}점</span>}
        </div>
      </header>

      <p className="report__summary">{r.summary}</p>

      {r.value && <ValueScore v={r.value} />}

      <section className="report__block report__areas" data-break>
        <RadarChart areas={r.areas} />
        <div>
          <h3>영역별 점수</h3>
          <ul className="bars bars--report">
            {r.areas.map((a) => (
              <li key={a.id}>
                <span>{a.label}</span>
                <span className="bar"><i style={{ width: `${a.score}%` }} className={a.score < 60 ? 'low' : ''} /></span>
                <b>{a.score}</b>
                <em className={`lv lv--${a.score >= 80 ? 'a' : a.score >= 60 ? 'b' : a.score >= 40 ? 'c' : 'd'}`}>{a.level}</em>
              </li>
            ))}
          </ul>
          <p className="muted report__scale">80점 이상 강점 · 60~79 양호 · 40~59 보완 필요 · 40 미만 부족</p>
        </div>
      </section>

      <section className="report__block report__three" data-break>
        <FindList title="강점" tone="good" items={r.strengths} empty="아직 뚜렷한 강점이 잡히지 않았어요. 아래 할 일부터 하나씩 채워 가면 됩니다." />
        <FindList title="없는 것" tone="bad" items={r.missing} empty="꼭 있어야 할 것은 모두 갖추고 있어요." showFix />
        <FindList title="부족해서 보완할 것" tone="mid" items={r.weak} empty="크게 부족한 부분이 없습니다." showFix />
      </section>

      <section className="report__block" data-break>
        <h3>실행 계획</h3>
        <div className="plan-cols">
          <PlanCol title="이번 주" items={r.plan.now} />
          <PlanCol title="한 달 안" items={r.plan.month} />
          <PlanCol title="석 달 계획" items={r.plan.quarter} />
        </div>
      </section>

      <section className="report__block report__two" data-break>
        <div>
          <h3>시장 상황</h3>
          <ul className="kv">{r.market.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
        <div>
          <h3>매출 추이</h3>
          <ul className="kv">{r.sales.map((m) => <li key={m}>{m}</li>)}</ul>
        </div>
      </section>

      <section className="report__block" data-break>
        <h3>상품군 분석{r.product.main && <span className="muted"> · 주력 {r.product.main}</span>}</h3>
        <div className="pcells">
          {r.product.cells.map((c) => (
            <div key={c.k} className={`pcell pcell--${c.s}`}>
              <span className="pcell__k">{c.k}</span>
              <b>{c.v}</b>
              <p>{c.note}</p>
            </div>
          ))}
        </div>
        <div className="ladder" aria-label="추천 상품 단계">
          {r.product.ladder.map((l, i) => (
            <div key={l.k} className={`ladder__step ${l.has ? 'has' : 'need'}`}>
              <span className="ladder__k">{i + 1}단계 {l.k}</span>
              <b>{l.d}</b>
              <span>{l.has ? '갖춤' : '만들 것'}</span>
            </div>
          ))}
        </div>
        <p className="muted report__note">입문 상품으로 첫 구매를 만들고, 주력 상품으로 만족을 주고, 정기 상품으로 다음 매출을 미리 확보하는 흐름입니다.</p>
      </section>

      <section className="report__block report__mineral" data-break>
        <div>
          <h3>새 상품을 더한다면: 미네랄 샵인샵 적합도 <span className={`fit fit--${r.mineral.level === '높음' ? 'a' : r.mineral.level === '보통' ? 'b' : 'c'}`}>{r.mineral.level}</span></h3>
          <p>{r.mineral.idea}</p>
          {r.mineral.reasons.length > 0 && <ul className="kv">{r.mineral.reasons.map((x) => <li key={x}>{x}</li>)}</ul>}
          <p className="muted report__note">오륜미네랄은 일반식품(기타가공품)입니다. 매장에서 소개할 때 질병 예방·치료 같은 효능 표현은 쓸 수 없습니다.</p>
        </div>
      </section>

      {p.worry && (
        <section className="report__block" data-break>
          <h3>사장님이 꼽은 고민</h3>
          <blockquote className="worry">{p.worry}</blockquote>
          <p className="muted">상담을 신청하시면 이 고민을 기준으로 이야기를 시작합니다.</p>
        </section>
      )}

      <section className="report__block" data-break>
        <h3>알프스가 도울 수 있는 것</h3>
        <ul className="help-list">
          {r.help.map((h) => <li key={h.title}><b>{h.title}</b><span>{h.text}</span></li>)}
        </ul>
      </section>

      <footer className="report__foot" data-break>
        이 진단은 사장님 응답을 바탕으로 한 자가진단이며 참고용입니다. 매출이나 성과를 보장하지 않습니다. · ALFS 알프스
      </footer>
    </article>
  )
}

function FindList({ title, tone, items, empty, showFix }) {
  return (
    <div className={`find find--${tone}`} data-break>
      <h3>{title} <span className="find__n">{items.length}</span></h3>
      {items.length === 0 ? <p className="muted">{empty}</p> : (
        <ul>
          {items.map((f) => (
            <li key={f.text}>
              <span className="find__area">{AREA_LABEL[f.area]}</span>
              <span>{f.text}{showFix && f.fix && <em>{f.fix}</em>}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PlanCol({ title, items }) {
  return (
    <div className="plan-col">
      <h4>{title}</h4>
      {items.length === 0 ? <p className="muted">해당 없음</p> : (
        <ul>{items.map((f) => <li key={f.fix}><span className="chk" aria-hidden="true" />{f.fix}</li>)}</ul>
      )}
    </div>
  )
}

// 구조 점수: 팔수록 남는 사업인가?
function ValueScore({ v }) {
  const ups = v.factors.filter((f) => f.side === 'up')
  const downs = v.factors.filter((f) => f.side === 'down')
  const Row = ({ f }) => (
    <li>
      <span className="vs__k">{f.k} <small>{f.invert ? `(6−${f.shown})×${f.w}` : `×${f.w}`}</small></span>
      <span className="vs__dots" aria-label={`${f.k} 5점 중 ${f.shown}점`}>{[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= f.shown ? 'on' : ''} />)}</span>
      <b>{f.weighted}</b>
    </li>
  )
  return (
    <section className="report__block vs" data-break>
      <h3>구조 점수 <span className={`vs__badge vs__badge--${v.tone}`}>{v.level}</span></h3>
      <div className="vs__top">
        <b className={`vs__num vs__num--${v.tone}`}>{v.value.toFixed(2)}</b>
        <p>팔수록 남는 사업인지, 한 번 팔고 끝나는 사업인지를 봅니다. <b>1.0보다 크면 남는 구조</b>, 작으면 팔수록 힘든 구조이고 높을수록 구조적으로 돈을 벌 수 있는 가게입니다.</p>
      </div>
      <div className="vs__frac">
        <div className="vs__part vs__part--up">
          <h4>더하는 힘 <small>클수록 좋음 · 합계 {v.numerator}</small></h4>
          <ul>{ups.map((f) => <Row key={f.id} f={f} />)}</ul>
        </div>
        <div className="vs__div" aria-hidden="true">÷</div>
        <div className="vs__part vs__part--down">
          <h4>깎는 부담 <small>작을수록 좋음 · 합계 {v.denominator}</small></h4>
          <ul>{downs.map((f) => <Row key={f.id} f={f} />)}</ul>
        </div>
      </div>
      <p className="muted report__note">계산식: (품질향상×2.5 + 재구매율×4.5 + 확장성×3.5) ÷ (원가×2.5 + 재고×1 + 유통비×2 + (6−시장성)×4) = {v.numerator} ÷ {v.denominator} · 1.8 이상 팔수록 남는 구조 · 1.2~1.8 남는 구조 · 0.9~1.2 본전 구조 · 0.9 미만 팔수록 힘든 구조</p>
      {v.levers.length > 0 && (
        <>
          <h4 className="vs__lh">구조 점수를 가장 크게 올리는 것</h4>
          <ol className="vs__levers">
            {v.levers.map((l) => (
              <li key={l.id}>
                <b>{l.k} 한 단계 {l.side === 'up' || l.invert ? '높이기' : '낮추기'}</b>
                <span className="vs__gain">{v.value.toFixed(2)} → {l.after.toFixed(2)}</span>
                <p>{l.tip}</p>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}
