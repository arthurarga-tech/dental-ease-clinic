-- Inserir pacientes fictícios
INSERT INTO patients (name, phone, email, birth_date, address, medical_notes, status) VALUES
('Maria Silva Santos', '(11) 98765-4321', 'maria.silva@email.com', '1985-03-15', 'Rua das Flores, 123 - Centro', 'Alergia a dipirona', 'Ativo'),
('João Pedro Oliveira', '(11) 91234-5678', 'joao.oliveira@email.com', '1990-07-22', 'Av. Brasil, 456 - Jardim América', NULL, 'Ativo'),
('Ana Clara Ferreira', '(11) 99876-5432', 'ana.ferreira@email.com', '1978-11-08', 'Rua do Comércio, 789 - Vila Nova', 'Hipertensa - usa medicamento contínuo', 'Ativo'),
('Carlos Eduardo Lima', '(11) 94567-8901', 'carlos.lima@email.com', '1965-05-30', 'Praça Central, 50 - Centro', 'Diabético tipo 2', 'Ativo'),
('Beatriz Almeida Costa', '(11) 93456-7890', 'beatriz.costa@email.com', '2000-01-12', 'Rua Nova, 321 - Jardim Primavera', NULL, 'Ativo'),
('Fernando Henrique Souza', '(11) 92345-6789', 'fernando.souza@email.com', '1955-09-25', 'Av. Principal, 999 - Centro', 'Cardíaco - marca-passo', 'Ativo'),
('Luciana Martins Rocha', '(11) 98234-5678', 'luciana.rocha@email.com', '1992-04-18', 'Rua das Palmeiras, 567 - Vila Verde', NULL, 'Ativo'),
('Ricardo Santos Neto', '(11) 97654-3210', 'ricardo.neto@email.com', '1988-12-03', 'Travessa do Sol, 88 - Bela Vista', 'Alergia a penicilina', 'Ativo'),
('Gabriela Pires Mendes', '(11) 96543-2109', NULL, '2015-06-20', 'Rua Esperança, 234 - Centro', 'Paciente infantil', 'Ativo'),
('Pedro Augusto Vieira', '(11) 95432-1098', 'pedro.vieira@email.com', '1975-08-14', 'Av. dos Estados, 1000 - Industrial', NULL, 'Ativo');

-- Adicionar responsável para paciente menor
UPDATE patients SET guardian_name = 'Sandra Pires Mendes', guardian_relationship = 'Mãe' WHERE name = 'Gabriela Pires Mendes';