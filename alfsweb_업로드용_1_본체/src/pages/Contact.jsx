import ChannelList from '../components/ChannelList.jsx'
import ConsultForm from '../components/ConsultForm.jsx'
import { company } from '../config/site.js'

export default function Contact() {
  return (
    <section className="section">
      <div className="wrap contact-grid">
        <div className="intro">
          <span className="kicker">상담</span>
          <h1 style={{ fontSize: 'var(--t-2xl)' }}>편한 채널로 말 걸어 주세요</h1>
          <p className="lead muted mt-s">카카오톡이 가장 빠릅니다. 신청서를 남기시면 담당자가 먼저 연락드려요.</p>
          <div className="mt-m"><ChannelList /></div>
          <p className="muted mt-m" style={{ fontSize: '0.85rem' }}>상담 시간 {company.hours}</p>
        </div>
        <div className="panel">
          <h2 style={{ fontSize: 'var(--t-xl)', marginBottom: 6 }}>상담 신청서</h2>
          <p className="muted" style={{ marginBottom: 22 }}>무엇이 궁금한지 고르고 연락처를 남겨 주세요.</p>
          <ConsultForm />
        </div>
      </div>
    </section>
  )
}
