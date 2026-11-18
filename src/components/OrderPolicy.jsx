import { Link } from 'react-router-dom'
import { delivery, product, refundSummary, won } from '../config/site.js'

// 상품 화면과 주문서에 함께 붙는 배송·교환·환불 요약.
// 토스페이먼츠 심사에서 요구하는 "배송 기간과 교환·환불 정책이 상품 화면·주문서에 바로 보이는지"를
// 한 곳에서 채웁니다. 값은 config/site.js 의 delivery · refundSummary 하나만 고치면 전체에 반영됩니다.
//
//   <OrderPolicy />                      기본 상품(오륜미네랄) 배송비 기준
//   <OrderPolicy fee={4000} freeOver={50000} />   효소세상 상품처럼 배송비가 다른 경우
//   <OrderPolicy dark />                 어두운 배경(제품 첫 화면) 안에서 쓸 때
export default function OrderPolicy({ fee = product.shippingFee, freeOver = product.freeShippingOver, dark = false, showLink = true, title = '배송·교환·환불 안내' }) {
  const ship = freeOver === 0 || !fee
    ? '무료배송'
    : `기본 ${won(fee)} · ${won(freeOver)} 이상 무료배송`

  return (
    <section className={`order-policy ${dark ? 'order-policy--dark' : ''}`} aria-label="배송·교환·환불 안내">
      <h3 className="order-policy__title">{title}</h3>
      <dl className="order-policy__list">
        <div>
          <dt>배송</dt>
          <dd>{delivery.carrier} · {delivery.leadTime}({delivery.leadTimeNote}) · {delivery.transit}</dd>
        </div>
        <div>
          <dt>배송비</dt>
          <dd>{ship} · 제주·도서산간 추가 {won(delivery.islandFee)}</dd>
        </div>
        <div>
          <dt>교환·환불</dt>
          <dd>
            {refundSummary.withdraw}. {refundSummary.changeOfMind}, {refundSummary.defect}.
            {refundSummary.refundTime}. {refundSummary.limit}.
          </dd>
        </div>
      </dl>
      {showLink && (
        <p className="order-policy__link">
          자세한 기준은 <Link to="/refund-policy">배송·교환·환불 정책</Link>에서 확인하실 수 있습니다.
        </p>
      )}
    </section>
  )
}
