// 진단 결과 저장소 — 결과는 이 브라우저(기기)에 저장하고, 이메일을 입력한 뒤에만 열립니다.
// 회사 쪽(알프스)에는 이메일 주소와 진단 결과 목록만 구글 시트로 보냅니다 (이름·전화번호 등은 받지 않습니다).
// 로그인 계정·서버 저장소 없이 동작하도록 Firebase 를 쓰지 않습니다.
import { useSyncExternalStore } from 'react'
import { ls } from './safeStorage.js'
import { sendToSheet } from './sheet.js'

const INDEX_KEY = 'alfs_diag_index_v1' // 결과 목록(요약) — 이메일별로 골라 봅니다
const ROW_KEY = (id) => `alfs_diag_row_v1_${id}` // 결과 본문
const EMAIL_KEY = 'alfs_diag_email'
const DRAFT_KEY = 'alfs_diag_draft_v1'
const EVENT = 'alfs:diag-email'
const MAX_LIST = 30

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/
export const emailOk = (v) => EMAIL_RE.test(String(v || '').trim())
export const normEmail = (v) => String(v || '').trim().toLowerCase()

const emit = (email) => {
  try { window.dispatchEvent(new CustomEvent(EVENT, { detail: email })) } catch { /* 서버 렌더링 등 */ }
}

// 지금 이 브라우저에서 결과를 볼 때 쓰는 이메일
export const emailSession = {
  get: () => String(ls.get(EMAIL_KEY, '') || ''),
  set(email) {
    const e = String(email || '').trim()
    if (e) ls.set(EMAIL_KEY, e)
    else ls.remove(EMAIL_KEY)
    emit(e)
  },
  clear() { ls.remove(EMAIL_KEY); emit('') },
}

// 헤더·페이지가 이메일 입력 상태를 따라 그리도록 (서버 렌더링에서는 빈 값)
const subscribe = (cb) => {
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}
export function useDiagEmail() {
  return useSyncExternalStore(subscribe, () => emailSession.get(), () => '')
}

const newId = () => `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

// 진단을 마치면 결과를 이 기기에 저장합니다. 아직 이메일을 받기 전이므로 잠긴 상태(email: '')입니다.
export function saveResult({ shopName, category, answers, result }) {
  const id = newId()
  const row = {
    id,
    created_at: new Date().toISOString(),
    shop_name: shopName || '',
    category: category || '',
    answers: answers || {},
    result,
    email: '',
  }
  if (!ls.set(ROW_KEY(id), row)) {
    return { error: '이 브라우저에 진단 결과를 저장하지 못했습니다. 저장 공간을 확인한 뒤 다시 시도해 주세요.' }
  }
  const index = ls.get(INDEX_KEY, [])
  const summary = {
    id,
    created_at: row.created_at,
    shop_name: row.shop_name,
    category: row.category,
    total: result?.total,
    grade: result?.grade,
    email: '',
  }
  const next = [summary, ...index.filter((x) => x.id !== id)].slice(0, MAX_LIST)
  ls.set(INDEX_KEY, next)
  return { data: row }
}

export function getResult(id) {
  const row = ls.get(ROW_KEY(id))
  return row ? { data: row } : { error: 'notfound' }
}

// 이메일을 입력하면 결과를 열고, 이메일 + 진단 결과 목록을 알프스 시트로 보냅니다.
export async function unlockResult(id, email) {
  const found = ls.get(ROW_KEY(id))
  if (!found) return { error: 'notfound' }
  const e = String(email || '').trim()
  const row = { ...found, email: e }
  ls.set(ROW_KEY(id), row)
  const next = ls.get(INDEX_KEY, []).map((x) => (x.id === id ? { ...x, email: e } : x))
  ls.set(INDEX_KEY, next)
  emailSession.set(e)

  // 화면은 바로 열고, 시트 기록은 뒤에서 조용히 진행합니다 (실패해도 화면은 그대로).
  sendToSheet({ id, email: e, result: row.result })

  return { data: row }
}

// 같은 이메일로 남긴 진단 기록 (이 기기에 저장된 것)
export function listResults(email) {
  const e = normEmail(email)
  if (!e) return { data: [] }
  return { data: ls.get(INDEX_KEY, []).filter((x) => normEmail(x.email) === e) }
}

export function deleteResult(id) {
  ls.remove(ROW_KEY(id))
  ls.set(INDEX_KEY, ls.get(INDEX_KEY, []).filter((x) => x.id !== id))
  return { ok: true }
}

// 작성 중인 진단 임시 저장 (이 기기에만)
export const draft = {
  load: () => ls.get(DRAFT_KEY),
  save: (v) => ls.set(DRAFT_KEY, v),
  clear: () => ls.remove(DRAFT_KEY),
}
