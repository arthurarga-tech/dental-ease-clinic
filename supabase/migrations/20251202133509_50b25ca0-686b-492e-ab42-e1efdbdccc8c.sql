-- Allow secretaria role to INSERT financial transactions
CREATE POLICY "Secretarias can insert financial transactions"
ON public.financial_transactions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'secretaria'
  )
);