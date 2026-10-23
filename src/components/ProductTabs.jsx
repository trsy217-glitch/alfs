import { NavLink } from 'react-router-dom'

// 제품 탭 — 새 제품이 생기면 여기에 한 줄 추가하고 App.jsx 에 경로를 연결하세요.
export const products = [
  { to: '/products', label: '오륜미네랄', end: true },
  { to: '/products/enzyme', label: '효소세상' },
]

export default function ProductTabs() {
  return (
    <div className="ptabs dark">
      <nav className="wrap ptabs__in" aria-label="제품 선택">
        {products.map((p) => (
          <NavLink key={p.to} to={p.to} end={p.end} className="ptab">{p.label}</NavLink>
        ))}
      </nav>
    </div>
  )
}
