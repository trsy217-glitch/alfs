-- 알프스 '우리가게 진단' 저장 테이블
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.

create table if not exists public.diagnoses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  created_at  timestamptz not null default now(),
  shop_name   text,
  category    text,
  answers     jsonb not null,
  result      jsonb not null
);

create index if not exists diagnoses_user_created_idx on public.diagnoses (user_id, created_at desc);

-- 행 단위 보안: 진단한 본인만 보고, 쓰고, 지울 수 있습니다.
alter table public.diagnoses enable row level security;

drop policy if exists "본인 진단 조회" on public.diagnoses;
create policy "본인 진단 조회" on public.diagnoses
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "본인 진단 저장" on public.diagnoses;
create policy "본인 진단 저장" on public.diagnoses
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "본인 진단 삭제" on public.diagnoses;
create policy "본인 진단 삭제" on public.diagnoses
  for delete to authenticated using (user_id = auth.uid());

-- 수정(update) 정책은 만들지 않습니다. 진단은 한 번 저장되면 기록으로 남고, 다시 하려면 새 진단을 만듭니다.
