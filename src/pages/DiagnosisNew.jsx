import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STEPS, CATEGORIES, questionsOf } from '../diagnosis/questions.js'
import { diagnose } from '../diagnosis/engine.js'
import { useAuth } from '../lib/auth.jsx'
import { saveDiagnosis, draft } from '../lib/store.js'

const isEmpty = (v) => v == null || v === '' || (Array.isArray(v) && v.length === 0)
const needsAnswer = (q) => q.required || ['single', 'multi', 'scale', 'category'].includes(q.type)

export default function DiagnosisNew() {
  const { user } = useAuth()
  const nav = useNavigate()
  const saved = useMemo(() => draft.load(user), [user])
  const [answers, setAnswers] = useState(saved?.answers || {})
  const [step, setStep] = useState(saved?.step || 0)
  const [resumed, setResumed] = useState(Boolean(saved && Object.keys(saved.answers || {}).length))
  const [missing, setMissing] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const headRef = useRef(null)

  const current = STEPS[step]
  const questions = questionsOf(current, answers.category)
  const last = step === STEPS.length - 1

  useEffect(() => { draft.save(user, { answers, step }) }, [answers, step, user])
  useEffect(() => { headRef.current?.focus({ preventScroll: true }); window.scrollTo(0, 0) }, [step])

  const setAnswer = (id, v) => {
    setAnswers((a) => ({ ...a, [id]: v }))
    setMissing((m) => m.filter((x) => x !== id))
  }

  const validate = () => {
    const miss = questions.filter((q) => needsAnswer(q) && isEmpty(answers[q.id])).map((q) => q.id)
    setMissing(miss)
    if (miss.length) document.getElementById(`q-${miss[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return miss.length === 0
  }

  const next = async () => {
    if (!validate()) return
    if (!last) { setStep((s) => s + 1); return }
    setSaving(true); setError('')
    const result = diagnose(answers)
    const r = await saveDiagnosis(user, { shopName: answers.shopName, category: answers.category, answers, result })
    setSaving(false)
    if (r.error) { setError(r.error); return }
    draft.clear(user)
    nav(`/diagnosis/result/${r.data.id}`, { replace: true })
  }

  const restart = () => { setAnswers({}); setStep(0); setResumed(false); draft.clear(user) }

  const answeredCount = Object.values(answers).filter((v) => !isEmpty(v)).length

  return (
    <section className="section wizard">
      <div className="wrap wizard__wrap">
        <ol className="steps-bar" aria-label="진단 단계">
          {STEPS.map((s, i) => (
            <li key={s.id} className={i === step ? 'on' : i < step ? 'done' : ''} aria-current={i === step ? 'step' : undefined}>
              <span className="steps-bar__dot" />
              <span className="steps-bar__name">{s.title}</span>
            </li>
          ))}
        </ol>

        {resumed && step === 0 && (
          <div className="resume" role="status">
            <span>작성하던 진단({answeredCount}개 답변)을 이어서 합니다.</span>
            <button className="linkish" onClick={restart}>처음부터 다시</button>
          </div>
        )}

        <header className="wizard__head">
          <p className="muted wizard__count">{step + 1} / {STEPS.length}</p>
          <h1 ref={headRef} tabIndex={-1}>{current.title}</h1>
          <p className="muted">{current.desc}</p>
        </header>

        <div className="qlist">
          {questions.map((q) => (
            <Question key={q.id} q={q} value={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} invalid={missing.includes(q.id)} />
          ))}
        </div>

        {missing.length > 0 && <p className="err" role="alert">답하지 않은 질문이 {missing.length}개 있어요. 표시된 질문을 골라 주세요.</p>}
        {error && <p className="err" role="alert">{error}</p>}

        <div className="wizard__nav">
          <button className="btn btn--ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>이전</button>
          <button className="btn btn--primary" onClick={next} disabled={saving}>
            {saving ? '분석하는 중…' : last ? '진단 결과 보기' : '다음'}
          </button>
        </div>
        <p className="muted wizard__save">답변은 이 기기에 자동으로 임시 저장돼요.</p>
      </div>
    </section>
  )
}

function Question({ q, value, onChange, invalid }) {
  const id = `q-${q.id}`
  const label = (
    <span className="q__label" id={`${id}-l`}>
      {q.q}
      {q.extraOf && <span className="q__tag">{q.extraOf} 맞춤</span>}
    </span>
  )

  if (q.type === 'category') {
    return (
      <fieldset className={`q ${invalid ? 'q--invalid' : ''}`} id={id}>
        <legend>{label}</legend>
        <div className="cat-pick" role="radiogroup" aria-labelledby={`${id}-l`}>
          {CATEGORIES.map((c) => (
            <label key={c.id} className={value === c.id ? 'on' : ''}>
              <input type="radio" name={q.id} value={c.id} checked={value === c.id} onChange={() => onChange(c.id)} />
              <b>{c.name}</b>
              <span>{c.ex}</span>
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  if (q.type === 'single' || q.type === 'multi') {
    const multi = q.type === 'multi'
    const sel = multi ? value || [] : value
    const toggle = (o) => {
      if (!multi) return onChange(o.v)
      if (o.exclusive) return onChange(sel.includes(o.v) ? [] : [o.v])
      const base = sel.filter((x) => !q.o.find((y) => y.v === x)?.exclusive)
      onChange(base.includes(o.v) ? base.filter((x) => x !== o.v) : [...base, o.v])
    }
    return (
      <fieldset className={`q ${invalid ? 'q--invalid' : ''}`} id={id}>
        <legend>{label}{multi && <span className="q__hint">여러 개 선택</span>}</legend>
        <div className="chips">
          {q.o.map((o) => {
            const checked = multi ? sel.includes(o.v) : sel === o.v
            return (
              <label key={o.v}>
                <input type={multi ? 'checkbox' : 'radio'} name={q.id} checked={checked} onChange={() => toggle(o)} />
                <span>{o.l}</span>
              </label>
            )
          })}
        </div>
      </fieldset>
    )
  }

  if (q.type === 'scale') {
    return (
      <fieldset className={`q ${invalid ? 'q--invalid' : ''}`} id={id}>
        <legend>{label}</legend>
        <div className="scale">
          <span className="muted">{q.min}</span>
          <div className="chips">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n}>
                <input type="radio" name={q.id} checked={Number(value) === n} onChange={() => onChange(n)} aria-label={`${n}점`} />
                <span className="scale__n">{n}</span>
              </label>
            ))}
          </div>
          <span className="muted">{q.max}</span>
        </div>
      </fieldset>
    )
  }

  const Tag = q.type === 'textarea' ? 'textarea' : 'input'
  return (
    <div className={`q field ${invalid ? 'q--invalid' : ''}`} id={id}>
      <label htmlFor={`${id}-in`} className="q__label">{q.q}{q.required ? '' : ''}</label>
      <Tag id={`${id}-in`} value={value || ''} maxLength={q.max} placeholder={q.placeholder} onChange={(e) => onChange(e.target.value)} rows={q.type === 'textarea' ? 3 : undefined} />
    </div>
  )
}
