-- Remove the old check constraint and add a new one with all valid status values
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE public.appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('Agendado', 'Confirmado', 'Em andamento', 'Concluído', 'Cancelado', 'Remarcado', 'Faltou'));