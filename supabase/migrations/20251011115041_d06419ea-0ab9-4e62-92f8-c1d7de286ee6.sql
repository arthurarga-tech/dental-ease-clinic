-- Drop ALL existing policies on all tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- PATIENTS TABLE: Admin only
CREATE POLICY "Admin can manage patients"
ON public.patients FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- MEDICAL RECORDS TABLE: Admin only
CREATE POLICY "Admin can manage medical records"
ON public.medical_records FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- FINANCIAL TRANSACTIONS TABLE: Admin only
CREATE POLICY "Admin can manage transactions"
ON public.financial_transactions FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- APPOINTMENTS TABLE: Admin only
CREATE POLICY "Admin can manage appointments"
ON public.appointments FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- DENTISTS TABLE: Admin only
CREATE POLICY "Admin can manage dentists"
ON public.dentists FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- DENTIST AVAILABILITY: Admin only
CREATE POLICY "Admin can manage dentist availability"
ON public.dentist_availability FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- DENTIST SPECIALIZATIONS: Admin only
CREATE POLICY "Admin can manage dentist specializations"
ON public.dentist_specializations FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- SPECIALIZATIONS: Read for authenticated, manage for admin
CREATE POLICY "Authenticated can view specializations"
ON public.specializations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can insert specializations"
ON public.specializations FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update specializations"
ON public.specializations FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete specializations"
ON public.specializations FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- FINANCIAL CATEGORIES: Read for authenticated, manage for admin
CREATE POLICY "Authenticated can view categories"
ON public.financial_categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can insert categories"
ON public.financial_categories FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update categories"
ON public.financial_categories FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete categories"
ON public.financial_categories FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- PAYMENT METHODS: Read for authenticated, manage for admin
CREATE POLICY "Authenticated can view payment methods"
ON public.payment_methods FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can insert payment methods"
ON public.payment_methods FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can update payment methods"
ON public.payment_methods FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin can delete payment methods"
ON public.payment_methods FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- PARTNERS: Admin only
CREATE POLICY "Admin can manage partners"
ON public.partners FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- TRANSACTION PARTNERS: Admin only
CREATE POLICY "Admin can manage transaction partners"
ON public.transaction_partners FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));