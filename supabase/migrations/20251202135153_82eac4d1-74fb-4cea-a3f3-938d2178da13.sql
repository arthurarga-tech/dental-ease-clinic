-- Drop existing secretaria policy and create a simpler one for debugging
DROP POLICY IF EXISTS "Secretaria can insert transactions" ON public.financial_transactions;

-- Create a simpler policy using direct subquery (not function)
CREATE POLICY "Secretaria can insert transactions"
ON public.financial_transactions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'secretaria'
  )
);