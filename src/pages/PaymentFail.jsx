import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { company, delivery, refundSummary, won } from '../config/site.js'
import { readOrder, LAST_ORDER_KEY } from '../config/payment.js'

// 토스페이먼츠 결제창에서 결제가 실패·취소되면 돌아오는 화면 (/payment/fail)
// 주소의 code·message 로 이유를 보여 주고, 주문 내용을 그대로 두어 다시 결제할 수 있게 합니다.
const FRIENDLY = {
  PAY_PROCESS_ABORTED: '결제가 중간에 중단되었습니다. 카드 정보나 결제 환경을 확인한 뒤 다시 시도해 주세요.',
  USER_CANCEL: '결제를 취소하셨습니다. 주문 내용은 그대로 남아 있습니다.',
  PAY_PROCESS_CANCELED: '결제를 취소하셨습니다. 주문 내용은 그대로 남아 있습니다.',
  REJECT_CARD_COMPANY: '카드사에서 결제를 거절했습니다. 카드 한도·비밀번호·사용 정지를 확인해 주세요.',
  INVALID_CARD_EXPIRATION: '카드 유효기간이 올바르지 않습니다.',
  INVALID_STOPPED_CARD: '정지된 카드입니다. 다른 카드로 시도해 주세요.',
  EXCEED_MAX_DAILY_PAYMENT_COUNT: '하루 결제 가능 횟수를 넘었습니다.',
  EXCEED_MAX_PAYMENT_AMOUNT: '1회 결제 한도를 넘었습니다. 다른 카드로 시도해 주세요.',
  NOT_SUPPORTED_INSTALLMENT_PLAN_CARD_OR_MERCHANT: '이 카드·가맹점에서는 선택한 할부가 지원되지 않습니다.',
  INVALID_CLIENT_KEY: '결제 설정을 확인하고 있습니다. 잠시 후 다시 시도해 주세요.',
  UNAUTHORIZED_KEY: '결제 설정을 확인하고 있습니다. 잠시 후 다시 시도해 주세요.',
}

export default function PaymentFail() {
  const [sp] = useSearchParams()
  const code = sp.get('code') || ''
  const message = sp.get('message') || ''
  const orderId = sp.get('orderId') || ''
  const order = useMemo(() => {
    if (orderId) {
      const o = readOrder(orderId)
      if (o) return o
    }
    try {
      if (typeof window === 'undefined') return null
      return readOrder(localStorage.getItem(LAST_ORDER_KEY) || '')
    } catch { return null }
  }, [orderId])

  return (
    <section className="section">
      <div className="wrap pay-page">
        <div className="pay-result pay-result--err" role="alert">
          <p className="pay-result__state">결제가 완료되지 않았습니다</p>
          <h1>결제를 마치지 못했습니다</h1>
          <p className="lead mt-s">
            {FRIENDLY[code] || message || '결제가 정상적으로 처리되지 않았습니다.'}
            {code && <span className="muted"> (오류 코드 {code})</span>}
          </p>
          <p className="muted mt-s">결제가 되지 않았으니 카드 청구는 발생하지 않습니다. 다시 시도하시거나 전화 주문을 이용해 주세요.</p>

          {order && (
            <dl className="pay-result__info">
              {orderId && <div><dt>주문번호</dt><dd>{orderId}</dd></div>}
              <div><dt>상품</dt><dd>{order.name}{order.volume ? ` (${order.volume})` : ''} × {order.qty}</dd></div>
              <div><dt>결제 예정 금액</dt><dd>{won(order.total)}</dd></div>
              {order.buyerName && <div><dt>받는 분</dt><dd>{order.buyerName} · {order.phone}</dd></div>}
              {order.address && <div><dt>배송지</dt><dd>{order.address}</dd></div>}
            </dl>
          )}

          <div className="btn-row mt-m">
            <Link to={order?.itemId && order.itemId !== 'oryun' ? '/products/enzyme' : '/products'} className="btn btn--primary">다시 주문하기</Link>
            <a className="btn btn--ghost" href={`tel:${company.phone.replace(/-/g, '')}`}>전화 주문 {company.phone}</a>
            <Link to="/contact" className="btn btn--ghost">상담 신청</Link>
          </div>

          <p className="notice">
            배송·교환·환불 기준은 그대로입니다. {delivery.carrier} · {delivery.leadTime}({delivery.leadTimeNote}) · {delivery.transit}.
            {' '}{refundSummary.withdraw}.
          </p>
        </div>
      </div>
    </section>
  )
}
