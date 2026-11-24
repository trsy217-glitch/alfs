import { useCallback, useEffect, useMemo, useState } from 'react'
import { STOCK_API, STOCK_TOKEN, STOCK_PIN } from '../config/stock.js'
import '../styles/stock.css'

/* ─────────────────────────────────────────────────────────────
   알프스 재고관리 — 독립 모바일 웹앱 (alfs.kr/stock)
   · 데이터: Google Apps Script JSON API (토큰 검증) → 기존 구글 시트
   · 화면: 공개 사이트 헤더·푸터 없이 앱 화면만 (App.jsx 에서 분리)
   ───────────────────────────────────────────────────────────── */

const OPEN_KEY = 'alfs_stock_open'
const WHO_KEY = 'alfs_stock_who'

const won = (v) => (Math.round(Number(v) || 0)).toLocaleString('ko-KR') + '원'
const num = (v) => {
  const n = Number(String(v == null ? '' : v).replace(/[^0-9.-]/g, ''))
  return isNaN(n) ? 0 : n
}
const pad2 = (x) => String(x).padStart(2, '0')
const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

// 구분별 입금여부 버튼 이름과 시트에 적는 값
const MODES = {
  out: {
    label: '📤 출고',
    pay: ['입금완료', '미입금', '일부입금'],
    defPay: '미입금',
    client: '고객명 · 거래처',
  },
  in: {
    label: '📥 입고',
    pay: ['결제완료', '미결제', '부분결제'],
    defPay: '결제완료',
    client: '공급처',
  },
  ret: {
    label: '↩️ 반송',
    pay: ['환불완료', '미환불', '일부환불'],
    defPay: '환불완료',
    client: '고객명 · 거래처',
  },
}
const KINDS = ['판매', '대리점', '위탁', '샘플']

// 화면에 보이는 이름 → 시트 입금상태 열에 들어가는 값(시트 데이터 확인 규칙에 맞춤)
function statusCode(mode, label) {
  if (label === '환불완료') return '입금완료'
  if (label === '미환불') return '미입금'
  if (label === '일부환불') return '일부입금'
  return label
}
function paidValue(mode, label, total, typed) {
  if (label === '입금완료' || label === '결제완료' || label === '환불완료') {
    return mode === 'ret' ? -total : total
  }
  if (label === '일부입금' || label === '부분결제' || label === '일부환불') {
    const p = Math.abs(num(typed))
    return mode === 'ret' ? -p : p
  }
  return 0
}

async function apiGet(action) {
  const url = `${STOCK_API}?action=${action}&token=${encodeURIComponent(STOCK_TOKEN)}&t=${Date.now()}`
  const res = await fetch(url, { redirect: 'follow', cache: 'no-store' })
  const text = await res.text()
  let data = null
  try { data = JSON.parse(text) } catch (e) { data = null }
  if (!data) throw new Error('서버 응답을 읽지 못했습니다. 잠시 뒤 새로고침해 주세요.')
  return data
}

async function apiPost(action, payload) {
  const res = await fetch(STOCK_API, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ token: STOCK_TOKEN, action, data: payload }),
    redirect: 'follow',
  })
  const text = await res.text()
  let data = null
  try { data = JSON.parse(text) } catch (e) { data = null }
  if (!data) throw new Error('저장 결과를 확인하지 못했습니다. 시트를 한 번 확인해 주세요.')
  return data
}

