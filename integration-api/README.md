# Integration API

API simples em Node.js + Express + PostgreSQL para usar com o app `integration-crud`.

## Banco de dados

Crie um banco PostgreSQL e configure a variável `DATABASE_URL`.

Exemplo:

```bash
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/integration_api"
```

Se `DATABASE_URL` não for informada, a API usa:

```txt
postgres://postgres:postgres@localhost:5432/integration_api
```

A API cria as tabelas automaticamente ao iniciar e semeia apenas o usuário admin.

## Rodar

Com Docker Compose, a partir da raiz do projeto:

```bash
docker compose up --build
```

Em outro terminal, para parar:

```bash
docker compose down
```

Para apagar também os dados do PostgreSQL:

```bash
docker compose down -v
```

Sem Docker:

```bash
npm install
npm run dev
```

URL local:

```txt
http://127.0.0.1:3333
```

Para expor em outro host, use `HOST=0.0.0.0 npm start`.

Health check:

```txt
GET /api/health
```

Swagger:

```txt
GET /api/docs
```

## Usuário admin inicial

```txt
email: admin@email.com
senha: 123456
```

O endpoint de cadastro cria apenas usuários `COMMON`.

## IDs

Todos os IDs são UUIDs gerados pelo PostgreSQL.

## Autenticação

Depois de fazer login ou cadastro, envie o token retornado no header:

```http
Authorization: Bearer <token>
```

## Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Produtos

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (`ADMIN`)
- `PUT /api/products/:id` (`ADMIN`)
- `DELETE /api/products/:id` (`ADMIN`)

### Pedidos

- `POST /api/orders` (`COMMON`)
- `GET /api/orders`
- `GET /api/orders/:id`

## Observações

- Usuários, produtos e pedidos ficam salvos no PostgreSQL.
- O estoque é baixado no backend ao criar pedido.
- A API calcula preço, subtotal e total do pedido; o frontend envia apenas `productId` e `quantity`.
