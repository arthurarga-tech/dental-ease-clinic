-- Add status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Ativo';

-- Add check constraint for valid status values
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_status_check 
CHECK (status IN ('Ativo', 'Inativo'));

-- Create policy for admins to update profile status
CREATE POLICY "Admins can update profile status"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));