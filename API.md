# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
A maioria dos endpoints requer autenticação via JWT token no header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication (`/api/auth`)

### POST `/auth/login`
Login de usuário.

**Body:**
```json
{
  "email": "admin@casamento.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Administrador",
    "email": "admin@casamento.com",
    "role": "admin"
  }
}
```

### GET `/auth/profile` 🔒
Obter perfil do usuário logado.

### PUT `/auth/profile` 🔒
Atualizar perfil do usuário logado.

### GET `/auth/users` 🔒 (Admin)
Listar todos os usuários.

### POST `/auth/users` 🔒 (Admin)
Criar novo usuário.

### DELETE `/auth/users/:id` 🔒 (Admin)
Deletar usuário.

---

## 👥 Guests (`/api/guests`)

### GET `/guests/search`
Buscar convidados (público).

**Query params:**
- `search`: Nome do convidado

### POST `/guests/confirm`
Confirmar presença (público).

**Body:**
```json
{
  "guestIds": [1, 2, 3]
}
```

### GET `/guests` 🔒
Listar todos os convidados.

### GET `/guests/confirmed` 🔒
Listar convidados confirmados.

### POST `/guests` 🔒
Criar novo convidado.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "phone": "(11) 99999-9999",
  "confirmed": false
}
```

### PUT `/guests/:id` 🔒
Atualizar convidado.

### DELETE `/guests/:id` 🔒
Deletar convidado.

---

## 🎁 Experiences (`/api/experiences`)

### GET `/experiences`
Listar experiências.

**Query params:**
- `active`: true/false (filtrar por ativas)

### GET `/experiences/:id`
Obter experiência específica.

### POST `/experiences` 🔒
Criar nova experiência.

**Body:**
```json
{
  "title": "Massagem Relaxante",
  "description": "Massagem para a noiva na lua de mel",
  "image_url": "https://exemplo.com/imagem.jpg",
  "price": 100.00,
  "total_quotas": 4,
  "active": true
}
```

### PUT `/experiences/:id` 🔒
Atualizar experiência.

### DELETE `/experiences/:id` 🔒
Deletar experiência.

---

## 💰 Payments (`/api/payments`)

### POST `/payments/create`
Criar pagamento (público).

**Body:**
```json
{
  "items": [
    {
      "experience_id": 1,
      "quantity": 2
    }
  ],
  "guest_name": "João Silva",
  "guest_email": "joao@exemplo.com",
  "message": "Parabéns aos noivos!"
}
```

**Response:**
```json
{
  "preference_id": "123456789",
  "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
}
```

### POST `/payments/webhook`
Webhook do Mercado Pago (automático).

### GET `/payments` 🔒
Listar compras/presentes.

**Query params:**
- `status`: pending/approved/rejected/cancelled

### GET `/payments/summary` 🔒
Obter resumo financeiro.

**Response:**
```json
{
  "total_received": 1000.00,
  "total_mp_fee": 50.00,
  "total_admin_fee": 50.00,
  "total_couple_amount": 900.00,
  "total_withdrawn": 0.00,
  "available_balance": 900.00,
  "total_purchases": 10
}
```

---

## 💸 Withdrawals (`/api/withdrawals`)

### GET `/withdrawals` 🔒
Listar saques.

**Query params:**
- `status`: pending/approved/rejected

### POST `/withdrawals` 🔒
Solicitar saque.

**Body:**
```json
{
  "amount": 500.00,
  "pix_key": "11999999999"
}
```

### PUT `/withdrawals/:id` 🔒 (Admin)
Processar saque (aprovar/rejeitar).

**Body:**
```json
{
  "status": "approved",
  "notes": "Saque aprovado"
}
```

---

## ⚙️ Settings (`/api/settings`)

### GET `/settings/wedding`
Obter informações do casamento (público).

**Response:**
```json
{
  "couple_name_1": "Vanessa",
  "couple_name_2": "Guilherme",
  "wedding_date": "2026-03-15",
  "wedding_time": "18:00",
  "wedding_location": "Espaço das Flores - Rua das Acácias, 123"
}
```

### GET `/settings` 🔒
Obter todas as configurações.

### PUT `/settings` 🔒 (Admin)
Atualizar configuração.

**Body:**
```json
{
  "key": "admin_fee_percentage",
  "value": "5.0"
}
```

---

## 🔒 Níveis de Acesso

- **Público**: Sem autenticação necessária
- **🔒**: Requer autenticação (token JWT)
- **🔒 (Admin)**: Requer autenticação como admin
- **🔒 (Couple/Admin)**: Requer autenticação como noivos ou admin

---

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Error Response Format

```json
{
  "error": "Mensagem de erro descritiva"
}
```
