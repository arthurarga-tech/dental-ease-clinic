-- Add photo_url column to patients table
ALTER TABLE public.patients ADD COLUMN photo_url TEXT;

-- Create storage bucket for patient photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-photos', 'patient-photos', true);

-- Storage policies for patient photos
CREATE POLICY "Anyone can view patient photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'patient-photos');

CREATE POLICY "Authenticated users can upload patient photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'patient-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update patient photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'patient-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete patient photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'patient-photos' AND auth.role() = 'authenticated');