import { Link } from 'react-router-dom'
import CtaBand from '../components/CtaBand.jsx'
import Faq from '../components/Faq.jsx'
import { asset } from '../lib/asset.js'
import { FAQ_PRODUCT } from '../seo.js'

// '효과 좋은 미네랄', '미네랄 추천', '오륜미네랄 추천'을 찾는 사람에게 보여 줄 안내 글.
// ⚠️ 식품표시광고법: 효능·질병·흡수율 비교·후기 표현 없이, 고르는 기준(사실)만 씁니다.

const points = [
  { t: '원료가 어디서 왔는지', d: '어떤 원료에서 미네랄을 얻었는지 라벨의 원재료명을 확인하세요. 오륜미네랄은 충북 보은의 어린 뽕잎과 누에를 원료로 씁니다.' },
  { t: '누가 만드는지', d: '제조원과 소재지가 분명한지 봅니다. 오륜미네랄의 제조원은 충북 보은의 유디아미네랄입니다. 수상·특허(발명특허 제1541516호 등)도 제조사 유디아미네랄의 이력입니다.' },
  { t: '식품 유형이 무엇인지', d: '건강기능식품인지 일반식품인지에 따라 표시할 수 있는 내용이 다릅니다. 오륜미네랄은 기타가공품(일반식품)이라 특정 효능을 내세우지 않습니다.' },
  { t: '어떻게 먹는지', d: '알약, 분말, 액상 중 내 생활에 맞는 형태를 고르세요. 오륜미네랄은 원액을 물에 10~30배 희석해 마시는 액상 제품입니다.' },
  { t: '매일 챙길 수 있는지', d: '미네랄은 하루 이틀이 아니라 매일 챙기는 습관이 중요합니다. 물에 타서 하루 한 잔 마시는 방식은 따로 시간을 내지 않아도 돼 꾸준히 이어 가기 쉽습니다.' },
]

const guideFaq = FAQ_PRODUCT.filter((f) => /효과 좋은|다시 구매|어디서/.test(f.q))

export default function MineralGuide() {
  return (
    <>
      <section className="section">
        <div className="wrap split">
          <div>
            <p className="muted">알프스 ALFS 가이드</p>
            <h1 className="h-section" style={{ fontSize: 'var(--t-2xl)' }}>미네랄 고르는 법<br />추천 전에 확인할 5가지</h1>
            <p className="lead muted mt-s">‘효과 좋은 미네랄’을 찾을 때 광고 문구보다 먼저 볼 것은 원료, 제조사, 식품 유형, 먹는 방법, 그리고 매일 챙길 수 있는지입니다. 알프스가 유통하는 오륜미네랄을 예로 정리했습니다.</p>
          </div>
          <div className="cocoon" style={{ maxWidth: 420, margin: '0 auto' }}>
            <img src={asset('images/bottle-mulberry.webp')} alt="오디와 누에고치로 둘러싸인 오륜미네랄" width="1024" height="1024" />
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 860 }}>
          <ol className="howto">
            {points.map((p, i) => (
              <li key={p.t}><span className="n">{i + 1}</span><h2 style={{ fontSize: 'var(--t-lg)' }}>{p.t}</h2><p>{p.d}</p></li>
            ))}
          </ol>
          <p className="notice mt-m">오륜미네랄은 기타가공품(일반식품)이며 질병의 예방·치료를 위한 의약품이나 건강기능식품이 아닙니다. 건강 상태에 따른 섭취는 전문가와 상담하세요.</p>
          <div className="btn-row mt-m">
            <Link to="/products" className="btn btn--primary">오륜미네랄 제품 정보 보기</Link>
            <Link to="/distribution" className="btn btn--ghost">알프스 유통 알아보기</Link>
          </div>
        </div>
      </section>

      <Faq title="오륜미네랄 추천, 이것부터 물어보세요" items={guideFaq} />

      <CtaBand
        title="매장에서 꾸준히 다시 찾는 제품을 찾고 계신가요?"
        text="알프스 파트너샵은 체험 행사, 판매 콘텐츠, 재구매 안내까지 함께 운영합니다. 공급 조건은 상담 시 안내합니다."
        to="/partner"
        toLabel="파트너 입점 안내"
      />
    </>
  )
}
