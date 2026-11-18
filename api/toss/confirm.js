// Vercel 서버리스 함수: POST /api/toss/confirm
// 토스페이먼츠 결제창에서 돌아온 paymentKey·orderId·amount 로 "결제 승인(매출 확정)"을 요청합니다.
// 브라우저에서 부른 금액을 그대로 믿지 않고, 상품 가격표(서버 코드)로 다시 계산해 대조합니다.
//
// 환경 변수 (Vercel → Settings → Environment Variables)
//   TOSS_SECRET_KEY   토스페이먼츠 개발자센터 > API 키 > API 개별 연동 키의 시크릿 키
//                     (VITE_TOSS_CLIENT_KEY 와 같은 상점의 키여야 합니다. 테스트/라이브를 섞으면 UNAUTHORIZED_KEY)
//   값이 없으면 503 secret_key_missing 을 돌려주고, 화면은 "승인 대기"로 안내합니다.
import { product as mineral } from '../../src/config/site.js'
import { enzymeProducts } from '../../src/config/enzyme.js'

const s = (v, n = 300) => String(v ?? '').trim().slice(0, n)

// 서버가 아는 상품 가격표 — 클라이언트가 보낸 금액을 검증하는 기준
const CATALOG = new Map([
  ['oryun', { price: mineral.price, maxQty: mineral.maxQty, fee: mineral.shippingFee, freeOver: mineral.freeShippingOver }],
  ...enzymeProducts.map((p) => [p.id, { price: p.price, maxQty: 5, fee: p.shippingFee || 0, freeOver: p.freeShippingOver || 0 }]),
])

function expectedTotal(items) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 5) return null
  let total = 0
  for (const raw of items) {
    const p = CATALOG.get(s(raw?.id, 40))
    const qty = Math.floor(Number(raw?.qty))
    if (!p || !Number.isFinite(qty) || qty < 1 || qty > p.maxQty) return null
    const amount = p.price * qty
    const ship = p.freeOver === 0 || amount >= p.freeOver ? 0 : p.fee
    total += amount + ship
  }
  return total
}

const authHeader = (secret) => `Basic ${Buffer.from(`${secret}:`, 'utf8').toString('base64')}`

const safeJson = (t) => { try { return JSON.parse(t) } catch { return {} } }

// 화면에 필요한 값만 골라 돌려줍니다 (카드 원본 번호·빌링키 같은 민감정보는 내보내지 않음)
function publicPayment(d) {
  return {
    orderId: d.orderId,
    orderName: d.orderName,
    totalAmount: d.totalAmount,
    method: d.method,
    status: d.status,
    approvedAt: d.approvedAt,
    receipt: d.receipt?.url || '',
    card: d.card
      ? {
          company: d.card.company || '',
          number: d.card.number || '',
          cardType: d.card.cardType || '',
          installmentPlanMonths: d.card.installmentPlanMonths ?? 0,
        }
      : null,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method_not_allowed' }) }

  const secret = s(process.env.TOSS_SECRET_KEY, 200)
  if (!secret) return res.status(503).json({ ok: false, error: 'secret_key_missing', message: '결제 승인 키가 설정되지 않았습니다.' })

  const b = typeof req.body === 'string' ? safeJson(req.body) : req.body || {}
  const paymentKey = s(b.paymentKey, 200)
  const orderId = s(b.orderId, 64)
  const amount = Number(b.amount)

  if (!paymentKey || !orderId) return res.status(400).json({ ok: false, error: 'invalid_request', message: '결제 정보가 없습니다.' })
  if (!/^[A-Za-z0-9\-_=]{6,64}$/.test(orderId)) return res.status(400).json({ ok: false, error: 'invalid_order_id', message: '주문번호 형식이 올바르지 않습니다.' })
  if (!Number.isInteger(amount) || amount <= 0) return res.status(400).json({ ok: false, error: 'invalid_amount', message: '결제 금액이 올바르지 않습니다.' })

  const expected = expectedTotal(b.items)
  if (expected === null) return res.status(400).json({ ok: false, error: 'invalid_items', message: '주문 상품 정보를 확인할 수 없습니다.' })
  if (expected !== amount) {
    return res.status(400).json({ ok: false, error: 'amount_mismatch', expected, message: '주문 금액과 결제 요청 금액이 다릅니다.' })
  }

  const auth = authHeader(secret)

  try {
    const r = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    })
    const d = await r.json().catch(() => ({}))

    if (r.ok) return res.status(200).json({ ok: true, payment: publicPayment(d) })

    // 새로고침 등으로 같은 결제를 다시 승인 요청한 경우 → 이미 승인된 결제 정보를 조회해 성공으로 돌려줍니다.
    if (d?.code === 'ALREADY_PROCESSED_PAYMENT') {
      const q = await fetch(`https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}`, { headers: { Authorization: auth } })
      const qd = await q.json().catch(() => ({}))
      if (q.ok && qd?.status === 'DONE') return res.status(200).json({ ok: true, payment: publicPayment(qd), already: true })
    }

    return res.status(402).json({
      ok: false,
      error: s(d?.code, 80) || 'confirm_failed',
      message: s(d?.message, 300) || '결제 승인에 실패했습니다.',
    })
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'confirm_unreachable', message: '결제 승인 서버에 연결하지 못했습니다.' })
  }
}
