import CtaBand from '../components/CtaBand.jsx'

const problems = [
  { t: '팔고 나면 끝', d: '광고비를 써서 한 번 팔아도 재구매로 이어지지 않습니다.' },
  { t: '판매자마다 제각각', d: '매출이 판매자 개인 역량에 달려 성과가 들쭉날쭉합니다.' },
  { t: '고객이 남지 않음', d: '누가, 언제, 왜 샀는지 데이터가 흩어져 다음 판매를 설계할 수 없습니다.' },
  { t: '설명할 사람이 없음', d: '체험과 설명이 필요한 제품인데, 현장에서 제대로 전달하는 사람이 없습니다.' },
]

const solution = [
  { en: 'Sell', t: '판매 채널 구축', d: '체험 카페·파트너샵·공동구매·온라인까지 채널을 직접 열고 운영합니다.' },
  { en: 'Content', t: '팔리는 콘텐츠', d: '영상·SNS·상세페이지·세미나 자료를 표준화해 누구나 같은 품질로 설명합니다.' },
  { en: 'Data', t: '고객 데이터 축적', d: '체험·구매·재구매 데이터를 쌓아 다음 판매와 공급량을 예측합니다.' },
  { en: 'Scale', t: '검증 후 확장', d: '숫자로 확인된 모델만 파트너샵·지역·제품군으로 넓힙니다.' },
]

const compare = [
  ['공급 범위', '제품만 공급', '제품 + 판매 시스템'],
  ['판매 품질', '판매자 개인 역량에 의존', '표준화된 콘텐츠·교육'],
  ['판매 이후', '일회성 판매 후 종료', '재구매 관리·CRM'],
  ['고객 정보', '판매처마다 흩어짐', '고객 DB 통합 축적'],
  ['홍보', '각자 개별 홍보', '공동 마케팅·체험 행사'],
  ['의사결정', '감과 경험으로 운영', '판매·재구매 데이터 기반 운영'],
]

const infra = [
  { t: '세미나·체험 운영 시스템', d: '참가 신청부터 현장 운영, 후속 관리까지 하나의 웹앱으로 관리합니다.' },
  { t: '미네랄 챌린지 앱', d: '체험 고객이 습관을 기록하고 인증·후기를 공유하는 참여형 앱입니다.' },
  { t: '온라인 스토어·상세페이지', d: '네이버·쿠팡용 상세페이지와 스마트스토어 운영 체계를 갖췄습니다.' },
  { t: '인플루언서 주문·정산', d: '공동구매 주문 접수와 등급별 수수료 정산을 시스템으로 처리합니다.' },
  { t: '콘텐츠 채널', d: '인스타그램 미네랄카페, 유튜브 미네랄디톡스 채널을 운영합니다.' },
  { t: '준법 콘텐츠 검수', d: '식품표시광고법 기준으로 모든 판매 문구를 사전에 검수합니다.' },
]

const promises = [
  { t: '정확한 정보', d: '확인되지 않은 효능이나 수익은 약속하지 않습니다.' },
  { t: '명확한 조건', d: '제품 정보와 거래 조건을 투명하게 안내합니다.' },
  { t: '문서로 합의', d: '공급·판매·정산의 역할과 책임을 협력 전에 문서로 정합니다.' },
]

export default function Company() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap intro">
          <span className="kicker">ALFS · Alpha Food Store</span>
          <h1>제품은 파트너가 만들고, 시장은 알프스가 만듭니다</h1>
          <p className="lead">알프스는 물건을 가져다 파는 총판이 아니라, 상품이 팔리는 시스템을 구축하는 유통·마케팅 파트너입니다. 판매업자와 서로 상생하는 구조를 원칙으로 합니다.</p>
        </div>
      </section>

      <section className="section--tight">
        <div className="wrap">
          <h2 className="h-section">좋은 제품이 시장에서 멈추는 네 가지 이유</h2>
          <div className="rows">
            {problems.map((p) => (
              <div className="row" key={p.t}><h3>{p.t}</h3><p className="muted">{p.d}</p></div>
            ))}
          </div>
          <p className="lead mt-m"><b>문제는 제품이 아닙니다. 제품이 팔리는 길이 없다는 것입니다.</b></p>
        </div>
      </section>

      <section className="section leafbg">
        <div className="wrap">
          <h2 className="h-section">알프스가 길을 내는 방법</h2>
          <div className="rows">
            {solution.map((s) => (
              <div className="row" key={s.t}>
                <h3><span className="en" style={{ fontSize: '0.8rem', display: 'block', opacity: 0.7, fontWeight: 600 }}>{s.en}</span>{s.t}</h3>
                <p className="muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="h-section">알프스와 협력하면 무엇이 달라질까요</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="compare">
              <thead><tr><th>구분</th><th>기존 제품 유통</th><th>알프스와 협력</th></tr></thead>
              <tbody>{compare.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="wrap">
          <h2 className="h-section">계획이 아니라, 이미 돌아가고 있는 판매 인프라</h2>
          <div className="agents">
            {infra.map((i) => (
              <div className="agent" key={i.t}><h3>{i.t}</h3><p>{i.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="h-section">알프스가 약속하는 것</h2>
          <div className="hooks">
            {promises.map((p) => (
              <div className="hook" key={p.t}><h3>{p.t}</h3><p>{p.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="작은 테스트에서 시작해, 숫자로 증명하고, 검증된 이후 확대합니다." />
    </>
  )
}
