-- Add UPDATE policy for secretaria on budgets
CREATE POLICY "Secretaria can update budgets"
ON budgets
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'secretaria'::app_role))
WITH CHECK (has_role(auth.uid(), 'secretaria'::app_role));