-- Add policy for dentists to view patients that have medical records they can access
CREATE POLICY "Dentistas can view patients with medical records" 
ON public.patients 
FOR SELECT 
USING (
  (has_role(auth.uid(), 'dentista'::app_role) OR has_role(auth.uid(), 'dentist'::app_role)) 
  AND id IN (
    SELECT patient_id FROM public.medical_records
  )
);

-- Add policy for secretaria to view medical records (read-only for prontuario page)
CREATE POLICY "Secretaria can view medical records" 
ON public.medical_records 
FOR SELECT 
USING (has_role(auth.uid(), 'secretaria'::app_role));

-- Add policy for secretaria to view medical record entries
CREATE POLICY "Secretaria can view medical record entries" 
ON public.medical_record_entries 
FOR SELECT 
USING (has_role(auth.uid(), 'secretaria'::app_role));