-- Create policies for dentists to view their own data
-- Dentists can view all patients (needed for appointments and medical records)
CREATE POLICY "Dentists can view patients"
ON public.patients
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'dentist'::app_role));

-- Dentists can view appointments
CREATE POLICY "Dentists can view appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'dentist'::app_role)
);

-- Dentists can update appointments assigned to them
CREATE POLICY "Dentists can update appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'dentist'::app_role) AND
  dentist_id IN (
    SELECT id FROM public.dentists WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Dentists can view medical records
CREATE POLICY "Dentists can view medical records"
ON public.medical_records
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'dentist'::app_role));

-- Dentists can create medical records
CREATE POLICY "Dentists can create medical records"
ON public.medical_records
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'dentist'::app_role));

-- Dentists can update medical records
CREATE POLICY "Dentists can update medical records"
ON public.medical_records
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'dentist'::app_role));

-- Dentists can view medical record entries
CREATE POLICY "Dentists can view medical record entries"
ON public.medical_record_entries
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'dentist'::app_role));

-- Dentists can create medical record entries
CREATE POLICY "Dentists can create medical record entries"
ON public.medical_record_entries
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'dentist'::app_role));

-- Dentists can update medical record entries
CREATE POLICY "Dentists can update medical record entries"
ON public.medical_record_entries
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'dentist'::app_role));

-- Dentists can view dentists table (to see their colleagues)
CREATE POLICY "Dentists can view dentists"
ON public.dentists
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'dentist'::app_role));