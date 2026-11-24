import { lazy, Suspense, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ConsultSheet from './components/ConsultSheet.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Home from './pages/Home.jsx'
import Company from './pages/Company.jsx'
import Product from './pages/Product.jsx'
import EnzymeTab from './pages/EnzymeTab.jsx'
import MineralCafeTab from './pages/MineralCafeTab.jsx'
import AiMarketing from './pages/AiMarketing.jsx'
import Partner from './pages/Partner.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'
import Login from './pages/Login.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import HomeFirst from './components/HomeFirst.jsx'
import SeoHead from './components/SeoHead.jsx'
import MineralGuide from './pages/MineralGuide.jsx'
import Terms from './pages/Terms.jsx'
import Privacy from './pages/Privacy.jsx'
import RefundPolicy from './pages/RefundPolicy.jsx'
import PaymentSuccess from './pages/PaymentSuccess.jsx'
import PaymentFail from './pages/PaymentFail.jsx'

// 무거운 화면(진단·영상 만들기)은 들어갈 때만 불러옵니다 → 첫 화면이 빨리 뜸
const Diagnosis = lazy(() => import('./pages/Diagnosis.jsx'))
const DiagnosisNew = lazy(() => import('./pages/DiagnosisNew.jsx'))
const DiagnosisResult = lazy(() => import('./pages/DiagnosisResult.jsx'))
const MyDiagnoses = lazy(() => import('./pages/MyDiagnoses.jsx'))
const VideoMaker = lazy(() => import('./pages/VideoMaker.jsx'))
// 비공개 재고관리 앱(alfs.kr/stock) — 들어갈 때만 불러옵니다.
const StockApp = lazy(() => import('./pages/StockApp.jsx'))
import { AuthProvider } from './lib/auth.jsx'
import { ConsultContext } from './components/consult.js'
import { BuyContext } from './components/buy.js'
import BuySheet from './components/BuySheet.jsx'

export default function App() {
  // /stock 은 공개 사이트와 완전히 분리된 앱 화면으로 그립니다(헤더·푸터·상담창 없음).
  const { pathname } = useLocation()
  const isStock = pathname.replace(/\/+$/, '') === '/stock'
  const [open, setOpen] = useState(false)
  const [buyOpen, setBuyOpen] = useState(false)
  // 주문서에 담을 상품. null 이면 기본 상품(오륜미네랄)으로 열립니다.
  const [buyItem, setBuyItem] = useState(null)
  const openBuy = (item) => { setBuyItem(item || null); setBuyOpen(true) }
  return (
    <AuthProvider>
    <ConsultContext.Provider value={{ open: () => setOpen(true) }}>
    <BuyContext.Provider value={{ open: openBuy, close: () => setBuyOpen(false) }}>
      {!isStock && <HomeFirst />}
      {!isStock && <SeoHead />}
      <ScrollToTop />
      {!isStock && <a href="#main" className="sr-only">본문으로 건너뛰기</a>}
      {!isStock && <Header />}
      <main id="main">
        <Suspense fallback={<div className="page-loading" role="status">불러오는 중…</div>}>
        <Routes>
          <Route path="/stock" element={<StockApp />} />
          <Route path="/" element={<Home />} />
          <Route path="/company" element={<Company />} />
          {/* 유통 페이지는 회사 소개로 통합 — 예전 주소와 /about 은 회사 소개로 모읍니다 */}
          <Route path="/distribution" element={<Navigate to="/company" replace />} />
          <Route path="/about" element={<Navigate to="/company" replace />} />
          <Route path="/products" element={<Product />} />
          <Route path="/products/oryun" element={<Navigate to="/products" replace />} />
          <Route path="/products/enzyme" element={<EnzymeTab />} />
          <Route path="/products/cafe" element={<MineralCafeTab />} />
          <Route path="/product" element={<Navigate to="/products" replace />} />
          <Route path="/mineral-guide" element={<MineralGuide />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          {/* 토스페이먼츠 결제창 성공·실패 콜백 */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/fail" element={<PaymentFail />} />
          <Route path="/pay/success" element={<Navigate to="/payment/success" replace />} />
          <Route path="/pay/fail" element={<Navigate to="/payment/fail" replace />} />
          <Route path="/refund" element={<Navigate to="/refund-policy" replace />} />
          <Route path="/shipping" element={<Navigate to="/refund-policy" replace />} />
          <Route path="/ai-marketing" element={<AiMarketing />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
          <Route path="/login" element={<Login />} />
          <Route path="/video-maker" element={<VideoMaker />} />
          <Route path="/diagnosis/new" element={<RequireAuth><DiagnosisNew /></RequireAuth>} />
          <Route path="/diagnosis/result/:id" element={<RequireAuth><DiagnosisResult /></RequireAuth>} />
          <Route path="/my" element={<RequireAuth><MyDiagnoses /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      {!isStock && <Footer />}
      {!isStock && <ConsultSheet open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} />}
      {!isStock && <BuySheet open={buyOpen} item={buyItem} onClose={() => setBuyOpen(false)} />}
    </BuyContext.Provider>
    </ConsultContext.Provider>
    </AuthProvider>
  )
}
