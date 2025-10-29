# Quebra Tigela API · Referência Completa

Este documento reúne **todos os recursos expostos pela Quebra Tigela API**, incluindo requisitos de autenticação, formatos de payload, códigos de resposta, efeitos colaterais no backend e regras de negócio relevantes. Use-o como fonte única para front-end, mobile, QA e integrações externas.

> **Base URL padrão**: `http://localhost:3000/api`

---

## 👀 Visão Geral Rápida

- **Framework**: NestJS + Mongoose.
- **Banco**: MongoDB (`MONGODB_URI`), com coleções `users`, `artists`, `services`, `schedule`, `requests`, `reviews`, `password_resets`.
- **Prefixo global**: todos os caminhos são servidos sob `/api` (definido em `main.ts`).
- **Validações**: o `ValidationPipe` global rejeita campos não listados (whitelist) e transforma tipos básicos com base nos DTOs.
- **Tratamento de erros**: ver seção [Erros & validações](#-erros--validações).
- **Coleção Postman**: `postman/quebra-tigela-api.postman_collection.json` contém todos os endpoints com exemplos.

---

## 🔐 Autenticação & Autorização

- A API usa **JWT**. Tokens são emitidos em `POST /auth/login` e `POST /auth/register/user`.
- O payload padrão do token inclui `sub` (ID), `email` e `role` (`client` ou `artist`).
- Envie o token via header: `Authorization: Bearer <token>`.
- No momento, nenhum endpoint está protegido por guarda (`@UseGuards`) por padrão, mas os headers já estão preparados nas coleções. Considere autenticação obrigatória como próximo passo.
- **Variáveis de ambiente relevantes**:
  - `JWT_SECRET`: segredo usado pelo `JwtModule`.
  - `JWT_EXPIRES`: tempo de expiração (default `7d`).

---

## 🚨 Erros & validações

Todos os erros passam por `AllExceptionsFilter`, retornando o padrão abaixo:

```json
{
  "statusCode": 400,
  "message": "Mensagem amigável",
  "error": "Bad Request"
}
```

- **Validação de DTO**: violações de `class-validator` retornam `400`.
- **Registros duplicados** (`MongoError 11000`): viram `409 Conflict` com mensagem amigável.
- **Não encontrado**: `404` com mensagem específica (por exemplo, `Usuário não encontrado`).
- **Interno**: `500` com mensagem genérica `Erro interno do servidor`.

---

## 🧱 Modelos de dados principais

| Modelo            | Coleção           | Campos-chave                                                                                                                                  |
| ----------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`            | `users`           | `name`, `email` (único), `passwordHash`, `city`, `state`, `role`                                                                              |
| `Artist`          | `artists`         | `name`, `email` (único), `passwordHash`, `bio`, `city`, `state`, `verified`, `artTypes[]`, atributos opcionais (portfolio, social links etc.) |
| `ServiceOffering` | `services`        | `artistId`, `title`, `description`, `media[{type,url}]`, `active`                                                                             |
| `ScheduleEntry`   | `schedule`        | `artistId`, `date`, `status` (`available`, `unavailable`, `booked`)                                                                           |
| `Request`         | `requests`        | `userId`, `artistId`, `serviceId`, `eventDate`, `status`, `location`, `details`, `requestedAt`, `updatedAt`                                   |
| `Review`          | `reviews`         | `artistId`, `userId`, `rating (1-5)`, `comment`, timestamps                                                                                   |
| `PasswordReset`   | `password_resets` | `email`, `code` (6 dígitos), `expiresAt`, `used`                                                                                              |

> 💡 Índices relevantes: `requests` garante unicidade de (`artistId`, `eventDate`) para status `pending/accepted/completed`; `schedule` também exige unicidade por artista + data; `reviews` impede avaliações duplicadas (`artistId` + `userId`).

---

## 📚 Sumário de Endpoints

| Módulo         | Método   | Caminho (já com `/api`)               | Descrição                                  |
| -------------- | -------- | ------------------------------------- | ------------------------------------------ |
| Saúde          | `GET`    | `/`                                   | Hello World (sanidade da API)              |
| Auth           | `POST`   | `/auth/register/user`                 | Cria usuário e devolve JWT                 |
| Auth           | `POST`   | `/auth/register/artist`               | Cria artista (retorna perfil sanitizado)   |
| Auth           | `POST`   | `/auth/login`                         | Login de usuário ou artista                |
| Password Reset | `POST`   | `/auth/password-reset/request`        | Envia código de recuperação                |
| Password Reset | `POST`   | `/auth/password-reset/validate`       | Valida código                              |
| Password Reset | `POST`   | `/auth/password-reset/reset`          | Redefine senha                             |
| Users          | `POST`   | `/users`                              | Cria cliente                               |
| Users          | `GET`    | `/users`                              | Lista clientes                             |
| Users          | `GET`    | `/users/:id`                          | Busca cliente                              |
| Users          | `PATCH`  | `/users/:id`                          | Atualiza cliente                           |
| Users          | `DELETE` | `/users/:id`                          | Remove cliente                             |
| Artists        | `POST`   | `/artists`                            | Cria artista                               |
| Artists        | `GET`    | `/artists`                            | Lista artistas                             |
| Artists        | `GET`    | `/artists/search`                     | Busca artistas verificados                 |
| Artists        | `GET`    | `/artists/:id`                        | Busca artista                              |
| Artists        | `GET`    | `/artists/:id/profile`                | Perfil completo (serviços, agenda, rating) |
| Artists        | `PATCH`  | `/artists/:id`                        | Atualiza artista                           |
| Artists        | `DELETE` | `/artists/:id`                        | Remove artista                             |
| Artists        | `POST`   | `/artists/:id/verify-identity`        | Upload (foto atual + documento)            |
| Serviços       | `POST`   | `/service-offerings`                  | Cria oferta de serviço                     |
| Serviços       | `GET`    | `/service-offerings/artist/:artistId` | Lista serviços ativos do artista           |
| Agenda         | `POST`   | `/schedule`                           | Cria horário                               |
| Agenda         | `GET`    | `/schedule/:id`                       | Busca horário                              |
| Agenda         | `GET`    | `/schedule/artist/:artistId`          | Lista horário filtrado                     |
| Agenda         | `GET`    | `/schedule/artist/:artistId/future`   | Lista futuros                              |
| Agenda         | `PATCH`  | `/schedule/:id`                       | Atualiza horário                           |
| Agenda         | `DELETE` | `/schedule/:id`                       | Remove horário                             |
| Solicitações   | `POST`   | `/requests`                           | Cria solicitação de serviço                |
| Solicitações   | `PATCH`  | `/requests/:id/status`                | Atualiza status                            |
| Solicitações   | `GET`    | `/requests/user/:userId`              | Lista por cliente                          |
| Solicitações   | `GET`    | `/requests/artist/:artistId`          | Lista por artista                          |
| Avaliações     | `POST`   | `/reviews`                            | Cria avaliação                             |
| Avaliações     | `GET`    | `/reviews/artist/:artistId`           | Lista avaliações                           |
| Face           | `POST`   | `/face-comparison/compare`            | Compara duas imagens                       |
| Face           | `POST`   | `/face-comparison/verify-identity`    | Verifica rosto x documento                 |
| Face           | `POST`   | `/face-comparison/verify-artist`      | Verifica artista (retorna status)          |
| Face           | `POST`   | `/face-comparison/analyze-quality`    | Avalia qualidade da imagem                 |

---

## 🌡️ Saúde & Metadados

### `GET /api/`

- **Descrição**: teste rápido de disponibilidade.
- **Resposta 200**:
  ```json
  "Hello World!"
  ```
- **Observações**: ideal para check de uptime ou monitoramento.

---

## 👥 Autenticação & Contas

### `POST /api/auth/register/user`

- **Descrição**: cria um cliente e já devolve JWT.
- **Body (JSON)**:
  | Campo | Tipo | Obrigatório | Observações |
  |-------|------|-------------|-------------|
  | `name` | string | ✔ | Nome completo |
  | `email` | string (email) | ✔ | Único, case-insensitive |
  | `password` | string (>=6) | ✔ | Será armazenada como hash |
  | `city` | string | ✖ | Opcional |
  | `state` | string | ✖ | Opcional |
- **Resposta 201**:
  ```json
  {
    "access_token": "<jwt>"
  }
  ```
- **Erros comuns**: `409` se email já existir.

### `POST /api/auth/register/artist`

- **Descrição**: cria artista e retorna perfil (sem `passwordHash`).
- **Body**: segue `CreateArtistDto` com validações específicas (nome, email, senha, `artTypes[]` obrigatório, campos complementares opcionais).
- **Resposta 201 (exemplo)**:
  ```json
  {
    "_id": "663...",
    "name": "Maria Souza",
    "email": "maria@example.com",
    "verified": false,
    "artTypes": ["música"],
    "city": "Recife",
    "state": "PE",
    "createdAt": "2025-01-10T15:32:01.123Z",
    "updatedAt": "2025-01-10T15:32:01.123Z"
  }
  ```
- **Notas**: respostas de erro seguem padrão do filtro global (409 para duplicidade, 400 para validação).

### `POST /api/auth/login`

- **Descrição**: autentica cliente (default) ou artista.
- **Body**:
  ```json
  {
    "email": "maria@example.com",
    "password": "123456",
    "accountType": "artist" // opcional, default "client"
  }
  ```
- **Resposta 200**:
  ```json
  {
    "access_token": "<jwt>"
  }
  ```
- **Erros**: `401 Invalid credentials` quando email/senha não batem.

---

## 🔄 Recuperação de Senha

### `POST /api/auth/password-reset/request`

- **Descrição**: gera código de 6 dígitos válido por 6 minutos e dispara e-mail.
- **Body**:
  ```json
  { "email": "usuario@example.com" }
  ```
- **Resposta 200**: `{ "message": "Código enviado para o e-mail" }`
- **Erros**: `404` se usuário/artista não encontrado.

### `POST /api/auth/password-reset/validate`

- **Descrição**: valida se código ainda é válido e não utilizado.
- **Body**:
  ```json
  {
    "email": "usuario@example.com",
    "code": "123456"
  }
  ```
- **Resposta 200**: `{ "valid": true }`
- **Erros**: `400` para código inválido/expirado.

### `POST /api/auth/password-reset/reset`

- **Descrição**: redefine senha, invalida o código e rehash da senha.
- **Body**:
  ```json
  {
    "email": "usuario@example.com",
    "code": "123456",
    "newPassword": "novaSenhaSegura"
  }
  ```
- **Resposta 200**: `{ "message": "Senha redefinida com sucesso" }`
- **Erros**: `400` para código inválido/expirado, `404` se usuário deixar de existir.

---

## 👤 Usuários (`/api/users`)

### `POST /users`

- **Descrição**: cria cliente (sem autenticação por enquanto).
- **Body**: igual a [`register/user`](#post-apiauthregisteruser).
- **Resposta 201**: objeto do usuário sem `passwordHash`.

### `GET /users`

- **Descrição**: lista todos os clientes.
- **Resposta 200**: `User[]` (campos principais + timestamps).

### `GET /users/:id`

- **Descrição**: retorna cliente específico.
- **Erros**: `404` se não existir.

### `PATCH /users/:id`

- **Descrição**: atualiza campos do usuário. Se `password` vier, o serviço converte para `passwordHash`.
- **Body**: `Partial<CreateUserDto>`.
- **Erros**: `404` se não existir.

### `DELETE /users/:id`

- **Resposta 200**: `{ "deleted": true }`.
- **Erros**: `404` se não existir.

---

## 🎨 Artistas (`/api/artists`)

### `POST /artists`

- **Descrição**: cria artista. Campos seguem `CreateArtistDto` (ver [Modelos](#-modelos-de-dados-principais)).
- **Resposta 201**: artista sem `passwordHash`.

### `GET /artists`

- **Descrição**: lista todos os artistas (independente de verificação).

### `GET /artists/search`

- **Descrição**: busca artistas **verificados** com serviços ativos.
- **Query params**:
  | Param | Tipo | Default | Observações |
  |-------|------|---------|-------------|
  | `city` | string | — | Filtra por cidade |
  | `artType` | string | — | Filtra por segmento |
  | `page` | number | `1` | Posição na paginação (>=1) |
  | `limit` | number | `20` | Máx 100 recomendado |
- **Resposta 200**: lista sanitizada com métricas (`ratingAvg`, `ratingCount`) e serviços ativos embutidos.

### `GET /artists/:id`

- **Descrição**: retorna artista (404 se não achar).

### `GET /artists/:id/profile`

- **Descrição**: payload consolidado para página de perfil.
- **Resposta 200 (exemplo simplificado)**:
  ```json
  {
    "artist": { "_id": "...", "name": "...", "verified": true, ... },
    "services": [ { "_id": "...", "title": "Show acústico", ... } ],
    "schedule": [ { "_id": "...", "date": "2025-02-01T20:00:00.000Z", "status": "available" } ],
    "rating": { "avg": 4.8, "count": 12 }
  }
  ```
- **Erros**: `404` se artista não existir ou não estiver verificado.

### `PATCH /artists/:id`

- **Descrição**: atualiza artista. Senhas são rehashadas se informadas.

### `DELETE /artists/:id`

- **Resposta**: `{ "deleted": true }` ou `404`.

### `POST /artists/:id/verify-identity`

- **Descrição**: simulação de verificação (mock) com duas imagens.
- **Upload**: `multipart/form-data` com campo `photos` (array) contendo **2 arquivos** (`foto atual`, `documento`).
- **Limites**: máx 10 MB cada, tipos `jpg|jpeg|png|webp`.
- **Resposta 200**:
  ```json
  {
    "verified": true,
    "similarity": 0.85,
    "artistUpdated": true,
    "verificationDetails": {
      "detectionMethod": "Mock verification (development mode)",
      "threshold": 0.6,
      "timestamp": "2025-01-10T16:00:00.000Z"
    }
  }
  ```

---

## 🗂️ Serviços (`/api/service-offerings`)

### `POST /service-offerings`

- **Descrição**: cria um serviço para um artista.
- **Body** (conforme `CreateServiceOfferingDto`):
  | Campo | Tipo | Obrigatório | Observações |
  |-------|------|-------------|-------------|
  | `artistId` | ObjectId | ✔ | Dono do serviço |
  | `title` | string | ✔ | Nome comercial |
  | `description` | string | ✖ | Detalhes |
  | `media` | array | ✖ | `{ type: 'image'|'video', url }[]` |
  | `active` | boolean | ✖ | Default `true` |
- **Resposta 201**: documento criado.

### `GET /service-offerings/artist/:artistId`

- **Descrição**: lista serviços ativos (`active: true`).
- **Resposta**: `ServiceOffering[]`.

---

## 🗓️ Agenda (`/api/schedule`)

### `POST /schedule`

- **Descrição**: cria entrada de agenda.
- **Body**:
  ```json
  {
    "artistId": "<ObjectId>",
    "date": "2025-02-01T20:00:00.000Z",
    "status": "available" // available | unavailable | booked
  }
  ```
- **Erros**: `409` se já existir agenda para a mesma data/artista.

### `GET /schedule/:id`

- **Descrição**: busca entrada. `404` se não existir.

### `GET /schedule/artist/:artistId`

- **Query params**:
  | Param | Tipo | Observações |
  |-------|------|-------------|
  | `from` | ISO date | Filtra datas >= `from` |
  | `to` | ISO date | Filtra datas <= `to` |
  | `status` | string | Um dos `available/unavailable/booked` |
  | `limit` | number | Default 200, máx 500 |
- **Erros**: `400` se status inválido.

### `GET /schedule/artist/:artistId/future`

- **Descrição**: atalho para listar datas futuras (>= agora), ordenadas asc.

### `PATCH /schedule/:id`

- **Descrição**: atualiza entrada. Pelo menos um campo deve ser informado.
- **Regras**:
  - Não permite mover de `booked` para `available`.
  - Se alterar `artistId`/`date`, ainda precisa manter unicidade.
- **Erros**: `400` sem campos; `409` se tentar duplicar data; `404` se não existir.

### `DELETE /schedule/:id`

- **Resposta**: `{ "deleted": true }`.

---

## 📬 Solicitações de Serviço (`/api/requests`)

> Consulte também `docs/frontend-requests-guide.md` para orientações de UX e lifecycle.

### Campos principais

| Campo       | Tipo     | Regra                                                                 |
| ----------- | -------- | --------------------------------------------------------------------- |
| `userId`    | ObjectId | Cliente autor                                                         |
| `artistId`  | ObjectId | Artista alvo                                                          |
| `serviceId` | ObjectId | Serviço relacionado                                                   |
| `eventDate` | Date     | Reservado para agenda + validação de conflito                         |
| `status`    | enum     | `pending` (default), `accepted`, `rejected`, `completed`, `cancelled` |
| `location`  | string   | Local do evento                                                       |
| `details`   | string?  | Observações                                                           |

### Transições permitidas

```
pending → accepted → completed
    └────────────→ rejected
    └────────────→ cancelled
accepted ─────────→ cancelled
```

### `POST /requests`

- **Descrição**: cria solicitação e reserva o slot se estiver disponível.
- **Body** (CreateRequestDto).
- **Regras**:
  - Falha com `400 Date not available` se `schedule` já estiver `booked/unavailable`.
  - Status inicial `pending`.

### `PATCH /requests/:id/status`

- **Body**:
  ```json
  { "status": "accepted" }
  ```
- **Regras de negócio**:
  - `accepted`: agenda vira `booked` (upsert).
  - `cancelled`/`rejected`: agenda volta para `available` **se** não houver outra solicitação ativa (`accepted/completed`) para a mesma data.
- **Erros**: `404 Request not found` se ID inexistente.

### `GET /requests/user/:userId`

- **Descrição**: lista do cliente, ordenado por `requestedAt desc`.

### `GET /requests/artist/:artistId`

- **Descrição**: lista recebidas pelo artista, ordenado por `requestedAt desc`.

---

## ⭐ Avaliações (`/api/reviews`)

### `POST /reviews`

- **Descrição**: cadastra avaliação somente se houver solicitação `completed` para o par usuário+artista.
- **Body** (`CreateReviewDto`):
  | Campo | Tipo | Regra |
  |-------|------|-------|
  | `artistId` | ObjectId | ✔ |
  | `userId` | ObjectId | ✔ |
  | `rating` | inteiro 1-5 | ✔ |
  | `comment` | string | opcional |
- **Erros**: `400 You can only review after a completed service`.

### `GET /reviews/artist/:artistId`

- **Descrição**: lista avaliações do artista, ordenadas por `createdAt desc`.

---

## 🤖 Reconhecimento Facial (`/api/face-comparison`)

Todos os endpoints exigem upload via `multipart/form-data` e limitam cada arquivo a **10 MB** (`jpg`, `jpeg`, `png`, `webp`).

### `POST /face-comparison/compare`

- **Campos**: `images` (array) com exatamente 2 arquivos.
- **Resposta**:
  ```json
  {
    "similarity": 0.82,
    "isMatch": true,
    "confidence": 82,
    "detectionMethod": "Sharp-based image analysis"
  }
  ```

### `POST /face-comparison/verify-identity`

- **Campos**: `photos` (array) com `foto do usuário` + `foto do documento`.
- **Resposta**: igual ao `compare`, com campos adicionais `verified`, `message`, `details`.

### `POST /face-comparison/verify-artist`

- **Campos**:
  - `photos` (2 arquivos).
  - Body JSON ou form field `artistId` obrigatório.
- **Resposta**:
  ```json
  {
    "verified": true,
    "similarity": 0.88,
    "confidence": 88,
    "message": "Identidade verificada com sucesso",
    "details": {...},
    "artistId": "...",
    "timestamp": "2025-01-10T16:20:00.000Z",
    "status": "APPROVED"
  }
  ```

### `POST /face-comparison/analyze-quality`

- **Campo**: `image` (único arquivo).
- **Resposta**:
  ```json
  {
    "quality": "good",
    "score": 78,
    "issues": ["Contraste muito baixo"],
    "hasFace": true
  }
  ```
- **Erros**: `400` se imagem ausente ou vazia.

---

## 🧰 Recursos adicionais

- **Coleção Postman**: `postman/quebra-tigela-api.postman_collection.json` (inclui scripts que capturam tokens automaticamente).
- **Guia de status de solicitações**: `docs/frontend-requests-guide.md` detalha jornadas e recomendações de UX.
- **Modelos de IA**: arquivos estáticos em `models/` são carregados pelo serviço de face (modo mock). Certifique-se de baixá-los em produção real.

---

## ✅ Boas práticas & próximos passos

- Habilitar guards (`JwtAuthGuard`/`RolesGuard`) nos módulos sensíveis.
- Garantir `HTTPS` em produção para upload seguro de imagens.
- Monitorar tempo de expiração de códigos de reset (6 minutos) e comunicar usuário na UI.
- Revisar limites de paginação no endpoint de busca para evitar paginações muito grandes.
- Manter este documento sincronizado após qualquer alteração de rota ou validação.

---

## 📎 Histórico do documento

- **29/10/2025**: primeira versão completa da referência da API.
