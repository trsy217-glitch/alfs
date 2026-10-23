import ProductTabs from '../components/ProductTabs.jsx'
import { useConsult } from '../components/consult.js'

// 효소세상 제품 탭 — 제품 정보가 확정되면 이 페이지를 채웁니다.
export default function EnzymeTab() {
  const consult = useConsult()
  return (
    <>
      <ProductTabs />
      <section className="section dark ptab-empty">
        <div className="wrap">
          <h1>효소세상</h1>
          <p className="lead muted mt-s">제품 소개를 준비하고 있습니다. 입점이나 공동구매가 궁금하시면 먼저 상담으로 물어봐 주세요.</p>
          <div className="btn-row mt-m">
            <button className="btn btn--drop" onClick={consult.open}>상담하기</button>
          </div>
        </div>
      </section>
    </>
  )
}