/* ── 화면 ─────────────────────────────────────────────────── */
export default function StockApp() {
  const [unlocked, setUnlocked] = useState(false)
  const [tab, setTab] = useState('record')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const say = useCallback((msg, bad) => {
    setToast({ msg, bad })
    window.clearTimeout(say._t)
    say._t = window.setTimeout(() => setToast(null), 3200)
  }, [])

  useEffect(() => {
    try { if (localStorage.getItem(OPEN_KEY) === STOCK_PIN) setUnlocked(true) } catch (e) { /* 저장소 없음 */ }
  }, [])

  useEffect(() => {
    document.title = '알프스 재고관리'
    const meta = (name, content) => {
      let el = document.head.querySelector(`meta[name="${name}"]`)
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el) }
      el.setAttribute('content', content)
    }
    meta('robots', 'noindex, nofollow')
    meta('theme-color', '#2f5d4a')
    let link = document.head.querySelector('link[rel="manifest"]')
    if (!link) { link = document.createElement('link'); link.rel = 'manifest'; document.head.appendChild(link) }
    link.href = '/stock-manifest.json'
    let icon = document.head.querySelector('link[rel="apple-touch-icon"]')
    if (!icon) { icon = document.createElement('link'); icon.rel = 'apple-touch-icon'; document.head.appendChild(icon) }
    icon.href = '/stock-icon-192.png'
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/stock-sw.js', { scope: '/stock' }).catch(() => {})
    }
  }, [])

  const load = useCallback(async (silent) => {
    if (!silent) setLoading(true)
    try {
      const d = await apiGet('bootstrap')
      if (!d || !d.ok) throw new Error((d && (d.msg || d.error)) || '데이터를 불러오지 못했습니다.')
      setData(d)
    } catch (e) {
      say(e.message || '데이터를 불러오지 못했습니다.', true)
    } finally {
      setLoading(false)
    }
  }, [say])

  useEffect(() => { if (unlocked) load() }, [unlocked, load])

  const lock = () => {
    try { localStorage.removeItem(OPEN_KEY) } catch (e) { /* 저장소 없음 */ }
    setUnlocked(false)
    setData(null)
  }

  if (!unlocked) return <PinGate onOpen={() => setUnlocked(true)} />

  return (
    <div className="stk">
      <header className="stk-top">
        <div>
          <div className="stk-top__t">알프스 재고관리</div>
          <div className="stk-top__s">{data ? `시트 연결됨 · ${data.serverTime}` : '불러오는 중…'}</div>
        </div>
        <div className="stk-top__btn">
          <button type="button" onClick={() => load()} aria-label="새로고침">⟳</button>
          <button type="button" onClick={lock} aria-label="잠금">🔒</button>
        </div>
      </header>

      {toast && <div className={'stk-toast' + (toast.bad ? ' bad' : '')}>{toast.msg}</div>}

      <div className="stk-body">
        {!data && loading && <div className="stk-loading">시트에서 재고를 불러오는 중입니다…</div>}
        {!data && !loading && (
          <div className="stk-sec">
            <div className="stk-h">연결을 확인해 주세요</div>
            <p style={{ fontSize: 16, color: '#5b6f65' }}>인터넷 연결을 확인하고 아래 버튼을 눌러 주세요.</p>
            <button type="button" className="stk-save" onClick={() => load()}>다시 불러오기</button>
          </div>
        )}
        {data && tab === 'record' && (
          <RecordForm data={data} say={say} onSaved={() => load(true)} />
        )}
        {data && tab === 'board' && <Board data={data} />}
        {data && tab === 'manage' && (
          <MasterTab data={data} say={say} onChanged={() => load(true)} />
        )}
      </div>

      <nav className="stk-tabbar">
        <button type="button" className={'stk-tab' + (tab === 'record' ? ' on' : '')} onClick={() => setTab('record')}>
          <i>✍️</i>빠른 기록
        </button>
        <button type="button" className={'stk-tab' + (tab === 'board' ? ' on' : '')} onClick={() => setTab('board')}>
          <i>📊</i>재고·정산
        </button>
        <button type="button" className={'stk-tab' + (tab === 'manage' ? ' on' : '')} onClick={() => setTab('manage')}>
          <i>⚙️</i>품목관리
        </button>
      </nav>
    </div>
  )
}

