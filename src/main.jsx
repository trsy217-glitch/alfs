import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'

// 배포(Vercel·Netlify 등)는 BrowserRouter, 정적 미리보기는 HashRouter
const Router = import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter

const app = (
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
)
// 배포 빌드는 페이지 글자를 미리 넣어 둡니다(scripts/prerender.mjs) → 그 위에 이어 붙이고, 비어 있으면 새로 그립니다
const el = document.getElementById('root')
if (el.firstElementChild && import.meta.env.VITE_ROUTER !== 'hash') hydrateRoot(el, app, { onRecoverableError: () => {} })
else createRoot(el).render(app)
