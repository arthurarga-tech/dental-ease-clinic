-- Add RLS policies for secretaria role to view appointments
CREATE POLICY "Secretaria can view appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'secretaria'::app_role));

-- Add RLS policies for secretaria role to view budgets
CREATE POLICY "Secretaria can view budgets"
ON public.budgets
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'secretaria'::app_role));

-- Add RLS policy for secretaria to insert appointments
CREATE POLICY "Secretaria can insert appointments"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'secretaria'::app_role));

-- Add RLS policy for secretaria to update appointments
CREATE POLICY "Secretaria can update appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'secretaria'::app_role))
WITH CHECK (has_role(auth.uid(), 'secretaria'::app_role));

-- Add RLS policy for secretaria to insert budgets
CREATE POLICY "Secretaria can insert budgets"
ON public.budgets
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'secretaria'::app_role));

-- Add RLS policy for secretaria to view patients
CREATE POLICY "Secretaria can view patients"
ON public.patients
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'secretaria'::app_role));

-- Add RLS policy for secretaria to insert patients
CREATE POLICY "Secretaria can insert patients"
ON public.patients
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'secretaria'::app_role));

-- Add RLS policy for secretaria to update patients
CREATE POLICY "Secretaria can update patients"
ON public.patients
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'secretaria'::app_role))
WITH CHECK (has_role(auth.uid(), 'secretaria'::app_role));