/* ── 잠금(팀 코드) ─────────────────────────────────────────── */
function PinGate({ onOpen }) {
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')

  const press = (d) => {
    setErr('')
    setPin((p) => (p.length >= 4 ? p : p + d))
  }
  const del = () => setPin((p) => p.slice(0, -1))
  const go = () => {
    if (pin === STOCK_PIN) {
      try { localStorage.setItem(OPEN_KEY, STOCK_PIN) } catch (e) { /* 저장소 없음 */ }
      onOpen()
    } else {
      setErr('팀 코드가 맞지 않습니다. 다시 입력해 주세요.')
      setPin('')
    }
  }

  return (
    <div className="stk">
      <div className="stk-lock">
        <h1>알프스 재고관리</h1>
        <p>팀 코드 4자리를 입력하세요. 이 휴대폰에서는 한 번만 입력하면 됩니다.</p>
        <div className="stk-lock__dots">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} className={pin.length > i ? 'on' : ''} />
          ))}
        </div>
        <div className="stk-lock__err">{err}</div>
        <div className="stk-lock__pad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} type="button" onClick={() => press(d)}>{d}</button>
          ))}
          <button type="button" className="act" onClick={del}>지우기</button>
          <button type="button" onClick={() => press('0')}>0</button>
          <button type="button" className="act" onClick={go}>열기</button>
        </div>
      </div>
    </div>
  )
}

