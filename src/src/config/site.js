// ─────────────────────────────────────────────────────────────
// 알프스 사이트 설정 — 이 파일만 고치면 연락처·채널·사업자 정보가 전체에 반영됩니다.
// 값이 비어 있는('') 채널은 화면에 표시되지 않습니다.
// ─────────────────────────────────────────────────────────────

export const company = {
  nameKo: '알프스',
  nameEn: 'ALFS',
  fullNameEn: 'Alpha Food Store',
  ceo: '이소영',
  // 전자상거래법상 사이트 하단 표시 정보 — 실제 값으로 바꿔 주세요.
  bizNumber: '000-00-00000',
  mailOrderNumber: '제 0000-서울OO-0000호',
  address: '주소를 입력해 주세요',
  phone: '010-0000-0000',
  email: 'hello@alfs.kr',
  hours: '평일 10:00 – 18:00 (주말·공휴일 휴무)',
}

// 상담 채널. url이 비어 있으면 숨겨집니다.
export const channels = [
  {
    id: 'kakao',
    label: '카카오톡 채널 상담',
    desc: '가장 빠른 답변 · 평일 1시간 이내',
    // 알프스 카카오톡 채널 (채널 홈 → '채팅' 버튼으로 상담)
    url: 'https://pf.kakao.com/_JdTPX',
    primary: true,
  },
  {
    id: 'naver',
    label: '네이버 톡톡',
    desc: '스마트스토어 구매 문의',
    // 예: 'https://talk.naver.com/ct/wxxxxx'
    url: '',
  },
  {
    id: 'instagram',
    label: '인스타그램 DM · 미네랄카페',
    desc: '레시피·체험 카페 소식',
    url: 'https://www.instagram.com/',
  },
  {
    id: 'youtube',
    label: '유튜브 · 미네랄디톡스',
    desc: '제품 이야기와 영상 콘텐츠',
    url: 'https://www.youtube.com/',
  },
  {
    id: 'phone',
    label: '전화 상담',
    desc: company.hours,
    url: `tel:${company.phone.replace(/-/g, '')}`,
  },
  {
    id: 'email',
    label: '이메일 제안',
    desc: '제휴·입점 제안서 접수',
    url: `mailto:${company.email}`,
  },
]

// 상담 신청서 수신 주소 (선택).
// Google Apps Script 웹앱 URL을 넣으면 신청 내용이 구글 시트로 저장됩니다. README 참고.
// 비워 두면 '카카오톡으로 이어서 상담' + 이메일 보내기 방식으로 동작합니다.
export const formEndpoint = ''

export const commerce = {
  // 구매 버튼이 연결될 온라인 스토어 주소
  smartstore: '',
  coupang: '',
}

// 로그인은 Firebase Google 계정 로그인 하나만 씁니다 (src/lib/firebase.js · README 참고).
