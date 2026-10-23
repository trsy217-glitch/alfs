import { Link } from 'react-router-dom'
import { CATEGORIES, STEPS } from '../diagnosis/questions.js'
import { useAuth } from '../lib/auth.jsx'

const outputs = [
  { t: '영역별 점수', d: '시장·매출·온라인·오프라인·고객·상품·운영 여건 7개 영역을 100점 기준으로 봅니다.' },
  { t: '강점과 없는 것', d: '이미 잘하고 있는 것, 아예 없는 것, 부족해서 보완할 것을 나눠 보여 드립니다.' },
  { t: '이번 주부터 할 일', d: '이번 주 · 한 달 안 · 석 달 계획으로 우선순위를 정리합니다.' },
  { t: '상품군 분석', d: '입문 상품, 재구매율, 가격대, 타깃을 따로 짚고 상품 단계를 제안합니다.' },
]

export default function Diagnosis() {
  const { user } = useAuth()
  const start = user ? '/diagnosis/new' : '/login'
  return (
    <>
      <section className="page-hero diag-hero">
        <div className="wrap diag-hero__grid">
          <div className="intro">
            <span className="kicker">무료 · 회원 전용</span>
            <h1>우리 가게, 어디가 비어 있는지 10분이면 보입니다</h1>
            <p className="lead">업종을 고르고 질문 {STEPS.length}묶음에 짧게 답하면, 강점과 없는 것, 보완할 것, 이번 주에 할 일까지 정리된 진단표가 나옵니다.</p>
            <div className="btn-row mt-m">
              <Link to={start} state={{ from: '/diagnosis/new' }} className="btn btn--primary">{user ? '진단 시작하기' : '로그인하고 무료 진단하기'}</Link>
              {user && <Link to="/my" className="btn btn--ghost">내 진단 기록</Link>}
            </div>
            <p className="muted mt-s" style={{ fontSize: '0.88rem' }}>결과는 진단한 본인만 볼 수 있고, PDF로 내려받을 수 있어요.</p>
          </div>
          <SamplePreview />
        </div>
      </section>

      <section className="section--tight">
        <div className="wrap">
          <h2 className="h-section">이런 업종이라면 바로 진단할 수 있어요</h2>
          <p className="lead muted mt-s">업종마다 다른 질문 두 개가 더해지고, 업종에 맞는 상품 아이디어가 함께 나옵니다.</p>
          <ul className="cat-list">
            {CATEGORIES.map((c) => (
              <li key={c.id}><b>{c.name}</b><span>{c.ex}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section leafbg">
        <div className="wrap">
          <h2 className="h-section">진단에서 보는 것</h2>
          <div className="rows">
            {STEPS.map((s) => (
              <div className="row" key={s.id}>
                <h3>{s.title}</h3>
                <p className="muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="h-section">진단표에 담기는 것</h2>
          <div className="hooks">
            {outputs.slice(0, 3).map((o) => <div className="hook" key={o.t}><h3>{o.t}</h3><p>{o.d}</p></div>)}
          </div>
          <div className="hooks" style={{ marginTop: 28 }}>
            {outputs.slice(3).map((o) => <div className="hook" key={o.t}><h3>{o.t}</h3><p>{o.d}</p></div>)}
            <div className="hook"><h3>업종별 상품 아이디어</h3><p>우리 업종에 미네랄 같은 새 상품을 더한다면 어떤 방식이 맞는지 참고 의견을 드립니다.</p></div>
            <div className="hook"><h3>지난 진단과 비교</h3><p>진단은 계정에 쌓입니다. 석 달 뒤 다시 진단해 점수 변화를 확인하세요.</p></div>
          </div>
          <div className="btn-row mt-l">
            <Link to={start} state={{ from: '/diagnosis/new' }} className="btn btn--primary">{user ? '진단 시작하기' : '로그인하고 무료 진단하기'}</Link>
          </div>
          <p className="notice">이 진단은 사장님 응답을 바탕으로 한 자가진단이며 참고용입니다. 매출이나 성과를 보장하지 않습니다.</p>
        </div>
      </section>
    </>
  )
}

// 결과 화면이 어떻게 생겼는지 보여 주는 예시 (실제 데이터 아님)
function SamplePreview() {
  const sample = [
    { label: '시장 경쟁력', score: 72 }, { label: '매출 건강도', score: 61 }, { label: '온라인 홍보', score: 44 },
    { label: '오프라인 홍보', score: 38 }, { label: '고객 관리', score: 51 }, { label: '상품 구성', score: 66 }, { label: '운영 여건', score: 70 },
  ]
  return (
    <div className="sample" aria-label="진단 결과 예시">
      <div className="sample__head">
        <span className="sample__tag">결과 예시</span>
        <b>망원동 카페 · 58점</b>
        <span>보완이 필요한 가게</span>
      </div>
      <ul className="bars">
        {sample.map((a) => (
          <li key={a.label}>
            <span>{a.label}</span>
            <span className="bar"><i style={{ width: `${a.score}%` }} className={a.score < 60 ? 'low' : ''} /></span>
            <b>{a.score}</b>
          </li>
        ))}
      </ul>
      <p className="sample__todo"><b>이번 주 할 일</b> 네이버 플레이스 사진 교체 · 재방문 쿠폰 시작</p>
    </div>
  )
}

