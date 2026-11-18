import { Link } from 'react-router-dom'
import { product, won, shippingSummary, delivery } from '../config/site.js'
import { useBuy } from './buy.js'

// 상품·메인 화면에 함께 쓰는 가격 + 배송비 + 구매하기 묶음.
// 클릭하면 주문서(BuySheet)가 열리고, 주문서에서 비회원 신용·체크카드 결제(토스페이먼츠)로 이어집니다.
// item 을 넘기면 그 상품 기준으로 가격·배송비가 계산됩니다(효소세상 상품 등).
export default function BuyBox({ quantity = 1, note = true, compact = false, dark = false, item = null }) {
  const buy = useBuy()
  const it = item || product
  const amount = it.price * quantity
  const freeOver = it.freeShippingOver ?? product.freeShippingOver
  const shippingFee = it.shippingFee ?? product.shippingFee
  const free = freeOver === 0 || amount >= freeOver
  const ship = free ? 0 : shippingFee

  return (
    <div className={`buybox ${compact ? 'buybox--compact' : ''} ${dark ? 'buybox--dark' : ''}`}>
      <div className="buybox__price">
        <span className="buybox__label">판매가</span>
        <b>{won(it.price)}</b>
        <span className="buybox__unit">/ {it.volume} {item ? '1개' : '1병'}</span>
      </div>
      <p className="buybox__ship">
        배송비 {freeOver === 0 ? '무료배송' : shippingSummary}
        <span className="buybox__ship-now">이 주문은 {ship === 0 ? '무료배송' : won(ship)}</span>
      </p>
      <div className="btn-row">
        <button type="button" className={`btn ${dark ? 'btn--drop' : 'btn--primary'}`} onClick={() => buy.open(item)}>구매하기</button>
        <Link to="/refund-policy" className="btn btn--ghost">배송·교환·환불 정책</Link>
      </div>
      {note && (
        <p className="buybox__note">
          비회원도 신용·체크카드로 바로 결제할 수 있습니다. {delivery.carrier} · {delivery.leadTime} · {delivery.transit} · 수령 후 7일 이내 청약철회 가능.
        </p>
      )}
    </div>
  )
}
