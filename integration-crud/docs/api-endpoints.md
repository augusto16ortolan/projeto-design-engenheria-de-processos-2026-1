# API endpoints para o Integration CRUD

Esta documentação descreve os endpoints necessários para substituir os mocks atuais do app por uma API externa.

## Convenções

- Base URL sugerida: `https://sua-api.com/api`
- Autenticação sugerida: Bearer token no header `Authorization`.
- Roles possíveis: `ADMIN` e `COMMON`.
- Datas em ISO 8601.
- Valores monetários como `number`.
- Todos os IDs são UUIDs e o app deve consumi-los como `string`.

### Headers autenticados

```http
Authorization: Bearer <token>
Content-Type: application/json
```

### Usuário

```json
{
  "id": "0d8d6b25-6f46-4b1a-8d63-74df557364df",
  "name": "Maria Silva",
  "email": "maria@email.com",
  "role": "COMMON"
}
```

### Produto

```json
{
  "id": "0d8d6b25-6f46-4b1a-8d63-74df557364df",
  "name": "Notebook Dell",
  "description": "Notebook para demonstração do CRUD.",
  "price": 3500,
  "quantity": 4,
  "image": "https://exemplo.com/produto.jpg"
}
```

### Pedido

```json
{
  "id": "0d8d6b25-6f46-4b1a-8d63-74df557364df",
  "customer": {
    "id": "0d8d6b25-6f46-4b1a-8d63-74df557364df",
    "name": "Maria Silva",
    "email": "maria@email.com"
  },
  "items": [
    {
      "productId": "7fc3e316-4f21-40dd-b89d-4cdbbaf9b7de",
      "name": "Notebook Dell",
      "price": 3500,
      "quantity": 1,
      "subtotal": 3500,
      "image": "https://exemplo.com/produto.jpg"
    }
  ],
  "total": 3500,
  "createdAt": "2026-06-08T12:00:00.000Z"
}
```

## Autenticação

### POST `/auth/register`

Cria um usuário comum. A tela de registro do app não deve criar admin.

Permissão: pública.

Request:

```json
{
  "name": "Maria Silva",
  "email": "maria@email.com",
  "password": "123456"
}
```

Response `201`:

```json
{
  "token": "jwt-ou-token-da-api",
  "user": {
    "id": "0d8d6b25-6f46-4b1a-8d63-74df557364df",
    "name": "Maria Silva",
    "email": "maria@email.com",
    "role": "COMMON"
  }
}
```

Regras:

- `name` obrigatório.
- `email` obrigatório e único.
- `password` com pelo menos 6 caracteres.
- `role` sempre `COMMON`.

### POST `/auth/login`

Autentica usuário comum ou admin.

Permissão: pública.

Request:

```json
{
  "email": "admin@email.com",
  "password": "123456"
}
```

Response `200`:

```json
{
  "token": "jwt-ou-token-da-api",
  "user": {
    "id": "0d8d6b25-6f46-4b1a-8d63-74df557364df",
    "name": "Administrador",
    "email": "admin@email.com",
    "role": "ADMIN"
  }
}
```

Regras:

- A API decide o `role` do usuário.
- Usuários admin devem ser criados diretamente no banco ou painel administrativo, não pelo app.

### GET `/auth/me`

Retorna o usuário autenticado a partir do token.

Permissão: autenticado.

Response `200`:

```json
{
  "id": "0d8d6b25-6f46-4b1a-8d63-74df557364df",
  "name": "Maria Silva",
  "email": "maria@email.com",
  "role": "COMMON"
}
```

### POST `/auth/logout`

Opcional. Use se a API invalidar token/sessão no servidor.

Permissão: autenticado.

Response `204`: sem body.

## Produtos

### GET `/products`

Lista produtos disponíveis no catálogo.

Permissão: autenticado (`ADMIN` e `COMMON`).

Response `200`:

```json
[
  {
    "id": "0d8d6b25-6f46-4b1a-8d63-74df557364df",
    "name": "Notebook Dell",
    "description": "Notebook para demonstração do CRUD.",
    "price": 3500,
    "quantity": 4,
    "image": "https://exemplo.com/produto.jpg"
  }
]
```

### GET `/products/:id`

Busca um produto por ID.

Permissão: autenticado (`ADMIN` e `COMMON`).

Response `200`:

```json
{
  "id": "0d8d6b25-6f46-4b1a-8d63-74df557364df",
  "name": "Notebook Dell",
  "description": "Notebook para demonstração do CRUD.",
  "price": 3500,
  "quantity": 4,
  "image": "https://exemplo.com/produto.jpg"
}
```

### POST `/products`

Cadastra produto.

Permissão: `ADMIN`.

Request:

```json
{
  "name": "Notebook Dell",
  "description": "Notebook para demonstração do CRUD.",
  "price": 3500,
  "quantity": 4,
  "image": "https://exemplo.com/produto.jpg"
}
```

Response `201`:

```json
{
  "id": "0d8d6b25-6f46-4b1a-8d63-74df557364df",
  "name": "Notebook Dell",
  "description": "Notebook para demonstração do CRUD.",
  "price": 3500,
  "quantity": 4,
  "image": "https://exemplo.com/produto.jpg"
}
```

Regras:

- `name`, `description`, `price`, `quantity` e `image` obrigatórios.
- `price >= 0`.
- `quantity` inteiro e `quantity >= 0`.

