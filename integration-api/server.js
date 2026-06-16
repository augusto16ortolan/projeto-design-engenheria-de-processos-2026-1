require("dotenv").config();

const crypto = require("node:crypto");
const express = require("express");
const { Pool } = require("pg");
const swaggerUi = require("swagger-ui-express");

const app = express();
const PORT = process.env.PORT || 3333;
const HOST = process.env.HOST || "127.0.0.1";
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/integration_api";

const USER_ROLES = {
  ADMIN: "ADMIN",
  COMMON: "COMMON",
};

const pool = new Pool({
  connectionString: DATABASE_URL,
});

app.use(express.json());
app.use(corsMiddleware);

app.get("/", (request, response) => {
  response.json({
    message: "Integration API",
    docs: "/api/docs",
    health: "/api/health",
  });
});

app.get("/api/health", asyncHandler(async (request, response) => {
  await pool.query("select 1");
  response.json({ status: "ok" });
}));

app.post("/api/auth/register", asyncHandler(async (request, response) => {
  const { name, email, password } = request.body;

  if (!name?.trim()) {
    return sendError(response, 400, "Informe seu nome.");
  }

  const normalizedEmail = normalizeEmail(email);
  const credentialError = validateCredentials(normalizedEmail, password);

  if (credentialError) {
    return sendError(response, 400, credentialError);
  }

  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    return sendError(response, 409, "E-mail já cadastrado.");
  }

  const result = await pool.query(
    `
      insert into users (name, email, password, role)
      values ($1, $2, $3, $4)
      returning id, name, email, role
    `,
    [name.trim(), normalizedEmail, password, USER_ROLES.COMMON],
  );

  const user = result.rows[0];

  return response.status(201).json(await createAuthResponse(user));
}));

app.post("/api/auth/login", asyncHandler(async (request, response) => {
  const { email, password } = request.body;
  const normalizedEmail = normalizeEmail(email);
  const credentialError = validateCredentials(normalizedEmail, password);

  if (credentialError) {
    return sendError(response, 400, credentialError);
  }

  const result = await pool.query(
    `
      select id, name, email, role
      from users
      where email = $1 and password = $2
    `,
    [normalizedEmail, password],
  );

  const user = result.rows[0];

  if (!user) {
    return sendError(response, 401, "E-mail ou senha inválidos.");
  }

  return response.json(await createAuthResponse(user));
}));

app.get("/api/auth/me", authenticate, (request, response) => {
  response.json(mapUser(request.user));
});

app.post("/api/auth/logout", authenticate, asyncHandler(async (request, response) => {
  await pool.query("delete from sessions where token = $1", [request.token]);
  response.status(204).send();
}));

app.get("/api/products", authenticate, asyncHandler(async (request, response) => {
  const result = await pool.query(`
    select id, name, description, price, quantity, image
    from products
    order by id desc
  `);

  response.json(result.rows.map(mapProduct));
}));

app.get("/api/products/:id", authenticate, asyncHandler(async (request, response) => {
  const product = await findProductById(request.params.id);

  if (!product) {
    return sendError(response, 404, "Produto não encontrado.");
  }

  return response.json(mapProduct(product));
}));

app.post(
  "/api/products",
  authenticate,
  requireAdmin,
  asyncHandler(async (request, response) => {
    const validationError = validateProductData(request.body);

    if (validationError) {
      return sendError(response, 400, validationError);
    }

    const result = await pool.query(
      `
        insert into products (name, description, price, quantity, image)
        values ($1, $2, $3, $4, $5)
        returning id, name, description, price, quantity, image
      `,
      [
        request.body.name.trim(),
        request.body.description.trim(),
        Number(request.body.price),
        Number(request.body.quantity),
        request.body.image.trim(),
      ],
    );

    return response.status(201).json(mapProduct(result.rows[0]));
  }),
);

