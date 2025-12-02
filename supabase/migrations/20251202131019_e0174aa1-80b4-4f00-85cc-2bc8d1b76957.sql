-- Drop existing policies for medical_records
DROP POLICY IF EXISTS "Dentists can create medical records" ON medical_records;
DROP POLICY IF EXISTS "Dentists can view medical records" ON medical_records;
DROP POLICY IF EXISTS "Dentists can update medical records" ON medical_records;

-- Recreate policies to check both 'dentist' and 'dentista' roles
CREATE POLICY "Dentists can create medical records"
ON medical_records
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'dentist'::app_role) 
  OR has_role(auth.uid(), 'dentista'::app_role)
);

CREATE POLICY "Dentists can view medical records"
ON medical_records
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'dentist'::app_role) 
  OR has_role(auth.uid(), 'dentista'::app_role)
);

CREATE POLICY "Dentists can update medical records"
ON medical_records
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'dentist'::app_role) 
  OR has_role(auth.uid(), 'dentista'::app_role)
);

-- Also fix medical_record_entries policies
DROP POLICY IF EXISTS "Dentists can create medical record entries" ON medical_record_entries;
DROP POLICY IF EXISTS "Dentists can view medical record entries" ON medical_record_entries;
DROP POLICY IF EXISTS "Dentists can update medical record entries" ON medical_record_entries;

CREATE POLICY "Dentists can create medical record entries"
ON medical_record_entries
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'dentist'::app_role) 
  OR has_role(auth.uid(), 'dentista'::app_role)
);

CREATE POLICY "Dentists can view medical record entries"
ON medical_record_entries
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'dentist'::app_role) 
  OR has_role(auth.uid(), 'dentista'::app_role)
);

CREATE POLICY "Dentists can update medical record entries"
ON medical_record_entries
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'dentist'::app_role) 
  OR has_role(auth.uid(), 'dentista'::app_role)
);