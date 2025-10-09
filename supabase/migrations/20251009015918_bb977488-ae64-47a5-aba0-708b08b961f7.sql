-- Drop all existing public "Allow all operations" policies
DROP POLICY IF EXISTS "Allow all operations on patients" ON public.patients;
DROP POLICY IF EXISTS "Allow all operations on medical_records" ON public.medical_records;
DROP POLICY IF EXISTS "Allow all operations on financial_transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Allow all operations on appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow all operations on dentists" ON public.dentists;
DROP POLICY IF EXISTS "Allow all operations on dentist_availability" ON public.dentist_availability;
DROP POLICY IF EXISTS "Allow all operations on dentist_specializations" ON public.dentist_specializations;
DROP POLICY IF EXISTS "Allow all operations on specializations" ON public.specializations;
DROP POLICY IF EXISTS "Allow all operations on financial_categories" ON public.financial_categories;
DROP POLICY IF EXISTS "Allow all operations on payment_methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Allow all operations on partners" ON public.partners;
DROP POLICY IF EXISTS "Allow all operations on transaction_partners" ON public.transaction_partners;

-- PATIENTS TABLE: Admin, Partners, Dentists, Secretaries can access
CREATE POLICY "Authenticated staff can view patients"
ON public.patients FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'partner') OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'dentist') OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'secretary')
);

CREATE POLICY "Authenticated staff can insert patients"
ON public.patients FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'secretary') OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'dentist')
);

CREATE POLICY "Authenticated staff can update patients"
ON public.patients FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'secretary') OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'dentist')
);

CREATE POLICY "Admin and secretary can delete patients"
ON public.patients FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'secretary')
);

-- MEDICAL RECORDS TABLE: Admin, Dentists, Secretaries only (NO partners)
CREATE POLICY "Healthcare staff can view medical records"
ON public.medical_records FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'dentist') OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'secretary')
);

CREATE POLICY "Healthcare staff can insert medical records"
ON public.medical_records FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'dentist') OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'secretary')
);

CREATE POLICY "Healthcare staff can update medical records"
ON public.medical_records FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'dentist') OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'secretary')
);

CREATE POLICY "Admin can delete medical records"
ON public.medical_records FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- FINANCIAL TRANSACTIONS TABLE: Admin and Partners full access, Secretaries limited
CREATE POLICY "Financial staff can view transactions"
ON public.financial_transactions FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'partner') OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'secretary')
);

CREATE POLICY "Financial staff can insert transactions"
ON public.financial_transactions FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'partner') OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'secretary')
);

CREATE POLICY "Financial staff can update transactions"
ON public.financial_transactions FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'partner') OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'secretary')
);

CREATE POLICY "Admin and partners can delete transactions"
ON public.financial_transactions FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'partner')
);

-- APPOINTMENTS TABLE: All authenticated healthcare staff
CREATE POLICY "Authenticated staff can view appointments"
ON public.appointments FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text IN ('partner', 'dentist', 'secretary'))
);

CREATE POLICY "Authenticated staff can insert appointments"
ON public.appointments FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text IN ('secretary', 'dentist'))
);

CREATE POLICY "Authenticated staff can update appointments"
ON public.appointments FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text IN ('secretary', 'dentist'))
);

CREATE POLICY "Admin and secretary can delete appointments"
ON public.appointments FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'secretary')
);

-- DENTISTS TABLE: Admin and Secretaries manage, Dentists view own profile
CREATE POLICY "Staff can view dentists"
ON public.dentists FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text IN ('secretary', 'dentist'))
);

CREATE POLICY "Admin and secretary can insert dentists"
ON public.dentists FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'secretary')
);

CREATE POLICY "Admin and secretary can update dentists"
ON public.dentists FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'secretary')
);

CREATE POLICY "Admin can delete dentists"
ON public.dentists FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- DENTIST AVAILABILITY: Same as dentists table
CREATE POLICY "Staff can view dentist availability"
ON public.dentist_availability FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text IN ('secretary', 'dentist'))
);

CREATE POLICY "Admin and secretary can manage dentist availability"
ON public.dentist_availability FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'secretary')
);

-- DENTIST SPECIALIZATIONS: Same as dentists table
CREATE POLICY "Staff can view dentist specializations"
ON public.dentist_specializations FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text IN ('secretary', 'dentist'))
);

CREATE POLICY "Admin and secretary can manage dentist specializations"
ON public.dentist_specializations FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'secretary')
);

-- SPECIALIZATIONS: Read-only for authenticated, manage for admin
CREATE POLICY "Authenticated users can view specializations"
ON public.specializations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can manage specializations"
ON public.specializations FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- FINANCIAL CATEGORIES: Read-only for authenticated, manage for admin
CREATE POLICY "Authenticated users can view financial categories"
ON public.financial_categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can manage financial categories"
ON public.financial_categories FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- PAYMENT METHODS: Read-only for authenticated, manage for admin
CREATE POLICY "Authenticated users can view payment methods"
ON public.payment_methods FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can manage payment methods"
ON public.payment_methods FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- PARTNERS: Admin and partners can view, admin can manage
CREATE POLICY "Admin and partners can view partners"
ON public.partners FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'partner')
);

CREATE POLICY "Admin can manage partners"
ON public.partners FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- TRANSACTION PARTNERS: Same as financial transactions
CREATE POLICY "Financial staff can view transaction partners"
ON public.transaction_partners FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text IN ('partner', 'secretary'))
);

CREATE POLICY "Admin and partners can manage transaction partners"
ON public.transaction_partners FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role::text = 'partner')
);