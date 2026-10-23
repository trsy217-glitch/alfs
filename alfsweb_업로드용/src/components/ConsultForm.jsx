import { useState } from 'react'
import { channels, company, formEndpoint } from '../config/site.js'

const TOPICS = ['파트너샵 입점', 'AI 마케팅 컨설팅', '제품 구매', '공동구매·인플루언서', '기타 제휴']

export default function ConsultForm({ defaultTopic = TOPICS[0] }) {
  const [v, setV] = useState({ name: '', phone: '', shop: '', region: '', topic: defaultTopic, message: '', agree: false })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | local
  const [copied, setCopied] = useState(false)

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const validate = () => {
    const e = {}
    if (!v.name.trim()) e.name = '이름을 입력해 주세요.'
    if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(v.phone.replace(/\s/g, ''))) e.phone = '연락 가능한 번호를 010-0000-0000 형식으로 입력해 주세요.'
    if (!v.agree) e.agree = '답변을 드리려면 개인정보 수집·이용 동의가 필요합니다.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const summary = () =>
    `[알프스 상담 신청]\n상담 분야: ${v.topic}\n이름: ${v.name}\n연락처: ${v.phone}\n매장/브랜드: ${v.shop || '-'}\n지역: ${v.region || '-'}\n내용: ${v.message || '-'}`

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    if (!formEndpoint) { setStatus('local'); return }
    setStatus('sending')
    try {
      await fetch(formEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...v, submittedAt: new Date().toISOString(), page: window.location.href }),
      })
      setStatus('sent')
    } catch {
      setStatus('local')
    }
  }

  const kakao = channels.find((c) => c.id === 'kakao' && c.url)

  const sendKakao = async () => {
    try { await navigator.clipboard.writeText(summary()); setCopied(true) } catch { /* 복사 권한이 없으면 그대로 진행 */ }
    window.open(kakao.url, '_blank', 'noreferrer')
  }

  if (status === 'sent') {
    return (
      <div className="form-done" role="status">
        <h3>상담 신청이 접수되었습니다</h3>
        <p>{v.name}님, 영업일 기준 하루 안에 {v.phone}로 연락드릴게요. 급하시면 카카오톡 채널로 말씀해 주세요.</p>
      </div>
    )
  }

  if (status === 'local') {
    return (
      <div className="form-done" role="status">
        <h3>신청 내용을 담당자에게 보내 주세요</h3>
        <p>아래 버튼 중 하나를 누르면 작성하신 내용이 그대로 전달됩니다.</p>
        <div className="btn-row mt-m">
          {kakao && <button className="btn btn--kakao" onClick={sendKakao}>카카오톡으로 보내기</button>}
          <a className="btn btn--ghost" href={`mailto:${company.email}?subject=${encodeURIComponent(`[알프스 상담] ${v.topic}`)}&body=${encodeURIComponent(summary())}`}>이메일로 보내기</a>
        </div>
        {copied && <p className="mt-s" style={{ fontSize: '0.85rem' }}>신청 내용을 복사했어요. 카카오톡 대화창에 붙여넣기 해 주세요.</p>}
        <button className="btn btn--ghost mt-m" style={{ minHeight: 40, fontSize: '0.9rem' }} onClick={() => setStatus('idle')}>내용 고치기</button>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="field">
        <label id="topic-l">상담 분야</label>
        <div className="chips" role="radiogroup" aria-labelledby="topic-l">
          {TOPICS.map((t) => (
            <label key={t}>
              <input type="radio" name="topic" value={t} checked={v.topic === t} onChange={set('topic')} />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="two">
        <div className="field">
          <label htmlFor="f-name">이름</label>
          <input id="f-name" value={v.name} onChange={set('name')} autoComplete="name" aria-invalid={!!errors.name} />
          {errors.name && <p className="err">{errors.name}</p>}
        </div>
        <div className="field">
          <label htmlFor="f-phone">연락처</label>
          <input id="f-phone" value={v.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" aria-invalid={!!errors.phone} />
          {errors.phone && <p className="err">{errors.phone}</p>}
        </div>
      </div>
      <div className="two">
        <div className="field">
          <label htmlFor="f-shop">매장·브랜드명 (선택)</label>
          <input id="f-shop" value={v.shop} onChange={set('shop')} placeholder="예: OO웰니스샵" />
        </div>
        <div className="field">
          <label htmlFor="f-region">지역 (선택)</label>
          <input id="f-region" value={v.region} onChange={set('region')} placeholder="예: 서울 마포구" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="f-msg">궁금한 점 (선택)</label>
        <textarea id="f-msg" value={v.message} onChange={set('message')} placeholder="매장 업종, 지금 운영 중인 SNS, 원하는 상담 시간 등을 적어 주시면 더 정확히 안내해 드려요." />
      </div>
      <label className="consent">
        <input type="checkbox" checked={v.agree} onChange={set('agree')} />
        <span>상담 답변을 위해 이름·연락처·상담 내용을 수집하며, 상담 완료 후 1년간 보관 후 파기하는 데 동의합니다. (필수)</span>
      </label>
      {errors.agree && <p className="err" style={{ marginTop: -8 }}>{errors.agree}</p>}
      <div>
        <button type="submit" className="btn btn--primary" disabled={status === 'sending'}>
          {status === 'sending' ? '접수하는 중…' : '상담 신청하기'}
        </button>
      </div>
    </form>
  )
}
