import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { product as oryun, company, channels, won, delivery } from '../config/site.js'
import { CloseIcon } from './Icons.jsx'
import { asset } from '../lib/asset.js'
import { inAppBrowser, openInExternalBrowser } from '../lib/auth.jsx'
import OrderPolicy from './OrderPolicy.jsx'
import {
  TOSS_CLIENT_KEY, loadTossPayments, newOrderId, saveOrder, rememberLastOrder,
} from '../config/payment.js'

// 구매하기 → 주문서 → 토스페이먼츠 카드 결제창.
// 로그인 없이(비회원) 배송지·연락처를 적고 결제하기를 누르면 토스 결제창이 열립니다.
// 카드 결제가 어려운 분은 전화·카카오톡으로 주문할 수 있습니다(아래 '전화·카카오톡으로 주문').
//
// 효소세상 상품처럼 여러 상품을 팔 때는 buy.open(item) 으로 상품을 넘겨
// 주문서의 상품명·구성·가격·배송비가 그 상품 기준으로 바뀝니다.
const EMPTY = { name: '', phone: '', email: '', address: '', memo: '', agree: false }

const DEFAULT_ITEM = {
  id: 'oryun',
  name: oryun.name,
  volume: oryun.volume,
  price: oryun.price,
  listPrice: null,
  image: 'images/bottle-mulberry.webp',
  maxQty: oryun.maxQty,
  shippingFee: oryun.shippingFee,
  freeShippingOver: oryun.freeShippingOver,
  carrier: oryun.carrier,
}

