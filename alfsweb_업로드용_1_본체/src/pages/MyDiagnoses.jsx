import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth.jsx'
import { listDiagnoses } from '../lib/store.js'
import { categoryById } from '../diagnosis/questions.js'

export default function MyDiagnoses() {
  const { user, signOut } = useAuth()
  const [list, setList] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listDiagnoses(user).then((r) => (r.error ? setError(r.error) : setList(r.data)))
  }, [user])

  return (
    <section className="section">
      <div className="wrap my">
        <div className="my__head">
          <div>
            <h1 style={{ fontSize: 'var(--t-2xl)' }}>내 진단 기록</h1>
            <p className="muted mt-s">{user.email} · 이 목록은 본인만 볼 수 있어요.</p>
          </div>
          <div className="btn-row">
            <Link to="/diagnosis/new" className="btn btn--primary">새로 진단하기</Link>
            <button className="btn btn--ghost" onClick={signOut}>로그아웃</button>
          </div>
        </div>

        {error && <p className="err" role="alert">{error}</p>}
        {!list && !error && <p className="muted">불러오는 중…</p>}
        {list && list.length === 0 && (
          <div className="empty">
            <h2>아직 진단 기록이 없어요</h2>
            <p className="muted">첫 진단은 10분 안팎이면 끝납니다. 결과는 여기에 차곡차곡 쌓여요.</p>
            <Link to="/diagnosis/new" className="btn btn--primary mt-m">첫 진단 시작하기</Link>
          </div>
        )}
        {list && list.length > 0 && (
          <ul className="my__list">
            {list.map((d, i) => {
              const prev = list[i + 1]?.result?.total
              const diff = prev != null ? Number(d.result.total) - Number(prev) : null
              return (
                <li key={d.id}>
                  <Link to={`/diagnosis/result/${d.id}`}>
                    <span className="my__date">{new Date(d.created_at).toLocaleDateString('ko-KR')}</span>
                    <span className="my__name"><b>{d.shop_name || '우리 가게'}</b><span>{categoryById(d.category)?.name}</span></span>
                    <span className="my__score">
                      <b>{d.result.total}점</b>
                      <span>{d.result.grade}</span>
                      {diff != null && <em className={diff >= 0 ? 'up' : 'down'}>{diff >= 0 ? '+' : ''}{diff}</em>}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
