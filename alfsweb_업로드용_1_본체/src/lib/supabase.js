import { createClient } from '@supabase/supabase-js'

// .env 에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 를 넣으면 실제 회원·저장 모드로 동작합니다.
// 비어 있으면 '체험 모드'(이 브라우저에만 저장)로 동작합니다.
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null
export const isDemoMode = !supabase
