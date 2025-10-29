# Guia Frontend · Usuários (Clientes)

Este documento orienta a implementação das telas de cadastro e gestão de usuários (`/users`).

> Base URL: `{{baseUrl}} = http://localhost:3000/api`

---

## 1. Estrutura do usuário

| Campo                   | Tipo     | Observações de UI                                    |
| ----------------------- | -------- | ---------------------------------------------------- |
| `_id`                   | ObjectId | Usado como chave em listas e para navegação.         |
| `name`                  | string   | Obrigatório; exibir sempre capitalizado.             |
| `email`                 | string   | Único e minúsculo; manter máscara básica.            |
| `city`                  | string?  | Opcional; exibir apenas se preenchido.               |
| `state`                 | string?  | Opcional; sugerir combo de UF.                       |
| `role`                  | string   | Sempre `client` para este módulo.                    |
| `createdAt`/`updatedAt` | ISO date | Utilizar para ordenações ou exibir data de cadastro. |

> Senha nunca é retornada; o backend armazena `passwordHash` internamente.

---

## 2. Endpoints principais

### 2.1 Criar usuário

- **POST `/users`**
- **Payload** (igual ao `register/user`):
  ```json
  {
    "name": "Ana Souza",
    "email": "ana@example.com",
    "password": "123456",
    "city": "Recife",
    "state": "PE"
  }
  ```
- **Resposta 201**: objeto do usuário (sem senha).
- **UI**: formulário com validação de senha mínima e confirmação opcional.
- **Erros frequentes**: `409` email duplicado, `400` campos ausentes.

### 2.2 Listar usuários

- **GET `/users`**
- **Resposta**: array ordenável (backend não ordena explicitamente).
- **UI**: tabela com busca por nome/email em client-side; exibir data formatada (`createdAt`).

### 2.3 Detalhar usuário

- **GET `/users/:id`**
- **Uso**: preencher formulário de edição ou página de perfil.
- **Erros**: `404` caso ID inválido ou inexistente → redirecionar para lista.

### 2.4 Atualizar usuário

- **PATCH `/users/:id`**
- **Payload**: `Partial<CreateUserDto>`; se `password` vier, backend já converte em hash.
- **UI**: permitir atualização seletiva; se o usuário alterar senha, pedir confirmação.
- **Erros**: `404` não encontrado, `409` email duplicado.

### 2.5 Remover usuário

- **DELETE `/users/:id`**
- **Resposta**: `{ "deleted": true }`.
- **UI**: modal de confirmação; ao concluir, remover item da lista localmente.
- **Erros**: `404` se registro já tiver sido removido.

---

## 3. Fluxos sugeridos

1. **Onboarding**
   - Opcionalmente usar `/auth/register/user` para já receber token; equivalente a `/users` + login.
2. **Administração**
   - Dashboard com listagem `GET /users`.
   - Botão “Editar” → fetch `/users/:id` → abrir drawer com formulário.
   - Botão “Remover” → confirmar → `DELETE` → atualizar UI optimistically.

---

## 4. Validações e mensagens

- Padronizar mensagens de erro: transformar respostas do backend em toasts/alerts amigáveis.
- Garantir que email esteja em minúsculas antes de enviar.
- Implementar loading states (botões `disabled` durante chamadas).
- Em `404`, exibir aviso "Usuário não encontrado" e navegar de volta.

---

## 5. Referências úteis

- DTO: `src/users/dto/create-user.dto.ts`
- Serviço: `src/users/users.service.ts`
- Coleção Postman: pasta **Users**
