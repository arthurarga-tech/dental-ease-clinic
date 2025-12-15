-- Fix dentist email matching in RLS policies (case/whitespace-insensitive)

-- financial_transactions: dentists can view their own transactions
DROP POLICY IF EXISTS "Dentists can view their own transactions" ON public.financial_transactions;
CREATE POLICY "Dentists can view their own transactions"
ON public.financial_transactions
FOR SELECT
TO authenticated
USING (
  (
    public.has_role(auth.uid(), 'dentist'::public.app_role)
    OR public.has_role(auth.uid(), 'dentista'::public.app_role)
  )
  AND (
    dentist_id IN (
      SELECT d.id
      FROM public.dentists d
      JOIN public.profiles p
        ON lower(trim(coalesce(d.email, ''))) = lower(trim(coalesce(p.email, '')))
      WHERE p.id = auth.uid()
    )
  )
);

-- dentist_settlements: dentists can view their own settlements
DROP POLICY IF EXISTS "Dentists can view their own settlements" ON public.dentist_settlements;
CREATE POLICY "Dentists can view their own settlements"
ON public.dentist_settlements
FOR SELECT
TO authenticated
USING (
  (
    public.has_role(auth.uid(), 'dentist'::public.app_role)
    OR public.has_role(auth.uid(), 'dentista'::public.app_role)
  )
  AND (
    dentist_id IN (
      SELECT d.id
      FROM public.dentists d
      JOIN public.profiles p
        ON lower(trim(coalesce(d.email, ''))) = lower(trim(coalesce(p.email, '')))
      WHERE p.id = auth.uid()
    )
  )
);
