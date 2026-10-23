import { Link } from 'react-router-dom'
import { company, channels } from '../config/site.js'
import { navItems } from './Header.jsx'

export default function Footer() {
  const social = channels.filter((c) => c.url && ['kakao', 'instagram', 'youtube', 'naver'].includes(c.id))
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <div>
            <div className="logo"><span className="logo__en">ALFS</span></div>
            <p className="mt-s">알프스 · {company.fullNameEn}<br />좋은 제품이 시장에 안착하는 구조를 만듭니다.</p>
          </div>
          <div>
            <h4>메뉴</h4>
            <ul>
              {navItems.map((n) => <li key={n.to}><Link to={n.to}>{n.label}</Link></li>)}
              <li><Link to="/contact">상담 신청</Link></li>
            </ul>
          </div>
          <div>
            <h4>채널</h4>
            <ul>
              {social.map((c) => <li key={c.id}><a href={c.url} target="_blank" rel="noreferrer">{c.label}</a></li>)}
              <li><a href={`mailto:${company.email}`}>{company.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer__biz">
          <span>상호 {company.nameKo}({company.nameEn})</span>
          <span>대표 {company.ceo}</span>
          <span>사업자등록번호 {company.bizNumber}</span>
          <span>통신판매업 신고 {company.mailOrderNumber}</span>
          <span>주소 {company.address}</span>
          <span>전화 {company.phone}</span>
        </div>
        <p className="mt-s" style={{ fontSize: '0.75rem' }}>
          오륜미네랄은 기타가공품(일반식품)이며 질병의 예방·치료를 위한 의약품이나 건강기능식품이 아닙니다. 수상·특허는 오륜미네랄 제품이 아닌 제조사 유디아미네랄의 이력입니다.
        </p>
        <p className="mt-s" style={{ fontSize: '0.75rem' }}>© {new Date().getFullYear()} ALFS. All rights reserved.</p>
      </div>
    </footer>
  )
}
