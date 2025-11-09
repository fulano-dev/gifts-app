-- Dados de exemplo para testes
-- Execute após criar o schema inicial

-- Convidados de exemplo
INSERT INTO guests_WED (name, email, phone, confirmed) VALUES 
('João Silva', 'joao.silva@email.com', '(11) 98765-4321', FALSE),
('Maria Santos', 'maria.santos@email.com', '(11) 98765-4322', FALSE),
('Pedro Oliveira', 'pedro.oliveira@email.com', '(11) 98765-4323', FALSE),
('Ana Costa', 'ana.costa@email.com', '(11) 98765-4324', TRUE),
('Carlos Ferreira', 'carlos.ferreira@email.com', '(11) 98765-4325', TRUE),
('Juliana Lima', 'juliana.lima@email.com', '(11) 98765-4326', FALSE),
('Roberto Alves', 'roberto.alves@email.com', '(11) 98765-4327', FALSE),
('Fernanda Souza', 'fernanda.souza@email.com', '(11) 98765-4328', TRUE),
('Lucas Martins', 'lucas.martins@email.com', '(11) 98765-4329', FALSE),
('Beatriz Rocha', 'beatriz.rocha@email.com', '(11) 98765-4330', FALSE);

-- Experiências de exemplo
INSERT INTO experiences_WED (title, description, image_url, price, total_quotas, available_quotas, active) VALUES 
(
    'Massagem Relaxante para a Noiva',
    'Uma sessão completa de massagem relaxante de 60 minutos para a noiva aproveitar durante a lua de mel.',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500',
    150.00,
    5,
    5,
    TRUE
),
(
    'Jantar Romântico à Luz de Velas',
    'Jantar especial para dois em restaurante premium com vista para o mar.',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500',
    300.00,
    3,
    3,
    TRUE
),
(
    'Passeio de Barco ao Pôr do Sol',
    'Experiência inesquecível navegando enquanto apreciam o pôr do sol.',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500',
    250.00,
    4,
    4,
    TRUE
),
(
    'Dia de Spa Completo',
    'Dia inteiro de relaxamento com spa, sauna e tratamentos premium.',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500',
    500.00,
    2,
    2,
    TRUE
),
(
    'Aula de Culinária Local',
    'Aprenda a preparar pratos típicos do destino com chef renomado.',
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500',
    200.00,
    3,
    3,
    TRUE
),
(
    'Mergulho com Tartarugas',
    'Experiência de mergulho em águas cristalinas com tartarugas marinhas.',
    'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=500',
    350.00,
    4,
    4,
    TRUE
),
(
    'Sessão de Fotos Profissional',
    'Ensaio fotográfico profissional durante a lua de mel.',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500',
    400.00,
    2,
    2,
    TRUE
),
(
    'Passeio de Helicóptero',
    'Vista panorâmica incrível do destino em passeio de helicóptero.',
    'https://images.unsplash.com/photo-1581092583537-20d51876f398?w=500',
    800.00,
    1,
    1,
    TRUE
);
