import { useState } from 'react'

// 알프스 카카오톡 채널 1:1 채팅 (채널 홈이 아니라 바로 대화창)
const KAKAO_CHAT = 'https://pf.kakao.com/_JdTPX/chat'

const KINDS = ['대리점', '총판', '샵인샵', '기타']

const empty = () => ({ kind: '대리점', name: '', phone: '', region: '', message: '', agree: false, company: '' })

const summaryOf = (v) =>
  [
    '[알프스 대리점·총판 입점 상담]',
    `구분: ${v.kind}`,
    `성함/상호: ${v.name}`,
    `연락처: ${v.phone}`,
    `지역/업종: ${v.region || '-'}`,
    `문의 내용: ${v.message || '-'}`,
  ].join('\n')

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch { /* 아래 예비 방법 */ }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.top = '-1000px'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch { return false }
}

/**
 * 대리점·총판 입점 상담 창
 * - 입력 내용은 /api/partner-sheet 를 거쳐 알프스 구글 시트('대리점·총판 상담 접수')에 한 줄로 쌓입니다.
 * - 접수되면 화면에서 바로 '내용 복사' + '알프스 카카오톡 채널 1:1 채팅' 으로 이어집니다.
 */
export default function DistForm() {
  const [v, setV] = useState(empty)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | local
  const [copied, setCopied] = useState(false)

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setV((s) => ({ ...s, [k]: val }))
  }

  const validate = () => {
    const e = {}
    if (!v.name.trim()) e.name = '성함 또는 상호를 입력해 주세요.'
    if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(v.phone.replace(/\s/g, ''))) e.phone = '연락 가능한 번호를 010-0000-0000 형식으로 입력해 주세요.'
    if (!v.agree) e.agree = '상담 답변을 드리려면 개인정보 수집·이용 동의가 필요합니다.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate() || status === 'sending') return
    setStatus('sending')
    try {
      const r = await fetch('/api/partner-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, page: window.location.href }),
      })
      const data = await r.json().catch(() => ({}))
      setStatus(r.ok && data.ok ? 'sent' : 'local')
    } catch {
      // 전송이 막혀도 상담을 놓치지 않도록 복사 + 카카오톡 안내로 넘어갑니다.
      setStatus('local')
    }
  }

  const doCopy = async () => setCopied(await copyText(summaryOf(v)))

  const goKakao = async () => {
    await copyText(summaryOf(v))
    setCopied(true)
  }

  const again = () => { setV(empty()); setErrors({}); setCopied(false); setStatus('idle') }

  if (status === 'sent' || status === 'local') {
    const sent = status === 'sent'
    return (
      <div className="form-done" role="status">
        <h3>{sent ? '상담 신청이 접수되었습니다' : '작성하신 내용을 담당자에게 보내 주세요'}</h3>
        <p>
          {sent
            ? `${v.name}님, 담당자가 확인한 뒤 영업일 기준 하루 안에 ${v.phone}로 연락드립니다.`
            : '자동 접수가 지연되고 있습니다. 아래 카카오톡 채널로 들어가 붙여넣어 주시면 담당자가 바로 확인합니다.'}
        </p>

        <div className="btn-row mt-m">
          <button type="button" className="btn btn--primary" onClick={doCopy}>입력한 내용 복사</button>
          <a
            className="btn btn--kakao"
            href={KAKAO_CHAT}
            target="_blank"
            rel="noreferrer"
            onClick={goKakao}
          >
            알프스 카카오톡 채널로 바로 상담하기
          </a>
        </div>
        {copied && (
          <p className="mt-s" style={{ fontSize: '0.85rem' }}>
            내용을 복사했어요. 카카오톡 채널 대화창에 붙여넣기(Ctrl+V)해 주시면 담당자가 바로 확인합니다.
          </p>
        )}

        <details style={{ marginTop: 18 }}>
          <summary style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700 }}>보낸 내용 보기</summary>
          <p className="muted" style={{ whiteSpace: 'pre-line', marginTop: 8, fontSize: '0.9rem' }}>{summaryOf(v)}</p>
        </details>

        <button type="button" className="btn btn--ghost mt-m" style={{ minHeight: 40, fontSize: '0.9rem' }} onClick={again}>
          새 문의 작성하기
        </button>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="field">
        <label id="kind-l">관심 구분</label>
        <div className="chips" role="radiogroup" aria-labelledby="kind-l">
          {KINDS.map((k) => (
            <label key={k}>
              <input type="radio" name="kind" value={k} checked={v.kind === k} onChange={set('kind')} />
              <span>{k}</span>
            </label>
          ))}
        </div>
        <p className="hint">대리점·총판은 지역 단위 공급, 샵인샵은 매장 안 판매 공간 입점입니다.</p>
      </div>

      <div className="two">
        <div className="field">
          <label htmlFor="d-name">성함 / 상호</label>
          <input id="d-name" value={v.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} placeholder="예: 홍길동 / OO건강샵" />
          {errors.name && <p className="err">{errors.name}</p>}
        </div>
        <div className="field">
          <label htmlFor="d-phone">연락처</label>
          <input id="d-phone" value={v.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" aria-invalid={!!errors.phone} />
          {errors.phone && <p className="err">{errors.phone}</p>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="d-region">지역 / 업종 (선택)</label>
        <input id="d-region" value={v.region} onChange={set('region')} placeholder="예: 서울 마포구 · 건강식품샵 / 온라인 판매" />
      </div>

      <div className="field">
        <label htmlFor="d-msg">문의 내용</label>
        <textarea
          id="d-msg"
          value={v.message}
          onChange={set('message')}
          placeholder="지금 하고 계신 일, 판매하려는 지역이나 채널, 궁금한 점(공급 조건·교육·지원)을 적어 주시면 상담이 빠릅니다."
        />
      </div>

      {/* 사람이 보지 않는 칸(자동 입력 차단용) */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="d-company">회사</label>
        <input id="d-company" name="company" tabIndex={-1} autoComplete="off" value={v.company} onChange={set('company')} />
      </div>

      <label className="consent">
        <input type="checkbox" checked={v.agree} onChange={set('agree')} />
        <span>상담 답변을 위해 성함·연락처·상담 내용을 수집하며, 상담 완료 후 1년간 보관 뒤 파기하는 데 동의합니다. (필수)</span>
      </label>
      {errors.agree && <p className="err" style={{ marginTop: -8 }}>{errors.agree}</p>}

      <div>
        <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>
          {status === 'sending' ? '접수하는 중…' : '대리점·총판 상담 신청하기'}
        </button>
      </div>
      <p className="hint">접수 즉시 담당자 시트로 전달되고, 접수 화면에서 카카오톡 채널로도 바로 이어갈 수 있습니다.</p>
    </form>
  )
}
