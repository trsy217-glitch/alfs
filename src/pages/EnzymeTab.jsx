import { Link } from 'react-router-dom'
import ProductTabs from '../components/ProductTabs.jsx'
import Faq from '../components/Faq.jsx'
import CtaBand from '../components/CtaBand.jsx'
import { useBuy } from '../components/buy.js'
import { useConsult } from '../components/consult.js'
import { enzymeProducts, enzymeShipping, shippingText, toOrderItem, discountRate } from '../config/enzyme.js'
import { company, won } from '../config/site.js'
import { asset, scrollToId } from '../lib/asset.js'
import { FAQ_ENZYME } from '../seo.js'

// ⚠️ 식품표시광고법·PG 심사: 효능(숙변 제거, 간 해독, 체질개선 등) 표현은 쓰지 않습니다.
//    제품명·구성·용량·배송·섭취 방법 같은 사실만 적고, 효능은 제품 라벨 안내로 넘깁니다.

export default function EnzymeTab() {
  const buy = useBuy()
  const consult = useConsult()

  return (
    <>
      <ProductTabs />

      <section className="p-hero dark">
        <div className="wrap">
          <div className="intro">
            <span className="kicker">알프스 유통 · 효소세상</span>
            <h1>매일 한 포씩, 발효 음료 여섯 가지</h1>
            <p className="lead muted">
              효소세상이 만든 발효 효소·미생물 발효 음료 6종을 알프스가 유통합니다. 30일·3일 프로그램부터
              낱개로 챙기는 병 제품까지, 쓰는 기간과 방식에 맞춰 고르실 수 있습니다.
            </p>
            <div className="badges">
              <span className="badge">5만 원 이상 무료배송</span>
              <span className="badge">카드 결제 준비 중 · 주문서 접수</span>
              <span className="badge">제조사 효소세상</span>
            </div>
            <div className="btn-row">
              <button type="button" className="btn btn--drop" onClick={() => scrollToId('products')}>제품 6종 보기</button>
              <button type="button" className="btn btn--ghost" onClick={consult.open}>어떤 제품이 맞을지 상담</button>
            </div>
            <p className="muted hero-note">
              표시 가격은 알프스.샵 네이버 스마트스토어의 판매가와 같습니다. 쿠폰·멤버십 적립은 스토어 정책에 따릅니다.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="products">
        <div className="wrap">
          <h2 className="h-section">효소세상 제품 6종</h2>
          <p className="lead muted mt-s">
            상품을 누르면 구성과 섭취 방법을 볼 수 있고, 구매하기를 누르면 주문서가 열립니다.
          </p>

          <div className="prodgrid">
            {enzymeProducts.map((p) => {
              const rate = discountRate(p)
              return (
                <article className="pcard" key={p.id}>
                  <div className="pcard__media">
                    <img src={asset(p.image)} alt={p.imageAlt} loading="lazy" width="900" height="900" />
                    <span className="pcard__tag">{p.tag}</span>
                  </div>
                  <div className="pcard__body">
                    <span className="pcard__brand">{p.brand}</span>
                    <h3>{p.name}</h3>
                    <p className="pcard__option">{p.option}</p>
                    <div className="pcard__price">
                      {p.listPrice && <span className="pcard__list">{won(p.listPrice)}</span>}
                      <b>{won(p.price)}</b>
                      {rate > 0 && <span className="pcard__rate">{rate}%</span>}
                    </div>
                    <p className="pcard__ship">{shippingText(p)}</p>
                    <div className="pcard__btns">
                      <button type="button" className="btn btn--primary" onClick={() => buy.open(toOrderItem(p))}>구매하기</button>
                      <button type="button" className="btn btn--ghost" onClick={() => scrollToId(`p-${p.slug}`)}>자세히</button>
                    </div>
                    <a className="pcard__store" href={p.storeUrl} target="_blank" rel="noreferrer">네이버 스토어에서 보기 ↗</a>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {enzymeProducts.map((p, i) => (
        <section key={p.id} id={`p-${p.slug}`} className={`section--tight pdetail ${i % 2 === 0 ? '' : 'pdetail--alt'}`}>
          <div className="wrap">
            <div className={`split split--top ${i % 2 === 0 ? '' : 'split--flip'}`}>
              <div className="pdetail__media">
                <img src={asset(p.image)} alt={p.imageAlt} loading="lazy" width="900" height="900" />
                {p.imageDetail && (
                  <img className="pdetail__media-detail" src={asset(p.imageDetail)} alt={p.imageDetailAlt} loading="lazy" width="900" height="690" />
                )}
              </div>
              <div>
                <span className="kicker">{p.brand}</span>
                <h2 className="h-section">{p.name}</h2>
                <p className="lead muted mt-s">{p.summary}</p>
                <ul className="plist">
                  {p.points.map((t) => <li key={t}>{t}</li>)}
                </ul>

                <div className="pricebox">
                  <div className="pricebox__line">
                    <span className="pricebox__label">판매가</span>
                    <b>{won(p.price)}</b>
                    {p.listPrice && <s className="muted">{won(p.listPrice)}</s>}
                  </div>
                  <p className="pricebox__meta">{p.option} · {shippingText(p)} · {enzymeShipping.carrier} 발송</p>
                  <div className="btn-row">
                    <button type="button" className="btn btn--primary" onClick={() => buy.open(toOrderItem(p))}>구매하기</button>
                    <a className="btn btn--ghost" href={p.storeUrl} target="_blank" rel="noreferrer">네이버 스토어</a>
                  </div>
                </div>

                <table className="spec">
                  <tbody>{p.spec.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody>
                </table>

                {p.usage && (
                  <>
                    <h3 className="pdetail__h3">이렇게 쓰세요</h3>
                    <ol className="howto howto--flat">
                      {p.usage.map((u, n) => (
                        <li key={u.t}><span className="n">{n + 1}</span><h3>{u.t}</h3><p>{u.d}</p></li>
                      ))}
                    </ol>
                  </>
                )}

                {p.note && <p className="notice">{p.note}</p>}
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="section--tight" style={{ background: 'var(--silk-2)' }}>
        <div className="wrap split">
          <div>
            <h2 className="h-section">배송·교환·환불 안내</h2>
            <p className="lead muted mt-s">
              상품 금액 5만 원 이상이면 무료배송이고, 5만 원 미만은 배송비 4,000원입니다. 제주·도서지역은 추가 6,000원이 붙고, 결제와 배송 일정은 주문서를 받은 뒤 담당자가 안내드립니다.
            </p>
            <div className="btn-row mt-m">
              <Link to="/refund-policy" className="btn btn--ghost">배송·교환·환불 정책</Link>
              <button type="button" className="btn btn--ghost" onClick={consult.open}>상담하기</button>
            </div>
          </div>
          <div>
            <table className="spec">
              <tbody>
                <tr><th scope="row">배송비</th><td>5만 원 이상 무료배송 · 5만 원 미만 4,000원 · 제주·도서지역 추가 6,000원</td></tr>
                <tr><th scope="row">배송 방법</th><td>택배 발송</td></tr>
                <tr><th scope="row">출고</th><td>주문서 확인 후 담당자가 일정 안내</td></tr>
                <tr><th scope="row">결제</th><td>카드 결제 준비 중 · 주문서를 카카오톡·전화·이메일로 접수</td></tr>
                <tr><th scope="row">판매원</th><td>{company.legalName} · {company.phone}</td></tr>
              </tbody>
            </table>
            <p className="notice">
              효소세상 제품은 의약품이 아니며, 질병의 예방이나 치료를 위한 제품이 아닙니다. 효능·효과를 표방하지 않습니다.
              섭취 방법과 원재료는 제품 라벨을 확인해 주세요. 섭취 중 이상이 느껴지면 섭취를 중단하고 전문가와 상담하세요.
            </p>
          </div>
        </div>
      </section>

      <Faq title="효소세상 제품 자주 묻는 질문" items={FAQ_ENZYME} />

      <CtaBand
        title="매장에서 함께 팔고 싶으신가요?"
        text="파트너샵은 오륜미네랄과 함께 효소세상 제품도 진열할 수 있습니다. 공급 조건과 판매 지원은 상담에서 안내합니다."
        to="/partner"
        toLabel="파트너 입점 조건 보기"
      />
    </>
  )
}
