import api from "./api";

function parseCurrency(value) {
  if (typeof value === "number") {
    return value;
  }

  const textValue = String(value).trim();

  if (textValue.includes(",")) {
    return Number(textValue.replace(/\./g, "").replace(",", "."));
  }

  return Number(textValue);
}

export function mapProduct(product) {
  if (!product) {
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    quantity: Number(product.quantity),
    image: product.image,
  };
}

export async function getProducts(token) {
  const response = await api.get("/products", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getProductById(id, token) {
  const response = await api.get(`/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return mapProduct(response.data);
}

export async function createProduct({ productData, token }) {
  const product = {
    name: productData.name,
    description: productData.description,
    price: parseCurrency(productData.price),
    quantity: Number(productData.quantity),
    image: productData.image,
  };

  const response = await api.post("/products", product, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return mapProduct(response.data);
}

export async function updateProduct(id, productData, token) {
  const product = {
    name: productData.name,
    description: productData.description,
    price: parseCurrency(productData.price),
    quantity: Number(productData.quantity),
    image: productData.image,
  };

  const response = await api.put(`/products/${id}`, product, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return mapProduct(response.data);
}

export async function deleteProduct(id, token) {
  await api.delete(`/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return true;
}
