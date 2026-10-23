const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const ChatIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...s}><path d="M4 5h16v11H9l-5 4z" /><path d="M8 10h8M8 13h5" /></svg>
)
export const CloseIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...s}><path d="M6 6l12 12M18 6L6 18" /></svg>
)
export const MenuIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...s}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
)

const KakaoIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#191600" d="M12 4C7 4 3 7.1 3 11c0 2.5 1.7 4.7 4.2 6l-1 3.6c-.1.3.3.6.6.4l4.3-2.8h.9c5 0 9-3.1 9-7s-4-7.2-9-7.2z" /></svg>
)
const NaverIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#03C75A" d="M5 4h4.6l4.8 7V4H19v16h-4.6l-4.8-7v7H5z" /></svg>
)
const InstaIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...s}><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17" cy="7" r="0.6" fill="currentColor" /></svg>
)
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...s}><rect x="3" y="6" width="18" height="12" rx="4" /><path d="M10.5 9.5v5l4-2.5z" fill="currentColor" /></svg>
)
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...s}><path d="M6 4h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2L16 13.5l4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4 6a2 2 0 0 1 2-2z" /></svg>
)
const MailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...s}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
)

export const channelIcon = { kakao: KakaoIcon, naver: NaverIcon, instagram: InstaIcon, youtube: YoutubeIcon, phone: PhoneIcon, email: MailIcon }
