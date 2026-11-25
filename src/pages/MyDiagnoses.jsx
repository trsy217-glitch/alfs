import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listResults, emailOk, emailSession, useDiagEmail } from '../lib/store.js'
import { categoryById } from '../diagnosis/questions.js'

export default function MyDiagnoses() {
  const sessionEmail = useDiagEmail()
  const [input, setInput] = useState(sessionEmail)
  const [err, setErr] = useState('')
  const list = useMemo(() => (sessionEmail ? listResults(sessionEmail).data : []), [sessionEmail])

  const open = (e) => {
    e.preventDefault()
    if (!emailOk(input)) { setErr('이메일 주소를 정확히 입력해 주세요.'); return }
    setErr('')
    emailSession.set(input)
  }

  // 이메일을 아직 입력하지 않았으면 먼저 이메일을 받습니다.
  if (!sessionEmail) {
    return (
      <section className="section">
        <div className="wrap" style={{ maxWidth: 640 }}>
          <div className="panel">
            <span className="kicker">무료 가게 진단</span>
            <h1 style={{ fontSize: 'var(--t-2xl)', marginBottom: 10 }}>이메일을 입력하면 내 진단 기록을 볼 수 있어요</h1>
            <p className="muted">진단할 때 입력한 이메일 주소를 적어 주세요. 이 브라우저에 저장된 진단 기록을 보여 드립니다.</p>
            <form className="form mt-m" onSubmit={open} noValidate>
              <div className="field">
                <label htmlFor="my-email">이메일 주소</label>
                <input
                  id="my-email"
                  type="email"
                  value={input}
                  onChange={(e) => { setInput(e.target.value); setErr('') }}
                  placeholder="name@example.com"
                  autoComplete="email"
                  inputMode="email"
                  aria-invalid={!!err}
                />
                {err && <p className="err" role="alert">{err}</p>}
              </div>
              <div className="btn-row">
                <button type="submit" className="btn btn--primary">내 진단 기록 보기</button>
                <Link to="/diagnosis/new" className="btn btn--ghost">새로 진단하기</Link>
              </div>
            </form>
            <p className="muted mt-m" style={{ fontSize: '0.85rem' }}>진단 기록은 이 브라우저에 저장됩니다. 다른 기기에서는 그 기기에서 진단한 기록만 보입니다.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="wrap my">
        <div className="my__head">
          <div>
            <h1 style={{ fontSize: 'var(--t-2xl)' }}>내 진단 기록</h1>
            <p className="muted mt-s">{sessionEmail} · 이 브라우저에 저장된 진단 기록입니다.</p>
          </div>
          <div className="btn-row">
            <Link to="/diagnosis/new" className="btn btn--primary">새로 진단하기</Link>
            <button className="btn btn--ghost" onClick={() => { emailSession.clear(); setInput('') }}>이메일 변경</button>
          </div>
        </div>

        {list.length === 0 && (
          <div className="empty">
            <h2>아직 진단 기록이 없어요</h2>
            <p className="muted">첫 진단은 10분 안팎이면 끝납니다. 결과는 여기에 차곡차곡 쌓여요.</p>
            <Link to="/diagnosis/new" className="btn btn--primary mt-m">첫 진단 시작하기</Link>
          </div>
        )}
        {list.length > 0 && (
          <ul className="my__list">
            {list.map((d, i) => {
              const prev = list[i + 1]?.total
              const diff = prev != null ? Number(d.total) - Number(prev) : null
              return (
                <li key={d.id}>
                  <Link to={`/diagnosis/result/${d.id}`}>
                    <span className="my__date">{new Date(d.created_at).toLocaleDateString('ko-KR')}</span>
                    <span className="my__name"><b>{d.shop_name || '우리 가게'}</b><span>{categoryById(d.category)?.name}</span></span>
                    <span className="my__score">
                      <b>{d.total}점</b>
                      <span>{d.grade}</span>
                      {diff != null && <em className={diff >= 0 ? 'up' : 'down'}>{diff >= 0 ? '+' : ''}{diff}</em>}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
