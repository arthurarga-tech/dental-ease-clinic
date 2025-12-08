-- Inserir agendamentos fictícios (hoje e próximos dias)
INSERT INTO appointments (patient_id, dentist_id, appointment_date, appointment_time, duration, type, status, notes) VALUES
-- Agendamentos para hoje (2025-12-08)
('97e56659-d53c-4ba2-8cb1-61fd4f1e14f1', '1818257e-3a00-4712-80c7-f9454d9e689a', '2025-12-08', '09:00', 30, 'Consulta', 'Agendado', 'Primeira consulta - avaliação geral'),
('38b0b5f0-d20b-49bb-a6d9-da04fcbd325e', 'e1ca00fb-1a16-409b-9080-f40c3e5178e8', '2025-12-08', '10:00', 60, 'Limpeza', 'Agendado', NULL),
('c868d050-32a2-4e9a-bff5-297311db105e', 'd51ae364-3f15-469f-8db7-32b492bbe674', '2025-12-08', '11:00', 45, 'Tratamento de Canal', 'Em andamento', 'Segunda sessão'),
('75e3924f-b5cd-4606-93ea-8dd9efbed0a8', 'e1b306bc-f66b-4b54-82f8-18be9648ef5c', '2025-12-08', '14:00', 30, 'Consulta', 'Agendado', 'Retorno'),
('5e0ea4de-471e-4226-9130-af6bf5d6f81e', '1818257e-3a00-4712-80c7-f9454d9e689a', '2025-12-08', '15:00', 60, 'Clareamento', 'Agendado', NULL),

-- Agendamentos para amanhã (2025-12-09)
('e635d307-ffb5-4143-ba55-4180d19d7694', 'e1ca00fb-1a16-409b-9080-f40c3e5178e8', '2025-12-09', '09:00', 30, 'Consulta', 'Agendado', 'Avaliação para prótese'),
('db09c64f-ff58-48e2-86ce-b3bd916a730f', 'd51ae364-3f15-469f-8db7-32b492bbe674', '2025-12-09', '10:30', 60, 'Ortodontia', 'Agendado', 'Manutenção aparelho'),
('2e195c28-8496-4324-892c-718f4ef31947', '1818257e-3a00-4712-80c7-f9454d9e689a', '2025-12-09', '14:00', 45, 'Restauração', 'Agendado', 'Restauração dente 26'),
('1444f645-ed06-4832-a0cb-33586d5f63ee', 'e1ca00fb-1a16-409b-9080-f40c3e5178e8', '2025-12-09', '15:30', 30, 'Consulta', 'Agendado', 'Acompanhamento infantil'),

-- Agendamentos passados (completados)
('3322de04-d843-42f0-b8b8-e939a09e09f5', 'e1b306bc-f66b-4b54-82f8-18be9648ef5c', '2025-12-05', '10:00', 30, 'Limpeza', 'Concluído', NULL),
('97e56659-d53c-4ba2-8cb1-61fd4f1e14f1', '1818257e-3a00-4712-80c7-f9454d9e689a', '2025-12-03', '09:00', 45, 'Restauração', 'Concluído', 'Restauração dente 15'),
('c868d050-32a2-4e9a-bff5-297311db105e', 'd51ae364-3f15-469f-8db7-32b492bbe674', '2025-12-01', '11:00', 60, 'Tratamento de Canal', 'Concluído', 'Primeira sessão');

-- Inserir orçamentos fictícios
INSERT INTO budgets (patient_id, dentist_id, procedures, total_amount, discount, final_amount, valid_until, status, notes) VALUES
('97e56659-d53c-4ba2-8cb1-61fd4f1e14f1', '1818257e-3a00-4712-80c7-f9454d9e689a', '[{"name":"Clareamento a Laser","value":800,"quantity":1,"status":"Pendente"},{"name":"Limpeza Periodontal","value":250,"quantity":1,"status":"Pendente"}]', 1050, 50, 1000, '2026-01-08', 'Pendente', 'Pacote estético'),
('38b0b5f0-d20b-49bb-a6d9-da04fcbd325e', 'e1ca00fb-1a16-409b-9080-f40c3e5178e8', '[{"name":"Implante Dentário","value":3500,"quantity":2,"status":"Em Andamento"},{"name":"Prótese Fixa","value":2000,"quantity":2,"status":"Pendente"}]', 11000, 500, 10500, '2026-02-15', 'Aprovado', 'Reabilitação oral'),
('c868d050-32a2-4e9a-bff5-297311db105e', 'd51ae364-3f15-469f-8db7-32b492bbe674', '[{"name":"Tratamento de Canal","value":600,"quantity":1,"status":"Concluído"},{"name":"Coroa de Porcelana","value":1200,"quantity":1,"status":"Pendente"}]', 1800, 0, 1800, '2026-01-20', 'Aprovado', NULL),
('75e3924f-b5cd-4606-93ea-8dd9efbed0a8', 'e1b306bc-f66b-4b54-82f8-18be9648ef5c', '[{"name":"Prótese Total Superior","value":2500,"quantity":1,"status":"Pendente"},{"name":"Prótese Total Inferior","value":2500,"quantity":1,"status":"Pendente"}]', 5000, 300, 4700, '2026-01-30', 'Pendente', 'Próteses totais');

-- Inserir prontuários médicos
INSERT INTO medical_records (patient_id, diagnosis, procedure_type, treatment, observations, status, odontogram) VALUES
('97e56659-d53c-4ba2-8cb1-61fd4f1e14f1', 'Cárie superficial dente 15', 'Restauração', 'Restauração em resina composta', 'Paciente colaborativa, procedimento sem intercorrências', 'Concluído', '{"15":{"status":"restored","notes":"Restauração resina composta"}}'),
('c868d050-32a2-4e9a-bff5-297311db105e', 'Necrose pulpar dente 36', 'Endodontia', 'Tratamento endodôntico - primeira sessão', 'Paciente hipertensa, verificar PA antes de procedimentos', 'Em Tratamento', '{"36":{"status":"in_treatment","notes":"Tratamento de canal em andamento"}}'),
('38b0b5f0-d20b-49bb-a6d9-da04fcbd325e', 'Ausência dentária 46 e 47', 'Implante', 'Planejamento para implantes', 'Aguardando exames complementares', 'Em Tratamento', '{"46":{"status":"missing","notes":"Planejado implante"},"47":{"status":"missing","notes":"Planejado implante"}}'),
('3322de04-d843-42f0-b8b8-e939a09e09f5', 'Gengivite leve', 'Periodontia', 'Raspagem supragengival', 'Orientado sobre higiene bucal', 'Concluído', '{}');