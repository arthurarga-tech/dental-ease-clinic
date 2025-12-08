-- Inserir transações financeiras fictícias
INSERT INTO financial_transactions (patient_id, dentist_id, category_id, payment_method_id, amount, transaction_date, type, status, description) VALUES
-- Receitas (procedimentos pagos)
('97e56659-d53c-4ba2-8cb1-61fd4f1e14f1', '1818257e-3a00-4712-80c7-f9454d9e689a', 'fa43de39-ad6e-4d60-a8ce-752d05a3a2ee', '32c7e7b5-f895-4308-b371-e5cf9489ae7c', 350, '2025-12-03', 'Receita', 'Pago', 'Restauração dente 15'),
('c868d050-32a2-4e9a-bff5-297311db105e', 'd51ae364-3f15-469f-8db7-32b492bbe674', 'f2c00f07-7752-4026-a9cf-4b1dcc410b95', 'f3eaa92a-a4a4-4a2a-be78-9196536a836a', 300, '2025-12-01', 'Receita', 'Pago', 'Tratamento de canal - 1ª sessão'),
('3322de04-d843-42f0-b8b8-e939a09e09f5', 'e1b306bc-f66b-4b54-82f8-18be9648ef5c', '26138f4e-2522-49bb-95bf-daf19b925460', '3dccdbf1-a865-45fa-8518-6ab357bb7fad', 200, '2025-12-05', 'Receita', 'Pago', 'Limpeza periodontal'),
('38b0b5f0-d20b-49bb-a6d9-da04fcbd325e', 'e1ca00fb-1a16-409b-9080-f40c3e5178e8', 'f6a24b40-aa2b-4145-8f80-82cda41f6319', 'f5dc8d64-933a-4227-ab1b-24faca5f9125', 3500, '2025-12-02', 'Receita', 'Pago', 'Implante dentário - primeiro'),

-- Despesas pagas
(NULL, NULL, '353cfc83-ee68-47b2-94f9-f866b24e9aa8', '32c7e7b5-f895-4308-b371-e5cf9489ae7c', 850, '2025-12-01', 'Despesa', 'Pago', 'Materiais odontológicos'),
(NULL, NULL, '0b7893a6-94aa-43f4-a39c-7e7529163221', '4f712dfb-c769-48b3-bb5b-376f04e34f42', 4500, '2025-12-05', 'Despesa', 'Pago', 'Aluguel dezembro'),
(NULL, NULL, '592073bd-868f-4ad1-aeeb-6bc147681993', 'b0809f63-0a27-4d8a-9f4c-2491631ced16', 380, '2025-12-05', 'Despesa', 'Pago', 'Energia elétrica novembro'),
(NULL, NULL, 'bbc55fac-9060-4121-80a4-a2647589aa1f', '32c7e7b5-f895-4308-b371-e5cf9489ae7c', 1200, '2025-12-03', 'Despesa', 'Pago', 'Laboratório de prótese'),

-- Despesas pendentes
(NULL, NULL, '8278cd61-fe89-4161-9dfb-26c74299de59', 'b0809f63-0a27-4d8a-9f4c-2491631ced16', 120, '2025-12-10', 'Despesa', 'Pendente', 'Conta de água'),
(NULL, NULL, 'a36100cb-7b6c-4690-87aa-e5837e2560b0', 'b0809f63-0a27-4d8a-9f4c-2491631ced16', 250, '2025-12-15', 'Despesa', 'Pendente', 'Internet'),
(NULL, NULL, 'a6ba66cc-86df-4a86-bd31-643e84943579', 'b0809f63-0a27-4d8a-9f4c-2491631ced16', 1800, '2025-12-20', 'Despesa', 'Pendente', 'ISSQN mensal');