app.put(
  "/api/products/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (request, response) => {
    const validationError = validateProductData(request.body);

    if (validationError) {
      return sendError(response, 400, validationError);
    }

    const result = await pool.query(
      `
        update products
        set name = $1,
            description = $2,
            price = $3,
            quantity = $4,
            image = $5
        where id::text = $6
        returning id, name, description, price, quantity, image
      `,
      [
        request.body.name.trim(),
        request.body.description.trim(),
        Number(request.body.price),
        Number(request.body.quantity),
        request.body.image.trim(),
        request.params.id,
      ],
    );

    const product = result.rows[0];

    if (!product) {
      return sendError(response, 404, "Produto não encontrado.");
    }

    return response.json(mapProduct(product));
  }),
);

app.delete(
  "/api/products/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (request, response) => {
    const result = await pool.query("delete from products where id::text = $1", [
      request.params.id,
    ]);

    if (result.rowCount === 0) {
      return sendError(response, 404, "Produto não encontrado.");
    }

    return response.status(204).send();
  }),
);

app.post(
  "/api/orders",
  authenticate,
  requireCommon,
  asyncHandler(async (request, response) => {
    const { items } = request.body;

    if (!Array.isArray(items) || items.length === 0) {
      return sendError(response, 400, "Informe ao menos um item no pedido.");
    }

    const client = await pool.connect();

    try {
      await client.query("begin");

      const orderItems = [];

      for (const item of items) {
        const quantity = Number(item.quantity);

        if (!item.productId || !Number.isInteger(quantity) || quantity <= 0) {
          await client.query("rollback");
          return sendError(response, 400, "Informe produto e quantidade válida.");
        }

        const productResult = await client.query(
          `
            select id, name, price, quantity, image
            from products
            where id::text = $1
            for update
          `,
          [item.productId],
        );

        const product = productResult.rows[0];

        if (!product) {
          await client.query("rollback");
          return sendError(response, 404, `Produto ${item.productId} não encontrado.`);
        }

        if (quantity > Number(product.quantity)) {
          await client.query("rollback");
          return sendError(
            response,
            409,
            `Estoque insuficiente para ${product.name}. Disponível: ${product.quantity}.`,
          );
        }

        orderItems.push({
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity,
          subtotal: Number(product.price) * quantity,
          image: product.image,
        });
      }

      const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
      const orderResult = await client.query(
        `
          insert into orders (user_id, total)
          values ($1, $2)
          returning id, created_at
        `,
        [request.user.id, total],
      );

      const order = orderResult.rows[0];

      for (const item of orderItems) {
        await client.query(
          `
            insert into order_items
              (order_id, product_id, name, price, quantity, subtotal, image)
            values ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            order.id,
            item.productId,
            item.name,
            item.price,
            item.quantity,
            item.subtotal,
            item.image,
          ],
        );

        await client.query(
          "update products set quantity = quantity - $1 where id = $2",
          [item.quantity, item.productId],
        );
      }

      await client.query("commit");

      return response.status(201).json(
        mapOrder({
          id: order.id,
          customer: mapCustomer(request.user),
          items: orderItems,
          total,
          createdAt: order.created_at,
        }),
      );
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }),
);

app.get("/api/orders", authenticate, asyncHandler(async (request, response) => {
  const orders = await listOrders(request.user);
  response.json(orders);
}));

app.get("/api/orders/:id", authenticate, asyncHandler(async (request, response) => {
  const order = await findOrderById(request.params.id);

  if (!order) {
    return sendError(response, 404, "Pedido não encontrado.");
  }

  const ownsOrder = order.customer.id === request.user.id;
  const isAdmin = request.user.role === USER_ROLES.ADMIN;

  if (!isAdmin && !ownsOrder) {
    return sendError(response, 403, "Você não tem permissão para acessar este recurso.");
  }

  return response.json(order);
}));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(getOpenApiSpec()));
app.get("/api/openapi.json", (request, response) => {
  response.json(getOpenApiSpec());
});

app.use((request, response) => {
  sendError(response, 404, "Rota não encontrada.");
});

app.use((error, request, response, next) => {
  console.error(error);
  sendError(response, 500, "Erro interno do servidor.");
});

initDatabase()
  .then(() => {
    const server = app.listen(PORT, HOST, () => {
      console.log(`Integration API rodando em http://${HOST}:${PORT}`);
      console.log(`Swagger disponível em http://${HOST}:${PORT}/api/docs`);
    });

    server.on("error", (error) => {
      console.error("Erro ao iniciar a API:", error.message);
    });
  })
  .catch((error) => {
    console.error("Erro ao preparar o banco de dados:", error.message);
    process.exit(1);
  });

function corsMiddleware(request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
  response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (request.method === "OPTIONS") {
    return response.status(204).send();
  }

  return next();
}

async function initDatabase() {
  await pool.query(`
    create extension if not exists pgcrypto;

    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      email text not null unique,
      password text not null,
      role text not null check (role in ('ADMIN', 'COMMON')),
      created_at timestamptz not null default now()
    );

    create table if not exists products (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      description text not null,
      price numeric(12, 2) not null check (price >= 0),
      quantity integer not null check (quantity >= 0),
      image text not null,
      created_at timestamptz not null default now()
    );

    create table if not exists orders (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id),
      total numeric(12, 2) not null check (total >= 0),
      created_at timestamptz not null default now()
    );

    create table if not exists order_items (
      id uuid primary key default gen_random_uuid(),
      order_id uuid not null references orders(id) on delete cascade,
      product_id uuid references products(id) on delete set null,
      name text not null,
      price numeric(12, 2) not null check (price >= 0),
      quantity integer not null check (quantity > 0),
      subtotal numeric(12, 2) not null check (subtotal >= 0),
      image text not null
    );

    create table if not exists sessions (
      token text primary key,
      user_id uuid not null references users(id) on delete cascade,
      created_at timestamptz not null default now()
    );
  `);

  await ensureOrderItemsProductDeleteRule();

  await pool.query(
    `
      insert into users (name, email, password, role)
      values ($1, $2, $3, $4)
      on conflict (email) do nothing
    `,
    ["Administrador", "admin@email.com", "123456", USER_ROLES.ADMIN],
  );
}

async function ensureOrderItemsProductDeleteRule() {
  await pool.query("alter table order_items alter column product_id drop not null");
  await pool.query("alter table order_items drop constraint if exists order_items_product_id_fkey");
  await pool.query(`
    alter table order_items
    add constraint order_items_product_id_fkey
    foreign key (product_id)
    references products(id)
    on delete set null
  `);
}

async function authenticate(request, response, next) {
  try {
    const [, token] = String(request.headers.authorization ?? "").split(" ");

    if (!token) {
      return sendError(response, 401, "Usuário não autenticado.");
    }

    const result = await pool.query(
      `
        select users.id, users.name, users.email, users.role
        from sessions
        join users on users.id = sessions.user_id
        where sessions.token = $1
      `,
      [token],
    );

    const user = result.rows[0];

    if (!user) {
      return sendError(response, 401, "Usuário não autenticado.");
    }

    request.token = token;
    request.user = mapUser(user);

    return next();
  } catch (error) {
    return next(error);
  }
}

function requireAdmin(request, response, next) {
  if (request.user.role !== USER_ROLES.ADMIN) {
    return sendError(response, 403, "Você não tem permissão para acessar este recurso.");
  }

  return next();
}

function requireCommon(request, response, next) {
  if (request.user.role !== USER_ROLES.COMMON) {
    return sendError(response, 403, "Você não tem permissão para acessar este recurso.");
  }

  return next();
}

async function createAuthResponse(user) {
  const token = crypto.randomUUID();

  await pool.query("insert into sessions (token, user_id) values ($1, $2)", [
    token,
    user.id,
  ]);

  return {
    token,
    user: mapUser(user),
  };
}

async function findUserByEmail(email) {
  const result = await pool.query(
    "select id, name, email, role from users where email = $1",
    [email],
  );

  return result.rows[0] ?? null;
}

async function findProductById(id) {
  const result = await pool.query(
    `
      select id, name, description, price, quantity, image
      from products
      where id::text = $1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

async function listOrders(user) {
  const isAdmin = user.role === USER_ROLES.ADMIN;
  const result = await pool.query(
    `
      select
        orders.id,
        orders.total,
        orders.created_at,
        users.id as customer_id,
        users.name as customer_name,
        users.email as customer_email
      from orders
      join users on users.id = orders.user_id
      where ($1::boolean = true or orders.user_id = $2)
      order by orders.id desc
    `,
    [isAdmin, user.id],
  );

  const orders = [];

  for (const row of result.rows) {
    orders.push(
      await hydrateOrder({
        id: row.id,
        total: row.total,
        created_at: row.created_at,
        customer_id: row.customer_id,
        customer_name: row.customer_name,
        customer_email: row.customer_email,
      }),
    );
  }

  return orders;
}

async function findOrderById(id) {
  const result = await pool.query(
    `
      select
        orders.id,
        orders.total,
        orders.created_at,
        users.id as customer_id,
        users.name as customer_name,
        users.email as customer_email
      from orders
      join users on users.id = orders.user_id
      where orders.id::text = $1
    `,
    [id],
  );

  const row = result.rows[0];

  return row ? hydrateOrder(row) : null;
}

async function hydrateOrder(row) {
  const itemsResult = await pool.query(
    `
      select product_id, name, price, quantity, subtotal, image
      from order_items
      where order_id = $1
      order by id asc
    `,
    [row.id],
  );

  return mapOrder({
    id: row.id,
    customer: {
      id: row.customer_id,
      name: row.customer_name,
      email: row.customer_email,
    },
    items: itemsResult.rows.map((item) => ({
      productId: item.product_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
      image: item.image,
    })),
    total: row.total,
    createdAt: row.created_at,
  });
}

function mapUser(user) {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function mapCustomer(user) {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
  };
}

function mapProduct(product) {
  return {
    id: String(product.id),
    name: product.name,
    description: product.description,
    price: Number(product.price),
    quantity: Number(product.quantity),
    image: product.image,
  };
}

function mapOrder(order) {
  return {
    id: String(order.id),
    customer: mapCustomer(order.customer),
    items: order.items.map((item) => ({
      productId: item.productId ? String(item.productId) : null,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      subtotal: Number(item.subtotal),
      image: item.image,
    })),
    total: Number(order.total),
    createdAt: new Date(order.createdAt).toISOString(),
  };
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

function validateCredentials(email, password) {
  if (!email || !password) {
    return "Informe e-mail e senha.";
  }

  if (!email.includes("@")) {
    return "Informe um e-mail válido.";
  }

  if (String(password).length < 6) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }

  return null;
}

function validateProductData(productData) {
  const { name, description, price, quantity, image } = productData;
  const parsedPrice = Number(price);
  const parsedQuantity = Number(quantity);

  if (!name?.trim() || !description?.trim() || !image?.trim()) {
    return "Preencha todos os campos do produto.";
  }

  if (
    Number.isNaN(parsedPrice) ||
    Number.isNaN(parsedQuantity) ||
    !Number.isInteger(parsedQuantity) ||
    parsedPrice < 0 ||
    parsedQuantity < 0
  ) {
    return "Informe um preço válido e uma quantidade inteira. Os valores não podem ser negativos.";
  }

  return null;
}

function sendError(response, status, message) {
  return response.status(status).json({ message });
}

function asyncHandler(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

function getOpenApiSpec() {
  const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Integration API",
    version: "1.0.0",
    description: "API para o app integration-crud com PostgreSQL.",
  },
  servers: [{ url: "/api" }],
  tags: [
    { name: "Health", description: "Verificação da API e banco de dados" },
    { name: "Auth", description: "Autenticação e sessão" },
    { name: "Product", description: "Catálogo e gestão de produtos" },
    { name: "Order", description: "Pedidos e compras" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "0d8d6b25-6f46-4b1a-8d63-74df557364df" },
          name: { type: "string", example: "Maria Silva" },
          email: { type: "string", example: "maria@email.com" },
          role: { type: "string", enum: ["ADMIN", "COMMON"] },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "7fc3e316-4f21-40dd-b89d-4cdbbaf9b7de" },
          name: { type: "string", example: "Notebook Dell" },
          description: { type: "string", example: "Notebook para demonstração." },
          price: { type: "number", example: 3500 },
          quantity: { type: "integer", example: 4 },
          image: { type: "string", example: "https://exemplo.com/produto.jpg" },
        },
      },
      Customer: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "0d8d6b25-6f46-4b1a-8d63-74df557364df" },
          name: { type: "string", example: "Maria Silva" },
          email: { type: "string", example: "maria@email.com" },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "5dfb36a0-a77b-4c0f-a6bf-e648745d2796" },
          customer: { $ref: "#/components/schemas/Customer" },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderItem" },
          },
          total: { type: "number", example: 7000 },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      OrderItem: {
        type: "object",
        properties: {
          productId: { type: "string", format: "uuid", example: "7fc3e316-4f21-40dd-b89d-4cdbbaf9b7de" },
          name: { type: "string", example: "Notebook Dell" },
          price: { type: "number", example: 3500 },
          quantity: { type: "integer", example: 2 },
          subtotal: { type: "number", example: 7000 },
          image: { type: "string", example: "https://exemplo.com/produto.jpg" },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Verifica saúde da API e conexão com banco",
        responses: { 200: { description: "OK" } },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Cadastra usuário comum",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Usuário cadastrado" } },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Autentica usuário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "admin@email.com" },
                  password: { type: "string", example: "123456" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Login realizado" } },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Retorna usuário autenticado",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Usuário autenticado" } },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Encerra sessão",
        security: [{ bearerAuth: [] }],
        responses: { 204: { description: "Sessão encerrada" } },
      },
    },
    "/products": {
      get: {
        tags: ["Product"],
        summary: "Lista produtos",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Lista de produtos" } },
      },
      post: {
        tags: ["Product"],
        summary: "Cria produto",
        security: [{ bearerAuth: [] }],
        requestBody: { $ref: "#/components/requestBodies/ProductInput" },
        responses: { 201: { description: "Produto criado" } },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Product"],
        summary: "Busca produto por ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Produto encontrado" } },
      },
      put: {
        tags: ["Product"],
        summary: "Atualiza produto",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { $ref: "#/components/requestBodies/ProductInput" },
        responses: { 200: { description: "Produto atualizado" } },
      },
      delete: {
        tags: ["Product"],
        summary: "Remove produto",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 204: { description: "Produto removido" } },
      },
    },
    "/orders": {
      get: {
        tags: ["Order"],
        summary: "Lista pedidos",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Lista de pedidos" } },
      },
      post: {
        tags: ["Order"],
        summary: "Cria pedido e baixa estoque no banco",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["items"],
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      required: ["productId", "quantity"],
                      properties: {
                        productId: { type: "string", format: "uuid", example: "7fc3e316-4f21-40dd-b89d-4cdbbaf9b7de" },
                        quantity: { type: "integer", example: 2 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Pedido criado" } },
      },
    },
    "/orders/{id}": {
      get: {
        tags: ["Order"],
        summary: "Busca pedido por ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { 200: { description: "Pedido encontrado" } },
      },
    },
  },
  };

  openApiSpec.components.requestBodies = {
    ProductInput: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["name", "description", "price", "quantity", "image"],
            properties: {
              name: { type: "string", example: "Notebook Dell" },
              description: { type: "string", example: "Notebook para demonstração." },
              price: { type: "number", example: 3500 },
              quantity: { type: "integer", example: 4 },
              image: { type: "string", example: "https://exemplo.com/produto.jpg" },
            },
          },
        },
      },
    },
  };

  return openApiSpec;
}
