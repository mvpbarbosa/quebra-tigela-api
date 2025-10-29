# API de Agenda de Artistas

Todas as rotas abaixo herdam o prefixo global `/api` configurado no `main.ts`.

## Criar agenda

`POST /schedule`

Body (JSON):

```json
{
  "artistId": "<ObjectId>",
  "date": "2025-01-20T14:00:00.000Z",
  "status": "available"
}
```

- `status` aceita: `available`, `unavailable`, `booked`.
- Retorna o registro criado.
- Erros comuns: 409 se já existir agenda para o artista na mesma data.

## Consultar agenda por ID

`GET /schedule/:id`

- Retorna o documento completo.
- 404 caso o ID não exista.

## Listar agenda por artista

`GET /schedule/artist/:artistId`

Query params opcionais:

- `from` / `to`: limites de data (ISO 8601). Quando omitidos, retorna todas as datas.
- `status`: filtra por status específico (`available`, `unavailable`, `booked`).
- `limit`: número máximo de registros (1–500, padrão 200).

## Listar próximas disponibilidades

`GET /schedule/artist/:artistId/future`

- Retorna a agenda futura a partir da data/hora atual.
- Útil para exibir slots disponíveis ao usuário final.

## Atualizar agenda

`PATCH /schedule/:id`

Body (JSON):

```json
{
  "date": "2025-01-21T14:00:00.000Z",
  "status": "unavailable"
}
```

- Pelo menos um campo deve ser enviado.
- Não é permitido alterar uma agenda `booked` de volta para `available`.
- Mantém verificação de unicidade (não é possível mover para data já cadastrada).

## Remover agenda

`DELETE /schedule/:id`

- Retorna `{ "deleted": true }` quando o registro é removido.
- 404 se o ID não existir.

## Boas práticas

- Normalize as datas em UTC antes de enviar.
- Garanta que `artistId` seja um `ObjectId` válido.
- Trate respostas `409` exibindo mensagem amigável ao usuário final.
