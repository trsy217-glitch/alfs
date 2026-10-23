import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 공유 미리보기(OG 이미지)는 카카오톡·페이스북이 전체 주소(https://...)를 요구합니다.
// VITE_SITE_URL 을 넣거나, Vercel 에서는 운영 도메인을 자동으로 씁니다.
const siteUrl = (
  process.env.VITE_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : '')
).replace(/\/$/, '')

export default defineConfig({
  plugins: [
    react(),
    { name: 'site-url', transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl) },
  ],
})
