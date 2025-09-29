-- Create dentist availability table for working days
CREATE TABLE public.dentist_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dentist_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0 = Domingo, 1 = Segunda, ... 6 = Sábado
  start_time TIME NOT NULL DEFAULT '08:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dentist_id, day_of_week)
);

-- Create financial categories table
CREATE TABLE public.financial_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL, -- 'Receita' ou 'Despesa'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment methods table
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial transactions table
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- 'Receita' ou 'Despesa'
  patient_id UUID,
  appointment_id UUID,
  category_id UUID NOT NULL,
  payment_method_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'Pendente', -- 'Pendente', 'Pago', 'Vencido', 'Cancelado'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dentist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on dentist_availability" 
ON public.dentist_availability 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on financial_categories" 
ON public.financial_categories 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on payment_methods" 
ON public.payment_methods 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on financial_transactions" 
ON public.financial_transactions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add foreign key constraints
ALTER TABLE public.dentist_availability 
ADD CONSTRAINT fk_dentist_availability_dentist 
FOREIGN KEY (dentist_id) REFERENCES public.dentists(id) ON DELETE CASCADE;

ALTER TABLE public.financial_transactions 
ADD CONSTRAINT fk_financial_transactions_patient 
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE SET NULL;

ALTER TABLE public.financial_transactions 
ADD CONSTRAINT fk_financial_transactions_appointment 
FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;

ALTER TABLE public.financial_transactions 
ADD CONSTRAINT fk_financial_transactions_category 
FOREIGN KEY (category_id) REFERENCES public.financial_categories(id) ON DELETE RESTRICT;

ALTER TABLE public.financial_transactions 
ADD CONSTRAINT fk_financial_transactions_payment_method 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON DELETE SET NULL;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_financial_transactions_updated_at
BEFORE UPDATE ON public.financial_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default financial categories
INSERT INTO public.financial_categories (name, type, description) VALUES 
('Consulta', 'Receita', 'Consultas odontológicas'),
('Procedimento', 'Receita', 'Procedimentos diversos'),
('Tratamento de Canal', 'Receita', 'Endodontia'),
('Limpeza', 'Receita', 'Limpeza e profilaxia'),
('Ortodontia', 'Receita', 'Tratamentos ortodônticos'),
('Implante', 'Receita', 'Implantes dentários'),
('Prótese', 'Receita', 'Próteses dentárias'),
('Clareamento', 'Receita', 'Tratamento de clareamento'),
('Materiais', 'Despesa', 'Compra de materiais odontológicos'),
('Equipamentos', 'Despesa', 'Compra e manutenção de equipamentos'),
('Salários', 'Despesa', 'Pagamento de funcionários'),
('Aluguel', 'Despesa', 'Aluguel do consultório'),
('Energia', 'Despesa', 'Conta de energia elétrica'),
('Água', 'Despesa', 'Conta de água'),
('Internet', 'Despesa', 'Serviços de internet'),
('Marketing', 'Despesa', 'Publicidade e marketing'),
('Laboratório', 'Despesa', 'Serviços de laboratório'),
('Impostos', 'Despesa', 'Impostos e taxas');

-- Insert default payment methods
INSERT INTO public.payment_methods (name) VALUES 
('Dinheiro'),
('Cartão de Débito'),
('Cartão de Crédito'),
('PIX'),
('Transferência Bancária'),
('Boleto'),
('Cheque');

-- Create indexes for better performance
CREATE INDEX idx_dentist_availability_dentist_id ON public.dentist_availability(dentist_id);
CREATE INDEX idx_dentist_availability_day_of_week ON public.dentist_availability(day_of_week);
CREATE INDEX idx_financial_transactions_type ON public.financial_transactions(type);
CREATE INDEX idx_financial_transactions_status ON public.financial_transactions(status);
CREATE INDEX idx_financial_transactions_patient_id ON public.financial_transactions(patient_id);
CREATE INDEX idx_financial_transactions_date ON public.financial_transactions(transaction_date);
CREATE INDEX idx_financial_transactions_category_id ON public.financial_transactions(category_id);