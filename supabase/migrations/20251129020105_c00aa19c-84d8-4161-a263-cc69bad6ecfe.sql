-- Permitir dentistas verem pacientes que têm consultas agendadas com eles
CREATE POLICY "Dentists can view their appointment patients"
ON patients
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'dentista'::app_role) AND
  id IN (
    SELECT a.patient_id
    FROM appointments a
    INNER JOIN dentists d ON a.dentist_id = d.id
    INNER JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
);