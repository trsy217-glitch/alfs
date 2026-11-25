import ConsultForm from '../components/ConsultForm.jsx'
import DistForm from '../components/DistForm.jsx'
import { asset, scrollToId } from '../lib/asset.js'
import { servicePaymentNotice } from '../config/site.js'
import { FAQ_PARTNER } from '../seo.js'

const fits = ['건강식품·웰니스샵', '카페·홈카페', '피부샵·뷰티샵', '필라테스·요가 스튜디오', '세미나·커뮤니티 호스트']

const steps = [
  { when: 'Step 1', t: '상담 신청', d: '아래 신청서나 카카오톡으로 매장 정보를 남겨 주세요.' },
  { when: 'Step 2', t: '방문 상담', d: '담당자가 매장을 찾아가 공간과 고객층을 함께 봅니다.' },
  { when: 'Step 3', t: '공급계약', d: '공급·지원·정산 조건을 계약서로 먼저 정합니다.' },
  { when: 'Step 4', t: '입점과 교육', d: '제품 입고, 진열, 판매·마케팅 교육을 진행합니다.' },
  { when: 'Step 5', t: '정착과 재발주', d: '판매 데이터를 함께 보며 재발주와 확장을 결정합니다.' },
]

const faq = FAQ_PARTNER

export default function Partner() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap split">
          <div className="intro">
            <span className="kicker">파트너샵 입점</span>
            <h1>우리 매장 한편이, 웰니스 체험 거점이 됩니다</h1>
            <p className="lead">제품만 들이는 입점이 아닙니다. 체험·교육·마케팅·재구매 관리까지 알프스가 함께 붙어 매장이 스스로 팔 수 있게 만듭니다.</p>
            <div className="btn-row mt-m">
              <button type="button" className="btn btn--primary" onClick={() => scrollToId('apply')}>입점 상담 신청하기</button>
              <button type="button" className="btn btn--ghost" onClick={() => scrollToId('apply-dist')}>대리점·총판 상담</button>
            </div>
            <p className="notice">{servicePaymentNotice}</p>
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

      <section className="section">
        <div className="wrap">
          <h2 className="h-section">입점까지 다섯 걸음</h2>
          <ol className="howto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
            {steps.map((s, i) => <li key={s.t}><span className="n">{i + 1}</span><h3>{s.t}</h3><p>{s.d}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="section leafbg" id="apply-dist">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div className="panel">
            <h2 style={{ fontSize: 'var(--t-xl)', marginBottom: 6 }}>대리점·총판 입점 상담</h2>
            <p className="muted" style={{ marginBottom: 22 }}>아래에 남겨 주시면 담당자가 확인해 영업일 하루 안에 연락드립니다. 접수 내용은 알프스 상담 시트에 바로 기록됩니다.</p>
            <DistForm />
            <p className="muted mt-m" style={{ fontSize: '0.85rem' }}>공급가·마진·지원 기간은 상담 후 공급계약서로 정하며, 효능이나 수익을 보장하지 않습니다.</p>
          </div>
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
            <p className="muted" style={{ marginBottom: 22 }}>영업일 하루 안에 담당자가 연락드립니다. 온라인 결제 없이 상담과 공급계약으로 진행됩니다.</p>
            <ConsultForm defaultTopic="파트너샵 입점" />
          </div>
        </div>
      </section>
    </>
  )
}
