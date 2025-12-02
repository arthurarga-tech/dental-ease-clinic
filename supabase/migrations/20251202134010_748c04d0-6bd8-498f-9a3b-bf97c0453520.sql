-- Drop existing restrictive policies for secretaria on financial_transactions
DROP POLICY IF EXISTS "Secretaria can insert transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Secretarias can insert financial transactions" ON public.financial_transactions;

-- Create a PERMISSIVE policy for secretaria to insert financial transactions
CREATE POLICY "Secretaria can insert financial transactions"
ON public.financial_transactions
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'secretaria'::app_role)
);