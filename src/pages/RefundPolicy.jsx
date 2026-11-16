import PolicyPage from '../components/PolicyPage.jsx'
import { company, product, won, shippingSummary } from '../config/site.js'

export default function RefundPolicy() {
  return (
    <PolicyPage
      title="배송·교환·환불 정책"
      lead={`${product.name} ${product.volume} 주문의 배송, 교환·반품, 환불 기준을 안내합니다.`}
    >
      <h2 id="shipping">1. 배송 안내</h2>
      <ul>
        <li>배송 방법: 택배({product.carrier})</li>
        <li>배송 지역: 대한민국 전국 · 제주·도서 산간 지역은 추가 배송비 6,000원이 발생합니다.</li>
        <li>배송비: {shippingSummary} (상품금액 {won(product.freeShippingOver)} 이상이면 배송비가 없습니다.)</li>
        <li>출고 소요: 결제 확인 후 2~3영업일 이내 발송 (주말·공휴일 제외)</li>
        <li>배송 기간: 발송 후 통상 1~3영업일 (택배사 사정에 따라 달라질 수 있습니다)</li>
        <li>배송 조회: 주문 접수 시 안내드린 운송장 번호로 {product.carrier} 홈페이지에서 조회할 수 있습니다.</li>
        <li>현재 판매 상품은 {product.name} {product.volume} 1종, 판매가 {won(product.price)}입니다.</li>
      </ul>

      <h2>2. 교환·반품 안내</h2>
      <ul>
        <li>신청 기간: 상품을 받은 날부터 7일 이내</li>
        <li>신청 방법: 고객센터 전화({company.phone}) 또는 이메일({company.email})로 주문 정보와 사유를 알려 주세요.</li>
        <li>교환·반품 배송비: 단순 변심은 구매자 부담, 상품 불량·오배송·배송 중 파손은 판매자 부담</li>
      </ul>
      <p>다음의 경우 교환·반품이 제한됩니다.</p>
      <ul>
        <li>상품을 받은 날부터 7일이 지난 경우</li>
        <li>식품의 특성상 포장을 개봉했거나 섭취한 경우(위생상 재판매가 어려운 경우)</li>
        <li>구매자의 사용·소비로 상품 가치가 현저히 감소한 경우</li>
        <li>반품에 필요한 포장·구성품이 누락된 경우</li>
      </ul>

      <h2>3. 환불 안내</h2>
      <ul>
        <li>환불 시점: 반품 상품을 확인한 날부터 3영업일 이내 환급</li>
        <li>환불 방법: 결제수단 취소(신용·체크카드, 간편결제) 또는 계좌이체</li>
        <li>카드 결제 취소는 카드사 정책에 따라 취소 반영에 3~5영업일이 걸릴 수 있습니다.</li>
        <li>상품이 표시·광고 내용과 다르거나 계약 내용과 다르게 이행된 경우, 그 사실을 안 날 또는 알 수 있었던 날부터 30일 이내, 상품을 받은 날부터 3개월 이내에 청약철회할 수 있습니다.</li>
      </ul>

      <h2>4. 고객센터</h2>
      <ul>
        <li>전화: {company.phone} · {company.hours}</li>
        <li>이메일: {company.email}</li>
        <li>카카오톡 채널: <a href="https://pf.kakao.com/_JdTPX" target="_blank" rel="noreferrer">알프스 카카오톡 채널</a></li>
      </ul>

      <h2>5. 결제 안내</h2>
      <p>현재 신용·체크카드 결제 연동을 준비 중이며, 연동 전까지는 주문서를 접수한 뒤 담당자가 결제 방법과 배송 일정을 안내합니다. 결제가 완료된 주문의 배송·환불은 위 기준을 따릅니다.</p>
    </PolicyPage>
  )
}
