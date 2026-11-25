import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Report from '../components/Report.jsx'
import { getResult, listResults, deleteResult, unlockResult, emailOk, normEmail, useDiagEmail } from '../lib/store.js'
import { resultText } from '../diagnosis/resultText.js'
import { downloadPdf, downloadImage } from '../lib/download.js'
import { useConsult } from '../components/consult.js'

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch { /* 아래 예비 방법 */ }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.top = '-1000px'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch { return false }
}

export default function DiagnosisResult() {
  const { id } = useParams()
  const sessionEmail = useDiagEmail()
  const consult = useConsult()
  const nav = useNavigate()
  const ref = useRef(null)
  const [row, setRow] = useState(null)
  const [delta, setDelta] = useState(null)
  const [state, setState] = useState('loading') // loading | ready | notfound
  const [busy, setBusy] = useState('')
  const [note, setNote] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)
  // 이메일 입력(결과 열기)
  const [email, setEmail] = useState(sessionEmail)
  const [emailErr, setEmailErr] = useState('')
  const [unlocking, setUnlocking] = useState(false)

  useEffect(() => {
    const r = getResult(id)
    if (r.error) { setState('notfound'); return }
    setRow(r.data); setState('ready')
    if (r.data.email) setEmail(r.data.email)
  }, [id])

  // 같은 이메일로 남긴 지난 진단과 총점을 비교합니다.
  useEffect(() => {
    if (!row?.email) { setDelta(null); return }
    const older = listResults(row.email).data
      .filter((x) => x.id !== row.id && new Date(x.created_at) < new Date(row.created_at))
    setDelta(older[0]?.total != null ? Number(row.result.total) - Number(older[0].total) : null)
  }, [row])

  const unlock = (e) => {
    e.preventDefault()
    if (unlocking) return
    if (!emailOk(email)) { setEmailErr('이메일 주소를 정확히 입력해 주세요. 예: name@example.com'); return }
    setUnlocking(true)
    setEmailErr('')
    unlockResult(id, email).then((r) => {
      setUnlocking(false)
      if (r.error) { setEmailErr('진단 결과를 열지 못했습니다. 이 브라우저에서 진단한 결과인지 확인해 주세요.'); return }
      setRow(r.data)
    })
  }

  const fileBase = row ? `알프스_가게진단_${(row.shop_name || '우리가게').replace(/\s+/g, '')}_${new Date(row.created_at).toLocaleDateString('sv-SE')}` : ''

  const run = async (kind) => {
    setBusy(kind); setNote('')
    try {
      if (kind === 'copy') {
        const ok = await copyText(resultText(row.result, row.created_at))
        setNote(ok ? '진단 결과를 복사했어요. 카카오톡이나 메모에 붙여넣기 하세요.' : '복사하지 못했습니다. 화면에서 직접 선택해 복사해 주세요.')
      } else if (kind === 'pdf') {
        await downloadPdf(ref.current, `${fileBase}.pdf`)
        setNote('PDF를 내려받았어요.')
      } else {
        await downloadImage(ref.current, `${fileBase}.png`)
        setNote('이미지를 내려받았어요.')
      }
    } catch {
      setNote(kind === 'copy' ? '복사하지 못했습니다. 화면에서 직접 선택해 복사해 주세요.' : '파일을 만들지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.')
    }
    setBusy('')
  }

  const remove = () => {
    deleteResult(id)
    nav('/my', { replace: true })
  }

  if (state === 'loading') return <section className="section"><div className="wrap"><p className="muted">진단 결과를 불러오는 중…</p></div></section>
  if (state !== 'ready') {
    return (
      <section className="section">
        <div className="wrap">
          <h1 style={{ fontSize: 'var(--t-2xl)' }}>이 진단을 찾을 수 없습니다</h1>
          <p className="lead muted mt-s">진단 결과는 결과를 만든 브라우저에 저장됩니다. 진단한 기기에서 열어 주세요.</p>
          <div className="btn-row mt-m"><Link to="/diagnosis/new" className="btn btn--primary">새로 진단하기</Link><Link to="/my" className="btn btn--ghost">내 진단 기록</Link></div>
        </div>
      </section>
    )
  }

  // 이메일을 입력하기 전에는 결과 내용을 보여 주지 않습니다.
  if (!row.email) {
    return (
      <section className="section diag-lock">
        <div className="wrap" style={{ maxWidth: 640 }}>
          <div className="panel">
            <span className="kicker">무료 가게 진단</span>
            <h1 style={{ fontSize: 'var(--t-2xl)', marginBottom: 10 }}>진단이 끝났습니다. 이메일을 입력하면 결과를 볼 수 있어요</h1>
            <p className="muted">
              진단 결과는 이메일 주소를 입력한 뒤에 열립니다. 이름·전화번호는 받지 않고,
              <b> 이메일 주소와 진단 결과만</b> 알프스에 기록됩니다.
            </p>
            <form className="form mt-m" onSubmit={unlock} noValidate>
              <div className="field">
                <label htmlFor="diag-email">이메일 주소</label>
                <input
                  id="diag-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailErr('') }}
                  placeholder="name@example.com"
                  autoComplete="email"
                  inputMode="email"
                  aria-invalid={!!emailErr}
                  autoFocus
                />
                {emailErr && <p className="err" role="alert">{emailErr}</p>}
                <p className="hint">같은 이메일을 다시 입력하면 이 브라우저에서 지난 진단 결과를 볼 수 있습니다.</p>
              </div>
              <div>
                <button type="submit" className="btn btn--primary" disabled={unlocking}>
                  {unlocking ? '여는 중…' : '진단 결과 보기'}
                </button>
              </div>
            </form>
            <p className="muted mt-m" style={{ fontSize: '0.85rem' }}>진단 결과는 이 브라우저에 저장됩니다. 브라우저 기록을 지우면 결과도 사라집니다.</p>
          </div>
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
            <p className="result-bar__lock">{normEmail(row.email)} 로 저장된 진단입니다. 결과는 이 브라우저에서 볼 수 있습니다.</p>
          </div>
          <div className="btn-row">
            <button className="btn btn--ghost" onClick={() => run('copy')} disabled={!!busy}>{busy === 'copy' ? '복사하는 중…' : '결과 복사'}</button>
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
