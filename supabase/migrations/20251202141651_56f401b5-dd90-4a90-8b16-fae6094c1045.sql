-- Drop existing dentist policy for budgets
DROP POLICY IF EXISTS "Dentists can manage budgets" ON public.budgets;

-- Create more restrictive policies for dentists
-- Dentists can only view their own budgets
CREATE POLICY "Dentists can view their own budgets" 
ON public.budgets 
FOR SELECT 
TO authenticated
USING (
  (has_role(auth.uid(), 'dentist') OR has_role(auth.uid(), 'dentista'))
  AND dentist_id IN (
    SELECT d.id 
    FROM dentists d 
    JOIN profiles p ON d.email = p.email 
    WHERE p.id = auth.uid()
  )
);

-- Dentists can insert budgets only for themselves
CREATE POLICY "Dentists can insert their own budgets" 
ON public.budgets 
FOR INSERT 
TO authenticated
WITH CHECK (
  (has_role(auth.uid(), 'dentist') OR has_role(auth.uid(), 'dentista'))
  AND dentist_id IN (
    SELECT d.id 
    FROM dentists d 
    JOIN profiles p ON d.email = p.email 
    WHERE p.id = auth.uid()
  )
);

-- Dentists can update their own budgets
CREATE POLICY "Dentists can update their own budgets" 
ON public.budgets 
FOR UPDATE 
TO authenticated
USING (
  (has_role(auth.uid(), 'dentist') OR has_role(auth.uid(), 'dentista'))
  AND dentist_id IN (
    SELECT d.id 
    FROM dentists d 
    JOIN profiles p ON d.email = p.email 
    WHERE p.id = auth.uid()
  )
)
WITH CHECK (
  (has_role(auth.uid(), 'dentist') OR has_role(auth.uid(), 'dentista'))
  AND dentist_id IN (
    SELECT d.id 
    FROM dentists d 
    JOIN profiles p ON d.email = p.email 
    WHERE p.id = auth.uid()
  )
);