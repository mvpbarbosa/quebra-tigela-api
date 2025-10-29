# Guia Frontend · Agenda de Artistas

Este guia cobre o uso dos endpoints de agenda (`/schedule`) para exibir, criar e atualizar disponibilidades de artistas.

> Base URL: `{{baseUrl}} = http://localhost:3000/api`

---

## 1. Status da agenda

| Status        | Significado                                  | Impacto na UI                                             |
| ------------- | -------------------------------------------- | --------------------------------------------------------- |
| `available`   | Horário livre para novas solicitações.       | Mostrar como “disponível” e habilitar CTA de agendamento. |
| `unavailable` | Bloqueio manual (férias, indisponibilidade). | Exibir em cinza com tooltip explicando bloqueio.          |
| `booked`      | Reserva confirmada (solicitação aceita).     | Exibir em destaque e impedir edição de horário.           |

> Regra importante: não é permitido mudar de `booked` para `available` diretamente (backend retorna `400`).

---

## 2. Endpoints

### 2.1 Criar entrada de agenda

- **POST `/schedule`**
- **Payload**:
  ```json
  {
    "artistId": "<artistId>",
    "date": "2025-02-01T20:00:00.000Z",
    "status": "available"
  }
  ```
- **Erros**: `409` se já existir agenda para o mesmo artista/data.
- **UI**: formulário ou calendário com seleção de data/hora e status inicial.

### 2.2 Buscar agenda específica

- **GET `/schedule/:id`** → preencher tela de edição.
- **Erros**: `404` se ID inválido → fallback para lista geral.

### 2.3 Listar agenda por artista

- **GET `/schedule/artist/:artistId`**
- **Query params**:
  | Param | Uso |
  |-------|-----|
  | `from`, `to` | Filtrar intervalo (ISO). |
  | `status` | Filtrar por um status específico. |
  | `limit` | Controlar tamanho da resposta (1 a 500). |
- **UI**: construir calendário semanal/mensal usando esses filtros; combinar com `requests` para mostrar conflitos.

### 2.4 Listar apenas futuros

- **GET `/schedule/artist/:artistId/future`**
- Shortcut para popular componente “Próximos horários”.

### 2.5 Atualizar entrada

- **PATCH `/schedule/:id`**
- **Payload**: qualquer subset válido (`artistId`, `date`, `status`).
- **Regras**:
  - É obrigatório enviar pelo menos um campo → `400` caso contrário.
  - Se alterar `artistId` ou `date`, backend valida unicidade.
- **UI**: bloquear edição quando status atual for `booked` (exibir mensagem informativa).

### 2.6 Remover entrada

- **DELETE `/schedule/:id`** → `{ "deleted": true }`.
- **UI**: confirmar com alerta; remover horário da visão imediatamente após sucesso.

---

## 3. Integração com solicitações

- Quando uma solicitação vira `accepted`, o backend cria/atualiza entrada com status `booked`.
- Ao cancelar/rejeitar, se não houver outras solicitações ativas, a agenda volta para `available`.
- Frontend deve reagir a mudanças de status de solicitações e sincronizar o calendário (ex.: via refetch ou websockets futuramente).

---

## 4. Boas práticas

- Unificar componente de seleção de data/hora com validação de timezone (exibir em horário local do artista).
- Destacar conflitos com label “Reservado por X” quando status `booked`.
- Exibir tooltips explicando por que determinado horário não pode ser editado/removido.
- Tratar erros específicos: `409` → “Já existe horário cadastrado”; `400` → mostrar dicas de correção.

---

## 5. Referências

- DTOs: `src/schedule/dto/create-schedule.dto.ts`, `src/schedule/dto/update-schedule.dto.ts`
- Serviço: `src/schedule/schedule.service.ts`
- Coleção Postman: pasta **Schedule**
