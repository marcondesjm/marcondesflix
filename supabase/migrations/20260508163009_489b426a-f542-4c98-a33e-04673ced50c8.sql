
-- Revoke execute on SECURITY DEFINER fns from public/anon/authenticated; only used internally by RLS/triggers
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Tighten storage listing for course-covers bucket: only allow specific object reads, not folder listing
DROP POLICY IF EXISTS "Public read course covers" ON storage.objects;
CREATE POLICY "Public read individual course covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-covers' AND name IS NOT NULL);
