import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'

// 로그인한 사람만 들어올 수 있는 화면을 감쌉니다. 로그인 후 원래 가려던 곳으로 돌아옵니다.
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <section className="section"><div className="wrap"><p className="muted">로그인 상태를 확인하는 중…</p></div></section>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}
