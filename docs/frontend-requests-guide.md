# Guia Frontend · Solicitações de Serviços

Este documento consolida tudo o que a equipe de frontend precisa saber sobre o módulo de **solicitações** (`requests`) da Quebra Tigela API. Ele apresenta o catálogo de status possíveis, regras de transição, endpoints relevantes e recomendações de UX para cada papel (cliente e artista).

> Base URL: `{{baseUrl}} = http://localhost:3000/api`

---

## 1. Catálogo de status

Cada solicitação trafega com o campo `status`, definido no backend como um dos valores abaixo:

| Status      | Quem vê primeiro   | Como ocorre                                                                                       | O que comunicar na UI                                                          |
| ----------- | ------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `pending`   | Cliente & Artista  | Valor padrão ao criar a solicitação. Representa “aguardando resposta”.                            | Mostrar cartão neutro com CTA para o artista aceitar/rejeitar.                 |
| `accepted`  | Cliente & Artista  | Definido quando o artista confirma o pedido. Agenda do artista vira _booked_.                     | Destacar em verde. Cliente deve enxergar próximos passos (pagamento, contato). |
| `rejected`  | Cliente            | Artista recusou. Agenda volta para `available` se não houver outros bookings.                     | Mostrar aviso em vermelho. CTA para criar nova solicitação.                    |
| `completed` | Cliente & Artista  | Artista sinaliza conclusão do serviço. Mantém agenda como `booked`.                               | Mostrar selo “Concluído”. Habilitar ação de avaliar (`reviews`).               |
| `cancelled` | Cliente ou Artista | Solicitação cancelada antes da execução. Agenda volta a `available` se for o único booking ativo. | Exibir aviso em laranja e remover CTAs de ação.                                |

### Observações importantes

- O backend garante a unicidade de data + artista para solicitações com status `pending`, `accepted` ou `completed`. Isso evita overbooking.
- Transições para `accepted` e `completed` acontecem somente se o artista iniciar a mudança (via endpoint de status).
- `cancelled` e `rejected` liberam o horário na agenda **caso não existam outras solicitações ativas para a mesma data**.

---

## 2. Regras de transição

```
pending → accepted → completed
    └────────────→ rejected
    └────────────→ cancelled
accepted ─────────→ cancelled (ex.: cliente desiste)
```

- **pending → accepted**: ação do artista ao clicar em “Aceitar solicitação”. Backend marca a agenda como `booked`.
- **pending → rejected**: ação do artista. Agenda permanece `available`.
- **accepted → completed**: artista confirma entrega do serviço. Use para liberar avaliação.
- **accepted → cancelled**: qualquer uma das partes pode cancelar (por exemplo, cliente desistiu). Agenda volta a `available` se não houver outro booking.
- **pending → cancelled**: permitido, caso o cliente retire o pedido antes da resposta.

Para o frontend, sempre exibir apenas as ações válidas a partir do status atual.

---

## 3. Endpoints envolvidos

### 3.1 Criar solicitação

- **URL**: `POST /requests`
- **Body (JSON)**:
  ```json
  {
    "userId": "<id do cliente>",
    "artistId": "<id do artista>",
    "serviceId": "<id do serviço>",
    "eventDate": "2025-01-25T20:00:00.000Z",
    "location": "Rua Exemplo, 123",
    "details": "Evento corporativo"
  }
  ```
- **Resposta (201)**:
  ```json
  {
    "_id": "...",
    "userId": "...",
    "artistId": "...",
    "serviceId": "...",
    "eventDate": "2025-01-25T20:00:00.000Z",
    "status": "pending",
    "location": "Rua Exemplo, 123",
    "details": "Evento corporativo",
    "requestedAt": "2025-01-10T15:32:01.123Z"
  }
  ```
- **Regras**: status sempre nasce como `pending`.

### 3.2 Atualizar status

- **URL**: `PATCH /requests/:id/status`
- **Body (JSON)**:
  ```json
  {
    "status": "accepted"
  }
  ```
- **Valores aceitos**: `accepted`, `rejected`, `completed`, `cancelled`.
- **Resposta (200)**: retorna o documento atualizado.
- **Efeitos colaterais**:
  - `accepted`: cria/atualiza entrada na agenda (`schedule`) para `booked`.
  - `cancelled`/`rejected`: agenda volta para `available` se não houver outra solicitação ativa na mesma data.

### 3.3 Listar por usuário

- **URL**: `GET /requests/user/:userId`
- **Resposta (200)**: lista ordenada por `requestedAt` decrescente com todas as solicitações do cliente.

### 3.4 Listar por artista

- **URL**: `GET /requests/artist/:artistId`
- **Resposta (200)**: lista ordenada por `requestedAt` decrescente com todas as solicitações recebidas pelo artista.

> **Autenticação**: atualmente os endpoints não exigem token, porém os headers `Authorization: Bearer {{accessTokenClient}}` ou `{{accessTokenArtist}}` já estão preparados no Postman. Caso o backend passe a requerer autenticação, basta ativar os headers correspondentes.

---

## 4. Recomendações de UI/UX

| Status    | Cor sugerida              | Ação para cliente                                   | Ação para artista                                 |
| --------- | ------------------------- | --------------------------------------------------- | ------------------------------------------------- |
| pending   | Neutro (cinza/azul claro) | Mostrar botão “Cancelar solicitação”.               | Botões “Aceitar” e “Rejeitar”.                    |
| accepted  | Verde                     | Mostrar próximos passos (contato, pagamento).       | Botões “Concluir” e “Cancelar”.                   |
| rejected  | Vermelho                  | CTA “Criar nova solicitação” / “Explorar artistas”. | Exibir justificativa se houver. Sem ações extras. |
| completed | Azul/Verde escuro         | CTA “Avaliar experiência” (link para `/reviews`).   | Label “Concluído”, nenhuma ação adicional.        |
| cancelled | Laranja                   | Mensagem contextual e opção de reagendar.           | Mostrar motivo (se capturado) e liberar horários. |

### Dicas adicionais

- Exibir `eventDate` no fuso do usuário e indicar diferença de `requestedAt` (“criado há 2 dias”).
- Mostrar `location` e `details` em destaque para facilitar o entendimento rápido.
- Para artistas, manter um filtro rápido no painel por `status` para priorização.

---

## 5. Fluxos de trabalho sugeridos

1. **Cliente cria solicitação** → status `pending` → notificação ao artista (push/email/UI).
2. **Artista aceita** → status `accepted` → agenda fechada e cliente notificado.
3. **Serviço realizado** → artista marca `completed` → liberar componente de avaliação.
4. **Cancelamento**:
   - Cliente cancela antes da confirmação → status `cancelled`, agenda livre.
   - Artista rejeita → status `rejected`, cliente convidado a tentar outro horário/artista.

Frontend deve refletir cada mudança em tempo real (polling ou websockets) para evitar exibição de ações inválidas.

---

## 6. Validações e mensagens de erro

- Se o backend responder `400 Date not available`, exibir toast informando que o horário foi preenchido por outra solicitação.
- Para `404 Request not found`, redirecionar o usuário para a lista geral e atualizar o estado local.
- Validar lado cliente: todos os campos obrigatórios (IDs, data, local) devem estar preenchidos antes de chamar o endpoint.

---

## 7. Referências úteis

- Coleção Postman: `postman/quebra-tigela-api.postman_collection.json` (folder **Requests**).
- Esquema Mongoose: `src/requests/schemas/request.schema.ts`.
- Serviço responsável por transições: `src/requests/requests.service.ts`.

Manter este guia atualizado sempre que novos status, ações ou políticas forem adicionados ao backend.
