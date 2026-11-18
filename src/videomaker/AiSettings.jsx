import { useEffect, useRef, useState } from 'react'
import { PROVIDERS, LOCAL_PRESETS, normalizeAi, providerById, aiLabel } from './aiConfig.js'
import { probeLocal, LOCAL_HELP } from './aiClient.js'

// ─────────────────────────────────────────────────────────────
// AI 문구 엔진 설정 창
// 방문자가 엔진을 고르고 자기 키를 넣습니다. 키는 이 브라우저에만 보관하고
// 알프스 서버에는 저장하지 않습니다. (모든 요청에 같은 광고 문구 규칙 적용)
// ─────────────────────────────────────────────────────────────
export default function AiSettings({ open, ai, onClose, onSave }) {
  const [draft, setDraft] = useState(() => normalizeAi(ai))
  const [showKey, setShowKey] = useState(false)
  const [probe, setProbe] = useState({ state: 'idle', msg: '', models: [] })
  const [err, setErr] = useState('')
  const dlgRef = useRef(null)
  const firstRef = useRef(null)

  // 열 때마다 저장된 설정으로 새로 시작
  useEffect(() => {
    if (!open) return
    setDraft(normalizeAi(ai))
    setShowKey(false)
    setProbe({ state: 'idle', msg: '', models: [] })
    setErr('')
  }, [open, ai])

  // ESC 닫기 · 열려 있는 동안 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const before = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => firstRef.current?.focus(), 30)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = before
      clearTimeout(t)
    }
  }, [open, onClose])

  if (!open) return null

  const def = providerById(draft.provider)
  const up = (patch) => setDraft((d) => ({ ...d, ...patch }))
  const pickProvider = (id) => {
    setProbe({ state: 'idle', msg: '', models: [] })
    setErr('')
    const d = providerById(id)
    setDraft((cur) => ({
      ...cur,
      provider: id,
      model: id === cur.provider ? cur.model : '', // 엔진을 바꾸면 모델은 기본값으로
      baseUrl: id === 'local' && !cur.baseUrl ? d.defaultBaseUrl : cur.baseUrl,
    }))
  }
  const pickPreset = (p) => setDraft((d) => ({ ...d, baseUrl: p.baseUrl, localModel: p.model || d.localModel }))

  const checkLocal = async () => {
    setProbe({ state: 'loading', msg: '내 PC의 AI에 연결해 보는 중…', models: [] })
    const r = await probeLocal(draft.baseUrl)
    if (r.ok) {
      const found = r.models.includes(draft.localModel) || !draft.localModel ? null : r.models
      setProbe({
        state: 'ok',
        msg: r.models.length
          ? `연결됐습니다. 쓸 수 있는 모델 ${r.models.length}개${draft.localModel ? ` · ${draft.localModel} ${r.models.includes(draft.localModel) ? '사용 가능' : '이름 확인 필요'}` : ` (예: ${r.models.slice(0, 3).join(', ')})`}`
          : '연결됐습니다. 모델을 하나 불러온 뒤 다시 확인해 주세요.',
        models: found || [],
      })
    } else {
      setProbe({ state: 'err', msg: r.error, models: [] })
    }
  }

  const submit = (e) => {
    e.preventDefault()
    const next = normalizeAi(draft)
    if (next.provider === 'local' && !next.baseUrl) { setErr('내 PC의 AI 주소를 넣어 주세요. (예: http://127.0.0.1:1234/v1)'); return }
    if (providerById(next.provider).needsKey && !next.apiKey) { setErr(`${providerById(next.provider).name} 키를 넣어 주세요. 키 없이 쓰려면 '키 없이 기본 문구'를 골라 주세요.`); return }
    onSave(next)
    onClose()
  }

  return (
    <div className="vm__dlgWrap" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="vm__dlg" role="dialog" aria-modal="true" aria-labelledby="vm-ai-title" ref={dlgRef}>
        <div className="vm__dlgHead">
          <h2 id="vm-ai-title">AI 문구 엔진 설정</h2>
          <button type="button" className="vm__dlgX" onClick={onClose} aria-label="설정 창 닫기">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        <p className="vm__dlgLead">
          문구는 <b>고객님(방문자)의 AI 키</b>나 <b>내 PC의 무료 로컬 AI</b>로 만듭니다. 알프스는 AI 비용을 받지 않고,
          입력한 키는 <b>이 브라우저에만</b> 저장되며 서버에 보관하지 않습니다.
        </p>

        <form onSubmit={submit} className="vm__dlgBody">
          <div className="vm__provs" role="radiogroup" aria-label="AI 엔진 선택">
            {PROVIDERS.map((p) => {
              const on = draft.provider === p.id
              return (
                <button type="button" key={p.id} role="radio" aria-checked={on}
                  className={`vm__prov ${on ? 'on' : ''}`} onClick={() => pickProvider(p.id)}
                  ref={p.id === PROVIDERS[0].id ? firstRef : null}>
                  <span className="vm__provTop"><b>{p.name}</b><i className={`vm__badge ${p.needsKey ? '' : 'free'}`}>{p.badge}</i></span>
                  <small>{p.vendor}</small>
                  <span className="vm__provDesc">{p.desc}</span>
                </button>
              )
            })}
          </div>

          {def.needsKey && (
            <div className="vm__aiSec">
              <label className="vm__label" htmlFor="vm-ai-key">{def.name} API 키</label>
              <div className="vm__keyrow">
                <input id="vm-ai-key" type={showKey ? 'text' : 'password'} value={draft.apiKey}
                  onChange={(e) => up({ apiKey: e.target.value })} placeholder={def.keyPlaceholder}
                  autoComplete="off" spellCheck="false" inputMode="text" />
                <button type="button" className="vm__keybtn" onClick={() => setShowKey((v) => !v)} aria-pressed={showKey}>
                  {showKey ? '가리기' : '보기'}
                </button>
              </div>
              <p className="vm__aiHint">
                <a href={def.keyUrl} target="_blank" rel="noreferrer noopener">{def.keyLabel} ↗</a>
                {draft.provider === 'gemini' && ' — 구글 계정만 있으면 무료 등급으로 시작할 수 있습니다.'}
                {draft.provider !== 'gemini' && ' — 키를 만든 뒤 결제(크레딧)가 켜져 있어야 동작합니다.'}
              </p>
              <label className="vm__label" htmlFor="vm-ai-model">모델 <span className="vm__opt">(선택)</span></label>
              <input id="vm-ai-model" value={draft.model} onChange={(e) => up({ model: e.target.value })}
                placeholder={def.modelHint} autoComplete="off" spellCheck="false" />
              <p className="vm__aiHint">비워 두면 {def.modelHint} 로 만듭니다. 키와 모델은 서버에 기록되지 않습니다.</p>
              {draft.apiKey && (
                <button type="button" className="vm__link" onClick={() => up({ apiKey: '' })}>입력한 키 지우기</button>
              )}
            </div>
          )}

          {draft.provider === 'local' && (
            <div className="vm__aiSec">
              <div className="vm__aiRow">
                <span className="vm__label">내 PC 프로그램</span>
                <div className="vm__aiChips">
                  {LOCAL_PRESETS.map((p) => (
                    <button type="button" key={p.id} className={`cut__tool ${draft.baseUrl === p.baseUrl ? 'on' : ''}`}
                      onClick={() => pickPreset(p)}>{p.name} 주소</button>
                  ))}
                </div>
              </div>
              <label className="vm__label" htmlFor="vm-ai-base">로컬 AI 주소</label>
              <input id="vm-ai-base" value={draft.baseUrl} onChange={(e) => up({ baseUrl: e.target.value })}
                placeholder="http://127.0.0.1:1234/v1" autoComplete="off" spellCheck="false" inputMode="url" />
              <label className="vm__label" htmlFor="vm-ai-lmodel">모델 이름 <span className="vm__opt">(선택)</span></label>
              <input id="vm-ai-lmodel" value={draft.localModel} onChange={(e) => up({ localModel: e.target.value })}
                placeholder={def.modelHint} autoComplete="off" spellCheck="false" />
              <div className="vm__aiRow">
                <button type="button" className="btn btn--line vm__probe" onClick={checkLocal} disabled={probe.state === 'loading'}>
                  {probe.state === 'loading' ? '확인 중…' : '연결 확인'}
                </button>
                {probe.state === 'ok' && <span className="vm__aiOk" role="status">{probe.msg}</span>}
                {probe.state === 'err' && <span className="vm__aiErr" role="alert">{probe.msg}</span>}
              </div>
              <p className="vm__aiHint">
                로컬 모델은 사진을 못 보는 경우가 많아, 사진은 브라우저에서 글자만 읽어(OCR) 설명과 함께 넘깁니다.
                {' '}{LOCAL_HELP}
              </p>
            </div>
          )}

          <label className="consent vm__remember">
            <input type="checkbox" checked={draft.remember} onChange={(e) => up({ remember: e.target.checked })} />
            <span>이 브라우저에 기억 <span className="vm__opt">— 끄면 탭을 닫을 때 키가 지워집니다</span></span>
          </label>

          {err && <p className="err" role="alert">{err}</p>}

          <div className="vm__dlgFoot">
            <span className="vm__aiNow">지금: <b>{aiLabel(draft)}</b></span>
            <div className="vm__aiBtns">
              <button type="button" className="btn btn--ghost" onClick={onClose}>닫기</button>
              <button type="submit" className="btn btn--primary">저장</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
