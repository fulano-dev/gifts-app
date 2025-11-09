-- Adicionar coluna mercadopago_payment_id na tabela purchases_WED
-- Execução: Rodar ANTES de ativar o webhook

ALTER TABLE purchases_WED 
ADD COLUMN mercadopago_payment_id VARCHAR(255) NULL 
AFTER payment_id;

-- Criar índice para buscar por mercadopago_payment_id
CREATE INDEX idx_mercadopago_payment_id ON purchases_WED(mercadopago_payment_id);

-- Verificar estrutura atualizada
DESCRIBE purchases_WED;
