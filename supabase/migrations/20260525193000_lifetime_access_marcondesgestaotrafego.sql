WITH target_user AS (
  SELECT id
  FROM auth.users
  WHERE email = 'marcondesgestaotrafego@gmail.com'
),
published_courses AS (
  SELECT id
  FROM public.courses
  WHERE is_published = true
)
INSERT INTO public.enrollments (user_id, course_id)
SELECT target_user.id, published_courses.id
FROM target_user
CROSS JOIN published_courses
ON CONFLICT (user_id, course_id) DO NOTHING;

WITH target_user AS (
  SELECT id
  FROM auth.users
  WHERE email = 'marcondesgestaotrafego@gmail.com'
),
published_courses AS (
  SELECT id
  FROM public.courses
  WHERE is_published = true
)
INSERT INTO public.sales (user_id, course_id, amount, status)
SELECT target_user.id, published_courses.id, 0, 'paid'
FROM target_user
CROSS JOIN published_courses;
