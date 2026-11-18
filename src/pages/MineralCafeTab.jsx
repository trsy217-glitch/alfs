import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductTabs from '../components/ProductTabs.jsx'
import Faq from '../components/Faq.jsx'
import { CloseIcon } from '../components/Icons.jsx'
import { useBuy } from '../components/buy.js'
import { useConsult } from '../components/consult.js'
import OrderPolicy from '../components/OrderPolicy.jsx'
import { CAFE_MINERAL_ML, cafeNotes, cafeRecipes, cafeSteps } from '../config/cafe.js'
import { company, delivery, refundSummary, shippingSummary, product, won } from '../config/site.js'
import { asset, scrollToId } from '../lib/asset.js'
import { FAQ_CAFE } from '../seo.js'

// ⚠️ 이 화면은 '레시피(음용·활용 가이드)'와 '판매 상품(오륜미네랄 1,000ml)'을 나눠 보여 줍니다.
//    PG 심사 중이므로 레시피를 상품처럼 보이게 만들지 않고, 효능·질병치료 표현도 쓰지 않습니다.
//    레시피 재료·분량은 소영 님이 보내 주신 카드에 적힌 그대로입니다.

// 카드 이미지를 화면 가득 크게 보는 창
function RecipeLightbox({ index, onClose, onStep }) {
  useEffect(() => {
    if (index === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onStep(1)
      if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    const before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = before
    }
  }, [index, onClose, onStep])

  if (index === null) return null
  const r = cafeRecipes[index]

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${r.name} 레시피 카드 크게 보기`} onClick={onClose}>
      <div className="lightbox__panel" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox__head">
          <div>
            <b className="lightbox__name">{r.name}</b>
            <span className="lightbox__ing">{r.ingredients.join(' · ')}</span>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="크게 보기 닫기"><CloseIcon /></button>
        </div>
        <img className="lightbox__img" src={asset(r.image)} alt={r.imageAlt} width="1260" height="891" />
        <div className="lightbox__nav">
          <button type="button" className="btn btn--ghost" onClick={() => onStep(-1)}>← 이전</button>
          <span className="lightbox__count">{index + 1} / {cafeRecipes.length}</span>
          <button type="button" className="btn btn--ghost" onClick={() => onStep(1)}>다음 →</button>
        </div>
      </div>
    </div>
  )
}

export default function MineralCafeTab() {
  const buy = useBuy()
  const consult = useConsult()
  const [zoom, setZoom] = useState(null)

  const closeZoom = useCallback(() => setZoom(null), [])
  const stepZoom = useCallback((d) => {
    setZoom((z) => (z === null ? z : (z + d + cafeRecipes.length) % cafeRecipes.length))
  }, [])

  return (
    <>
      <ProductTabs />
      <RecipeLightbox index={zoom} onClose={closeZoom} onStep={stepZoom} />

      <section className="p-hero dark">
        <div className="wrap">
          <div className="intro">
            <span className="kicker">알프스 미네랄 카페 · 오륜미네랄 레시피</span>
            <h1>건강하고 맛있는 오륜미네랄 카페 레시피</h1>
            <p className="lead muted">
              오륜미네랄 60ml를 넣어 만드는 홈카페 음료 6종입니다. 과일과 요구르트, 두유처럼 집에 있는
              재료에 오륜미네랄만 더하면 한 잔이 됩니다. 카드에 적힌 재료와 분량을 그대로 옮겨 두었습니다.
            </p>
            <div className="badges">
              <span className="badge">레시피 6종</span>
              <span className="badge">레시피는 무료 음용 가이드</span>
              <span className="badge">판매 상품은 오륜미네랄 1,000ml</span>
            </div>
            <div className="btn-row">
              <button type="button" className="btn btn--drop" onClick={() => scrollToId('recipes')}>레시피 6종 보기</button>
              <button type="button" className="btn btn--ghost" onClick={() => buy.open()}>오륜미네랄 1,000ml 구매하기</button>
            </div>
            <p className="muted hero-note">
              이 페이지의 레시피는 판매 상품이 아닙니다. 알프스가 판매하는 상품은 오륜미네랄 {product.volume}
              ({won(product.price)}) 한 가지입니다.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="recipes">
        <div className="wrap">
          <h2 className="h-section">오륜미네랄 카페 레시피 6종</h2>
          <p className="lead muted mt-s">
            카드를 누르면 원본 레시피 이미지를 크게 볼 수 있습니다. 카드 아래에는 같은 재료를 글자로 적어 두었습니다.
          </p>

          <div className="cafegrid">
            {cafeRecipes.map((r, i) => (
              <article className="capecard" key={r.id}>
                <button type="button" className="capecard__media" onClick={() => setZoom(i)} aria-label={`${r.name} 레시피 카드 크게 보기`}>
                  <img src={asset(r.image)} alt={r.imageAlt} width="1260" height="891" loading="lazy" />
                  <span className="capecard__zoom">크게 보기</span>
                </button>
                <div className="capecard__body">
                  <div className="capecard__head">
                    <span className="capecard__tag">{r.tag}</span>
                    <span className="capecard__en en">{r.nameEn}</span>
                  </div>
                  <h3>{r.name}</h3>
                  <p className="capecard__line">{r.line}</p>
                  <ul className="capecard__ing">
                    {r.ingredients.map((g) => <li key={g}>{g}</li>)}
                  </ul>
                  <p className="capecard__meta">1잔 기준 · 오륜미네랄 {CAFE_MINERAL_ML}ml 포함</p>
                  <button type="button" className="btn btn--ghost capecard__btn" onClick={() => setZoom(i)}>
                    레시피 카드 크게 보기
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section--tight" style={{ background: 'var(--silk-2)' }}>
        <div className="wrap">
          <h2 className="h-section">이렇게 만들어요</h2>
          <p className="lead muted mt-s">여섯 가지 모두 같은 순서로 만듭니다. 다른 점은 과일과 곁들이는 재료뿐입니다.</p>
          <ol className="howto howto--four">
            {cafeSteps.map((s, i) => (
              <li key={s.t}>
                <span className="n">{i + 1}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>

          <div className="capecaution">
            <h3>알아 두실 점</h3>
            <ul>
              {cafeNotes.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="section--tight leafbg" id="buy">
        <div className="wrap split">
          <div>
            <span className="kicker">판매 상품 · 오륜미네랄</span>
            <h2 className="h-section">레시피에 쓰는 오륜미네랄 1,000ml</h2>
            <p className="lead muted mt-s">
              레시피 6종에 60ml씩 들어가는 오륜미네랄은 알프스가 유통하는 액상 미네랄입니다.
              원액을 물에 10~30배 희석해 하루 한 잔 마시고, 음료를 만들 때는 한 잔에 60ml를 넣습니다.
            </p>
            <div className="btn-row mt-m">
              <button type="button" className="btn btn--drop" onClick={() => buy.open()}>오륜미네랄 1,000ml 구매하기</button>
              <Link to="/products" className="btn btn--ghost">제품 정보 보기</Link>
            </div>
            <p className="muted" style={{ marginTop: 14, fontSize: '0.9rem', lineHeight: 1.7 }}>
              비회원도 신용·체크카드로 바로 결제할 수 있습니다. {delivery.carrier} · {delivery.leadTime}({delivery.leadTimeNote}) · {delivery.transit}.
              수령 후 7일 이내 청약철회가 가능하고, 단순 변심 반품은 왕복 배송비를 구매자가 부담합니다. 배송비는 {shippingSummary}입니다.
            </p>
          </div>
          <div>
            <div className="pricebox">
              <div className="pricebox__line">
                <span className="pricebox__label">판매가</span>
                <b>{won(product.price)}</b>
              </div>
              <p className="pricebox__meta">{product.name} · {product.volume} · {product.carrier} 발송</p>
              <table className="spec">
                <tbody>
                  <tr><th scope="row">제품명</th><td>{product.name}</td></tr>
                  <tr><th scope="row">내용량</th><td>{product.volume}</td></tr>
                  <tr><th scope="row">식품유형</th><td>기타가공품(일반식품)</td></tr>
                  <tr><th scope="row">제조원</th><td>유디아미네랄 (충북 보은)</td></tr>
                  <tr><th scope="row">섭취 방법</th><td>원액을 물에 10~30배 희석해 하루 한 잔</td></tr>
                  <tr><th scope="row">배송비</th><td>{shippingSummary} · 제주·도서산간 추가 6,000원</td></tr>
                  <tr><th scope="row">배송 방법</th><td>{delivery.carrier} · {delivery.leadTime}({delivery.leadTimeNote})</td></tr>
                  <tr><th scope="row">배송 기간</th><td>{delivery.transit}</td></tr>
                  <tr><th scope="row">교환·환불</th><td>{refundSummary.withdraw} · {refundSummary.changeOfMind} · {refundSummary.defect}</td></tr>
                  <tr><th scope="row">결제</th><td>토스페이먼츠 신용·체크카드 (비회원 가능)</td></tr>
                  <tr><th scope="row">판매원</th><td>{company.legalName} · {company.phone}</td></tr>
                </tbody>
              </table>
              <OrderPolicy showLink={false} />
            </div>
          </div>
        </div>
      </section>

      <Faq title="미네랄 카페 레시피 자주 묻는 질문" items={FAQ_CAFE} />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 860 }}>
          <p className="notice">
            오륜미네랄은 기타가공품(일반식품)이며, 질병의 예방이나 치료를 위한 제품이 아닙니다.
            레시피에 들어가는 과일·달걀·요구르트는 일반 식재료이고, 레시피는 오륜미네랄을 활용하는
            방법을 안내하는 글입니다. 섭취 중 이상이 느껴지면 섭취를 중단하고 전문가와 상담하세요.
          </p>
          <div className="btn-row mt-m">
            <button type="button" className="btn btn--ghost" onClick={consult.open}>레시피·제품 상담하기</button>
            <Link to="/refund-policy" className="btn btn--ghost">배송·교환·환불 정책</Link>
          </div>
        </div>
      </section>
    </>
  )
}
