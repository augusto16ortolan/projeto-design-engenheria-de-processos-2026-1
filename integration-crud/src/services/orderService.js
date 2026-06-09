import * as productService from "./productService";

let orders = [];
let lastOrderId = 0;

function mapOrder(order) {
  return {
    ...order,
    customer: { ...order.customer },
    items: order.items.map((item) => ({ ...item })),
  };
}

export async function getOrders() {
  return orders.map(mapOrder);
}

export async function createOrder(user, cartItems) {
  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  if (!cartItems.length) {
    throw new Error("O carrinho está vazio.");
  }

  const orderItems = [];

  for (const cartItem of cartItems) {
    const product = await productService.getProductById(cartItem.product.id);

    if (!product) {
      throw new Error(`Produto ${cartItem.product.name} não encontrado.`);
    }

    if (cartItem.quantity > product.quantity) {
      throw new Error(
        `Estoque insuficiente para ${product.name}. Disponível: ${product.quantity}.`,
      );
    }

    orderItems.push({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: cartItem.quantity,
      subtotal: Number(product.price) * cartItem.quantity,
      image: product.image,
    });
  }

  lastOrderId += 1;

  const order = {
    id: String(lastOrderId),
    customer: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    items: orderItems,
    total: orderItems.reduce((sum, item) => sum + item.subtotal, 0),
    createdAt: new Date().toISOString(),
  };

  orders = [order, ...orders];

  return mapOrder(order);
}
