// Firebase 연결 — Google 계정 로그인(Authentication) + 진단 결과 저장(Firestore)
// .env (또는 Vercel 환경 변수)에 VITE_FIREBASE_* 값을 넣으면 실제 모드로 동작합니다.
// 비어 있으면: 개발 서버(npm run dev)에서만 '체험 모드', 배포 사이트에서는 로그인·진단을 막고 '준비 중'으로 보여 줍니다.
// (가짜 로그인으로 진단하는 일이 없도록 — 진단은 실제 Google 로그인한 사람만)
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const env = import.meta.env
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
}

const ready = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId)
export const app = ready ? initializeApp(config) : null

export const auth = app ? getAuth(app) : null
// Firestore(진단 저장)는 진단 화면에서만 불러옵니다 → src/lib/store.js
export const isDemoMode = !app && Boolean(env.DEV)
// 배포 사이트인데 Firebase 값이 없을 때 → 로그인 불가 안내
export const authMissing = !app && !env.DEV
