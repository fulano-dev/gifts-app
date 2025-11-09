# Sistema de Convite de Casamento - Checklist de Deploy

## ✅ Pré-Deploy

### Banco de Dados
- [ ] Criar banco de dados MySQL em produção
- [ ] Executar `schema.sql`
- [ ] (Opcional) Executar `sample-data.sql` para dados de exemplo
- [ ] Anotar credenciais de acesso ao banco

### Mercado Pago
- [ ] Obter credenciais de produção
- [ ] Configurar webhook URL: `https://seudominio.com/api/payments/webhook`
- [ ] Testar credenciais

### Brevo (Email)
- [ ] Criar conta no Brevo
- [ ] Obter API Key
- [ ] Configurar domínio de envio
- [ ] Testar envio de email

## 🚀 Deploy Backend

### Servidor
- [ ] Provisionar servidor Node.js (DigitalOcean, AWS, Heroku, etc)
- [ ] Instalar Node.js 16+
- [ ] Instalar PM2 ou similar para gerenciar processo

### Código
- [ ] Upload dos arquivos do backend
- [ ] Criar arquivo `.env` em produção com variáveis corretas
- [ ] Executar `npm install --production`
- [ ] Testar conexão com banco: `node config/database.js`

### Variáveis de Ambiente
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=GERAR_CHAVE_SECRETA_FORTE

DB_HOST=seu-host-mysql.com
DB_USER=seu_usuario
DB_PASSWORD=sua_senha_forte
DB_NAME=nome_do_banco
DB_PORT=3306

BREVO_API_URL=https://api.brevo.com/v3
BREVO_API_KEY=sua-chave-brevo
EMAIL_FROM=noreply@seudominio.com

MERCADO_PAGO_ACCESS_TOKEN=seu-token-producao
MERCADO_PAGO_PUBLIC_KEY=sua-chave-publica

FRONTEND_URL=https://seudominio.com
```

### Iniciar Servidor
```bash
# Com PM2
pm2 start server.js --name gifts-app-backend
pm2 save
pm2 startup

# Verificar logs
pm2 logs gifts-app-backend
```

## 🎨 Deploy Frontend

### Build
```bash
cd frontend
npm install
npm run build
```

### Servidor Web
- [ ] Provisionar servidor web (Nginx, Apache, Vercel, Netlify)
- [ ] Upload da pasta `build/`
- [ ] Configurar domínio
- [ ] Configurar SSL/HTTPS

### Variáveis de Ambiente
Criar arquivo `.env.production`:
```env
REACT_APP_API_URL=https://api.seudominio.com/api
REACT_APP_MERCADO_PAGO_PUBLIC_KEY=sua-chave-publica-mercadopago
```

### Nginx Config (Exemplo)
```nginx
server {
    listen 80;
    server_name seudominio.com;
    
    root /var/www/gifts-app/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Segurança

- [ ] Alterar senhas padrão dos usuários
- [ ] Gerar JWT_SECRET forte e único
- [ ] Configurar CORS corretamente
- [ ] Habilitar HTTPS
- [ ] Configurar firewall
- [ ] Backup automático do banco de dados
- [ ] Logs de erro e acesso

## 🧪 Testes Pós-Deploy

### Frontend
- [ ] Acessar homepage
- [ ] Testar confirmação de presença
- [ ] Visualizar lista de presentes
- [ ] Testar responsividade mobile

### Backend
- [ ] Testar health check: `https://api.seudominio.com/health`
- [ ] Testar login admin
- [ ] Testar login noivos

### Fluxo Completo
- [ ] Confirmar presença de convidado
- [ ] Verificar email de confirmação
- [ ] Comprar presente (teste com cartão de teste do MP)
- [ ] Verificar webhook funcionando
- [ ] Verificar atualização de quotas
- [ ] Verificar cálculo de valores no dashboard
- [ ] Solicitar saque
- [ ] Aprovar saque (admin)

## 📊 Monitoramento

- [ ] Configurar logs centralizados
- [ ] Configurar alertas de erro
- [ ] Monitorar uso de CPU/RAM
- [ ] Monitorar espaço em disco
- [ ] Configurar backup automático
- [ ] Documentar procedimentos de recuperação

## 📝 Pós-Deploy

- [ ] Configurar informações do casamento no painel admin
- [ ] Adicionar convidados
- [ ] Criar experiências/presentes
- [ ] Testar envio de convites
- [ ] Preparar comunicação com convidados
- [ ] Treinar noivos no uso do painel

## 🆘 Rollback

Em caso de problemas:
1. Reverter código para versão anterior
2. Restaurar backup do banco de dados
3. Limpar cache do navegador
4. Verificar logs de erro
5. Contatar suporte técnico se necessário

---

## 📞 Contatos Importantes

- **Suporte Mercado Pago**: https://www.mercadopago.com.br/developers/
- **Suporte Brevo**: https://www.brevo.com/pt/suporte/
- **Hospedagem**: [anotar contato]
- **Desenvolvedor**: [seu contato]
