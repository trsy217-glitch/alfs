import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { emailOk, emailSession } from '../lib/store.js'

// 로그인 = 진단할 때 적은 이메일 주소를 입력하는 것. 결과를 열 때도 같은 이메일을 씁니다.
export default function Login() {
  const nav = useNavigate()
  const { state } = useLocation()
  const to = state?.from || '/my'
  const [email, setEmail] = useState(emailSession.get())
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!emailOk(email)) { setErr('이메일 주소를 정확히 입력해 주세요. 예: name@example.com'); return }
    emailSession.set(email)
    nav(to, { replace: true })
  }

  return (
    <section className="section auth-page">
      <div className="wrap auth-grid">
        <div className="intro">
          <span className="kicker">우리가게 진단</span>
          <h1 className="auth-title">이메일 주소 하나로 진단 결과를 보고, 지난 기록도 이어서 봅니다</h1>
          <ul className="auth-points">
            <li>가입 없이 이메일 주소만 입력하면 됩니다.</li>
            <li>진단은 무료이고, 결과는 이메일을 입력해야 열립니다.</li>
            <li>이름·전화번호는 받지 않고, 이메일 주소와 진단 결과만 저장합니다.</li>
            <li>같은 이메일로 다시 진단하면 지난 결과와 점수 변화를 비교할 수 있습니다.</li>
          </ul>
          <p className="muted mt-m">아직 진단 전이라면 <Link to="/diagnosis">가게 진단 소개</Link>로 가세요.</p>
        </div>

        <div className="panel">
          <h2 className="auth-h2">이메일 로그인</h2>
          <form className="form" onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="login-email">이메일 주소</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErr('') }}
                placeholder="name@example.com"
                autoComplete="email"
                inputMode="email"
                aria-invalid={!!err}
              />
              {err && <p className="err" role="alert">{err}</p>}
            </div>
            <div className="btn-row">
              <button type="submit" className="btn btn--primary">내 진단 기록 보기</button>
              <Link to="/diagnosis/new" className="btn btn--ghost">무료 진단 시작하기</Link>
            </div>
          </form>
          <p className="hint auth-hint">진단 기록은 이 브라우저에 저장됩니다. 브라우저 기록을 지우면 결과도 사라집니다.</p>
        </div>
      </div>
    </section>
  )
}
