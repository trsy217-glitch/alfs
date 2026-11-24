import { Link } from 'react-router-dom'
import { company, channels, product, won, delivery, servicePaymentNoticeFooter } from '../config/site.js'
import { enzymeShipping } from '../config/enzyme.js'
import { navItems } from './Header.jsx'
import { asset } from '../lib/asset.js'

// 푸터 배송 안내: 오륜미네랄 기본 3,000원 · 효소세상 기본 4,000원 (/refund-policy 1번 표와 동일)
const footerShipping = `기본 ${won(product.shippingFee)}(효소세상 ${won(enzymeShipping.fee)}) · ${won(product.freeShippingOver)} 이상 무료배송 · ${product.carrier}`

export default function Footer() {
  const social = channels.filter((c) => c.url && ['kakao', 'instagram', 'youtube', 'naver'].includes(c.id))
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <div>
            <img className="footer__logo" src={asset('brand/alfs-logo.webp')} alt="ALFS 알프스" width="84" height="90" />
            <p className="mt-s">{company.legalName} · {company.fullNameEn}<br />좋은 제품이 시장에 안착하는 구조를 만듭니다.</p>
          </div>
          <div>
            <h4>메뉴</h4>
            <ul>
              {navItems.map((n) => <li key={n.to}><Link to={n.to}>{n.label}</Link></li>)}
              <li><Link to="/mineral-guide">미네랄 고르는 법</Link></li>
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
          <div>
            <h4>약관·정책</h4>
            <ul>
              <li><a href="/refund-policy#shipping">배송 안내</a></li>
              <li><Link to="/terms">이용약관</Link></li>
              <li><Link to="/privacy">개인정보처리방침</Link></li>
              <li><Link to="/refund-policy">배송·교환·환불 정책</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer__biz">
          <span>상호 {company.legalName}</span>
          <span>대표 {company.ceo}</span>
          <span>사업자등록번호 {company.bizNumber}</span>
          <span>통신판매업 신고 {company.mailOrderNumber}</span>
          <span>주소 {company.address}</span>
          <span>전화 {company.phone}</span>
          <span>이메일 <a href={`mailto:${company.email}`}>{company.email}</a></span>
        </div>
        <p className="footer__ship mt-s">
          배송 안내 · {footerShipping} · {delivery.leadTime} · <a href="/refund-policy">배송·교환·환불 정책 보기</a>
        </p>
        <p className="mt-s" style={{ fontSize: '0.75rem' }}>
          {product.name}은 기타가공품(일반식품)이며 질병의 예방·치료를 위한 의약품이나 건강기능식품이 아닙니다. 수상·특허는 {product.name} 제품이 아닌 제조사 유디아미네랄의 이력입니다.
        </p>
        <p className="mt-s" style={{ fontSize: '0.75rem' }}>{servicePaymentNoticeFooter}</p>
        <p className="mt-s" style={{ fontSize: '0.75rem' }}>© {new Date().getFullYear()} {company.legalName}. All rights reserved.</p>
      </div>
    </footer>
  )
}
