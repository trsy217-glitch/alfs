import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Report from '../components/Report.jsx'
import { useAuth } from '../lib/auth.jsx'
import { getDiagnosis, listDiagnoses, deleteDiagnosis } from '../lib/store.js'
import { downloadPdf, downloadImage } from '../lib/download.js'
import { useConsult } from '../components/consult.js'

export default function DiagnosisResult() {
  const { id } = useParams()
  const { user } = useAuth()
  const consult = useConsult()
  const nav = useNavigate()
  const ref = useRef(null)
  const [row, setRow] = useState(null)
  const [delta, setDelta] = useState(null)
  const [state, setState] = useState('loading') // loading | ready | notfound | error
  const [busy, setBusy] = useState('')
  const [note, setNote] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const r = await getDiagnosis(user, id)
      if (!alive) return
      if (r.error) { setState(r.error === 'notfound' ? 'notfound' : 'error'); return }
      setRow(r.data); setState('ready')
      const list = await listDiagnoses(user)
      const older = (list.data || []).filter((x) => x.id !== id && new Date(x.created_at) < new Date(r.data.created_at))
      if (alive && older[0]?.result?.total != null) setDelta(r.data.result.total - Number(older[0].result.total))
    })()
    return () => { alive = false }
  }, [id, user])

  const fileBase = row ? `알프스_가게진단_${(row.shop_name || '우리가게').replace(/\s+/g, '')}_${new Date(row.created_at).toLocaleDateString('sv-SE')}` : ''

  const run = async (kind) => {
    setBusy(kind); setNote('')
    try {
      if (kind === 'pdf') await downloadPdf(ref.current, `${fileBase}.pdf`)
      else await downloadImage(ref.current, `${fileBase}.png`)
      setNote(kind === 'pdf' ? 'PDF를 내려받았어요.' : '이미지를 내려받았어요.')
    } catch {
      setNote('파일을 만들지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.')
    }
    setBusy('')
  }

  const remove = async () => {
    const r = await deleteDiagnosis(user, id)
    if (r.error) { setNote(r.error); return }
    nav('/my', { replace: true })
  }

  if (state === 'loading') return <section className="section"><div className="wrap"><p className="muted">진단 결과를 불러오는 중…</p></div></section>
  if (state !== 'ready') {
    return (
      <section className="section">
        <div className="wrap">
          <h1 style={{ fontSize: 'var(--t-2xl)' }}>{state === 'notfound' ? '이 진단을 찾을 수 없습니다' : '진단 결과를 불러오지 못했습니다'}</h1>
          <p className="lead muted mt-s">{state === 'notfound' ? '진단 결과는 진단한 본인 계정에서만 열립니다. 로그인한 계정을 확인해 주세요.' : '네트워크를 확인하고 다시 시도해 주세요.'}</p>
          <div className="btn-row mt-m"><Link to="/my" className="btn btn--primary">내 진단 기록</Link><Link to="/diagnosis/new" className="btn btn--ghost">새로 진단하기</Link></div>
        </div>
      </section>
    )
  }

  return (
    <section className="section result-page">
      <div className="wrap">
        <div className="result-bar">
          <div>
            <p className="muted">우리가게 진단 결과</p>
            <p className="result-bar__lock">이 결과는 {user.name || user.email}님만 볼 수 있어요.</p>
          </div>
          <div className="btn-row">
            <button className="btn btn--primary" onClick={() => run('pdf')} disabled={!!busy}>{busy === 'pdf' ? 'PDF 만드는 중…' : 'PDF 다운로드'}</button>
            <button className="btn btn--ghost" onClick={() => run('png')} disabled={!!busy}>{busy === 'png' ? '이미지 만드는 중…' : '이미지 저장'}</button>
          </div>
        </div>
        {note && <p className="ok" role="status">{note}</p>}

        <div ref={ref} className="report-wrap">
          <Report r={row.result} createdAt={row.created_at} delta={delta} />
        </div>

        <div className="result-next">
          <div>
            <h2>진단 결과로 상담받기</h2>
            <p className="muted">결과를 내려받아 상담 때 보여 주시면 바로 이야기를 시작할 수 있어요.</p>
          </div>
          <div className="btn-row">
            <button className="btn btn--primary" onClick={consult.open}>상담하기</button>
            {row.result.help.map((h) => <Link key={h.title} to={h.to} className="btn btn--ghost">{h.title}</Link>)}
          </div>
        </div>

        <div className="result-foot">
          <Link to="/diagnosis/new">새로 진단하기</Link>
          <Link to="/my">내 진단 기록</Link>
          {!confirmDel
            ? <button className="linkish danger" onClick={() => setConfirmDel(true)}>이 진단 삭제</button>
            : <span className="confirm">삭제하면 되돌릴 수 없어요. <button className="linkish danger" onClick={remove}>삭제</button> <button className="linkish" onClick={() => setConfirmDel(false)}>취소</button></span>}
        </div>
      </div>
    </section>
  )
}
