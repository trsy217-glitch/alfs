import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

export default function Login() {
  const auth = useAuth()
  const nav = useNavigate()
  const { state } = useLocation()
  const to = state?.from || '/diagnosis/new'
  const [mode, setMode] = useState('signin') // signin | signup | reset
  const [v, setV] = useState({ email: '', password: '', name: '', agree: false })
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (auth.user) nav(to, { replace: true }) }, [auth.user, nav, to])

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    if (!/^\S+@\S+\.\S+$/.test(v.email)) return setMsg({ err: '이메일 주소를 확인해 주세요.' })
    if (mode !== 'reset' && v.password.length < 8) return setMsg({ err: '비밀번호는 8자 이상으로 입력해 주세요.' })
    if (mode === 'signup' && !v.name.trim()) return setMsg({ err: '이름(또는 닉네임)을 입력해 주세요.' })
    if (mode === 'signup' && !v.agree) return setMsg({ err: '진단 결과 저장을 위한 개인정보 수집·이용에 동의해 주세요.' })
    setBusy(true)
    const r = mode === 'signin' ? await auth.signIn(v)
      : mode === 'signup' ? await auth.signUp(v)
      : await auth.resetPassword(v.email)
    setBusy(false)
    if (r.error) return setMsg({ err: r.error })
    if (r.needConfirm) return setMsg({ ok: `${v.email}로 가입 확인 메일을 보냈어요. 메일의 링크를 누르면 바로 진단을 시작할 수 있습니다.` })
    if (mode === 'reset') return setMsg({ ok: '비밀번호 재설정 메일을 보냈어요. 메일함을 확인해 주세요.' })
  }

  const kakao = async () => {
    const r = await auth.signInWithKakao(to)
    if (r.error) setMsg({ err: r.error })
  }

  const title = mode === 'signin' ? '로그인' : mode === 'signup' ? '무료 회원가입' : '비밀번호 재설정'

  return (
    <section className="section auth-page">
      <div className="wrap auth-grid">
        <div className="intro">
          <span className="kicker">우리가게 진단</span>
          <h1 className="auth-title">로그인하면 진단 결과가 내 계정에만 저장됩니다</h1>
          <ul className="auth-points">
            <li>가입과 진단은 모두 무료예요.</li>
            <li>결과는 진단한 본인만 볼 수 있어요. 알프스 직원도 따로 열람하지 않습니다.</li>
            <li>지난 진단과 비교하고 PDF로 내려받을 수 있어요.</li>
          </ul>
          <p className="muted mt-m">진단 없이 둘러보시려면 <Link to="/diagnosis">진단 소개</Link>로 가세요.</p>
        </div>

        <div className="panel">
          {mode !== 'reset' && (
            <div className="tabs" role="tablist" aria-label="로그인 또는 회원가입">
              <button role="tab" aria-selected={mode === 'signin'} className={mode === 'signin' ? 'on' : ''} onClick={() => { setMode('signin'); setMsg(null) }}>로그인</button>
              <button role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'on' : ''} onClick={() => { setMode('signup'); setMsg(null) }}>회원가입</button>
            </div>
          )}
          <h2 className="sr-only">{title}</h2>
          {mode === 'reset' && <h2 style={{ fontSize: 'var(--t-xl)', marginBottom: 16 }}>비밀번호 재설정</h2>}

          {auth.demo && (
            <p className="demo-note">지금은 <b>체험 모드</b>입니다. 계정과 진단 결과가 이 브라우저에만 저장돼요. 실제 서비스는 Supabase를 연결하면 서버에 안전하게 저장됩니다.</p>
          )}

          <form className="form" onSubmit={submit} noValidate>
            {mode === 'signup' && (
              <div className="field">
                <label htmlFor="l-name">이름 또는 닉네임</label>
                <input id="l-name" value={v.name} onChange={set('name')} autoComplete="nickname" />
              </div>
            )}
            <div className="field">
              <label htmlFor="l-email">이메일</label>
              <input id="l-email" type="email" value={v.email} onChange={set('email')} autoComplete="email" inputMode="email" />
            </div>
            {mode !== 'reset' && (
              <div className="field">
                <label htmlFor="l-pass">비밀번호</label>
                <input id="l-pass" type="password" value={v.password} onChange={set('password')} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
                {mode === 'signup' && <p className="hint">8자 이상</p>}
              </div>
            )}
            {mode === 'signup' && (
              <label className="consent">
                <input type="checkbox" checked={v.agree} onChange={set('agree')} />
                <span>진단 결과 저장을 위해 이메일·이름·진단 응답을 수집하며, 탈퇴 또는 삭제 요청 시 바로 파기하는 데 동의합니다. (필수)</span>
              </label>
            )}
            {msg?.err && <p className="err" role="alert">{msg.err}</p>}
            {msg?.ok && <p className="ok" role="status">{msg.ok}</p>}
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? '처리하는 중…' : mode === 'signin' ? '로그인하고 진단하기' : mode === 'signup' ? '가입하고 진단 시작하기' : '재설정 메일 보내기'}
            </button>
          </form>

          {mode !== 'reset' && auth.providers.kakao && (
            <button className="btn btn--kakao auth-kakao" onClick={kakao}>카카오로 시작하기</button>
          )}

          <div className="auth-foot">
            {mode === 'signin' && !auth.demo && <button className="linkish" onClick={() => { setMode('reset'); setMsg(null) }}>비밀번호를 잊으셨나요?</button>}
            {mode === 'reset' && <button className="linkish" onClick={() => { setMode('signin'); setMsg(null) }}>로그인으로 돌아가기</button>}
          </div>
        </div>
      </div>
    </section>
  )
}
