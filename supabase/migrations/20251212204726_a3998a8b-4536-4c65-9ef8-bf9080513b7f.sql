-- Allow dentists to view their own financial transactions for commission calculation
CREATE POLICY "Dentists can view their own transactions" 
ON public.financial_transactions 
FOR SELECT 
USING (
  (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'dentista'::app_role)) 
  AND dentist_id IN (
    SELECT d.id 
    FROM dentists d
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
);