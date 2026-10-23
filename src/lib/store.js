// 진단 결과 저장소 — 로그인한 본인 것만 읽고 쓸 수 있습니다.
// Supabase 모드: diagnoses 테이블 + RLS(user_id = auth.uid()) 로 서버에서 막습니다. supabase/schema.sql 참고.
// 체험 모드: 사용자별 localStorage 키에 저장합니다.
import { supabase, isDemoMode } from './supabase.js'
import { ls } from './safeStorage.js'

const key = (uid) => `alfs_demo_diag_${uid}`

export async function saveDiagnosis(user, { shopName, category, answers, result }) {
  if (isDemoMode) {
    const list = ls.get(key(user.id), [])
    const row = { id: `d${Date.now().toString(36)}`, created_at: new Date().toISOString(), shop_name: shopName, category, answers, result }
    list.unshift(row)
    ls.set(key(user.id), list.slice(0, 30))
    return { data: row }
  }
  const { data, error } = await supabase
    .from('diagnoses')
    .insert({ user_id: user.id, shop_name: shopName, category, answers, result })
    .select()
    .single()
  return error ? { error: '진단 결과를 저장하지 못했습니다. 네트워크를 확인하고 다시 시도해 주세요.' } : { data }
}

export async function listDiagnoses(user) {
  if (isDemoMode) return { data: ls.get(key(user.id), []) }
  const { data, error } = await supabase
    .from('diagnoses')
    .select('id, created_at, shop_name, category, result->total, result->grade')
    .order('created_at', { ascending: false })
  return error ? { error: '진단 목록을 불러오지 못했습니다.' } : { data: data.map((r) => ({ ...r, result: { total: r.total, grade: r.grade } })) }
}

export async function getDiagnosis(user, id) {
  if (isDemoMode) {
    const row = ls.get(key(user.id), []).find((r) => r.id === id)
    return row ? { data: row } : { error: 'notfound' }
  }
  const { data, error } = await supabase.from('diagnoses').select('*').eq('id', id).maybeSingle()
  if (error) return { error: '진단 결과를 불러오지 못했습니다.' }
  return data ? { data } : { error: 'notfound' }
}

export async function deleteDiagnosis(user, id) {
  if (isDemoMode) {
    ls.set(key(user.id), ls.get(key(user.id), []).filter((r) => r.id !== id))
    return { ok: true }
  }
  const { error } = await supabase.from('diagnoses').delete().eq('id', id)
  return error ? { error: '삭제하지 못했습니다.' } : { ok: true }
}

// 작성 중인 진단 임시 저장 (이 기기에만)
export const draft = {
  load: (user) => ls.get(`alfs_draft_${user.id}`),
  save: (user, v) => ls.set(`alfs_draft_${user.id}`, v),
  clear: (user) => ls.remove(`alfs_draft_${user.id}`),
}
