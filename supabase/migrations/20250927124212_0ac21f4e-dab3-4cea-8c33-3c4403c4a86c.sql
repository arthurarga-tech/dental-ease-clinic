-- Create medical_records table for prontuário functionality
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  procedure_type TEXT NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT NOT NULL,
  observations TEXT,
  status TEXT NOT NULL DEFAULT 'Concluído',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Create policy for medical records access
CREATE POLICY "Allow all operations on medical_records" 
ON public.medical_records 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add foreign key constraint to patients table
ALTER TABLE public.medical_records 
ADD CONSTRAINT fk_medical_records_patient 
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_medical_records_updated_at
BEFORE UPDATE ON public.medical_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance on patient queries
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_medical_records_date ON public.medical_records(record_date);