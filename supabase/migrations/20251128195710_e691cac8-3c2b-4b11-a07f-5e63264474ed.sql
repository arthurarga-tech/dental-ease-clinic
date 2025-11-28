-- Permitir secretárias criar transações financeiras (apenas INSERT)
CREATE POLICY "Secretaria can insert transactions"
ON public.financial_transactions
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'secretaria'::app_role));

-- Permitir dentistas gerenciar orçamentos
CREATE POLICY "Dentists can manage budgets"
ON public.budgets
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'dentista'::app_role))
WITH CHECK (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'dentista'::app_role));