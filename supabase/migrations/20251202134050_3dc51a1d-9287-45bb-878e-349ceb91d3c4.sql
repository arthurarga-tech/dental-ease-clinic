-- Create PERMISSIVE INSERT policy for secretaria
CREATE POLICY "Secretaria can insert transactions"
ON public.financial_transactions
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'secretaria'::app_role));