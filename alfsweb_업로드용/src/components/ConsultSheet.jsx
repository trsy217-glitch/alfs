import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ChannelList from './ChannelList.jsx'
import { ChatIcon, CloseIcon } from './Icons.jsx'

export default function ConsultSheet({ open, onOpen, onClose }) {
  const { pathname } = useLocation()
  const hideFab = pathname === '/diagnosis/new' || pathname === '/login'
  const closeRef = useRef(null)
  const fabRef = useRef(null)
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const close = () => { onClose(); fabRef.current?.focus() }

  return (
    <>
      {!open && !hideFab && (
        <div className="fabs">
          {!pathname.startsWith('/diagnosis') && <Link to="/diagnosis" className="fab fab--line">무료 가게 진단</Link>}
          <button ref={fabRef} className="fab" onClick={onOpen} aria-haspopup="dialog">
            <ChatIcon /> 상담하기
          </button>
        </div>
      )}
      <div className={`sheet-backdrop ${open ? 'open' : ''}`} onClick={close} />
      <div className={`sheet ${open ? 'open' : ''}`} role="dialog" aria-modal="true" aria-labelledby="sheet-title" aria-hidden={!open}>
        <div className="sheet__head">
          <div>
            <h2 id="sheet-title">무엇을 도와드릴까요?</h2>
            <p>편한 채널을 고르면 담당자와 바로 연결됩니다.</p>
          </div>
          <button ref={closeRef} className="icon-btn" onClick={close} aria-label="상담 창 닫기" tabIndex={open ? 0 : -1}><CloseIcon /></button>
        </div>
        {open && <ChannelList />}
        <Link to="/contact" className="sheet__more" onClick={onClose}>상담 신청서 남기기 (답변 받을 연락처 등록)</Link>
      </div>
    </>
  )
}
