// 진단 결과 저장소 — 로그인한 본인 것만 읽고 쓸 수 있습니다.
// Firebase 모드: Firestore  users/{uid}/diagnoses/{id}  에 저장하고, firestore.rules 로 본인만 접근하도록 서버에서 막습니다.
// 체험 모드: 사용자별 localStorage 키에 저장합니다.
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { app, isDemoMode } from './firebase.js'

const db = app ? getFirestore(app) : null
import { ls } from './safeStorage.js'

const key = (uid) => `alfs_demo_diag_${uid}`
const col = (uid) => collection(db, 'users', uid, 'diagnoses')
const iso = (t) => (t?.toDate ? t.toDate().toISOString() : t || new Date().toISOString())
const clean = (o) => JSON.parse(JSON.stringify(o)) // Firestore 는 undefined 를 저장하지 못함

export async function saveDiagnosis(user, { shopName, category, answers, result }) {
  if (isDemoMode) {
    const list = ls.get(key(user.id), [])
    const row = { id: `d${Date.now().toString(36)}`, created_at: new Date().toISOString(), shop_name: shopName, category, answers, result }
    list.unshift(row)
    ls.set(key(user.id), list.slice(0, 30))
    return { data: row }
  }
  try {
    const ref = await addDoc(col(user.id), { shop_name: shopName || '', category: category || '', answers: clean(answers), result: clean(result), created_at: serverTimestamp() })
    return { data: { id: ref.id, created_at: new Date().toISOString(), shop_name: shopName, category, answers, result } }
  } catch {
    return { error: '진단 결과를 저장하지 못했습니다. 네트워크를 확인하고 다시 시도해 주세요.' }
  }
}

export async function listDiagnoses(user) {
  if (isDemoMode) return { data: ls.get(key(user.id), []) }
  try {
    const snap = await getDocs(query(col(user.id), orderBy('created_at', 'desc')))
    return {
      data: snap.docs.map((d) => {
        const r = d.data()
        return { id: d.id, created_at: iso(r.created_at), shop_name: r.shop_name, category: r.category, result: { total: r.result?.total, grade: r.result?.grade } }
      }),
    }
  } catch {
    return { error: '진단 목록을 불러오지 못했습니다.' }
  }
}

export async function getDiagnosis(user, id) {
  if (isDemoMode) {
    const row = ls.get(key(user.id), []).find((r) => r.id === id)
    return row ? { data: row } : { error: 'notfound' }
  }
  try {
    const d = await getDoc(doc(db, 'users', user.id, 'diagnoses', id))
    if (!d.exists()) return { error: 'notfound' }
    const r = d.data()
    return { data: { id: d.id, ...r, created_at: iso(r.created_at) } }
  } catch {
    return { error: '진단 결과를 불러오지 못했습니다.' }
  }
}

export async function deleteDiagnosis(user, id) {
  if (isDemoMode) {
    ls.set(key(user.id), ls.get(key(user.id), []).filter((r) => r.id !== id))
    return { ok: true }
  }
  try {
    await deleteDoc(doc(db, 'users', user.id, 'diagnoses', id))
    return { ok: true }
  } catch {
    return { error: '삭제하지 못했습니다.' }
  }
}

// 작성 중인 진단 임시 저장 (이 기기에만)
export const draft = {
  load: (user) => ls.get(`alfs_draft_${user.id}`),
  save: (user, v) => ls.set(`alfs_draft_${user.id}`, v),
  clear: (user) => ls.remove(`alfs_draft_${user.id}`),
}
