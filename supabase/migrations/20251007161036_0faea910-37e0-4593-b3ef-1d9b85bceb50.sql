-- Create partners table to store business partners/owners
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on partners"
ON public.partners
FOR ALL
USING (true)
WITH CHECK (true);

-- Create junction table for many-to-many relationship between transactions and partners
CREATE TABLE public.transaction_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.financial_transactions(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(transaction_id, partner_id)
);

-- Enable RLS
ALTER TABLE public.transaction_partners ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on transaction_partners"
ON public.transaction_partners
FOR ALL
USING (true)
WITH CHECK (true);

-- Insert default partners
INSERT INTO public.partners (name) VALUES 
  ('Jorge'),
  ('Arthur'),
  ('Dra. ADRIANA');