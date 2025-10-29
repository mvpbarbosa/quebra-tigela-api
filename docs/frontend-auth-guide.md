# Guia Frontend · Autenticação & Recuperação de Senha

Este guia ajuda o time de frontend a implementar fluxos de cadastro, login e recuperação de senha utilizando os endpoints de `auth` e `auth/password-reset`.

> Base URL: `{{baseUrl}} = http://localhost:3000/api`

---

## 1. Tokens e papéis

- **Formato**: JWT assinado (`HS256`).
- **Payload padrão**: `{ sub: <id>, email: <email>, role: 'client' | 'artist' }`.
- **Header**: `Authorization: Bearer <token>`.
- **Expiração**: configurável via `JWT_EXPIRES` (default `7d`).
- **Armazenamento sugerido**: secure httpOnly cookie (web) ou storage criptografado (mobile). Evitar localStorage.

### Perfis disponíveis

| Papel    | Origem              | Permissões atuais                                   |
| -------- | ------------------- | --------------------------------------------------- |
| `client` | Cadastro de usuário | Acesso a solicitações, reviews, etc.                |
| `artist` | Cadastro de artista | Gestão de agenda, serviços, solicitações recebidas. |

> 🔐 Ainda não há guardas ativos no backend; porém a API já devolve `role` para bloqueio de UI e preparo quando o guard for adicionado.

---

## 2. Cadastro de usuário

### `POST /auth/register/user`

- **Payload**:
  ```json
  {
    "name": "Ana Souza",
    "email": "ana@example.com",
    "password": "123456",
    "city": "Recife",
    "state": "PE"
  }
  ```
- **Resposta 201**:
  ```json
  { "access_token": "<jwt>" }
  ```
- **Recomendações UI**:
  - Validar senha mínima de 6 caracteres antes de enviar.
  - Normalizar e-mails para minúsculas.
  - Após sucesso, armazenar token e redirecionar para dashboard cliente.
- **Erros esperados**:
  - `409` se email já existir → mostrar mensagem amigável.
  - `400` se campos obrigatórios faltarem.

---

## 3. Cadastro de artista

### `POST /auth/register/artist`

- **Payload mínimo** (conferir DTO completo para campos opcionais):
  ```json
  {
    "name": "DJ Aurora",
    "email": "aurora@example.com",
    "password": "segura123",
    "artTypes": ["música"],
    "city": "São Paulo",
    "state": "SP"
  }
  ```
- **Resposta 201**: perfil sanitizado (sem `passwordHash`).
- **Observações**:
  - Muitos campos são opcionais (`bio`, `socialLinks`, etc.). O frontend pode implementar wizard em etapas.
  - Campo `verified` sempre inicia `false` (mock de verificação via upload).
  - Em caso de sucesso, o backend **não** retorna token; o artista deve logar em seguida.
- **Erros esperados**: mesmos padrões (`400` validação, `409` duplicidade).

---

## 4. Login (cliente ou artista)

### `POST /auth/login`

- **Payload**:
  ```json
  {
    "email": "ana@example.com",
    "password": "123456",
    "accountType": "client"
  }
  ```
- `accountType` é opcional e assume `client`. Para artistas, enviar `artist`.
- **Resposta 200**:
  ```json
  { "access_token": "<jwt>" }
  ```
- **Fluxo sugerido**:
  1. Exibir loader enquanto aguarda resposta.
  2. Em sucesso, salvar token + role.
  3. Redirecionar conforme papel (`/dashboard` vs `/studio`).
  4. Em `401`, exibir mensagem genérica (`Credenciais inválidas`).

---

## 5. Recuperação de senha

### 5.1 Solicitar código — `POST /auth/password-reset/request`

- **Payload**: `{ "email": "ana@example.com" }`
- **Resposta**: `{ "message": "Código enviado para o e-mail" }`
- **UI**: após sucesso, avançar para etapa de verificação com contador regressivo (6 minutos).
- **Erros**: `404` se email não estiver cadastrado (mostrar mensagem amigável sem revelar existência do usuário).

### 5.2 Validar código — `POST /auth/password-reset/validate`

- **Payload**:
  ```json
  {
    "email": "ana@example.com",
    "code": "123456"
  }
  ```
- **Resposta**: `{ "valid": true }`
- **UI**: habilitar campo de nova senha somente após validação.
- **Erros**: `400` se código inválido/expirado → exibir mensagem e permitir reenviar.

