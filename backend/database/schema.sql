-- Schema do banco de dados para o sistema de convite de casamento

-- Tabela de usuários (noivos e admin)
CREATE TABLE IF NOT EXISTS users_WED (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'couple') DEFAULT 'couple',
    pix_key VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de convidados
CREATE TABLE IF NOT EXISTS guests_WED (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    confirmed BOOLEAN DEFAULT FALSE,
    confirmed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Tabela de experiências/presentes
CREATE TABLE IF NOT EXISTS experiences_WED (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    total_quotas INT NOT NULL DEFAULT 1,
    available_quotas INT NOT NULL DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de compras/presentes
CREATE TABLE IF NOT EXISTS purchases_WED (
    id INT PRIMARY KEY AUTO_INCREMENT,
    guest_id INT,
    guest_name VARCHAR(255),
    guest_email VARCHAR(255),
    experience_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    message TEXT,
    payment_id VARCHAR(255),
    payment_status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    mercadopago_fee DECIMAL(10, 2) DEFAULT 0,
    admin_fee_percentage DECIMAL(5, 2) DEFAULT 0,
    admin_fee_amount DECIMAL(10, 2) DEFAULT 0,
    couple_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests_WED(id) ON DELETE SET NULL,
    FOREIGN KEY (experience_id) REFERENCES experiences_WED(id)
);

-- Tabela de solicitações de saque
CREATE TABLE IF NOT EXISTS withdrawals_WED (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    pix_key VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by INT,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users_WED(id),
    FOREIGN KEY (processed_by) REFERENCES users_WED(id)
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS settings_WED (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir configuração inicial da taxa administrativa
INSERT INTO settings_WED (setting_key, setting_value) VALUES 
('admin_fee_percentage', '5.0'),
('couple_name_1', 'Vanessa'),
('couple_name_2', 'Guilherme'),
('wedding_date', '2026-03-15'),
('wedding_time', '18:00'),
('wedding_location', 'Espaço das Flores - Rua das Acácias, 123'),
('mercadopago_fee_percentage', '5.0')
ON DUPLICATE KEY UPDATE setting_value = setting_value;

-- Inserir usuário admin padrão (senha: admin123)
INSERT INTO users_WED (name, email, password, role) VALUES 
('Administrador', 'admin@casamento.com', '$2a$10$GAsZQ9wjL3CjVBsMSVHKd.kd0EU8R3iSy9Ry592OxOGXqJD/yanSi', 'admin')
ON DUPLICATE KEY UPDATE email = email;

-- Inserir usuários dos noivos (senha: noivos123)
INSERT INTO users_WED (name, email, password, role) VALUES 
('Vanessa e Guilherme', 'noivos@casamento.com', '$2a$10$xXicBiFw8tm/5c1hp8bwD.oIH2yoefDUZ.6sLEKw0UugOeqhwRV4u', 'couple')
ON DUPLICATE KEY UPDATE email = email;
