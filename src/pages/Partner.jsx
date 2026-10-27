import ConsultForm from '../components/ConsultForm.jsx'
import { asset, scrollToId } from '../lib/asset.js'

const fits = ['건강식품·웰니스샵', '카페·홈카페', '피부샵·뷰티샵', '필라테스·요가 스튜디오', '세미나·커뮤니티 호스트']

const package_ = [
  { t: '샵인샵 입점 제품', d: '오륜미네랄을 매장 한편의 체험·판매 공간에 들입니다.' },
  { t: '정착 지원금', d: '매장이 자리 잡을 때까지 계약서에 정한 기간 동안 판매장려금을 지원합니다.' },
  { t: '진열·판매 교육', d: '제품 설명법, 진열 가이드, 광고 기준까지 한 번에 교육합니다.' },
  { t: 'SNS·AI 마케팅 교육', d: '매장이 스스로 마케팅할 수 있도록 콘텐츠와 자동화 방법을 알려드립니다.' },
  { t: '체험 카페 운영 키트', d: '하루 체험 카페를 열 수 있는 시연용 제품과 진행 자료를 드립니다.' },
  { t: '재구매 고객 관리', d: '체험·구매 고객을 기록하고 다시 찾을 때를 놓치지 않게 돕습니다.' },
]

const steps = [
  { when: 'Step 1', t: '상담 신청', d: '아래 신청서나 카카오톡으로 매장 정보를 남겨 주세요.' },
  { when: 'Step 2', t: '방문 상담', d: '담당자가 매장을 찾아가 공간과 고객층을 함께 봅니다.' },
  { when: 'Step 3', t: '공급계약', d: '공급·지원·정산 조건을 계약서로 먼저 정합니다.' },
  { when: 'Step 4', t: '입점과 교육', d: '제품 입고, 진열, 판매·마케팅 교육을 진행합니다.' },
  { when: 'Step 5', t: '정착과 재발주', d: '판매 데이터를 함께 보며 재발주와 확장을 결정합니다.' },
]

const faq = [
  { q: '재고 부담이 크지 않을까요?', a: '첫 입점 수량과 지원 조건은 상담 때 매장 규모에 맞춰 안내드립니다. 정착 지원금과 체험 카페 운영으로 초기 판매를 함께 만듭니다.' },
  { q: '소비자가는 얼마인가요?', a: '권장 소비자가는 병당 10~12만 원이며, 판매 가격은 매장이 정합니다. 공급가와 마진 구조는 상담 시 계약서 기준으로 안내합니다.' },
  { q: '건강 효능을 말하며 팔아도 되나요?', a: '안 됩니다. 오륜미네랄은 일반식품이라 질병 예방·치료 표현을 쓸 수 없습니다. 쓸 수 있는 설명법은 교육에서 알려드립니다.' },
  { q: '마케팅을 해 본 적이 없어도 괜찮나요?', a: '괜찮습니다. 입점 파트너샵은 SNS 계정 정비부터 AI 자동화까지 단계별로 배웁니다.' },
]

export default function Partner() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap split">
          <div className="intro">
            <span className="kicker">파트너샵 입점</span>
            <h1>우리 매장 한편이, 웰니스 체험 거점이 됩니다</h1>
            <p className="lead">제품만 들이는 입점이 아닙니다. 체험·교육·마케팅·재구매 관리까지 알프스가 함께 붙어 매장이 스스로 팔 수 있게 만듭니다.</p>
            <div className="btn-row mt-m"><button type="button" className="btn btn--primary" onClick={() => scrollToId('apply')}>입점 상담 신청하기</button></div>
          </div>
          <div className="cocoon cocoon--wide intro-img">
            <img src={asset('images/lifestyle-park.webp')} alt="공원 벤치에서 오륜미네랄을 탄 물을 마시는 사람" width="1100" height="1099" fetchPriority="high" />
          </div>
        </div>
      </section>

      <section className="section--tight">
        <div className="wrap">
          <h2 className="h-section">이런 매장과 함께합니다</h2>
          <div className="badges" style={{ marginTop: 24 }}>
            {fits.map((f) => <span key={f} className="badge" style={{ borderColor: 'var(--leaf-2)', color: 'var(--leaf)' }}>{f}</span>)}
          </div>
        </div>
      </section>

      <section className="section leafbg">
        <div className="wrap">
          <h2 className="h-section">첫 입점 패키지에 들어 있는 것</h2>
          <div className="rows">
            {package_.map((p) => <div className="row" key={p.t}><h3>{p.t}</h3><p className="muted">{p.d}</p></div>)}
          </div>
          <p className="muted mt-m" style={{ fontSize: '0.85rem' }}>공급 수량·금액·지원 기간은 매장 상담 후 공급계약서로 정합니다. 효능이나 수익을 보장하지 않습니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="h-section">입점까지 다섯 걸음</h2>
          <ol className="howto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
            {steps.map((s, i) => <li key={s.t}><span className="n">{i + 1}</span><h3>{s.t}</h3><p>{s.d}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap split" style={{ alignItems: 'start' }}>
          <div>
            <h2 className="h-section">자주 묻는 질문</h2>
            <div className="faq mt-m">
              {faq.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="panel" id="apply">
            <h2 style={{ fontSize: 'var(--t-xl)', marginBottom: 6 }}>입점 상담 신청</h2>
            <p className="muted" style={{ marginBottom: 22 }}>영업일 하루 안에 담당자가 연락드립니다.</p>
            <ConsultForm defaultTopic="파트너샵 입점" />
          </div>
        </div>
      </section>
    </>
  )
}
