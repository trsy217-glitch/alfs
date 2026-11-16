import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import CtaBand from '../components/CtaBand.jsx'
import Faq from '../components/Faq.jsx'
import LoopCycle from '../components/LoopCycle.jsx'
import { FAQ_COMPANY } from '../seo.js'
import { asset } from '../lib/asset.js'

const problems = [
  { t: '팔고 나면 끝', d: '광고비를 써서 한 번 팔아도 재구매로 이어지지 않습니다.' },
  { t: '판매자마다 제각각', d: '매출이 판매자 개인 역량에 달려 성과가 들쭉날쭉합니다.' },
  { t: '고객이 남지 않음', d: '누가, 언제, 왜 샀는지 데이터가 흩어져 다음 판매를 설계할 수 없습니다.' },
  { t: '설명할 사람이 없음', d: '체험과 설명이 필요한 제품인데, 현장에서 제대로 전달하는 사람이 없습니다.' },
]

const solution = [
  { img: 'images/loop-sell.webp', alt: '매장에서 휴대폰 주문으로 이어지는 판매 채널을 설명하는 상담 장면', en: 'Sell', t: '판매 채널 구축', d: '체험 카페·파트너샵·공동구매·온라인까지 채널을 직접 열고 운영합니다.' },
  { img: 'images/loop-content.webp', alt: '태블릿으로 상품 영상과 사진 콘텐츠를 보여 주는 상담 장면', en: 'Content', t: '팔리는 콘텐츠', d: '영상·SNS·상세페이지·세미나 자료를 표준화해 누구나 같은 품질로 설명합니다.' },
  { img: 'images/loop-data.webp', alt: '노트북으로 고객 목록과 판매 그래프를 짚어 주는 상담 장면', en: 'Data', t: '고객 데이터 축적', d: '체험·구매·재구매 데이터를 쌓아 다음 판매와 공급량을 예측합니다.' },
  { img: 'images/loop-scale.webp', alt: '확인 표시와 오르는 그래프를 보여 주는 상담 장면', en: 'Scale', t: '검증 후 확장', d: '숫자로 확인된 모델만 파트너샵·지역·제품군으로 넓힙니다.' },
]

// 제품이 지나는 길 — 알프스가 총판으로 서는 자리
const chain = [
  { e: '🏭', t: '제조사', s: '유디아미네랄' },
  { e: '📦', t: '총공급업자', s: '공급·물류' },
  { e: '🌿', t: '알프스', s: '총판 · 판매 시스템', dot: 'dot--leaf' },
  { e: '🏪', t: '파트너샵·셀러', s: '체험·판매 거점' },
  { e: '🙂', t: '소비자', s: '체험 → 구매 → 재구매', dot: 'dot--drop' },
]

const channels = [
  { icon: 'ch-cafe', en: 'Cafe · Party', t: '체험 카페·홈파티', d: '호스트가 하루 카페를 열고 참석자에게 체험 키트를 전달합니다. 신규 고객이 처음 들어오는 문입니다.' },
  { icon: 'ch-partner', en: 'Partner shop', t: '오프라인 파트너샵', d: '지역 건강샵·웰니스샵이 상시 체험·판매 거점이 됩니다. 교육과 판매 자료는 알프스가 지원합니다.' },
  { icon: 'ch-groupbuy', en: 'Group buy', t: '인플루언서 공동구매', d: '검증된 콘텐츠로 공동구매를 열고, 주문·정산은 시스템이 처리합니다.' },
  { icon: 'ch-online', en: 'Online', t: '온라인 스토어', d: '네이버·쿠팡에서 재구매를 받는 상시 창구. 오프라인 고객이 여기로 돌아옵니다.' },
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

const roadmap = [
  { y: 'Phase 1', t: '오륜미네랄', d: '90일 검증으로 판매 모델을 확정합니다.' },
  { y: 'Phase 2', t: '파트너샵·지역 확장', d: '검증된 모델을 전국 거점으로 넓힙니다.' },
  { y: 'Phase 3', t: '제품군 확대', d: '미네랄·효소·건강식품·뷰티로 품목을 늘립니다.' },
  { y: 'Phase 4', t: '알프스 웰니스 플랫폼', d: '좋은 제품이 들어오면 바로 판매 시스템에 올립니다.' },
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
          <h2 className="h-section">좋은 제품이 시장에서 <em className="hl">멈추는</em> <em className="hl">네 가지</em> 이유</h2>
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
          <p className="lead muted mt-s">팔고, 알리고, 쌓고, 넓힌 결과가 다시 다음 판매로 돌아옵니다.</p>
          <LoopCycle items={solution} label="알프스가 길을 내는 네 단계" />
        </div>
      </section>

      <section className="section--tight">
        <div className="wrap">
          <h2 className="h-section">제품이 소비자에게 닿는 길</h2>
          <p className="lead muted mt-s">알프스는 제조사와 매장 사이에서 총판으로 섭니다. 오륜미네랄을 공급받아, 파트너샵과 셀러가 실제로 팔 수 있도록 콘텐츠·교육·고객 관리까지 함께 넘깁니다.</p>
          <div className="chain" role="list" aria-label="제조사에서 소비자까지 이어지는 유통 경로">
            {chain.map((c, i) => (
              <Fragment key={c.t}>
                <div className="chain__item" role="listitem">
                  <div className={c.dot ? `dot ${c.dot}` : 'dot'} aria-hidden="true">{c.e}</div>
                  <b>{c.t}</b>
                  <span>{c.s}</span>
                </div>
                {i < chain.length - 1 && <span className="chain__arrow" aria-hidden="true">›</span>}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="h-section">체험·매장·공동구매·온라인, 네 개의 채널</h2>
          <p className="lead muted mt-s">총판이 직접 여는 채널이 다르기 때문에, 한 번 보고 끝나지 않고 다음 채널로 고객이 이어집니다.</p>
          <div className="channels">
            {channels.map((c) => (
              <div key={c.t} className="channel">
                <div className="channel__head">
                  <img className="channel__icon" src={asset(`images/icons/${c.icon}.webp`)} alt="" width="192" height="192" loading="lazy" />
                  <div><span className="en">{c.en}</span><h3>{c.t}</h3></div>
                </div>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
          <p className="channels-flow">체험으로 들어온 고객이 매장에서 정착하고, 온라인에서 다시 찾습니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="h-section">알프스와 협력하면 무엇이 달라질까요</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="compare">
              <thead><tr><th>구분</th><th>기존 제품 유통</th><th><span className="compare__us">알프스와 협업이유</span></th></tr></thead>
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

      <Faq title="알프스 유통·협업, 자주 묻는 질문" lead="제품 공급, 파트너샵, 상담 방법에 대해 가장 많이 받는 질문입니다." items={FAQ_COMPANY} />

      <CtaBand
        title="작은 테스트로 시작해, 숫자로 증명하고, 검증된 뒤 넓힙니다."
        text="파트너샵 입점부터 제조사·브랜드의 공급 제안까지, 공급 조건 확인 미팅 → 90일 파일럿 범위 합의 → 첫 체험 행사 오픈 순서로 진행합니다."
        toLabel="상담·제휴 문의 남기기"
      />
    </>
  )
}
