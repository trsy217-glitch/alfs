import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { product as oryun, company, channels, won } from '../config/site.js'
import { CloseIcon } from './Icons.jsx'
import { asset } from '../lib/asset.js'

// 구매하기 → 주문서. 아직 카드 결제가 연결되기 전이라, 주문 내용을 확인해
// 카카오톡·전화·이메일로 접수하는 단계까지 안내합니다. (결제 연동 시 이 화면에 결제창을 붙입니다)
//
// 효소세상 상품처럼 여러 상품을 팔 때는 buy.open(item) 으로 상품을 넘겨
// 주문서의 상품명·구성·가격·배송비가 그 상품 기준으로 바뀝니다.
const EMPTY = { name: '', phone: '', address: '', memo: '', agree: false }

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
  const [status, setStatus] = useState('idle') // idle | ready
  const [copied, setCopied] = useState(false)
  const closeRef = useRef(null)

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
    setStatus('idle'); setCopied(false); setErrors({})
  }, [open])

  // 다른 상품의 구매 버튼을 누르면 수량을 1로 되돌립니다.
  useEffect(() => { setQty(1) }, [it.id])

  const amount = it.price * qty
  const free = it.freeShippingOver === 0 || amount >= it.freeShippingOver
  const ship = free ? 0 : it.shippingFee
  const total = amount + ship

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const validate = () => {
    const e = {}
    if (!v.name.trim()) e.name = '받는 분 이름을 입력해 주세요.'
    if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(v.phone.replace(/\s/g, ''))) e.phone = '연락 가능한 번호를 010-0000-0000 형식으로 입력해 주세요.'
    if (!v.address.trim()) e.address = '배송지 주소를 입력해 주세요.'
    if (!v.agree) e.agree = '주문 접수를 위해 개인정보 수집·이용에 동의해 주세요.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const summary = () =>
    `[알프스 주문]\n상품: ${it.name} (${it.volume}) × ${qty}\n상품금액: ${won(amount)}\n배송비: ${ship === 0 ? '무료' : won(ship)} (${it.carrier})\n결제 예정금액: ${won(total)}\n받는 분: ${v.name}\n연락처: ${v.phone}\n배송지: ${v.address}\n요청사항: ${v.memo || '-'}`

  const submit = (e) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('ready')
  }

  const kakao = channels.find((c) => c.id === 'kakao' && c.url)
  const sendKakao = async () => {
    try { await navigator.clipboard.writeText(summary()); setCopied(true) } catch { /* 복사 권한이 없으면 그대로 진행 */ }
    window.open(kakao.url, '_blank', 'noreferrer')
  }

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
            <h2 id="buy-title">{status === 'ready' ? '주문 내용을 확인해 주세요' : '주문하기'}</h2>
            <p>{it.name} · {it.volume}</p>
          </div>
          <button ref={closeRef} className="icon-btn" onClick={close} aria-label="주문 창 닫기" tabIndex={open ? 0 : -1}><CloseIcon /></button>
        </div>

        {status === 'idle' ? (
          <form className="form" onSubmit={submit} noValidate>
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
              <div className="order-total__sum"><dt>결제 예정금액</dt><dd>{won(total)}</dd></div>
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
              <span>주문 접수·배송을 위해 이름·연락처·배송지를 수집하며, 전자상거래법에 따른 거래 기록 보존 기간 동안 보관하는 데 동의합니다. (필수)</span>
            </label>
            {errors.agree && <p className="err" style={{ marginTop: -8 }}>{errors.agree}</p>}

            <p className="buybox__note">카드 결제는 준비 중입니다. 주문서를 작성하면 카카오톡·전화·이메일로 접수할 수 있고, 담당자가 결제 방법과 배송 일정을 안내드립니다.</p>
            <div>
              <button type="submit" className="btn btn--primary">주문서 확인</button>
            </div>
          </form>
        ) : (
          <div className="form">
            <div className="form-done" role="status">
              <h3>주문서가 준비되었습니다</h3>
              <p>{v.name}님, 아래 내용으로 주문을 접수해 주세요. 담당자가 확인 후 결제 방법과 배송 일정을 안내드립니다.</p>
              <pre className="order-summary">{summary()}</pre>
            </div>
            <div className="btn-row">
              {kakao && <button className="btn btn--kakao" onClick={sendKakao}>카카오톡으로 주문 접수</button>}
              <a className="btn btn--primary" href={`tel:${company.phone.replace(/-/g, '')}`}>전화 주문 {company.phone}</a>
              <a className="btn btn--ghost" href={`mailto:${company.email}?subject=${encodeURIComponent(`[알프스 주문] ${it.name} ${qty}개`)}&body=${encodeURIComponent(summary())}`}>이메일로 주문</a>
            </div>
            {copied && <p className="muted" style={{ fontSize: '0.85rem' }}>주문 내용을 복사했어요. 카카오톡 대화창에 붙여넣기 해 주세요.</p>}
            <p className="muted" style={{ fontSize: '0.85rem' }}>
              배송·교환·환불 조건은 <Link to="/refund-policy" onClick={close}>배송·교환·환불 정책</Link>에서 확인하실 수 있습니다.
            </p>
            <button className="btn btn--ghost" style={{ minHeight: 40, fontSize: '0.9rem' }} onClick={() => setStatus('idle')}>주문 내용 고치기</button>
          </div>
        )}
      </div>
    </>
  )
}
