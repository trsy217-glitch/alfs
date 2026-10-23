import { Link } from 'react-router-dom'
import CtaBand from '../components/CtaBand.jsx'

const chain = [
  { e: '🏭', t: '제조사', s: '유디아미네랄' },
  { e: '📦', t: '총공급업자', s: '공급·물류' },
  { e: '🌿', t: '알프스', s: '총판 · 판매 시스템' },
  { e: '🏪', t: '파트너샵·셀러', s: '체험·판매 거점' },
]

const channels = [
  { en: 'Cafe · Party', t: '체험 카페·홈파티', d: '호스트가 하루 카페를 열고 참석자에게 체험 키트를 전달합니다. 신규 고객이 처음 들어오는 문입니다.' },
  { en: 'Partner shop', t: '오프라인 파트너샵', d: '지역 건강샵·웰니스샵이 상시 체험·판매 거점이 됩니다. 교육과 판매 자료는 알프스가 지원합니다.' },
  { en: 'Group buy', t: '인플루언서 공동구매', d: '검증된 콘텐츠로 공동구매를 열고, 주문·정산은 시스템이 처리합니다.' },
  { en: 'Online', t: '온라인 스토어', d: '네이버·쿠팡에서 재구매를 받는 상시 창구. 오프라인 고객이 여기로 돌아옵니다.' },
]

const pilot = [
  { when: 'Step 1 · ~30일', t: '시장 반응 확인', items: ['체험 카페·세미나 운영', '판매 콘텐츠 제작', '파트너샵 입점 준비'], goal: '목표 · 체험 고객 300명' },
  { when: 'Step 2 · ~60일', t: '판매 테스트', items: ['4개 채널 동시 판매', '고객 DB 확보', '재구매 흐름 추적'], goal: '목표 · 파트너샵 3곳 · 고객 DB 200명' },
  { when: 'Step 3 · ~90일', t: '성과 리포트·확대 결정', items: ['판매량·재구매율 리포트', '채널별 효율 분석', '공급량·지역 확대 결정'], goal: '결과 · 데이터로 다음 단계 합의' },
]

const roadmap = [
  { y: 'Phase 1', t: '오륜미네랄', d: '90일 검증으로 판매 모델을 확정합니다.' },
  { y: 'Phase 2', t: '파트너샵·지역 확장', d: '검증된 모델을 전국 거점으로 넓힙니다.' },
  { y: 'Phase 3', t: '제품군 확대', d: '미네랄·효소·건강식품·뷰티로 품목을 늘립니다.' },
  { y: 'Phase 4', t: '알프스 웰니스 플랫폼', d: '좋은 제품이 들어오면 바로 판매 시스템에 올립니다.' },
]

export default function Distribution() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap intro">
          <span className="kicker">총판·유통</span>
          <h1>한 번 팔고 끝나는 유통이 아니라, 고객이 돌아오는 엔진</h1>
          <p className="lead">알프스는 총판으로서 제품을 공급하는 데서 멈추지 않고, 매장과 셀러가 실제로 팔 수 있도록 콘텐츠·교육·데이터까지 함께 넘겨드립니다.</p>
        </div>
      </section>

      <section className="section--tight">
        <div className="wrap">
          <h2 className="h-section">제품이 소비자에게 닿는 길</h2>
          <div className="chain" role="list">
            {chain.map((c, i) => (
              <FragmentWithArrow key={c.t} last={i === chain.length - 1}>
                <div className="chain__item" role="listitem">
                  <div className="dot" aria-hidden="true" style={i === 2 ? { background: 'var(--leaf)' } : undefined}>{c.e}</div>
                  <b>{c.t}</b>
                  <span>{c.s}</span>
                </div>
              </FragmentWithArrow>
            ))}
            <span className="chain__arrow" aria-hidden="true">›</span>
            <div className="chain__item" role="listitem">
              <div className="dot" aria-hidden="true" style={{ background: 'var(--drop)' }}>🙂</div>
              <b>소비자</b>
              <span>체험 → 구매 → 재구매</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="h-section">네 개의 채널이 서로 고객을 넘겨줍니다</h2>
          <div className="channels">
            {channels.map((c) => (
              <div key={c.t} className="channel"><span className="en">{c.en}</span><h3>{c.t}</h3><p>{c.d}</p></div>
            ))}
          </div>
          <p className="channels-flow">처음은 체험으로, 다음은 매장에서, 그 다음은 온라인 재구매로.</p>
        </div>
      </section>

      <section className="section leafbg">
        <div className="wrap">
          <h2 className="h-section">처음부터 큰 계약을 제안하지 않습니다. 먼저 90일, 숫자로 증명합니다</h2>
          <div className="steps">
            {pilot.map((p) => (
              <div className="step" key={p.t}>
                <span className="when">{p.when}</span>
                <h3>{p.t}</h3>
                <ul>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
                <p className="goal">{p.goal}</p>
              </div>
            ))}
          </div>
          <p className="muted mt-m" style={{ fontSize: '0.85rem' }}>목표치는 파일럿 범위 협의에 따라 조정합니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div>
            <h2 className="h-section">하나의 제품에서, 웰니스 유통 플랫폼으로</h2>
            <p className="lead muted mt-s">검증된 판매 모델 위에 제품군과 지역을 하나씩 더해 갑니다.</p>
            <div className="btn-row mt-m">
              <Link to="/partner" className="btn btn--primary">파트너 입점 조건 보기</Link>
            </div>
          </div>
          <ol className="timeline timeline--leaf">
            {roadmap.map((r) => (
              <li key={r.y}><span className="y">{r.y}</span><h3>{r.t}</h3><p className="muted">{r.d}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand title="제조사·브랜드라면, 알프스의 판매 시스템에 제품을 올려 보세요." text="공급 조건 확인 미팅 → 90일 파일럿 범위 합의 → 첫 체험 행사 오픈 순서로 진행합니다." toLabel="제휴 제안 남기기" />
    </>
  )
}

function FragmentWithArrow({ children, last }) {
  return (
    <>
      {children}
      {!last && <span className="chain__arrow" aria-hidden="true">›</span>}
    </>
  )
}
