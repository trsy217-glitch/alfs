import { Link, NavLink } from 'react-router-dom'
import { company } from '../config/site.js'

// 약관·정책 페이지 3종이 함께 쓰는 틀.
export const policyLinks = [
  { to: '/terms', label: '이용약관' },
  { to: '/privacy', label: '개인정보처리방침' },
  { to: '/refund-policy', label: '배송·교환·환불 정책' },
]

// 전자상거래법상 표시해야 하는 사업자 정보 (사업자등록증명과 같은 값)
export function BizInfo() {
  return (
    <div className="policy__biz">
      <h2>사업자 정보</h2>
      <dl>
        <div><dt>상호</dt><dd>{company.legalName}</dd></div>
        <div><dt>대표자</dt><dd>{company.ceo}</dd></div>
        <div><dt>사업자등록번호</dt><dd>{company.bizNumber}</dd></div>
        <div><dt>통신판매업 신고번호</dt><dd>{company.mailOrderNumber}</dd></div>
        <div><dt>사업장 주소</dt><dd>{company.address}</dd></div>
        <div><dt>고객센터</dt><dd>{company.phone} · <a href={`mailto:${company.email}`}>{company.email}</a></dd></div>
        <div><dt>상담 시간</dt><dd>{company.hours}</dd></div>
      </dl>
    </div>
  )
}

export default function PolicyPage({ title, lead, children }) {
  return (
    <>
      <section className="page-hero">
        <div className="wrap intro">
          <span className="kicker">알프스(AL.F.S) · 정책</span>
          <h1>{title}</h1>
          {lead && <p className="lead">{lead}</p>}
          <p className="policy__date">시행일 {company.policyEffectiveDate}</p>
        </div>
      </section>

      <section className="section--tight">
        <div className="wrap policy">
          <nav className="policy__tabs" aria-label="약관·정책 목록">
            {policyLinks.map((p) => (
              <NavLink key={p.to} to={p.to} className={({ isActive }) => `policy__tab ${isActive ? 'active' : ''}`}>{p.label}</NavLink>
            ))}
          </nav>

          <article className="policy__body">{children}</article>

          <BizInfo />

          <p className="policy__more">
            제품·배송 문의는 <Link to="/contact">상담 신청</Link> 또는 고객센터({company.phone})로 연락 주세요.
          </p>
        </div>
      </section>
    </>
  )
}
