import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, isDemoMode } from './supabase.js'
import { ls } from './safeStorage.js'
import { authProviders } from '../config/site.js'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const DEMO_USERS = 'alfs_demo_users'
const DEMO_SESSION = 'alfs_demo_session'

async function hash(text) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return btoa(unescape(encodeURIComponent(text)))
  }
}

// Supabase 오류 메시지를 사용자가 이해할 수 있는 말로 바꿉니다.
function friendly(error) {
  const m = (error?.message || '').toLowerCase()
  if (m.includes('invalid login')) return '이메일 또는 비밀번호가 맞지 않습니다. 다시 확인해 주세요.'
  if (m.includes('already registered') || m.includes('already been registered')) return '이미 가입된 이메일입니다. 로그인해 주세요.'
  if (m.includes('email not confirmed')) return '가입 확인 메일의 링크를 먼저 눌러 주세요.'
  if (m.includes('password')) return '비밀번호는 8자 이상으로 입력해 주세요.'
  if (m.includes('rate limit')) return '요청이 많습니다. 잠시 후 다시 시도해 주세요.'
  return error?.message || '처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      setUser(ls.get(DEMO_SESSION))
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(mapUser(data.session?.user))
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(mapUser(session?.user)))
    return () => sub.subscription.unsubscribe()
  }, [])

  const api = useMemo(() => ({
    user,
    loading,
    demo: isDemoMode,
    providers: isDemoMode ? {} : authProviders,

    async signUp({ email, password, name }) {
      if (isDemoMode) {
        const users = ls.get(DEMO_USERS, {})
        const key = email.trim().toLowerCase()
        if (users[key]) return { error: '이미 가입된 이메일입니다. 로그인해 주세요.' }
        const id = `demo-${Date.now().toString(36)}`
        users[key] = { id, name, pass: await hash(password) }
        ls.set(DEMO_USERS, users)
        const u = { id, email: key, name }
        ls.set(DEMO_SESSION, u); setUser(u)
        return { ok: true }
      }
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: { name }, emailRedirectTo: window.location.origin + '/diagnosis/new' },
      })
      if (error) return { error: friendly(error) }
      if (!data.session) return { needConfirm: true }
      return { ok: true }
    },

    async signIn({ email, password }) {
      if (isDemoMode) {
        const users = ls.get(DEMO_USERS, {})
        const key = email.trim().toLowerCase()
        const u = users[key]
        if (!u || u.pass !== (await hash(password))) return { error: '이메일 또는 비밀번호가 맞지 않습니다. 다시 확인해 주세요.' }
        const s = { id: u.id, email: key, name: u.name }
        ls.set(DEMO_SESSION, s); setUser(s)
        return { ok: true }
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return error ? { error: friendly(error) } : { ok: true }
    },

    async signInWithKakao(redirectPath = '/diagnosis/new') {
      if (isDemoMode) return { error: '체험 모드에서는 카카오 로그인을 쓸 수 없습니다.' }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao', options: { redirectTo: window.location.origin + redirectPath },
      })
      return error ? { error: friendly(error) } : { ok: true }
    },

    async resetPassword(email) {
      if (isDemoMode) return { error: '체험 모드에서는 비밀번호 재설정 메일을 보낼 수 없습니다.' }
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/login' })
      return error ? { error: friendly(error) } : { ok: true }
    },

    async signOut() {
      if (isDemoMode) { ls.remove(DEMO_SESSION); setUser(null); return }
      await supabase.auth.signOut()
    },
  }), [user, loading])

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

function mapUser(u) {
  if (!u) return null
  return { id: u.id, email: u.email, name: u.user_metadata?.name || u.user_metadata?.full_name || u.email?.split('@')[0] }
}
