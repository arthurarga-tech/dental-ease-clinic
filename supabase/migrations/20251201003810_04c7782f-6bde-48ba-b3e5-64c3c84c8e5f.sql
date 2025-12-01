-- Fix RLS policy for dentists to view their own settlements
-- The previous policy was trying to access auth.users which causes permission errors
DROP POLICY IF EXISTS "Dentists can view their own settlements" ON dentist_settlements;

CREATE POLICY "Dentists can view their own settlements"
ON dentist_settlements
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'dentist'::app_role) 
  AND dentist_id IN (
    SELECT d.id
    FROM dentists d
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
);