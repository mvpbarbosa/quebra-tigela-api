# Guia Frontend · Artistas

Este guia organiza tudo o que o frontend precisa para lidar com perfis de artistas (`/artists`).

> Base URL: `{{baseUrl}} = http://localhost:3000/api`

---

## 1. Estrutura do artista

| Campo                        | Tipo      | Observações de UI                            |
| ---------------------------- | --------- | -------------------------------------------- |
| `_id`                        | ObjectId  | Identificador principal.                     |
| `name`                       | string    | Nome civil; exibir completo.                 |
| `artisticName`               | string?   | Opcional; usar em vitrines caso exista.      |
| `email`                      | string    | Único. Utilizar em formulários e para login. |
| `bio`                        | string?   | Texto livre para página de perfil.           |
| `city` / `state`             | string?   | Mostrar badge de localização.                |
| `artTypes[]`                 | string[]  | Segmentos culturais. Usar como tags/filtros. |
| `verified`                   | boolean   | Selo “Verificado” quando `true`.             |
| `portfolio`, `socialLinks[]` | opcionais | Links externos.                              |
| `hasMEI`, `ccmeiCertificate` | opcionais | Expor somente em áreas administrativas.      |
| `createdAt` / `updatedAt`    | ISO date  | Carimbo de cadastro.                         |

> Senhas não são retornadas. O backend só expõe dados sanitizados (`passwordHash` removido).

---

## 2. Endpoints principais

### 2.1 Criar artista

- **POST `/artists`**
- **Payload mínimo**:
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
- **Resposta 201**: artista sem `passwordHash`.
- **UI**: wizard multi-etapas para coletar dados complementares (portfolio, links, MEI, etc.).
- **Erros**: `409` para email já cadastrado, `400` para validações.

### 2.2 Listar artistas

- **GET `/artists`**
- **Uso**: painel administrativo ou listagem interna (sem filtros de verificação).

### 2.3 Buscar artistas verificados

- **GET `/artists/search`**
- **Query params**:
  | Param | Tipo | Default | Notas |
  |-------|------|---------|-------|
  | `city` | string | — | Filtra por cidade (campo exato). |
  | `artType` | string | — | Filtra segmento (`artTypes`). |
  | `page` | number | 1 | Paginação (>=1). |
  | `limit` | number | 20 | Sugestão máxima de 100 para UI. |
- **Resposta**: apenas artistas `verified: true` com serviços ativos, incluindo campos auxiliares:
  ```json
  {
    "ratingAvg": 4.7,
    "ratingCount": 12,
    "services": [...]
  }
  ```
- **UI**:
  - Exibir `ratingAvg` com estrelas (usar fallback quando `null`).
  - Paginar client-side usando `page`/`limit`.
  - Mostrar badges para `artTypes`.

### 2.4 Perfil completo

- **GET `/artists/:id/profile`**
- **Resposta**:
  ```json
  {
    "artist": { ... },
    "services": [ ... ],
    "schedule": [ ... ],
    "rating": { "avg": 4.8, "count": 22 }
  }
  ```
- **UI**:
  - Construir página detalhada com seções de portfólio, agenda/exibições e avaliações.
  - Ordenar agenda por data ascendente (já vem assim).

### 2.5 Atualizar ou remover artista

- **PATCH `/artists/:id`**: aceita `Partial<CreateArtistDto>`; se `password` mudar, backend rehash.
- **DELETE `/artists/:id`**: `{ "deleted": true }`.
- **Erros**: `404` se ID inválido.

### 2.6 Verificação de identidade (mock)

- **POST `/artists/:id/verify-identity`**
- **Upload**: multipart com `photos` (2 arquivos: foto atual + documento).
- **Limites**: < 10 MB por arquivo; formatos `jpg|jpeg|png|webp`.
- **Resposta**:
  ```json
  {
    "verified": true,
    "similarity": 0.85,
    "artistUpdated": true,
    "verificationDetails": { ... }
  }
  ```
- **UI**: tela de upload orientando artista a enviar fotos nítidas; destacar que processo é simulado em ambiente atual.

---

## 3. Fluxos recomendados

1. **Onboarding de artista**
   - Cadastro → mensagem incentivando upload para verificação → redirecionar para fluxo `/artists/:id/verify-identity`.
2. **Marketplace**
   - Landing → filtros (cidade, `artType`) → cards com rating/serviços → CTA “Ver perfil” (usa `/profile`).
3. **Admin**
   - Tabela com colunas: Nome, Email, Verificado?, Serviços ativos, Última atualização.
   - Botões: “Editar” (abre formulário), “Remover”.

---

## 4. Boas práticas de UI

- Indicar status `verified` com selo visual.
- Ao exibir rating, usar placeholder “Sem avaliações” quando `count = 0`.
- Para campos opcionais (portfolio, socialLinks), condicionar renderização para evitar espaços vazios.
- Tratar `404` com mensagem “Artista não encontrado ou não verificado”.
- Nos formulários, permitir adicionar múltiplas redes sociais (`socialLinks[]`).

---

## 5. Referências

- DTO principal: `src/artists/dto/create-artist.dto.ts`
- Controller/Serviço: `src/artists/artists.controller.ts`, `src/artists/artists.service.ts`
- Coleção Postman: pasta **Artists**
