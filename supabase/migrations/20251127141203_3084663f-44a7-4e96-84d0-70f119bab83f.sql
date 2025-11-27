-- Add guardian_relationship column to patients table
ALTER TABLE patients
ADD COLUMN guardian_relationship TEXT;

COMMENT ON COLUMN patients.guardian_relationship IS 'Parentesco do responsável com o paciente (pai, mãe, avô, etc)';