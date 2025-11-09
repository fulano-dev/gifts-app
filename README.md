# Sistema de Convite de Casamento com Presentes Digitais

Sistema completo para gerenciar convites de casamento, confirmação de presença e compra de presentes (experiências de lua de mel) com integração ao Mercado Pago.

## 🎯 Funcionalidades

### Área Pública
- **Página Inicial**: Informações do casamento (noivos, data, hora, local)
- **Confirmação de Presença**: Sistema de busca de convidados com autocomplete
- **Lista de Presentes**: Experiências de lua de mel com compra via Mercado Pago
- **Sistema de Carrinho**: Adicionar múltiplos presentes antes do pagamento
- **Mensagens Personalizadas**: Convidados podem deixar mensagens aos noivos

### Painel dos Noivos
- Dashboard financeiro com resumo de valores
- Gerenciar convidados (adicionar, editar, remover, confirmar)
- Gerenciar experiências/presentes da lista
- Ver presentes recebidos e mensagens
- Solicitar saques via PIX
- Verificar saldo disponível

### Painel do Admin
- Tudo que os noivos podem fazer, mais:
- Gerenciar usuários (noivos e admins)
- Aprovar ou rejeitar solicitações de saque
- Configurar taxa administrativa
- Configurar informações do casamento
- Visualizar lucro e taxas detalhadas

## 🛠️ Tecnologias

- **Frontend**: React.js
- **Backend**: Node.js + Express
- **Banco de Dados**: MySQL
- **Pagamentos**: Mercado Pago
- **E-mails**: Brevo (antigo Sendinblue)

## 📋 Pré-requisitos

- Node.js 16+ instalado
- MySQL 8+ instalado e rodando
- Conta no Mercado Pago (credenciais de produção)
- Conta no Brevo para envio de e-mails

## 🚀 Instalação

### 1. Clonar o repositório
```bash
cd c:\projetos\gifts-app
```

### 2. Instalar dependências

**Instalar todas as dependências de uma vez:**
```powershell
npm run install-all
```

**Ou instalar separadamente:**
```powershell
# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
```

### 3. Configurar Banco de Dados

**Criar o banco de dados:**
```sql
CREATE DATABASE deiapres_graduation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Executar o schema:**
```powershell
# No MySQL, execute:
mysql -u deiapres_wed -p -h 192.99.13.191 deiapres_graduation < backend/database/schema.sql
```

### 4. Configurar Variáveis de Ambiente

As variáveis já estão configuradas nos arquivos `.env`, mas você pode ajustá-las:

**Backend** (`backend/.env`):
- Banco de dados MySQL
- Credenciais Brevo
- Credenciais Mercado Pago
- JWT Secret

**Frontend** (`frontend/.env`):
- URL da API
- Chave pública do Mercado Pago

### 5. Iniciar o Sistema

**Opção 1: Iniciar tudo de uma vez (recomendado):**
```powershell
npm run dev
```

**Opção 2: Iniciar separadamente:**

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## 🔑 Acessos Padrão

### Admin
- **Email**: admin@casamento.com
- **Senha**: admin123

### Noivos
- **Email**: noivos@casamento.com
- **Senha**: noivos123

> ⚠️ **IMPORTANTE**: Altere essas senhas após o primeiro login!

## 📱 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

## 🎨 Design Mobile-First

O sistema foi desenvolvido com abordagem mobile-first, garantindo perfeita visualização e usabilidade em smartphones, tablets e desktops.

## 📧 Configuração de E-mails

O sistema envia e-mails automáticos para:
- Confirmação de presença
- Confirmação de pagamento/presente
- Lembretes sobre o casamento

Os e-mails são enviados via Brevo (API já configurada no .env).

## 💰 Fluxo de Pagamento

1. Convidado seleciona experiências (presentes)
2. Adiciona ao carrinho
3. Preenche dados e mensagem
4. É redirecionado ao checkout do Mercado Pago
5. Após pagamento aprovado:
   - Quotas são atualizadas
   - E-mail de confirmação é enviado
   - Valor é calculado (taxa MP + taxa admin)
   - Saldo fica disponível para saque

## 🔄 Webhook Mercado Pago

O webhook está configurado em: `http://seu-dominio.com/api/payments/webhook`

> ⚠️ Para desenvolvimento local, você precisará usar ngrok ou similar para expor o webhook.

## 📊 Estrutura do Banco de Dados

- **users**: Usuários do sistema (admin e noivos)
- **guests**: Convidados do casamento
- **experiences**: Experiências/presentes disponíveis
- **purchases**: Compras realizadas
- **withdrawals**: Solicitações de saque
- **settings**: Configurações do sistema

## 🧪 Testando o Sistema

1. **Adicionar Convidados**: Entre no painel e adicione alguns convidados
2. **Adicionar Experiências**: Crie experiências com fotos, valores e quotas
3. **Testar Confirmação**: Na página pública, confirme presença de convidados
4. **Testar Compra**: Selecione presentes e teste o fluxo de pagamento
5. **Verificar Dashboard**: Veja os valores sendo calculados automaticamente

## 🔧 Customização

### Alterar Informações do Casamento
1. Faça login como admin
2. Vá em "Configurações"
3. Altere nomes, data, hora e local

### Alterar Taxa Administrativa
1. Painel Admin > Configurações
2. Ajuste o percentual da taxa
3. Salvar

## 📦 Deploy em Produção

### Backend
1. Configure um servidor Node.js
2. Configure as variáveis de ambiente
3. Execute `npm start` no diretório backend

### Frontend
1. Execute `npm run build` no diretório frontend
2. Sirva os arquivos da pasta `build` com nginx ou similar

### Banco de Dados
1. Configure MySQL em produção
2. Execute o schema.sql
3. Ajuste as credenciais no .env

## 🐛 Troubleshooting

### Erro de Conexão com Banco
- Verifique se o MySQL está rodando
- Confirme as credenciais no `.env`
- Verifique se o banco foi criado

### Erro no Mercado Pago
- Confirme as credenciais no `.env`
- Verifique se está usando credenciais de produção
- Configure o webhook corretamente

### E-mails não estão sendo enviados
- Verifique a chave API do Brevo
- Confirme o e-mail remetente
- Veja os logs do console para erros

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console (backend e frontend)
2. Consulte a documentação das APIs (Mercado Pago, Brevo)
3. Revise as configurações do `.env`

## 🎉 Pronto!

O sistema está completo e pronto para uso. Bom casamento! 💍❤️
