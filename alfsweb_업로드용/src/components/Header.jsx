import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { MenuIcon, CloseIcon } from './Icons.jsx'
import { useConsult } from './consult.js'
import { useAuth } from '../lib/auth.jsx'

export const navItems = [
  { to: '/company', label: '회사 소개' },
  { to: '/distribution', label: '총판·유통' },
  { to: '/product', label: '오륜미네랄' },
  { to: '/ai-marketing', label: 'AI 마케팅' },
  { to: '/partner', label: '파트너 입점' },
  { to: '/diagnosis', label: '가게 진단' },
]

export default function Header() {
  const [menu, setMenu] = useState(false)
  const { pathname } = useLocation()
  const consult = useConsult()
  const { user, signOut } = useAuth()
  useEffect(() => setMenu(false), [pathname])
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : ''
  }, [menu])

  const t = menu ? 0 : -1
  return (
    <>
      <header className="header">
        <div className="wrap header__in">
          <Link to="/" className="logo" aria-label="알프스 홈">
            <span className="logo__en">ALFS</span>
            <span className="logo__ko">알프스</span>
          </Link>
          <nav className="nav" aria-label="주 메뉴">
            {navItems.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/diagnosis'}>{n.label}</NavLink>
            ))}
          </nav>
          <div className="header__actions">
            {user
              ? <Link to="/my" className="header__me">내 진단</Link>
              : <Link to="/login" className="header__me">로그인</Link>}
            <Link to="/diagnosis" className="btn btn--line header__cta">우리가게 진단하기</Link>
            <button className="btn btn--primary header__cta" onClick={consult.open}>상담하기</button>
          </div>
          <button className="menu-btn" aria-label={menu ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
            {menu ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>
      <div className={`drawer ${menu ? 'open' : ''}`} aria-hidden={!menu}>
        {navItems.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/diagnosis'} className="navlink" tabIndex={t}>{n.label}</NavLink>
        ))}
        <NavLink to="/contact" className="navlink" tabIndex={t}>상담 신청</NavLink>
        {user
          ? <NavLink to="/my" className="navlink" tabIndex={t}>내 진단 기록</NavLink>
          : <NavLink to="/login" className="navlink" tabIndex={t}>로그인 · 회원가입</NavLink>}
        <div className="drawer__btns">
          <Link to="/diagnosis" className="btn btn--line" tabIndex={t}>우리가게 진단하기</Link>
          <button className="btn btn--primary" tabIndex={t} onClick={() => { setMenu(false); consult.open() }}>상담하기</button>
        </div>
        {user && <button className="linkish drawer__out" tabIndex={t} onClick={signOut}>로그아웃 ({user.email})</button>}
      </div>
    </>
  )
}