### PUT `/products/:id`

Atualiza produto.

Permissão: `ADMIN`.

Request:

```json
{
  "name": "Notebook Dell",
  "description": "Notebook atualizado.",
  "price": 3599.9,
  "quantity": 3,
  "image": "https://exemplo.com/produto.jpg"
}
```

Response `200`:

```json
{
  "id": "0d8d6b25-6f46-4b1a-8d63-74df557364df",
  "name": "Notebook Dell",
  "description": "Notebook atualizado.",
  "price": 3599.9,
  "quantity": 3,
  "image": "https://exemplo.com/produto.jpg"
}
```

### DELETE `/products/:id`

Remove produto.

Permissão: `ADMIN`.

Response `204`: sem body.

## Pedidos

### POST `/orders`

Cria pedido para o usuário autenticado.

Permissão: `COMMON`.

Request:

```json
{
  "items": [
    {
      "productId": "7fc3e316-4f21-40dd-b89d-4cdbbaf9b7de",
      "quantity": 2
    },
    {
      "productId": "9a0c3c6d-3817-4db9-9f8b-6df8a1bd5a5a",
      "quantity": 1
    }
  ]
}
```

Response `201`:

```json
{
  "id": "5dfb36a0-a77b-4c0f-a6bf-e648745d2796",
  "customer": {
    "id": "0d8d6b25-6f46-4b1a-8d63-74df557364df",
    "name": "Maria Silva",
    "email": "maria@email.com"
  },
  "items": [
    {
      "productId": "7fc3e316-4f21-40dd-b89d-4cdbbaf9b7de",
      "name": "Notebook Dell",
      "price": 3500,
      "quantity": 2,
      "subtotal": 7000,
      "image": "https://exemplo.com/produto.jpg"
    }
  ],
  "total": 7000,
  "createdAt": "2026-06-08T12:00:00.000Z"
}
```

Regras importantes:

- O backend deve buscar os produtos pelo `productId`.
- O backend deve validar estoque.
- O backend deve calcular `price`, `subtotal` e `total`.
- O backend deve baixar o estoque dentro da mesma operação/transação da criação do pedido.
- O frontend não deve enviar preço, subtotal, total ou dados do cliente.
- Se não houver estoque suficiente, retornar erro `400` ou `409`.

### GET `/orders`

Lista pedidos.

Permissão: autenticado.

Comportamento:

- `ADMIN`: retorna todos os pedidos.
- `COMMON`: retorna apenas os pedidos do usuário autenticado.

Response `200`:

```json
[
  {
    "id": "5dfb36a0-a77b-4c0f-a6bf-e648745d2796",
    "customer": {
      "id": "0d8d6b25-6f46-4b1a-8d63-74df557364df",
      "name": "Maria Silva",
      "email": "maria@email.com"
    },
    "items": [
      {
        "productId": "7fc3e316-4f21-40dd-b89d-4cdbbaf9b7de",
        "name": "Notebook Dell",
        "price": 3500,
        "quantity": 2,
        "subtotal": 7000,
        "image": "https://exemplo.com/produto.jpg"
      }
    ],
    "total": 7000,
    "createdAt": "2026-06-08T12:00:00.000Z"
  }
]
```

### GET `/orders/:id`

Busca detalhes de um pedido.

Permissão: autenticado.

Comportamento:

- `ADMIN`: pode acessar qualquer pedido.
- `COMMON`: só pode acessar os próprios pedidos.

Response `200`: mesmo shape de pedido.

## Endpoint opcional

Este endpoint não é necessário para a versão atual do app, mas pode ser útil depois.

### GET `/admin/users`

Lista usuários para administração.

Permissão: `ADMIN`.

Use apenas se a aula evoluir para gestão de usuários.

## Erros sugeridos

### `400 Bad Request`

Dados inválidos.

```json
{
  "message": "Informe um preço válido e uma quantidade inteira."
}
```

### `401 Unauthorized`

Token ausente, inválido ou expirado.

```json
{
  "message": "Usuário não autenticado."
}
```

### `403 Forbidden`

Usuário sem permissão para a ação.

```json
{
  "message": "Você não tem permissão para acessar este recurso."
}
```

### `404 Not Found`

Recurso não encontrado.

```json
{
  "message": "Produto não encontrado."
}
```

### `409 Conflict`

Conflito de regra de negócio, como estoque insuficiente.

```json
{
  "message": "Estoque insuficiente para Notebook Dell. Disponível: 1."
}
```

## Resumo dos endpoints necessários

| Método | Rota | Permissão | Uso no app |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Público | Cadastro de usuário comum |
| `POST` | `/auth/login` | Público | Login comum/admin |
| `GET` | `/auth/me` | Autenticado | Recuperar usuário pelo token |
| `GET` | `/products` | Autenticado | Listar catálogo/produtos |
| `GET` | `/products/:id` | Autenticado | Detalhes do produto |
| `POST` | `/products` | `ADMIN` | Criar produto |
| `PUT` | `/products/:id` | `ADMIN` | Editar produto |
| `DELETE` | `/products/:id` | `ADMIN` | Remover produto |
| `POST` | `/orders` | `COMMON` | Finalizar compra |
| `GET` | `/orders` | Autenticado | Listar pedidos |
| `GET` | `/orders/:id` | Autenticado | Detalhes do pedido |
