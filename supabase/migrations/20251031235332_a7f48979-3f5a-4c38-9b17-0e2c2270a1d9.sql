-- Update the handle_new_user function to automatically assign super_admin role to admin@gmail.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, nama, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email)
  );
  
  -- Automatically assign super_admin role to admin@gmail.com
  IF NEW.email = 'admin@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin');
  END IF;
  
  RETURN NEW;
END;
$$;