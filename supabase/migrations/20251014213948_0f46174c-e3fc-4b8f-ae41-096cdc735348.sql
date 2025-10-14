-- Create budgets table
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  dentist_id UUID REFERENCES public.dentists(id) ON DELETE SET NULL,
  budget_date DATE NOT NULL DEFAULT CURRENT_DATE,
  procedures TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  final_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente',
  valid_until DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create policies for budgets
CREATE POLICY "Admin can manage budgets"
ON public.budgets
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();