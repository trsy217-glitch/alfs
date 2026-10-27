import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 공유 미리보기(OG 이미지)는 카카오톡·페이스북이 전체 주소(https://...)를 요구합니다.
// 운영 도메인은 alfs.kr 입니다. 다른 주소로 빌드할 때만 VITE_SITE_URL 을 넣으세요.
const siteUrl = (process.env.VITE_SITE_URL || 'https://alfs.kr').replace(/\/$/, '')

// 검색엔진 소유 확인 코드 — Vercel 환경변수에 값만 넣으면 모든 페이지 <head> 에 들어갑니다.
//   GOOGLE_SITE_VERIFICATION : Google Search Console 'HTML 태그' 방식의 content 값
//   NAVER_SITE_VERIFICATION  : 네이버 서치어드바이저 'HTML 태그' 방식의 content 값
const verify = [
  ['google-site-verification', process.env.GOOGLE_SITE_VERIFICATION],
  ['naver-site-verification', process.env.NAVER_SITE_VERIFICATION],
].filter(([, v]) => v).map(([k, v]) => `<meta name="${k}" content="${v.replace(/"/g, '')}" />`).join('\n    ')

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'site-url',
      transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl).replace('</head>', verify ? `    ${verify}\n  </head>` : '</head>'),
    },
  ],
})
