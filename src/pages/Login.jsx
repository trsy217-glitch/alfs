import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, inAppBrowser, openInExternalBrowser } from '../lib/auth.jsx'

// 로그인·회원가입 = Google 계정으로 시작하기 (Firebase Authentication)
export default function Login() {
  const auth = useAuth()
  const nav = useNavigate()
  const { state } = useLocation()
  const to = state?.from || '/diagnosis/new'
  const [agree, setAgree] = useState(false)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const inApp = inAppBrowser()

  useEffect(() => { if (auth.user) nav(to, { replace: true }) }, [auth.user, nav, to])
  useEffect(() => { if (auth.error) setMsg(auth.error) }, [auth.error])

  const start = async () => {
    setMsg('')
    if (!agree) return setMsg('진단 결과 저장을 위한 개인정보 수집·이용에 동의해 주세요.')
    setBusy(true)
    const r = await auth.signInWithGoogle()
    setBusy(false)
    if (r.error) setMsg(r.error)
  }

  return (
    <section className="section auth-page">
      <div className="wrap auth-grid">
        <div className="intro">
          <span className="kicker">우리가게 진단</span>
          <h1 className="auth-title">Google 계정으로 시작하면 진단 결과가 내 계정에만 저장됩니다</h1>
          <ul className="auth-points">
            <li>따로 가입할 필요 없이 Google 계정으로 바로 시작해요. 처음 로그인이 곧 회원가입입니다.</li>
            <li>가입과 진단은 모두 무료예요.</li>
            <li>결과는 진단한 본인만 볼 수 있어요. 알프스 직원도 따로 열람하지 않습니다.</li>
            <li>지난 진단과 비교하고 PDF로 내려받을 수 있어요.</li>
          </ul>
          <p className="muted mt-m">진단 없이 둘러보시려면 <Link to="/diagnosis">진단 소개</Link>로 가세요.</p>
        </div>

        <div className="panel">
          <h2 className="auth-h2">로그인 · 회원가입</h2>

          {auth.demo && (
            <p className="demo-note">지금은 <b>체험 모드</b>입니다. 진단 결과가 이 브라우저에만 저장돼요. Firebase를 연결하면 Google 계정으로 로그인하고 서버에 안전하게 저장됩니다.</p>
          )}

          {inApp ? (
            <div className="inapp">
              <p><b>{inApp === 'kakao' ? '카카오톡' : '앱'} 안의 브라우저에서는 Google 로그인이 막혀 있어요.</b> 크롬·사파리 같은 기본 브라우저에서 열어 주세요.</p>
              {inApp === 'kakao'
                ? <button type="button" className="btn btn--primary" onClick={openInExternalBrowser}>기본 브라우저로 열기</button>
                : <p className="hint">화면 오른쪽 위(또는 아래) 메뉴 → '다른 브라우저로 열기'를 눌러 주세요.</p>}
            </div>
          ) : (
            <>
              <label className="consent">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <span>진단 결과 저장을 위해 Google 계정의 이메일·이름과 진단 응답을 수집하며, 탈퇴 또는 삭제 요청 시 바로 파기하는 데 동의합니다. (필수)</span>
              </label>
              {msg && <p className="err" role="alert">{msg}</p>}
              <button type="button" className="btn btn--google" onClick={start} disabled={busy || auth.loading}>
                <svg viewBox="0 0 48 48" aria-hidden="true" width="20" height="20">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
                </svg>
                {busy ? '로그인하는 중…' : auth.demo ? '체험 모드로 시작하기' : 'Google 계정으로 시작하기'}
              </button>
              <p className="hint auth-hint">로그인 창이 뜨지 않으면 브라우저의 팝업 차단을 풀어 주세요.</p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
