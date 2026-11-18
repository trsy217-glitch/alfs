import { Link } from 'react-router-dom'
import PolicyPage from '../components/PolicyPage.jsx'
import { company, delivery, product, refundSummary, won } from '../config/site.js'
import { enzymeProducts, enzymeShipping } from '../config/enzyme.js'

// 5만 원 미만이라 배송비가 실제로 붙는 상품 (지금은 클린바이옴 1병)
const paidShipping = enzymeProducts.filter((p) => p.price < product.freeShippingOver)

export default function RefundPolicy() {
  return (
    <PolicyPage
      title="배송·교환·환불 정책"
      lead={`${product.name} ${product.volume}와 효소세상 제품 ${enzymeProducts.length}종 주문의 배송, 교환·반품, 환불 기준을 안내합니다.`}
    >
      <h2 id="products">1. 판매 상품과 배송비</h2>
      <p>알프스(AL.F.S)가 alfs.kr에서 판매하는 상품과 판매가, 기본 배송비입니다. 판매가는 각 상품 페이지에 표시된 가격과 같습니다.</p>
      <table className="policy__table">
        <thead>
          <tr>
            <th scope="col">상품</th>
            <th scope="col">판매가</th>
            <th scope="col">기본 배송비</th>
          </tr>
        </thead>
        <tbody>
          <tr className="policy__table-group">
            <th scope="colgroup" colSpan={3}>{product.name} · 기본 배송비 {won(product.shippingFee)}</th>
          </tr>
          <tr>
            <th scope="row">
              {product.volume} · 1병
            </th>
            <td>{won(product.price)}</td>
            <td>{won(product.shippingFee)}</td>
          </tr>
          <tr className="policy__table-group">
            <th scope="colgroup" colSpan={3}>효소세상 제품 {enzymeProducts.length}종 · 기본 배송비 {won(enzymeShipping.fee)}</th>
          </tr>
          {enzymeProducts.map((p) => (
            <tr key={p.id}>
              <th scope="row">
                {p.name}
                <span className="policy__table-option">{p.option}</span>
              </th>
              <td>{won(p.price)}</td>
              <td>{won(enzymeShipping.fee)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul>
        <li>상품금액 {won(product.freeShippingOver)} 이상이면 기본 배송비가 없습니다(무료배송).</li>
        {paidShipping.length > 0 && (
          <li>
            효소세상 제품 가운데 {paidShipping.map((p) => `${p.name}(${won(p.price)})`).join(', ')}만 {won(product.freeShippingOver)} 미만이라 배송비 {won(enzymeShipping.fee)}이 붙고,
            나머지 상품은 상품금액이 {won(product.freeShippingOver)} 이상이라 무료배송입니다.
          </li>
        )}
        <li>제주·도서 산간 지역은 위 배송비와 별도로 추가 배송비 6,000원이 발생합니다.</li>
        <li>효소세상 제품의 판매가·구성은 <Link to="/products/enzyme">효소세상 제품 페이지</Link>에서, {product.name}은 <Link to="/products">제품 페이지</Link>에서 확인하실 수 있습니다.</li>
      </ul>

      <h2 id="shipping">2. 배송 안내</h2>
      <ul>
        <li>배송 방법: 택배({product.carrier})</li>
        <li>배송 지역: 대한민국 전국 · 제주·도서 산간 지역은 추가 배송비 6,000원이 발생합니다.</li>
        <li>배송비: 상품별 기본 배송비는 위 1번 표와 같으며, 상품금액 {won(product.freeShippingOver)} 이상이면 무료입니다.</li>
        <li>출고 소요: {delivery.leadTime} ({delivery.leadTimeNote})</li>
        <li>배송 기간: {delivery.transit}</li>
        <li>배송 조회: 주문 접수 시 안내드린 운송장 번호로 {product.carrier} 홈페이지에서 조회할 수 있습니다.</li>
      </ul>

      <h2>3. 교환·반품 안내</h2>
      <ul>
        <li>신청 기간: 상품을 받은 날부터 7일 이내</li>
        <li>신청 방법: 고객센터 전화({company.phone}) 또는 이메일({company.email})로 주문 정보와 사유를 알려 주세요.</li>
        <li>교환·반품 배송비: 단순 변심은 구매자 부담, 상품 불량·오배송·배송 중 파손은 판매자 부담</li>
        <li>단순 변심 반품 배송비: 편도 3,000원 (최초 배송비가 무료였던 주문은 왕복 6,000원)</li>
        <li>단순 변심 교환 배송비: 왕복 6,000원</li>
        <li>반품 보내실 곳: {company.address} · 택배({product.carrier})</li>
      </ul>
      <p>다음의 경우 교환·반품이 제한됩니다.</p>
      <ul>
        <li>상품을 받은 날부터 7일이 지난 경우</li>
        <li>식품의 특성상 포장을 개봉했거나 섭취한 경우(위생상 재판매가 어려운 경우)</li>
        <li>구매자의 사용·소비로 상품 가치가 현저히 감소한 경우</li>
        <li>반품에 필요한 포장·구성품이 누락된 경우</li>
      </ul>

      <h2>4. 환불 안내</h2>
      <ul>
        <li>환불 시점: 반품 상품을 확인한 날부터 3영업일 이내 환급</li>
        <li>환불 금액: 결제 금액에서 반품 배송비가 발생한 경우 그 금액을 뺀 나머지 금액</li>
        <li>환불 방법: 결제수단 취소(신용·체크카드, 간편결제) 또는 계좌이체</li>
        <li>카드 결제 취소는 카드사 정책에 따라 취소 반영에 3~5영업일이 걸릴 수 있습니다.</li>
        <li>상품이 표시·광고 내용과 다르거나 계약 내용과 다르게 이행된 경우, 그 사실을 안 날 또는 알 수 있었던 날부터 30일 이내, 상품을 받은 날부터 3개월 이내에 청약철회할 수 있습니다.</li>
      </ul>

      <h2>5. 고객센터</h2>
      <ul>
        <li>전화: {company.phone} · {company.hours}</li>
        <li>이메일: {company.email}</li>
        <li>카카오톡 채널: <a href="https://pf.kakao.com/_JdTPX" target="_blank" rel="noreferrer">알프스 카카오톡 채널</a></li>
      </ul>

      <h2>6. 결제 안내</h2>
      <p>
        신용·체크카드 결제는 전자지급결제대행사 토스페이먼츠(주)의 결제창에서 처리됩니다. 회원가입이나 로그인 없이
        비회원으로도 결제하실 수 있으며, 주문서에서 배송지·연락처를 적고 결제하기를 누르면 결제창이 열립니다.
        카드 승인이 끝나면 주문이 접수되고, 결제 확인 후 영업일 기준 1~3일 이내에 출고합니다.
      </p>
      <ul>
        <li>{refundSummary.withdraw}. {refundSummary.changeOfMind}. {refundSummary.defect}.</li>
        <li>{refundSummary.refundTime}. 카드 결제 취소는 카드사 정책에 따라 취소 반영에 3~5영업일이 걸릴 수 있습니다.</li>
        <li>결제가 끝난 주문의 배송·환불은 위 기준을 그대로 따릅니다.</li>
      </ul>
    </PolicyPage>
  )
}