### 5.3 Redefinir senha — `POST /auth/password-reset/reset`

- **Payload**:
  ```json
  {
    "email": "ana@example.com",
    "code": "123456",
    "newPassword": "novaSenha123"
  }
  ```
- **Resposta**: `{ "message": "Senha redefinida com sucesso" }`
- **Fluxo**: após sucesso, redirecionar para login com mensagem de confirmação.
- **Erros**: mesmos de validação (`400`) ou `404` se usuário não existir mais.

---

## 6. Boas práticas de frontend

- Criar um serviço/hook de autenticação centralizado que atualize contexto global.
- Expirar sessão ao detectar `401` em endpoints protegidos (quando guards forem ativados).
- Armazenar o `role` para controlar navegação e componentes visíveis.
- Em formulários de senha, aplicar validação de força mínima e exibir feedback em tempo real.
- Nos fluxos de recuperação, mostrar tempo restante para reutilizar o código e permitir reenviar após expiração.

---

## 7. Referências cruzadas

- DTOs: `src/auth/dto/*`
- Serviços: `src/auth/auth.service.ts`, `src/auth/password-reset.service.ts`
- Postman: pastas **Auth** e **Password Reset** na coleção `quebra-tigela-api.postman_collection.json`

# Guia Frontend · Autenticação & Recuperação de Senha

Este guia ajuda o time de frontend a implementar fluxos de cadastro, login e recuperação de senha utilizando os endpoints de `auth` e `auth/password-reset`.

> Base URL: `{{baseUrl}} = http://localhost:3000/api`

---

## 1. Tokens e papéis

- **Formato**: JWT assinado (`HS256`).
- **Payload padrão**: `{ sub: <id>, email: <email>, role: 'client' | 'artist' }`.
- **Header**: `Authorization: Bearer <token>`.
- **Expiração**: configurável via `JWT_EXPIRES` (default `7d`).
- **Armazenamento sugerido**: secure httpOnly cookie (web) ou storage criptografado (mobile). Evitar localStorage.

### Perfis disponíveis

| Papel    | Origem              | Permissões atuais                                   |
| -------- | ------------------- | --------------------------------------------------- |
| `client` | Cadastro de usuário | Acesso a solicitações, reviews, etc.                |
| `artist` | Cadastro de artista | Gestão de agenda, serviços, solicitações recebidas. |

> 🔐 Ainda não há guardas ativos no backend; porém a API já devolve `role` para bloqueio de UI e preparo quando o guard for adicionado.

---

## 2. Cadastro de usuário

### `POST /auth/register/user`

- **Payload**:
  ```json
  {
    "name": "Ana Souza",
    "email": "ana@example.com",
    "password": "123456",
    "city": "Recife",
    "state": "PE"
  }
  ```
- **Resposta 201**:
  ```json
  { "access_token": "<jwt>" }
  ```
- **Recomendações UI**:
  - Validar senha mínima de 6 caracteres antes de enviar.
  - Normalizar e-mails para minúsculas.
  - Após sucesso, armazenar token e redirecionar para dashboard cliente.
- **Erros esperados**:
  - `409` se email já existir → mostrar mensagem amigável.
  - `400` se campos obrigatórios faltarem.

---

## 3. Cadastro de artista

### `POST /auth/register/artist`

- **Payload mínimo** (conferir DTO completo para campos opcionais):
  ```json
  {
    "name": "DJ Aurora",
    "email": "aurora@example.com",
    "password": "segura123",
    "artTypes": ["música"],
    "city": "São Paulo",
    "state": "SP"
  }
  ```
- **Resposta 201**: perfil sanitizado (sem `passwordHash`).
- **Observações**:
  - Muitos campos são opcionais (`bio`, `socialLinks`, etc.). O frontend pode implementar wizard em etapas.
  - Campo `verified` sempre inicia `false` (mock de verificação via upload).
  - Em caso de sucesso, o backend **não** retorna token; o artista deve logar em seguida.
- **Erros esperados**: mesmos padrões (`400` validação, `409` duplicidade).

---

## 4. Login (cliente ou artista)

### `POST /auth/login`

- **Payload**:
  ```json
  {
    "email": "ana@example.com",
    "password": "123456",
    "accountType": "client"
  }
  ```
- `accountType` é opcional e assume `client`. Para artistas, enviar `
