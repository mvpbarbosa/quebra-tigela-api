# Guia Frontend · Avaliações

Orienta o uso dos endpoints de avaliações (`/reviews`) para criar e exibir feedbacks de clientes.

> Base URL: `{{baseUrl}} = http://localhost:3000/api`

---

## 1. Estrutura da avaliação

| Campo                     | Tipo      | Observações                                                 |
| ------------------------- | --------- | ----------------------------------------------------------- |
| `_id`                     | ObjectId  | Identificador do review.                                    |
| `artistId`                | ObjectId  | Artista avaliado.                                           |
| `userId`                  | ObjectId  | Cliente autor.                                              |
| `rating`                  | int (1-5) | Exibir com estrelas/nota.                                   |
| `comment`                 | string?   | Opcional, máx livre; permitir até ~500 caracteres no front. |
| `createdAt` / `updatedAt` | ISO date  | Usar para ordenação e exibir “há X dias”.                   |

> Há índice único por `artistId + userId`: um usuário avalia cada artista apenas uma vez (após serviço concluído).

---

## 2. Endpoints

### 2.1 Criar avaliação

- **POST `/reviews`**
- **Payload**:
  ```json
  {
    "artistId": "<artistId>",
    "userId": "<userId>",
    "rating": 5,
    "comment": "Excelente performance!"
  }
  ```
- **Regras**:
  - Backend verifica se existe solicitação `completed` para o par `userId/artistId`.
  - Caso contrário, retorna `400` com mensagem `You can only review after a completed service`.
- **UI**:
  - Disponibilizar componente de avaliação somente quando `request.status === 'completed'`.
  - Validar `rating` (1-5). Usar slider ou estrelas clicáveis.
  - Campo `comment` opcional com contador de caracteres.

### 2.2 Listar avaliações do artista

- **GET `/reviews/artist/:artistId`**
- **Resposta**: array ordenado por `createdAt desc`.
- **UI**:
  - Exibir nota média (pode combinar com dados trazidos por `/artists/:id/profile`).
  - Mostrar nome do usuário (se disponível via cache) e data formatada.
  - Indicar quando não há avaliações (“Seja o primeiro a avaliar”).

---

## 3. Fluxos sugeridos

1. **Após serviço concluído**
   - Solicitação muda para `completed` → mostrar modal “Avalie sua experiência”.
   - Em submissão bem-sucedida, atualizar lista com novo review e incrementar contagem.
2. **Tela de perfil do artista**
   - Carregar reviews via `/artists/:id/profile` (que não inclui lista) **ou** via `GET /reviews/artist/:id`.
   - Ordenar por data e destacar nota.

---

## 4. Boas práticas

- Desabilitar botão enquanto `POST /reviews` estiver em andamento.
- Tratar erros de backend com mensagens claras (“Complete um serviço antes de avaliar”).
- Evitar múltiplos envios: uma vez enviado, bloquear novo formulário para o mesmo artista/usuário.
- Exibir skeleton placeholders enquanto reviews são carregados.

---

## 5. Referências

- DTO: `src/reviews/dto/create-review.dto.ts`
- Serviço: `src/reviews/reviews.service.ts`
- Coleção Postman: pasta **Reviews**
