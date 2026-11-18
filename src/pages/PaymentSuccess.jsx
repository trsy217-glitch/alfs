import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { company, delivery, refundSummary, won } from '../config/site.js'
import { readOrder } from '../config/payment.js'
import OrderPolicy from '../components/OrderPolicy.jsx'

// 토스페이먼츠 결제창에서 돌아오는 성공 화면 (/payment/success)
//  · 주소에 붙어 오는 paymentKey·orderId·amount 를 확인하고
//  · 주문서에 담아 둔 금액과 같은지 대조한 뒤
//  · 서버(api/toss/confirm.js)에 결제 승인을 요청합니다.
// 승인 없이 "결제 완료"라고 쓰지 않습니다. 승인 결과에 따라 문구가 달라집니다.
const PHASE = {
  checking: { title: '결제 정보를 확인하고 있습니다', tone: 'wait' },
  done: { title: '결제가 완료되었습니다', tone: 'ok' },
  pending: { title: '결제 인증이 끝났습니다 · 승인 대기', tone: 'wait' },
  failed: { title: '결제를 완료하지 못했습니다', tone: 'err' },
  mismatch: { title: '결제 금액이 주문과 다릅니다', tone: 'err' },
  invalid: { title: '결제 정보가 없습니다', tone: 'err' },
}

