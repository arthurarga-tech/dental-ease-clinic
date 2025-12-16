-- Create SELECT policies for visualizador role on all main tables

-- appointments
CREATE POLICY "Visualizador can view appointments" 
ON public.appointments 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'));

-- budgets
CREATE POLICY "Visualizador can view budgets" 
ON public.budgets 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'));

-- card_fees
CREATE POLICY "Visualizador can view card fees" 
ON public.card_fees 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'));

-- dentist_availability
CREATE POLICY "Visualizador can view dentist availability" 
ON public.dentist_availability 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'));

-- dentist_settlements
CREATE POLICY "Visualizador can view dentist settlements" 
ON public.dentist_settlements 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'));

-- dentist_specializations
CREATE POLICY "Visualizador can view dentist specializations" 
ON public.dentist_specializations 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'));

-- dentists
CREATE POLICY "Visualizador can view dentists" 
ON public.dentists 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'));

-- financial_categories
CREATE POLICY "Visualizador can view financial categories" 
ON public.financial_categories 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'));

-- financial_transactions
CREATE POLICY "Visualizador can view financial transactions" 
ON public.financial_transactions 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'));

-- medical_record_entries
CREATE POLICY "Visualizador can view medical record entries" 
ON public.medical_record_entries 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'));

-- medical_records
CREATE POLICY "Visualizador can view medical records" 
ON public.medical_records 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'));

-- patients
CREATE POLICY "Visualizador can view patients" 
ON public.patients 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'));

-- payment_methods
CREATE POLICY "Visualizador can view payment methods" 
ON public.payment_methods 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'));

-- profiles
CREATE POLICY "Visualizador can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'));

-- specializations
CREATE POLICY "Visualizador can view specializations" 
ON public.specializations 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'));

-- user_roles
CREATE POLICY "Visualizador can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'visualizador'));