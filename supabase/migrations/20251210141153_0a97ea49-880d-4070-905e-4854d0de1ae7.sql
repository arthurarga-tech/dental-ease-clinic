-- Update dentist budget policies to exclude "Concluído" status

-- Drop existing dentist budget policies
DROP POLICY IF EXISTS "Dentists can view their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Dentists can insert their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Dentists can update their own budgets" ON public.budgets;

-- Recreate policies excluding "Concluído" status for viewing

-- Dentists can view budgets where they are the dentist and status is NOT "Concluído"
CREATE POLICY "Dentists can view their own budgets"
ON public.budgets
FOR SELECT
USING (
  (has_role(auth.uid(), 'dentist') OR has_role(auth.uid(), 'dentista'))
  AND dentist_id IN (
    SELECT d.id FROM dentists d
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
  AND status != 'Concluído'
);

-- Dentists can insert budgets
CREATE POLICY "Dentists can insert their own budgets"
ON public.budgets
FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'dentist') OR has_role(auth.uid(), 'dentista'))
  AND dentist_id IN (
    SELECT d.id FROM dentists d
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
);

-- Dentists can update their own budgets (except Concluído)
CREATE POLICY "Dentists can update their own budgets"
ON public.budgets
FOR UPDATE
USING (
  (has_role(auth.uid(), 'dentist') OR has_role(auth.uid(), 'dentista'))
  AND dentist_id IN (
    SELECT d.id FROM dentists d
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
  AND status != 'Concluído'
)
WITH CHECK (
  (has_role(auth.uid(), 'dentist') OR has_role(auth.uid(), 'dentista'))
  AND dentist_id IN (
    SELECT d.id FROM dentists d
    JOIN profiles p ON d.email = p.email
    WHERE p.id = auth.uid()
  )
);