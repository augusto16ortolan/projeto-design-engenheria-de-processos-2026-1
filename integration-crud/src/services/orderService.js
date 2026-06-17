import api from "./api";
import * as productService from "./productService";

function mapOrder(order) {
  return {
    ...order,
    customer: { ...order.customer },
    items: order.items.map((item) => ({ ...item })),
  };
}

export async function getOrders() {
  const response = await api.get("/orders");

  const orders = response.data.map((order) => mapOrder(order));

  return orders;
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
      quantity: cartItem.quantity,
    });
  }

  const order = {
    items: orderItems,
  };

  const response = await api.post("/orders", order);

  console.log(response.data);

  return mapOrder(order);
}
