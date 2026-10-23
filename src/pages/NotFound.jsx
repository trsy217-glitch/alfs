import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap">
        <h1 style={{ fontSize: 'var(--t-2xl)' }}>찾는 페이지가 없습니다</h1>
        <p className="lead muted mt-s">주소가 바뀌었거나 삭제된 페이지입니다. 홈에서 다시 찾아보세요.</p>
        <div className="btn-row mt-m"><Link to="/" className="btn btn--primary">홈으로 가기</Link></div>
      </div>
    </section>
  )
}
