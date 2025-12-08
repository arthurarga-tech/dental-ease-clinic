-- Add dentist_id column to medical_record_entries
ALTER TABLE public.medical_record_entries 
ADD COLUMN dentist_id uuid REFERENCES public.dentists(id);

-- Add index for performance
CREATE INDEX idx_medical_record_entries_dentist ON public.medical_record_entries(dentist_id);