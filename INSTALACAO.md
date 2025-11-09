# Guia de Instalação Rápida

## 1. Instalar Dependências
```powershell
npm run install-all
```

## 2. Configurar Banco de Dados
```sql
CREATE DATABASE deiapres_graduation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Depois execute:
```powershell
mysql -u deiapres_wed -p -h 192.99.13.191 deiapres_graduation < backend/database/schema.sql
```

## 3. Iniciar o Sistema
```powershell
npm run dev
```

## 4. Acessar
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 5. Login Padrão
**Admin**: admin@casamento.com / admin123
**Noivos**: noivos@casamento.com / noivos123

---

## Estrutura de Pastas

```
gifts-app/
├── backend/
│   ├── config/          # Configurações (database)
│   ├── controllers/     # Lógica de negócio
│   ├── middleware/      # Autenticação
│   ├── routes/          # Rotas da API
│   ├── services/        # Serviços externos (email)
│   ├── database/        # Schema SQL
│   └── server.js        # Servidor principal
│
├── frontend/
│   ├── public/          # Arquivos estáticos
│   └── src/
│       ├── components/  # Componentes React
│       ├── context/     # Context API (Auth)
│       ├── pages/       # Páginas
│       ├── services/    # API client
│       └── App.js       # App principal
│
└── package.json         # Scripts principais
```

## Comandos Úteis

```powershell
# Instalar tudo
npm run install-all

# Rodar tudo junto
npm run dev

# Rodar apenas backend
npm run server

# Rodar apenas frontend
npm run client
```

## Funcionalidades Principais

### Público
- ✅ Página inicial com informações do casamento
- ✅ Confirmação de presença com autocomplete
- ✅ Lista de experiências/presentes
- ✅ Carrinho de compras
- ✅ Checkout com Mercado Pago

### Painel Noivos
- ✅ Dashboard financeiro
- ✅ Gerenciar convidados
- ✅ Gerenciar experiências
- ✅ Ver presentes recebidos
- ✅ Solicitar saques

### Painel Admin
- ✅ Tudo dos noivos +
- ✅ Gerenciar usuários
- ✅ Aprovar saques
- ✅ Configurar taxas
- ✅ Configurações gerais

## Notas Importantes

1. **Webhook Mercado Pago**: Para desenvolvimento local, use ngrok para expor o webhook
2. **E-mails**: Configurados via Brevo, credenciais já no .env
3. **Senhas**: Altere as senhas padrão após primeiro acesso
4. **Mobile-First**: Interface otimizada para celular

## Fluxo de Trabalho Típico

1. Admin configura informações do casamento
2. Admin/Noivos adicionam convidados
3. Admin/Noivos criam experiências
4. Convidados acessam site e confirmam presença
5. Convidados compram presentes
6. Sistema calcula automaticamente taxas e saldo
7. Noivos solicitam saques
8. Admin aprova saques
