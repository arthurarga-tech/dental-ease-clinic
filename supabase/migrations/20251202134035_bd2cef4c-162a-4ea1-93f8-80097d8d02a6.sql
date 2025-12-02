-- Drop the restrictive admin policy and recreate as permissive
DROP POLICY IF EXISTS "Admin can manage transactions" ON public.financial_transactions;

-- Create PERMISSIVE policies for admin
CREATE POLICY "Admin can view transactions"
ON public.financial_transactions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can insert transactions"
ON public.financial_transactions
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update transactions"
ON public.financial_transactions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete transactions"
ON public.financial_transactions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Also drop and recreate the secretaria policy to ensure it's permissive
DROP POLICY IF EXISTS "Secretaria can insert financial transactions" ON public.financial_transactions;