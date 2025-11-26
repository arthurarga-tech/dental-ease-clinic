-- Add commission percentage to dentists table
ALTER TABLE dentists
ADD COLUMN commission_percentage DECIMAL(5,2) DEFAULT 50.00;

-- Create card_fees table for card machine fees
CREATE TABLE card_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_method_id UUID REFERENCES payment_methods(id) NOT NULL,
  fee_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(payment_method_id)
);

-- Add dentist_id to financial_transactions
ALTER TABLE financial_transactions
ADD COLUMN dentist_id UUID REFERENCES dentists(id);

-- Create dentist_settlements table for dentist payments
CREATE TABLE dentist_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dentist_id UUID REFERENCES dentists(id) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  gross_amount DECIMAL(10,2) NOT NULL,
  card_fees_deducted DECIMAL(10,2) DEFAULT 0,
  commission_percentage DECIMAL(5,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Pendente',
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE card_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE dentist_settlements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for card_fees
CREATE POLICY "Admin can manage card fees"
ON card_fees
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can view card fees"
ON card_fees
FOR SELECT
USING (auth.role() = 'authenticated');

-- RLS Policies for dentist_settlements
CREATE POLICY "Admin can manage dentist settlements"
ON dentist_settlements
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Dentists can view their own settlements"
ON dentist_settlements
FOR SELECT
USING (
  has_role(auth.uid(), 'dentist') 
  AND dentist_id IN (
    SELECT id FROM dentists 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Create trigger for dentist_settlements updated_at
CREATE TRIGGER update_dentist_settlements_updated_at
BEFORE UPDATE ON dentist_settlements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for card_fees updated_at
CREATE TRIGGER update_card_fees_updated_at
BEFORE UPDATE ON card_fees
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();