export default function BuySheet({ open, item, onClose }) {
  const it = item || DEFAULT_ITEM
  const [qty, setQty] = useState(1)
  const [v, setV] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | opening
  const [msg, setMsg] = useState('')
  const closeRef = useRef(null)
  const inApp = inAppBrowser()

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // 창을 닫으면 다음에 다시 열 때 처음 상태로 돌아갑니다.
  useEffect(() => {
    if (open) return
    setStatus('idle'); setMsg(''); setErrors({})
  }, [open])

  // 다른 상품의 구매 버튼을 누르면 수량을 1로 되돌립니다.
  useEffect(() => { setQty(1) }, [it.id])

  const amount = it.price * qty
  const free = it.freeShippingOver === 0 || amount >= it.freeShippingOver
  const ship = free ? 0 : it.shippingFee
  const total = amount + ship

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const phoneDigits = v.phone.replace(/[^0-9]/g, '')

  const validate = () => {
    const e = {}
    if (!v.name.trim()) e.name = '받는 분 이름을 입력해 주세요.'
    if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(v.phone.replace(/\s/g, ''))) e.phone = '연락 가능한 번호를 010-0000-0000 형식으로 입력해 주세요.'
    if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = '이메일 주소 형식을 확인해 주세요.'
    if (!v.address.trim()) e.address = '배송지 주소를 입력해 주세요.'
    if (!v.agree) e.agree = '주문·결제를 위해 개인정보 수집·이용에 동의해 주세요.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const summary = () =>
    `[알프스 주문]\n상품: ${it.name} (${it.volume}) × ${qty}\n상품금액: ${won(amount)}\n배송비: ${ship === 0 ? '무료' : won(ship)} (${it.carrier || delivery.carrier})\n결제 예정금액: ${won(total)}\n받는 분: ${v.name}\n연락처: ${v.phone}\n배송지: ${v.address}\n요청사항: ${v.memo || '-'}`

  const pay = async (e) => {
    e.preventDefault()
    setMsg('')
    if (!validate()) return
    setStatus('opening')
    const orderId = newOrderId()
    // 결제창에서 돌아온 뒤 금액 대조·주문 표시에 쓰는 기록
    saveOrder({
      orderId,
      itemId: it.id,
      name: it.name,
      volume: it.volume,
      qty,
      amount,
      ship,
      total,
      shippingFee: it.shippingFee,
      freeShippingOver: it.freeShippingOver,
      buyerName: v.name.trim(),
      phone: v.phone.trim(),
      email: v.email.trim(),
      address: v.address.trim(),
      memo: v.memo.trim(),
      items: [{ id: it.id, qty }],
    })
    rememberLastOrder(orderId)

    try {
      const TossPayments = await loadTossPayments()
      const payment = TossPayments(TOSS_CLIENT_KEY).payment({ customerKey: TossPayments.ANONYMOUS })
      await payment.requestPayment({
        method: 'CARD', // 카드·간편결제 통합 결제창
        amount: { currency: 'KRW', value: total },
        orderId,
        orderName: `${it.name} ${qty}개`,
        customerName: v.name.trim(),
        customerMobilePhone: phoneDigits,
        ...(v.email.trim() ? { customerEmail: v.email.trim() } : {}),
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      })
      // 리다이렉트 방식이라 결제창이 열리면 페이지가 이동합니다. (여기까지 오면 창이 닫힌 경우)
      setStatus('idle')
    } catch (err) {
      setStatus('idle')
      const code = err?.code || ''
      if (code === 'USER_CANCEL' || code === 'PAY_PROCESS_CANCELED') {
        setMsg('결제를 취소하셨습니다. 주문 내용은 그대로 두었으니 다시 결제하실 수 있습니다.')
      } else if (code === 'INVALID_CLIENT_KEY' || code === 'UNAUTHORIZED_KEY' || code === 'UNKNOWN' || !code) {
        // 키·가맹 설정 문제까지 포함해 사용자에게는 기술 용어를 보이지 않습니다.
        setMsg(`결제 연결을 확인하고 있습니다. 잠시 후 다시 시도하시거나 전화 주문(${company.phone})을 이용해 주세요.`)
        console.warn('[alfs] 토스 결제창을 열지 못했습니다:', code || '(코드 없음)', err?.message || '')
      } else {
        setMsg(`결제창을 열지 못했습니다.${err?.message ? ` (${err.message})` : ''} 잠시 후 다시 시도하시거나 전화 주문(${company.phone})을 이용해 주세요.`)
      }
    }
  }

  const kakao = channels.find((c) => c.id === 'kakao' && c.url)

  const close = () => onClose()

  return (
    <>
      <div className={`sheet-backdrop sheet-backdrop--buy ${open ? 'open' : ''}`} onClick={close} />
      <div
        className={`sheet sheet--buy ${open ? 'open' : ''}`}
        role="dialog" aria-modal="true" aria-labelledby="buy-title" aria-hidden={!open}
      >
        <div className="sheet__head">
          <div>
            <h2 id="buy-title">주문하기</h2>
            <p>{it.name} · {it.volume}</p>
          </div>
          <button ref={closeRef} className="icon-btn" onClick={close} aria-label="주문 창 닫기" tabIndex={open ? 0 : -1}><CloseIcon /></button>
        </div>

        <form className="form" onSubmit={pay} noValidate>
          {inApp && (
            <p className="order-app-note" role="note">
              카카오톡·인스타그램 앱 안에서는 카드 결제창이 열리지 않을 수 있습니다.
              {inApp === 'kakao' && <> <button type="button" className="link-btn" onClick={openInExternalBrowser}>다른 브라우저로 열기</button></>}
            </p>
          )}

          <div className="order-line">
            <img src={asset(it.image)} alt="" width="64" height="64" loading="lazy" />
            <div className="order-line__body">
              <b>{it.name}</b>
              <span>{it.volume} · {won(it.price)}</span>
            </div>
            <div className="qty" role="group" aria-label="수량">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="수량 줄이기" disabled={qty <= 1}>−</button>
              <output aria-live="polite">{qty}</output>
              <button type="button" onClick={() => setQty((q) => Math.min(it.maxQty, q + 1))} aria-label="수량 늘리기" disabled={qty >= it.maxQty}>+</button>
            </div>
          </div>

          <dl className="order-total">
            <div><dt>상품금액</dt><dd>{won(amount)}</dd></div>
            <div>
              <dt>배송비 <span className="muted">({it.freeShippingOver === 0 ? '무료배송 상품' : `${won(it.freeShippingOver)} 이상 무료`})</span></dt>
              <dd>{ship === 0 ? '무료' : won(ship)}</dd>
            </div>
            <div className="order-total__sum"><dt>결제 금액</dt><dd>{won(total)}</dd></div>
          </dl>

          <div className="field">
            <label htmlFor="b-name">받는 분</label>
            <input id="b-name" value={v.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} />
            {errors.name && <p className="err">{errors.name}</p>}
          </div>
          <div className="field">
            <label htmlFor="b-phone">연락처</label>
            <input id="b-phone" value={v.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" aria-invalid={!!errors.phone} />
            {errors.phone && <p className="err">{errors.phone}</p>}
          </div>
          <div className="field">
            <label htmlFor="b-email">이메일 <span className="muted">(선택 · 결제 영수증 받을 주소)</span></label>
            <input id="b-email" type="email" value={v.email} onChange={set('email')} inputMode="email" autoComplete="email" placeholder="name@example.com" aria-invalid={!!errors.email} />
            {errors.email && <p className="err">{errors.email}</p>}
          </div>
          <div className="field">
            <label htmlFor="b-addr">배송지 주소</label>
            <input id="b-addr" value={v.address} onChange={set('address')} autoComplete="street-address" placeholder="도로명 주소와 상세 주소" aria-invalid={!!errors.address} />
            {errors.address && <p className="err">{errors.address}</p>}
          </div>
          <div className="field">
            <label htmlFor="b-memo">배송 요청사항 (선택)</label>
            <input id="b-memo" value={v.memo} onChange={set('memo')} placeholder="예: 문 앞에 놓아 주세요" />
          </div>

          <label className="consent">
            <input type="checkbox" checked={v.agree} onChange={set('agree')} />
            <span>
              주문·배송·결제를 위해 이름·연락처·이메일(선택)·배송지를 수집하며, 전자상거래법에 따른 거래 기록 보존 기간 동안 보관하는 데 동의합니다.
              결제는 토스페이먼츠(주)를 통해 처리됩니다. (필수)
            </span>
          </label>
          {errors.agree && <p className="err" style={{ marginTop: -8 }}>{errors.agree}</p>}

          <OrderPolicy fee={it.shippingFee} freeOver={it.freeShippingOver} />

          {msg && <p className="err" role="alert">{msg}</p>}

          <div>
            <button type="submit" className="btn btn--primary btn--pay" disabled={status === 'opening'}>
              {status === 'opening' ? '결제창을 여는 중…' : `신용·체크카드로 결제하기 · ${won(total)}`}
            </button>
            <p className="buybox__note">토스페이먼츠 결제창에서 카드사와 할부를 고르실 수 있습니다. 회원가입·로그인 없이 결제됩니다.</p>
          </div>

          <details className="order-alt">
            <summary>카드 결제 대신 전화·카카오톡으로 주문하려면</summary>
            <p>주문 내용을 그대로 불러 드립니다. 아래 방법으로 알려 주시면 담당자가 결제와 배송 일정을 안내드립니다.</p>
            <pre className="order-summary">{summary()}</pre>
            <div className="btn-row">
              {kakao && <a className="btn btn--kakao" href={kakao.url} target="_blank" rel="noreferrer">카카오톡 채널로 주문</a>}
              <a className="btn btn--ghost" href={`tel:${company.phone.replace(/-/g, '')}`}>전화 주문 {company.phone}</a>
              <a className="btn btn--ghost" href={`mailto:${company.email}?subject=${encodeURIComponent(`[알프스 주문] ${it.name} ${qty}개`)}&body=${encodeURIComponent(summary())}`}>이메일로 주문</a>
            </div>
          </details>

          <p className="muted" style={{ fontSize: '0.85rem' }}>
            결제 전에 <Link to="/terms" onClick={close}>이용약관</Link>과 <Link to="/privacy" onClick={close}>개인정보처리방침</Link>,
            배송·교환·환불 기준을 확인해 주세요.
          </p>
        </form>
      </div>
    </>
  )
}
