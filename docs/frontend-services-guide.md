# Guia Frontend · Serviços Ofertados

Este guia descreve como integrar as telas de catálogo e gerenciamento de serviços (`/service-offerings`).

> Base URL: `{{baseUrl}} = http://localhost:3000/api`

---

## 1. Estrutura do serviço

| Campo         | Tipo     | Observações de UI                                                    |
| ------------- | -------- | -------------------------------------------------------------------- | ------------------------------------------ |
| `_id`         | ObjectId | Identificador do serviço.                                            |
| `artistId`    | ObjectId | Relaciona com artista; usar para filtros.                            |
| `title`       | string   | Nome comercial (exibir em destaque).                                 |
| `description` | string?  | Texto livre para detalhes.                                           |
| `media[]`     | array    | Itens `{ type: 'image'                                               | 'video', url }`; renderizar conforme tipo. |
| `active`      | boolean  | Controle de visibilidade; mostrar etiqueta “Inativo” quando `false`. |

---

## 2. Endpoints

### 2.1 Criar serviço

- **POST `/service-offerings`**
- **Payload**:
  ```json
  {
    "artistId": "<artistId>",
    "title": "Show acústico",
    "description": "Repertório POP/MPB",
    "media": [{ "type": "image", "url": "https://cdn/.../foto.jpg" }],
    "active": true
  }
  ```
- **UI**: formulário com upload opcional de mídia (armazenar URL antes de enviar).
- **Erros**: validação de campos obrigatórios (`artistId`, `title`).

### 2.2 Listar serviços por artista

- **GET `/service-offerings/artist/:artistId`**
- **Resposta**: serviços ativos (`active: true`).
- **UI**:
  - Galeria de cards com título, descrição resumida e miniaturas de mídia.
  - Permitir fallback quando não houver serviços (call-to-action “Crie seu primeiro serviço”).

> No momento não há endpoints para atualizar ou desativar serviços; considerar rota custom em futuras versões.

---

## 3. Fluxos sugeridos

1. **Painel do artista**
   - Página “Meus serviços” → carrega `GET /service-offerings/artist/:id`.
   - Botão “Novo serviço” → abre modal/wizard → `POST` → refetch.
2. **Perfil público**
   - Consumir `services` retornados em `/artists/:id/profile` (mesmos dados), evitando nova chamada.

---

## 4. Boas práticas

- Validar URLs de mídia antes de enviar (ou integrar com uploader próprio).
- Permitir pré-visualização das imagens/vídeos cadastrados.
- Destacar flag `active` em UI administrativa para sinalizar serviços ocultos.
- Em caso de erro `400`, exibir mensagem amigável indicando campos obrigatórios.

---

## 5. Referências

- DTO: `src/services/dto/create-service.dto.ts`
- Controller/Service: `src/services/services.controller.ts`, `src/services/services.service.ts`
- Coleção Postman: pasta **Service Offerings**
