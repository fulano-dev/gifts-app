# 🔧 CORREÇÕES APLICADAS - WEBHOOK MERCADOPAGO

## ✅ O que foi corrigido:

### 1. **Logs detalhados adicionados**
   - Criação de pagamento com emojis: 🛒 📦 👤 💰 🔑 🌐 📤 ✅ 💾 ❌
   - Webhook com logs completos: 📨 🔔 💳 🔍 🔑 📊 💾 🎉 📧 ⚠️ ❌
   - Todos os logs têm timestamp e separadores visuais

### 2. **External Reference implementado**
   - Formato: `gift_${Date.now()}`
   - Permite vincular o pagamento do MercadoPago com a compra no banco

### 3. **Webhook corrigido**
   - Responde 200 **IMEDIATAMENTE** (obrigatório pelo MercadoPago)
   - Processamento assíncrono após resposta
   - Salva `mercadopago_payment_id` no banco
   - Logs detalhados de cada etapa

### 4. **Campos do banco atualizados**
   - `payment_id`: Armazena external_reference (ex: gift_1234567890)
   - `mercadopago_payment_id`: Armazena ID do pagamento no MercadoPago (ex: 123456789)

---

## 📋 PASSO A PASSO PARA ATIVAR

### 1️⃣ **Atualizar banco de dados**
Executar o script SQL no banco MySQL:
```bash
cd backend/database
mysql -h 192.99.13.191 -u nome_usuario -p nome_banco < add-mercadopago-payment-id.sql
```

Ou manualmente no phpMyAdmin:
```sql
ALTER TABLE purchases_WED 
ADD COLUMN mercadopago_payment_id VARCHAR(255) NULL 
AFTER payment_id;

CREATE INDEX idx_mercadopago_payment_id ON purchases_WED(mercadopago_payment_id);
```

### 2️⃣ **Configurar variáveis de ambiente**

Editar `backend/.env`:
```env
# MercadoPago
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token_aqui

# URLs
FRONTEND_URL=https://seu-site.vercel.app
BACKEND_URL=https://seu-backend.onrender.com

# Banco
DB_HOST=192.99.13.191
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=seu_banco

# Brevo (Email)
BREVO_API_KEY=sua_chave_brevo
```

### 3️⃣ **Testar localmente ANTES de fazer deploy**

```bash
cd backend
npm install
node server.js
```

Verificar nos logs:
- ✅ Servidor rodando na porta 5000
- ✅ Conectado ao banco de dados
- ✅ Access Token MercadoPago carregado

### 4️⃣ **Fazer deploy no Render**

1. Fazer commit das alterações:
```bash
git add .
git commit -m "fix: webhook mercadopago com logs e external_reference"
git push
```

2. No painel do Render:
   - Aguardar deploy automático
   - Verificar logs: deve aparecer "🚀 Servidor rodando..."

### 5️⃣ **Configurar webhook no MercadoPago**

1. Acessar: https://www.mercadopago.com.br/developers/panel/app
2. Selecionar sua aplicação
3. Menu **Webhooks** → Criar novo
4. **URL de notificação:** `https://seu-backend.onrender.com/api/payments/webhook`
5. **Eventos:** Selecionar **Pagamentos**
6. Salvar

### 6️⃣ **Testar fluxo completo**

1. Acessar site: `https://seu-site.vercel.app`
2. Selecionar presente
3. Preencher dados
4. Clicar em "Presentear"
5. Será redirecionado ao MercadoPago
6. Usar cartão de teste:
   ```
   Número: 5031 4332 1540 6351
   CVV: 123
   Validade: 11/25
   Nome: APRO (para aprovar)
   CPF: qualquer CPF válido
   ```

### 7️⃣ **Verificar logs no Render**

Após o pagamento, os logs devem aparecer:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛒 [CREATE_PAYMENT] 2024-01-15T10:30:00.000Z
📦 [CREATE_PAYMENT] Items: 1
👤 [CREATE_PAYMENT] Guest: João - joao@email.com
💰 [CREATE_PAYMENT] Total: R$ 150.00
🔑 [CREATE_PAYMENT] External Reference: gift_1234567890
🌐 [CREATE_PAYMENT] Webhook URL: https://seu-backend.onrender.com/api/payments/webhook
✅ [CREATE_PAYMENT] Preferência criada: 123456789-abc
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📨 [WEBHOOK] 2024-01-15T10:31:00.000Z
🔔 [WEBHOOK] Type: payment
💳 [WEBHOOK] Payment ID: 987654321
🔑 [WEBHOOK] External Reference: gift_1234567890
📊 [WEBHOOK] Status: approved
🎉 [WEBHOOK] PAGAMENTO APROVADO!
💾 [WEBHOOK] Linhas afetadas: 1
📧 [WEBHOOK] Enviando email para: joao@email.com
✅ [WEBHOOK] Email enviado com sucesso!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🐛 DEBUGGING

### Se o webhook não chamar:

1. **Verificar URL no MercadoPago:**
   - Painel → Webhooks → Ver URL cadastrada
   - Deve ser: `https://seu-backend.onrender.com/api/payments/webhook`
   - **NÃO pode ser:** Vercel URL

2. **Verificar logs do Render:**
   - Se aparecer 📨 [WEBHOOK]: webhook está sendo chamado
   - Se NÃO aparecer: URL está errada no MercadoPago

3. **Verificar banco:**
```sql
SELECT payment_id, mercadopago_payment_id, payment_status 
FROM purchases_WED 
ORDER BY created_at DESC 
LIMIT 10;
```

### Se o pagamento não aprovar:

1. **Verificar external_reference:**
   - Logs devem mostrar: `🔑 [WEBHOOK] External Reference: gift_xxxxx`
   - Se estiver NULL: problema na criação da preferência

2. **Verificar status:**
   - `📊 [WEBHOOK] Status: approved` ✅
   - Se for `pending`, `rejected`: problema no MercadoPago

3. **Verificar email:**
   - Se aparecer `❌ [WEBHOOK] Erro ao enviar email`: problema no Brevo
   - Verificar BREVO_API_KEY no .env

---

## 📊 MONITORAMENTO

### Comando para ver logs em tempo real:

No painel do Render, clicar em **Logs** e deixar aberto.

### Filtrar logs específicos:

- `🛒` = Criação de pagamento
- `📨` = Webhook recebido
- `🎉` = Pagamento aprovado
- `❌` = Erros

### Limpar logs antigos:

Os logs no Render ficam por 7 dias. Para histórico maior, usar serviço externo como LogDNA/Datadog.

---

## ✅ CHECKLIST FINAL

- [ ] Coluna `mercadopago_payment_id` adicionada no banco
- [ ] Variáveis .env configuradas (ACCESS_TOKEN, BACKEND_URL)
- [ ] Deploy feito no Render
- [ ] Webhook configurado no MercadoPago com URL do Render
- [ ] Teste realizado com cartão de teste
- [ ] Logs aparecem corretamente
- [ ] Email de confirmação enviado
- [ ] Quotas atualizadas no banco

---

## 🆘 SUPORTE

Se continuar com problemas, enviar:

1. Logs completos do Render (copiar tudo desde 🛒 até ━━━)
2. Screenshot do painel MercadoPago → Webhooks
3. Resultado da query SQL:
```sql
SELECT * FROM purchases_WED ORDER BY created_at DESC LIMIT 5;
```

**Arquivos alterados:**
- `backend/controllers/paymentsController.js` - Logs e external_reference
- `backend/database/add-mercadopago-payment-id.sql` - Migração do banco