export default function PaymentSuccess() {
  const [sp] = useSearchParams()
  const [phase, setPhase] = useState('checking')
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState(null)

  const orderId = sp.get('orderId') || ''
  const paymentKey = sp.get('paymentKey') || ''
  const amount = Number(sp.get('amount') || 0)
  const order = useMemo(() => readOrder(orderId), [orderId])

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) { setPhase('invalid'); return }
    if (order && Number(order.total) !== amount) { setPhase('mismatch'); return }
    let alive = true
    ;(async () => {
      try {
        const r = await fetch('/api/toss/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount, items: order?.items || [] }),
        })
        const d = await r.json().catch(() => ({}))
        if (!alive) return
        if (r.ok && d.ok) { setPayment(d.payment || null); setPhase('done'); return }
        if (d.error === 'secret_key_missing') { setPhase('pending'); return }
        setError(d); setPhase('failed')
      } catch {
        if (alive) { setError({ error: 'network', message: '결제 승인 결과를 받지 못했습니다.' }); setPhase('failed') }
      }
    })()
    return () => { alive = false }
  }, [paymentKey, orderId, amount, order])

  const head = PHASE[phase]
  const method = payment?.method === '카드' || payment?.method === 'CARD' ? '신용·체크카드' : payment?.method || ''

  return (
    <section className="section">
      <div className="wrap pay-page">
        <div className={`pay-result pay-result--${head.tone}`} role="status" aria-live="polite">
          <p className="pay-result__state">
            {phase === 'checking' && '잠시만 기다려 주세요'}
            {phase === 'done' && '주문이 정상 접수되었습니다'}
            {phase === 'pending' && '담당자 확인이 필요합니다'}
            {phase === 'failed' && '카드 승인이 이루어지지 않았습니다'}
            {phase === 'mismatch' && '결제를 진행하지 않았습니다'}
            {phase === 'invalid' && '주소가 올바르지 않습니다'}
          </p>
          <h1>{head.title}</h1>

          {phase === 'checking' && <p className="lead muted mt-s">토스페이먼츠에서 받은 결제 정보로 승인을 요청하고 있습니다. 이 화면을 닫지 말아 주세요.</p>}

          {phase === 'done' && (
            <p className="lead mt-s">
              {order?.buyerName ? `${order.buyerName}님, ` : ''}결제가 정상적으로 승인되었습니다.
              {' '}결제 확인 후 영업일 기준 1~3일 이내에 출고되며, 출고 후 {delivery.carrier}로 배송됩니다.
            </p>
          )}

          {phase === 'pending' && (
            <p className="lead mt-s">
              카드 인증은 끝났지만, 가맹점 결제 승인 설정이 마무리되지 않아 승인 처리가 대기 중입니다.
              주문번호를 알려 주시면 담당자가 결제 상태를 확인해 드립니다. 중복 결제를 피하기 위해 다시 결제하지 마세요.
            </p>
          )}

          {phase === 'failed' && (
            <p className="lead mt-s">
              {error?.message || '카드사 승인이 이루어지지 않았습니다.'}
              {error?.error && error.error !== 'network' ? ` (오류 코드 ${error.error})` : ''}
              {' '}결제가 되지 않았으니 다시 시도하시거나 전화 주문을 이용해 주세요.
            </p>
          )}

          {phase === 'mismatch' && (
            <p className="lead mt-s">
              주문서의 결제 금액({won(order?.total || 0)})과 결제 요청 금액({won(amount)})이 달라 승인을 요청하지 않았습니다.
              주문을 다시 진행해 주세요. 금액이 이미 빠져나갔다면 {company.phone}으로 알려 주세요.
            </p>
          )}

          {phase === 'invalid' && (
            <p className="lead mt-s">결제 결과 주소에 필요한 정보가 없습니다. 주문을 다시 진행해 주세요.</p>
          )}

          {(phase === 'done' || phase === 'pending' || phase === 'failed') && (
            <dl className="pay-result__info">
              {orderId && <div><dt>주문번호</dt><dd>{orderId}</dd></div>}
              {payment?.orderName || order?.name ? (
                <div><dt>상품</dt><dd>{payment?.orderName || `${order.name} ${order.volume ? `(${order.volume})` : ''} × ${order.qty}`}</dd></div>
              ) : null}
              {(payment?.totalAmount || order?.total || amount) ? (
                <div><dt>결제 금액</dt><dd>{won(payment?.totalAmount || order?.total || amount)}</dd></div>
              ) : null}
              {method && <div><dt>결제 수단</dt><dd>{method}{payment?.card?.company ? ` · ${payment.card.company}` : ''}</dd></div>}
              {payment?.card?.number && <div><dt>카드번호</dt><dd>{payment.card.number}</dd></div>}
              {payment?.approvedAt && <div><dt>승인 시각</dt><dd>{new Date(payment.approvedAt).toLocaleString('ko-KR')}</dd></div>}
              {order?.buyerName && <div><dt>받는 분</dt><dd>{order.buyerName} · {order.phone}</dd></div>}
              {order?.address && <div><dt>배송지</dt><dd>{order.address}</dd></div>}
              {order?.memo && <div><dt>요청사항</dt><dd>{order.memo}</dd></div>}
            </dl>
          )}

          {payment?.receipt && (
            <p className="mt-s"><a className="btn btn--ghost" href={payment.receipt} target="_blank" rel="noreferrer">결제 영수증 보기</a></p>
          )}

          {(phase === 'done' || phase === 'pending') && (
            <>
              <p className="notice">
                배송 안내 · {delivery.carrier} · {delivery.leadTime}({delivery.leadTimeNote}) · {delivery.transit}
                <br />
                교환·환불 안내 · {refundSummary.withdraw}. {refundSummary.changeOfMind}, {refundSummary.defect}. {refundSummary.refundTime}.
              </p>
              <OrderPolicy fee={order?.shippingFee} freeOver={order?.freeShippingOver} title="배송·교환·환불 안내" />
            </>
          )}

          <div className="btn-row mt-m">
            <Link to="/products" className="btn btn--primary">제품 보러 가기</Link>
            {(phase === 'failed' || phase === 'mismatch') && <Link to="/products/enzyme" className="btn btn--ghost">다시 주문하기</Link>}
            <a className="btn btn--ghost" href={`tel:${company.phone.replace(/-/g, '')}`}>고객센터 {company.phone}</a>
          </div>
          <p className="muted mt-s" style={{ fontSize: '0.85rem' }}>
            주문·배송 문의는 {company.hours} · 이메일 {company.email} · 카카오톡 채널로도 받습니다.
          </p>
        </div>
      </div>
    </section>
  )
}
