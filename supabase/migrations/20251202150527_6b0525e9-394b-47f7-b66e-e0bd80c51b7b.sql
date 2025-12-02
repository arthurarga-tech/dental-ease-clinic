-- Remove tabela de vínculo primeiro (tem foreign key para partners)
DROP TABLE IF EXISTS public.transaction_partners;

-- Remove tabela de parceiros
DROP TABLE IF EXISTS public.partners;