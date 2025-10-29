# Guia Frontend · Reconhecimento Facial

Documenta boas práticas para integrar os endpoints de verificação facial (`/face-comparison`).

> Base URL: `{{baseUrl}} = http://localhost:3000/api`

Todos os endpoints exigem `multipart/form-data` e aceitam arquivos `jpg`, `jpeg`, `png`, `webp` de até **10 MB** cada.

---

## 1. Cenários suportados

| Endpoint                                | Uso principal                                         | Entradas                                    |
| --------------------------------------- | ----------------------------------------------------- | ------------------------------------------- |
| `POST /face-comparison/compare`         | Comparar duas imagens livres (ex.: selfie vs selfie). | Campo `images` com **2 arquivos**.          |
| `POST /face-comparison/verify-identity` | Validar usuário com documento.                        | Campo `photos` (selfie + documento).        |
| `POST /face-comparison/verify-artist`   | Validar artista específico (mock).                    | `photos` (2 arquivos) + `artistId` no body. |
| `POST /face-comparison/analyze-quality` | Checar se foto tem qualidade mínima.                  | Campo `image` (1 arquivo).                  |

---

## 2. Padrão de respostas

- **Compare/Verify**:
  ```json
  {
    "similarity": 0.82,
    "isMatch": true,
    "confidence": 82,
    "detectionMethod": "Sharp-based image analysis"
  }
  ```
- **Verify identity/artist** adiciona:
  ```json
  {
    "verified": true,
    "message": "Identidade verificada com sucesso",
    "details": { "threshold": 0.6, ... }
  }
  ```
- **Verify artist** ainda inclui `artistId`, `timestamp`, `status` (`APPROVED` ou `REJECTED`).
- **Analyze quality**:
  ```json
  {
    "quality": "good",
    "score": 78,
    "issues": ["Contraste muito baixo"],
    "hasFace": true
  }
  ```

> Valores são simulados em ambiente atual (mock) e podem mudar quando modelos reais forem integrados.

---

## 3. UX recomendada por fluxo

### 3.1 Comparar imagens (demo/QA)

- Formulário com dois campos de upload.
- Validar extensões e tamanho antes de enviar.
- Após resposta, exibir barra de similaridade (0-100%) e mensagem “Faces coincidem” quando `isMatch` for `true`.

### 3.2 Verificar identidade do usuário

- Pedir selfie atual e foto nítida do documento (mesmo rosto).
- Exibir checklist de qualidade (boa iluminação, rosto centralizado).
- Usar `message` do backend para feedback.
- Em caso de `verified: false`, oferecer retentativa.

### 3.3 Verificar artista

- Usar `artistId` no corpo (campo oculto).
- Após resposta, mostrar status textual (`APPROVED` ou `REJECTED`) e log de `timestamp`.
- Atualizar UI do artista (exibir selo “Verificado” se `verified: true`).

### 3.4 Analisar qualidade

- Ideal para pré-validação antes de subir foto definitiva.
- Interpretar `quality`/`score`:
  | Qualidade | Faixa sugerida | UI |
  |-----------|----------------|----|
  | `excellent` | >= 90 | Avançar sem alertas. |
  | `good` | 70-89 | Mostrar ok com dicas opcionais. |
  | `fair` | 50-69 | Sugerir enviar foto melhor. |
  | `poor` | < 50 | Bloquear envio e listar `issues`. |

---

## 4. Tratamento de erros

- `400`: ausência de arquivos, formatos inválidos ou imagens vazias → apresentar mensagem indicando quais campos precisam ser reenviados.
- Exibir progresso de upload (barra ou spinner) para arquivos grandes.
- Limitar tentativas consecutivas e informar políticas de privacidade sobre processamento de imagens.

---

## 5. Referências técnicas

- Controller: `src/face-comparison/face-comparison.controller.ts`
- Serviço (mock): `src/face-comparison/face-comparison.service.ts`
- Coleção Postman: pasta **Face Comparison**