/* ── 빠른 기록 ─────────────────────────────────────────────── */
function RecordForm({ data, say, onSaved }) {
  const items = data.items || []
  const cats = data.cats || []
  const [mode, setMode] = useState('out')
  const [kind, setKind] = useState('판매')
  const [cat, setCat] = useState('')
  const [name, setName] = useState('')
  const [qty, setQty] = useState(1)
  const [price, setPrice] = useState(0)
  const [date, setDate] = useState(todayStr())
  const [who, setWho] = useState('')
  const [client, setClient] = useState('')
  const [pay, setPay] = useState(MODES.out.defPay)
  const [paid, setPaid] = useState('')
  const [memo, setMemo] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    try { setWho(localStorage.getItem(WHO_KEY) || '') } catch (e) { /* 저장소 없음 */ }
  }, [])

  // 카테고리는 데이터에서 자동 (미네랄 · 클린바יום …)
  useEffect(() => {
    if (cat && cats.indexOf(cat) >= 0) return
    if (cats.length) setCat(cats[0])
  }, [cats, cat])

  const stockQty = useMemo(() => {
    const map = {}
    ;(data.stock || []).forEach((s) => { map[s.name] = num(s.qty) })
    return map
  }, [data])
  const shown = useMemo(() => items.filter((it) => !cat || it.cat === cat), [items, cat])
  const selected = useMemo(() => items.find((it) => it.name === name) || null, [items, name])
  const total = Math.max(0, qty) * num(price)

  const pickMode = (m) => {
    setMode(m)
    setPay(MODES[m].defPay)
    setPaid('')
  }

  const pickItem = (it) => {
    setName(it.name)
    setCat(it.cat)
    setPrice(num(it.sell))
  }

  const partial = pay === '일부입금' || pay === '부분결제' || pay === '일부환불'

  const save = async () => {
    if (busy) return
    if (!name) { say('제품을 먼저 골라 주세요.', true); return }
    if (qty < 1) { say('수량을 1 이상으로 해 주세요.', true); return }
    setBusy(true)
    try {
      const base = {
        date: date || todayStr(),
        cat: selected ? selected.cat : cat,
        name,
        qty: Math.round(qty),
        price: num(price),
        who,
        memo,
      }
      let r
      if (mode === 'in') {
        r = await apiPost('recordIn', {
          ...base,
          vendor: client,
          status: statusCode(mode, pay),
          payDate: pay === '결제완료' ? base.date : '',
          method: '',
        })
      } else {
        r = await apiPost('recordOut', {
          ...base,
          kind: mode === 'ret' ? '반품' : kind,
          client,
          status: statusCode(mode, pay),
          paid: paidValue(mode, pay, total, paid),
          payDate: '',
          method: '',
        })
      }
      if (!r || !r.ok) throw new Error((r && (r.msg || r.error)) || '저장하지 못했습니다.')
      const sign = mode === 'ret' ? '−' : ''
      say(`✅ 저장됨 · ${name} ${qty}개 · ${sign}${won(total)} (${r.row}행)`)
      setQty(1)
      setClient('')
      setMemo('')
      setPaid('')
      try { localStorage.setItem(WHO_KEY, who) } catch (e) { /* 저장소 없음 */ }
      onSaved()
    } catch (e) {
      say(e.message || '저장하지 못했습니다.', true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {/* ① 구분 */}
      <section className="stk-sec">
        <div className="stk-h">구분 <em>1탭</em></div>
        <div className="grid3">
          {Object.keys(MODES).map((m) => (
            <button key={m} type="button" className={'stk-btn' + (mode === m ? ' on' : '')} onClick={() => pickMode(m)}>
              {MODES[m].label}
            </button>
          ))}
        </div>
        {mode === 'out' && (
          <div className="wrap" style={{ marginTop: 10 }}>
            {KINDS.map((k) => (
              <button key={k} type="button" className={'stk-chip' + (kind === k ? ' on' : '')} onClick={() => setKind(k)}>
                {k}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ② 제품 */}
      <section className="stk-sec">
        <div className="stk-h">제품 <em>카테고리 → 제품</em></div>
        <div className="wrap" style={{ marginBottom: 10 }}>
          {cats.map((c) => (
            <button key={c} type="button" className={'stk-chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="stack-sm">
          {shown.map((it) => (
            <button
              key={it.row}
              type="button"
              className={'stk-prod' + (name === it.name ? ' on' : '')}
              onClick={() => pickItem(it)}
            >
              <span>
                <b>{it.name}</b>
                <small>{it.spec || it.code}</small>
              </span>
              <span className="stk-prod__p">
                {won(it.sell)}
                <span>재고 {(stockQty[it.name] || 0).toLocaleString('ko-KR')}개</span>
              </span>
            </button>
          ))}
          {!shown.length && <div className="stk-empty">품목이 없습니다. ⚙️ 품목관리에서 먼저 등록해 주세요.</div>}
        </div>
      </section>

      {/* ③ 수량·금액 */}
      <section className="stk-sec">
        <div className="stk-h">수량 · 금액</div>
        <div className="stk-step">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="수량 줄이기">−</button>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.round(num(e.target.value))))}
            aria-label="수량"
          />
          <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="수량 늘리기">+</button>
        </div>
        <div className="two" style={{ marginTop: 10 }}>
          <div className="stk-field">
            <label htmlFor="stk-price">{mode === 'in' ? '매입단가 (원)' : '판매단가 (원)'}</label>
            <input
              id="stk-price"
              type="number"
              inputMode="numeric"
              value={price || ''}
              onChange={(e) => setPrice(num(e.target.value))}
              placeholder="0"
            />
          </div>
          <div className="stk-field">
            <label htmlFor="stk-date">날짜</label>
            <input id="stk-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className="stk-amount">
          <span>총금액</span>
          <b className={mode === 'ret' ? 'ret' : ''}>{mode === 'ret' ? '−' : ''}{won(total)}</b>
        </div>
      </section>

      {/* ④ 고객 */}
      <section className="stk-sec">
        <div className="stk-h">{MODES[mode].client}</div>
        <div className="stack-sm">
          <div className="stk-field">
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder={mode === 'in' ? '예: 유디아미네랄' : '예: 김미영 (파트너샵)'}
              aria-label={MODES[mode].client}
            />
          </div>
          <div className="stk-field">
            <label htmlFor="stk-who">담당자</label>
            <input id="stk-who" type="text" value={who} onChange={(e) => setWho(e.target.value)} placeholder="예: 소영" />
          </div>
        </div>
      </section>

      {/* ⑤ 입금여부 */}
      <section className="stk-sec">
        <div className="stk-h">{mode === 'in' ? '결제여부' : mode === 'ret' ? '환불여부' : '입금여부'}</div>
        <div className="grid3">
          {MODES[mode].pay.map((p) => (
            <button key={p} type="button" className={'stk-btn' + (pay === p ? ' on' : '')} onClick={() => setPay(p)}>
              {p}
            </button>
          ))}
        </div>
        {partial && (
          <div className="stk-field" style={{ marginTop: 10 }}>
            <label htmlFor="stk-paid">{mode === 'in' ? '결제한 금액 (원)' : mode === 'ret' ? '환불한 금액 (원)' : '입금액 (원)'}</label>
            <input
              id="stk-paid"
              type="number"
              inputMode="numeric"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
              placeholder="0"
            />
          </div>
        )}
      </section>

      {/* ⑥ 메모 */}
      <section className="stk-sec">
        <div className="stk-h">기타 <em>메모 · 송장</em></div>
        <textarea
          rows="2"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="예: 송장 1234-5678 / 다음 주 재주문"
          aria-label="메모"
        />
      </section>

      {/* 저장 — 입력칸을 가리지 않고 폼 맨 아래에 그대로 */}
      <button type="button" className="stk-save" onClick={save} disabled={busy}>
        {busy ? '저장 중…' : '✅ 기록 저장'}
      </button>
    </>
  )
}

/* ── 재고·정산 ─────────────────────────────────────────────── */
function Board({ data }) {
  const s = data.summary || {}
  const stock = data.stock || []
  const logs = useMemo(() => {
    const list = []
    ;(data.recentOut || []).forEach((r) => list.push({ ...r, t: r.t === '반품' ? '반품' : '출고' }))
    ;(data.recentIn || []).forEach((r) => list.push({ ...r, t: '입고' }))
    list.sort((a, b) => (b.ts || 0) - (a.ts || 0))
    return list.slice(0, 10)
  }, [data])

  return (
    <>
      <section className="stk-sec" style={{ background: 'transparent', border: 0, padding: 0 }}>
        <div className="stk-sum">
          <div>
            <span>📦 현재고</span>
            <b>{num(s.stockQty).toLocaleString('ko-KR')}개</b>
            <small>{num(s.itemCount)}개 품목</small>
          </div>
          <div>
            <span>⚠️ 발주필요</span>
            <b className={num(s.lowCount) > 0 ? 'warn' : ''}>{num(s.lowCount)}건</b>
            <small>안전재고 이하</small>
          </div>
          <div>
            <span>💸 미수금</span>
            <b>{won(s.receivable)}</b>
            <small>매입 미결제 {won(s.purchaseUnpaid)}</small>
          </div>
          <div>
            <span>🧾 이번 달 출고</span>
            <b>{won(s.monthSales)}</b>
            <small>누적 매출 {won(s.totalSales)}</small>
          </div>
        </div>
      </section>

      <section className="stk-sec">
        <div className="stk-h">품목별 재고 <em>{stock.length}개</em></div>
        <div className="stack-sm">
          {stock.map((it) => (
            <div className="stk-item" key={it.cat + it.name}>
              <div className="stk-item__top">
                <b>{it.name}</b>
                {String(it.status || '').indexOf('발주') >= 0
                  ? <span className="stk-tag low">발주필요</span>
                  : <span className="stk-tag">{it.cat}</span>}
              </div>
              <div className="stk-item__row">
                <span>현재고 <b>{num(it.qty).toLocaleString('ko-KR')}</b></span>
                <span>안전 <b>{num(it.safety).toLocaleString('ko-KR')}</b></span>
                <span>출고매출 <b>{won(it.sales)}</b></span>
                <span>미수 <b>{won(it.due)}</b></span>
              </div>
            </div>
          ))}
          {!stock.length && <div className="stk-empty">아직 품목이 없습니다.</div>}
        </div>
      </section>

      <section className="stk-sec">
        <div className="stk-h">최근 기록 <em>10건</em></div>
        <div className="stk-log">
          {logs.map((r, i) => (
            <div className="stk-log__r" key={i}>
              <span className={'stk-log__t' + (r.t === '출고' ? ' out' : r.t === '반품' ? ' ret' : '')}>{r.t}</span>
              <span className="stk-log__b">
                <b>{r.name}</b>
                <small>{r.date} · {r.client || r.vendor || '-'} · {num(r.qty)}개</small>
              </span>
              <span className="stk-log__a">{won(r.amount)}</span>
            </div>
          ))}
          {!logs.length && <div className="stk-empty">아직 기록이 없습니다.</div>}
        </div>
      </section>
    </>
  )
}

/* ── 품목관리 (목록 · 수정 · 삭제 · 새 품목) ─────────────────── */

function MasterTab({ data, say, onChanged }) {
  const items = data.items || []
  const cats = data.cats || []
  const [mode, setMode] = useState('list') // list | edit | new
  const [editing, setEditing] = useState(null) // 수정 중인 품목
  const [confirm, setConfirm] = useState(null) // 삭제 확인 중인 품목
  const [busy, setBusy] = useState(false)

  const stockQty = useMemo(() => {
    const map = {}
    ;(data.stock || []).forEach((s) => { map[s.name] = num(s.qty) })
    return map
  }, [data])

  const toTop = () => {
    const body = document.querySelector('.stk-body')
    if (body) body.scrollTop = 0
  }

  const startEdit = (it) => { setEditing(it); setMode('edit'); toTop() }
  const startNew = () => { setMode('new'); toTop() }
  const backToList = () => { setMode('list'); setEditing(null); toTop() }

  const doDelete = async () => {
    if (!confirm || busy) return
    setBusy(true)
    try {
      const r = await apiPost('deleteMaster', { row: confirm.row, name: confirm.name })
      if (!r || !r.ok) throw new Error((r && (r.msg || r.error)) || '삭제하지 못했습니다.')
      say(`✅ ${r.msg}`)
      setConfirm(null)
      onChanged()
    } catch (e) {
      say(e.message || '삭제하지 못했습니다.', true)
    } finally {
      setBusy(false)
    }
  }

  if (mode === 'edit' && editing) {
    return (
      <MasterEditForm
        item={editing}
        cats={cats}
        say={say}
        onCancel={backToList}
        onSaved={() => { backToList(); onChanged() }}
      />
    )
  }

  if (mode === 'new') {
    return (
      <ItemForm
        cats={cats}
        say={say}
        onCancel={backToList}
        onSaved={() => { backToList(); onChanged() }}
      />
    )
  }

  return (
    <>
      <section className="stk-sec">
        <div className="stk-h">등록된 품목 <em>{items.length}개</em></div>
        <div className="stack-sm">
          {items.map((it) => (
            <div className="stk-mst" key={it.row}>
              <div className="stk-mst__top">
                <span className="stk-tag">{it.cat || '기타'}</span>
                <b>{it.name}</b>
              </div>
              <div className="stk-mst__row">
                <span>현재고 <b>{num(stockQty[it.name]).toLocaleString('ko-KR')}개</b></span>
                <span>안전 <b>{num(it.safety).toLocaleString('ko-KR')}</b></span>
              </div>
              <div className="stk-mst__row">
                <span>매입 <b>{won(it.buy)}</b></span>
                <span>판매 <b>{won(it.sell)}</b></span>
              </div>
              <div className="stk-mst__btns">
                <button type="button" className="stk-mini" onClick={() => startEdit(it)}>✏️ 수정</button>
                <button type="button" className="stk-mini del" onClick={() => setConfirm(it)}>🗑️ 삭제</button>
              </div>
            </div>
          ))}
          {!items.length && <div className="stk-empty">아직 등록된 품목이 없습니다. 아래 버튼으로 추가해 주세요.</div>}
        </div>
      </section>

      <button type="button" className="stk-save ghost" onClick={startNew}>➕ 새 품목 추가</button>

      {confirm && (
        <div className="stk-modal" role="dialog" aria-modal="true" aria-label="품목 삭제 확인">
          <div className="stk-modal__box">
            <div className="stk-modal__t">정말 삭제할까요?</div>
            <div className="stk-modal__n">{confirm.cat ? `${confirm.cat} · ` : ''}{confirm.name}</div>
            <p className="stk-modal__w">
              이 품목은 품목 목록·재고 현황·기록 화면에서 사라집니다. 이미 기록된 입출고 내역은 시트에 그대로 남고,
              되돌리려면 다시 등록해야 합니다.
            </p>
            <div className="stk-modal__btns">
              <button type="button" onClick={() => setConfirm(null)} disabled={busy}>취소</button>
              <button type="button" className="del" onClick={doDelete} disabled={busy}>
                {busy ? '삭제 중…' : '🗑️ 삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ── 품목 수정 폼 ─────────────────────────────────────────── */
function MasterEditForm({ item, cats, say, onCancel, onSaved }) {
  const fill = (v) => (num(v) ? String(num(v)) : '')
  const [cat, setCat] = useState(item.cat || '')
  const [name, setName] = useState(item.name || '')
  const [spec, setSpec] = useState(item.spec || '')
  const [base, setBase] = useState(fill(item.base))
  const [safety, setSafety] = useState(fill(item.safety))
  const [buy, setBuy] = useState(fill(item.buy))
  const [sell, setSell] = useState(fill(item.sell))
  const [memo, setMemo] = useState(item.memo || '')
  const [busy, setBusy] = useState(false)

  const save = async () => {
    if (busy) return
    if (!String(cat).trim()) { say('카테고리를 입력해 주세요.', true); return }
    if (!String(name).trim()) { say('품목명을 입력해 주세요.', true); return }
    setBusy(true)
    try {
      const r = await apiPost('updateMaster', {
        row: item.row,
        cat: String(cat).trim(),
        name: String(name).trim(),
        spec,
        base: num(base),
        safety: num(safety),
        buy: num(buy),
        sell: num(sell),
        memo,
      })
      if (!r || !r.ok) throw new Error((r && (r.msg || r.error)) || '수정하지 못했습니다.')
      say(`✅ ${r.msg}`)
      onSaved()
    } catch (e) {
      say(e.message || '수정하지 못했습니다.', true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <section className="stk-sec">
        <div className="stk-h">✏️ 품목 수정 <em>{item.row}행</em></div>
        <div className="stack-sm">
          <div className="stk-field">
            <label htmlFor="ed-cat">카테고리</label>
            <input id="ed-cat" type="text" value={cat} onChange={(e) => setCat(e.target.value)} placeholder="예: 미네랄" list="stk-cats-edit" />
            <datalist id="stk-cats-edit">{cats.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div className="stk-field">
            <label htmlFor="ed-name">품목명 *</label>
            <input id="ed-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 오륜미네랄 500ml" />
          </div>
          <div className="stk-field">
            <label htmlFor="ed-spec">규격 / 단위</label>
            <input id="ed-spec" type="text" value={spec} onChange={(e) => setSpec(e.target.value)} placeholder="예: 1병" />
          </div>
          <div className="two">
            <div className="stk-field">
              <label htmlFor="ed-base">기초재고</label>
              <input id="ed-base" type="number" inputMode="numeric" value={base} onChange={(e) => setBase(e.target.value)} placeholder="0" />
            </div>
            <div className="stk-field">
              <label htmlFor="ed-safety">안전재고</label>
              <input id="ed-safety" type="number" inputMode="numeric" value={safety} onChange={(e) => setSafety(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="two">
            <div className="stk-field">
              <label htmlFor="ed-buy">기본매입가 (원)</label>
              <input id="ed-buy" type="number" inputMode="numeric" value={buy} onChange={(e) => setBuy(e.target.value)} placeholder="0" />
            </div>
            <div className="stk-field">
              <label htmlFor="ed-sell">기본판매가 (원)</label>
              <input id="ed-sell" type="number" inputMode="numeric" value={sell} onChange={(e) => setSell(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="stk-field">
            <label htmlFor="ed-memo">비고</label>
            <input id="ed-memo" type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예: alfs.kr 판매가 396,000원" />
          </div>
          <div className="stk-note">품목명을 바꾸면 이미 기록된 입출고 내역은 예전 이름으로 남습니다(합계는 예전 이름 기준).</div>
        </div>
      </section>
      <button type="button" className="stk-save" onClick={save} disabled={busy}>
        {busy ? '저장 중…' : '✅ 수정 저장'}
      </button>
      <button type="button" className="stk-save ghost" onClick={onCancel} disabled={busy}>취소</button>
    </>
  )
}

/* ── 새 품목 추가 ─────────────────────────────────────────── */
function ItemForm({ cats, say, onCancel, onSaved }) {
  const [cat, setCat] = useState(cats[0] || '')
  const [name, setName] = useState('')
  const [spec, setSpec] = useState('')
  const [code, setCode] = useState('')
  const [base, setBase] = useState('')
  const [safety, setSafety] = useState('')
  const [buy, setBuy] = useState('')
  const [sell, setSell] = useState('')
  const [memo, setMemo] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (!cat && cats.length) setCat(cats[0]) }, [cats, cat])

  const save = async () => {
    if (busy) return
    if (!String(cat).trim()) { say('카테고리를 입력해 주세요.', true); return }
    if (!String(name).trim()) { say('품목명을 입력해 주세요.', true); return }
    setBusy(true)
    try {
      const r = await apiPost('addMaster', {
        cat: String(cat).trim(),
        name: String(name).trim(),
        spec, code,
        base: num(base), safety: num(safety), buy: num(buy), sell: num(sell),
        memo,
      })
      if (!r || !r.ok) throw new Error((r && (r.msg || r.error)) || '추가하지 못했습니다.')
      say(`✅ ${r.msg}`)
      setName(''); setSpec(''); setCode(''); setBase(''); setSafety(''); setBuy(''); setSell(''); setMemo('')
      onSaved()
    } catch (e) {
      say(e.message || '추가하지 못했습니다.', true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <section className="stk-sec">
        <div className="stk-h">➕ 새 품목 등록</div>
        <div className="stack-sm">
          <div className="stk-field">
            <label htmlFor="it-cat">카테고리</label>
            <input id="it-cat" type="text" value={cat} onChange={(e) => setCat(e.target.value)} placeholder="예: 미네랄" list="stk-cats" />
            <datalist id="stk-cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div className="stk-field">
            <label htmlFor="it-name">품목명 *</label>
            <input id="it-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 오륜미네랄 500ml" />
          </div>
          <div className="two">
            <div className="stk-field">
              <label htmlFor="it-spec">규격</label>
              <input id="it-spec" type="text" value={spec} onChange={(e) => setSpec(e.target.value)} placeholder="예: 1병" />
            </div>
            <div className="stk-field">
              <label htmlFor="it-code">품목코드</label>
              <input id="it-code" type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="예: ML-004" />
            </div>
          </div>
          <div className="two">
            <div className="stk-field">
              <label htmlFor="it-base">기초재고</label>
              <input id="it-base" type="number" inputMode="numeric" value={base} onChange={(e) => setBase(e.target.value)} placeholder="0" />
            </div>
            <div className="stk-field">
              <label htmlFor="it-safety">안전재고</label>
              <input id="it-safety" type="number" inputMode="numeric" value={safety} onChange={(e) => setSafety(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="two">
            <div className="stk-field">
              <label htmlFor="it-buy">매입가 (원)</label>
              <input id="it-buy" type="number" inputMode="numeric" value={buy} onChange={(e) => setBuy(e.target.value)} placeholder="0" />
            </div>
            <div className="stk-field">
              <label htmlFor="it-sell">판매가 (원)</label>
              <input id="it-sell" type="number" inputMode="numeric" value={sell} onChange={(e) => setSell(e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="stk-field">
            <label htmlFor="it-memo">메모</label>
            <input id="it-memo" type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예: 신규 입점 상품" />
          </div>
        </div>
      </section>
      <button type="button" className="stk-save" onClick={save} disabled={busy}>
        {busy ? '등록 중…' : '➕ 품목 등록'}
      </button>
      <button type="button" className="stk-save ghost" onClick={onCancel} disabled={busy}>취소</button>
    </>
  )
}
