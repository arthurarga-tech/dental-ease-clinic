-- Add guardian_name column to patients table for minors
ALTER TABLE patients
ADD COLUMN guardian_name TEXT;

COMMENT ON COLUMN patients.guardian_name IS 'Nome do responsável para pacientes menores de idade';