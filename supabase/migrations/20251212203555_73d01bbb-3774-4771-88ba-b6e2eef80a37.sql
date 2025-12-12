-- Drop existing dentist policies for budgets that need to be replaced
DROP POLICY IF EXISTS "Dentists can view their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Dentists can insert their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Dentists can update their own budgets" ON public.budgets;

-- Create new policy: Dentists can view budgets for patients they have appointments with
CREATE POLICY "Dentists can view budgets for their patients" 
ON public.budgets 
FOR SELECT 
USING (
  (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'dentista'::app_role)) 
  AND status <> 'Concluído'
  AND patient_id IN (
    SELECT a.patient_id 
    FROM appointments a
    JOIN dentists d ON a.dentist_id = d.id
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
);

-- Dentists can insert budgets for patients they have appointments with
CREATE POLICY "Dentists can insert budgets for their patients" 
ON public.budgets 
FOR INSERT 
WITH CHECK (
  (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'dentista'::app_role)) 
  AND patient_id IN (
    SELECT a.patient_id 
    FROM appointments a
    JOIN dentists d ON a.dentist_id = d.id
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
);

-- Dentists can update budgets for patients they have appointments with (excluding completed)
CREATE POLICY "Dentists can update budgets for their patients" 
ON public.budgets 
FOR UPDATE 
USING (
  (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'dentista'::app_role)) 
  AND status <> 'Concluído'
  AND patient_id IN (
    SELECT a.patient_id 
    FROM appointments a
    JOIN dentists d ON a.dentist_id = d.id
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
)
WITH CHECK (
  (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'dentista'::app_role))
);

-- Drop existing dentist policies for medical_records
DROP POLICY IF EXISTS "Dentists can view medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Dentists can create medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Dentists can update medical records" ON public.medical_records;

-- Create new policy: Dentists can view medical records for patients they have appointments with
CREATE POLICY "Dentists can view medical records for their patients" 
ON public.medical_records 
FOR SELECT 
USING (
  (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'dentista'::app_role)) 
  AND patient_id IN (
    SELECT a.patient_id 
    FROM appointments a
    JOIN dentists d ON a.dentist_id = d.id
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
);

-- Dentists can create medical records for patients they have appointments with
CREATE POLICY "Dentists can create medical records for their patients" 
ON public.medical_records 
FOR INSERT 
WITH CHECK (
  (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'dentista'::app_role)) 
  AND patient_id IN (
    SELECT a.patient_id 
    FROM appointments a
    JOIN dentists d ON a.dentist_id = d.id
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
);

-- Dentists can update medical records for patients they have appointments with
CREATE POLICY "Dentists can update medical records for their patients" 
ON public.medical_records 
FOR UPDATE 
USING (
  (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'dentista'::app_role)) 
  AND patient_id IN (
    SELECT a.patient_id 
    FROM appointments a
    JOIN dentists d ON a.dentist_id = d.id
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
);

-- Also update patients visibility to match the same logic
DROP POLICY IF EXISTS "Dentistas can view patients with medical records" ON public.patients;
DROP POLICY IF EXISTS "Dentists can view patients" ON public.patients;
DROP POLICY IF EXISTS "Dentists can view patients with their budgets" ON public.patients;
DROP POLICY IF EXISTS "Dentists can view their appointment patients" ON public.patients;

-- Single unified policy: Dentists can view patients they have appointments with
CREATE POLICY "Dentists can view their appointment patients" 
ON public.patients 
FOR SELECT 
USING (
  (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'dentista'::app_role)) 
  AND id IN (
    SELECT a.patient_id 
    FROM appointments a
    JOIN dentists d ON a.dentist_id = d.id
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
);