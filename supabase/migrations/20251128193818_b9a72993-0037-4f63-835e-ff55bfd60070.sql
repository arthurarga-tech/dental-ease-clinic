-- Add admin role for existing users without roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles);