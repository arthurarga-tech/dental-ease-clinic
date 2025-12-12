-- Drop existing dentist policies on budgets
DROP POLICY IF EXISTS "Dentists can view budgets for their patients" ON budgets;
DROP POLICY IF EXISTS "Dentists can update budgets for their patients" ON budgets;
DROP POLICY IF EXISTS "Dentists can insert budgets for their patients" ON budgets;

-- Recreate SELECT policy: Dentists can view budgets for patients they have appointments with
CREATE POLICY "Dentists can view budgets for their patients" ON budgets
FOR SELECT USING (
  (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'dentista'::app_role)) 
  AND (status <> 'Concluído'::text) 
  AND (patient_id IN (
    SELECT a.patient_id 
    FROM appointments a
    JOIN dentists d ON a.dentist_id = d.id
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  ))
);

-- Recreate UPDATE policy: Dentists can update budgets for patients they have appointments with
CREATE POLICY "Dentists can update budgets for their patients" ON budgets
FOR UPDATE USING (
  (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'dentista'::app_role)) 
  AND (status <> 'Concluído'::text) 
  AND (patient_id IN (
    SELECT a.patient_id 
    FROM appointments a
    JOIN dentists d ON a.dentist_id = d.id
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  ))
) WITH CHECK (
  has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'dentista'::app_role)
);

-- Recreate INSERT policy: Dentists can only create budgets where they are the responsible dentist
CREATE POLICY "Dentists can insert budgets for their patients" ON budgets
FOR INSERT WITH CHECK (
  (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'dentista'::app_role)) 
  AND (dentist_id IN (
    SELECT d.id 
    FROM dentists d
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  ))
);