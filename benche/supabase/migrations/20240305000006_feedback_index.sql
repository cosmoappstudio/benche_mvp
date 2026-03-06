-- Edge Function geçmiş feedback çekerken user_id + created_at ile sıralıyor
create index if not exists idx_feedback_user_created
on public.feedback (user_id, created_at desc);
