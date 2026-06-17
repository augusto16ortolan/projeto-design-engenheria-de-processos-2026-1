import api from "./api";
import { uploadProductImage } from "./cloudinaryService";

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

export async function getProducts() {
  const response = await api.get("/products");

  return response.data;
}

export async function getProductById(id) {
  const response = await api.get(`/products/${id}`);

  return mapProduct(response.data);
}

export async function createProduct({ productData }) {
  const image = productData.imageAsset
    ? await uploadProductImage(productData.imageAsset)
    : productData.image || "";

  const product = {
    name: productData.name,
    description: productData.description,
    price: parseCurrency(productData.price),
    quantity: Number(productData.quantity),
    image,
  };

  const response = await api.post("/products", product);

  return mapProduct(response.data);
}

export async function updateProduct(id, productData) {
  const image = productData.imageAsset
    ? await uploadProductImage(productData.imageAsset)
    : productData.image || "";

  const product = {
    name: productData.name,
    description: productData.description,
    price: parseCurrency(productData.price),
    quantity: Number(productData.quantity),
    image,
  };

  const response = await api.put(`/products/${id}`, product);

  return mapProduct(response.data);
}

export async function deleteProduct(id) {
  await api.delete(`/products/${id}`);

  return true;
}
