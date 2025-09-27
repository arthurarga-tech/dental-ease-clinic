-- Create dentists table
CREATE TABLE public.dentists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT NOT NULL,
  cro TEXT NOT NULL UNIQUE, -- Registro no Conselho Regional de Odontologia
  birth_date DATE,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create specializations table
CREATE TABLE public.specializations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dentist_specializations junction table
CREATE TABLE public.dentist_specializations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dentist_id UUID NOT NULL,
  specialization_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dentist_id, specialization_id)
);

-- Add appointments relationship with dentist
ALTER TABLE public.appointments 
ADD COLUMN dentist_id UUID;

-- Enable Row Level Security
ALTER TABLE public.dentists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dentist_specializations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on dentists" 
ON public.dentists 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on specializations" 
ON public.specializations 
FOR ALL 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on dentist_specializations" 
ON public.dentist_specializations 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Add foreign key constraints
ALTER TABLE public.dentist_specializations 
ADD CONSTRAINT fk_dentist_specializations_dentist 
FOREIGN KEY (dentist_id) REFERENCES public.dentists(id) ON DELETE CASCADE;

ALTER TABLE public.dentist_specializations 
ADD CONSTRAINT fk_dentist_specializations_specialization 
FOREIGN KEY (specialization_id) REFERENCES public.specializations(id) ON DELETE CASCADE;

ALTER TABLE public.appointments 
ADD CONSTRAINT fk_appointments_dentist 
FOREIGN KEY (dentist_id) REFERENCES public.dentists(id) ON DELETE SET NULL;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_dentists_updated_at
BEFORE UPDATE ON public.dentists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default specializations
INSERT INTO public.specializations (name, description) VALUES 
('Clínica Geral', 'Atendimento odontológico geral e preventivo'),
('Ortodontia', 'Correção de dentes e mandíbula'),
('Endodontia', 'Tratamento de canal'),
('Periodontia', 'Tratamento de gengiva e estruturas de suporte'),
('Implantodontia', 'Implantes dentários'),
('Cirurgia Oral', 'Cirurgias na região bucal'),
('Odontopediatria', 'Odontologia infantil'),
('Prótese Dentária', 'Reabilitação com próteses'),
('Estética Dental', 'Tratamentos estéticos e cosméticos');

-- Create indexes for better performance
CREATE INDEX idx_dentists_status ON public.dentists(status);
CREATE INDEX idx_dentists_cro ON public.dentists(cro);
CREATE INDEX idx_appointments_dentist_id ON public.appointments(dentist_id);
CREATE INDEX idx_dentist_specializations_dentist_id ON public.dentist_specializations(dentist_id);