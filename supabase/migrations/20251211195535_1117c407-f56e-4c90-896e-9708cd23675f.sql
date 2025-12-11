-- Allow dentists to view patients for whom they have created budgets
CREATE POLICY "Dentists can view patients with their budgets"
ON patients
FOR SELECT
USING (
  (has_role(auth.uid(), 'dentista'::app_role) OR has_role(auth.uid(), 'dentist'::app_role))
  AND id IN (
    SELECT b.patient_id 
    FROM budgets b
    JOIN dentists d ON b.dentist_id = d.id
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
);