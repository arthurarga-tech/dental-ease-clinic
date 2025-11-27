-- Fix RLS policy causing permission error by referencing auth.users
DROP POLICY IF EXISTS "Dentists can update appointments" ON public.appointments;

CREATE POLICY "Dentists can update appointments"
ON public.appointments
FOR UPDATE
USING (has_role(auth.uid(), 'dentist'::app_role))
WITH CHECK (has_role(auth.uid(), 'dentist'::app_role));