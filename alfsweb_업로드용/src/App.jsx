import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import ConsultSheet from './components/ConsultSheet.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import Home from './pages/Home.jsx'
import Company from './pages/Company.jsx'
import Distribution from './pages/Distribution.jsx'
import Product from './pages/Product.jsx'
import AiMarketing from './pages/AiMarketing.jsx'
import Partner from './pages/Partner.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'
import Diagnosis from './pages/Diagnosis.jsx'
import DiagnosisNew from './pages/DiagnosisNew.jsx'
import DiagnosisResult from './pages/DiagnosisResult.jsx'
import MyDiagnoses from './pages/MyDiagnoses.jsx'
import Login from './pages/Login.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import { AuthProvider } from './lib/auth.jsx'
import { ConsultContext } from './components/consult.js'

export default function App() {
  const [open, setOpen] = useState(false)
  return (
    <AuthProvider>
    <ConsultContext.Provider value={{ open: () => setOpen(true) }}>
      <ScrollToTop />
      <a href="#main" className="sr-only">본문으로 건너뛰기</a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/company" element={<Company />} />
          <Route path="/distribution" element={<Distribution />} />
          <Route path="/product" element={<Product />} />
          <Route path="/ai-marketing" element={<AiMarketing />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
          <Route path="/login" element={<Login />} />
          <Route path="/diagnosis/new" element={<RequireAuth><DiagnosisNew /></RequireAuth>} />
          <Route path="/diagnosis/result/:id" element={<RequireAuth><DiagnosisResult /></RequireAuth>} />
          <Route path="/my" element={<RequireAuth><MyDiagnoses /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ConsultSheet open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} />
    </ConsultContext.Provider>
    </AuthProvider>
  )
}
