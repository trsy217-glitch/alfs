import { Component } from 'react'

// 화면을 그리다 오류가 나도 사이트 전체가 빈 화면이 되지 않도록 감싸는 안전장치입니다.
// 평소에는 아무것도 그리지 않습니다 (자식만 그대로 보여 줍니다).
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error('[alfs] 화면 오류', error)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <section className="section">
        <div className="wrap" style={{ maxWidth: 640 }}>
          <div className="panel">
            <h1 style={{ fontSize: 'var(--t-2xl)', marginBottom: 10 }}>화면을 그리는 중 문제가 생겼습니다</h1>
            <p className="muted">잠시 후 다시 시도해 주세요. 진단 기록은 이 브라우저에 저장되어 있습니다.</p>
            <div className="btn-row mt-m">
              <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>새로고침</button>
              <a className="btn btn--ghost" href="/my">내 진단 기록</a>
            </div>
          </div>
        </div>
      </section>
    )
  }
}
