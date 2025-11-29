-- Atualizar políticas RLS para dentistas verem apenas suas próprias consultas
DROP POLICY IF EXISTS "Dentists can view appointments" ON appointments;
DROP POLICY IF EXISTS "Dentists can update appointments" ON appointments;

CREATE POLICY "Dentists can view their own appointments"
ON appointments
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'dentista'::app_role) AND
  dentist_id IN (
    SELECT d.id 
    FROM dentists d
    INNER JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
);

CREATE POLICY "Dentists can update their own appointments"
ON appointments
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'dentista'::app_role) AND
  dentist_id IN (
    SELECT d.id 
    FROM dentists d
    INNER JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
)
WITH CHECK (
  has_role(auth.uid(), 'dentista'::app_role) AND
  dentist_id IN (
    SELECT d.id 
    FROM dentists d
    INNER JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
);

-- Permitir dentistas verem informações de dentistas (para o perfil)
DROP POLICY IF EXISTS "Dentists can view dentists" ON dentists;

CREATE POLICY "Dentists can view their own profile"
ON dentists
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'dentista'::app_role) AND
  email IN (
    SELECT p.email 
    FROM profiles p
    WHERE p.id = auth.uid()
  )
);

-- Permitir dentistas verem todos os dentistas para a agenda
CREATE POLICY "Authenticated can view all dentists"
ON dentists
FOR SELECT
TO authenticated
USING (true);