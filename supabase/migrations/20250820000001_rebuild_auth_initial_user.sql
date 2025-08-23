-- Migration to remove all existing users and create initial admin user

DO $$
DECLARE
  initial_user_id UUID;
BEGIN
  -- Delete all existing user profiles and users
  DELETE FROM public.user_profiles;
  DELETE FROM auth.users;

  -- Insert initial user into auth.users
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, raw_app_meta_data, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'leadond@gmail.com',
    crypt('TempPass123!', gen_salt('bf')),
    NOW(),
    '{"full_name": "Dev App Hero"}'::jsonb,
    '{"provider": "email"}'::jsonb,
    NOW(),
    NOW()
  )
  RETURNING id INTO initial_user_id;

  -- Insert initial user profile
  INSERT INTO public.user_profiles (id, email, full_name, company_name, role, status, provider, force_password_change, created_at, updated_at)
  VALUES (
    initial_user_id,
    'leadond@gmail.com',
    'Dev App Hero',
    'Dev App Hero',
    'global_admin',
    'active',
    'email',
    TRUE,
    NOW(),
    NOW()
  );
END;
$$ LANGUAGE plpgsql;