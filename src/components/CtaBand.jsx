import { Link } from 'react-router-dom'
import { useConsult } from './consult.js'

export default function CtaBand({ title, text, to = '/contact', toLabel = '상담 신청서 쓰기' }) {
  const consult = useConsult()
  return (
    <section className="section--tight leafbg">
      <div className="wrap cta-band">
        <div>
          <h2>{title}</h2>
          {text && <p className="muted mt-s lead">{text}</p>}
        </div>
        <div className="btn-row">
          <button className="btn btn--drop" onClick={consult.open}>채널로 바로 상담</button>
          <Link to={to} className="btn btn--ghost">{toLabel}</Link>
        </div>
      </div>
    </section>
  )
}
