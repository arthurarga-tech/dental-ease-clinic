-- Step 1: Add odontogram column first
ALTER TABLE medical_records 
ADD COLUMN IF NOT EXISTS odontogram JSONB DEFAULT '{}'::jsonb;

-- Step 2: Create medical_record_entries table for individual consultations
CREATE TABLE IF NOT EXISTS medical_record_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_record_id UUID NOT NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  procedure_type TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT NOT NULL,
  observations TEXT,
  status TEXT NOT NULL DEFAULT 'Concluído',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE medical_record_entries ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admin can manage medical record entries"
ON medical_record_entries
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_medical_record_entries_updated_at
  BEFORE UPDATE ON medical_record_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 3: Create a temp table with the first record ID for each patient
CREATE TEMP TABLE first_records AS
SELECT DISTINCT ON (patient_id) id as first_id, patient_id
FROM medical_records
ORDER BY patient_id, created_at ASC;

-- Step 4: Move ALL existing records to entries table
INSERT INTO medical_record_entries (medical_record_id, record_date, procedure_type, diagnosis, treatment, observations, status, created_at, updated_at)
SELECT 
  fr.first_id as medical_record_id,
  mr.record_date,
  mr.procedure_type,
  mr.diagnosis,
  mr.treatment,
  mr.observations,
  mr.status,
  mr.created_at,
  mr.updated_at
FROM medical_records mr
JOIN first_records fr ON mr.patient_id = fr.patient_id;

-- Step 5: Delete duplicate records, keeping only the first one per patient
DELETE FROM medical_records 
WHERE id NOT IN (SELECT first_id FROM first_records);

-- Step 6: Update remaining records to be general medical records
UPDATE medical_records 
SET 
  procedure_type = 'Prontuário Geral',
  diagnosis = 'Prontuário principal do paciente',
  treatment = 'Histórico médico completo',
  observations = 'Prontuário odontológico principal';

-- Step 7: Now add the unique constraint
ALTER TABLE medical_records 
ADD CONSTRAINT unique_patient_record UNIQUE (patient_id);