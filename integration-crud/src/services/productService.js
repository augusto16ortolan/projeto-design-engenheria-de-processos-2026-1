const initialProducts = [
  {
    id: "1",
    name: "Notebook Dell",
    description: "Notebook para demonstração do CRUD.",
    price: 3500,
    quantity: 4,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
  },
  {
    id: "2",
    name: "Mouse Logitech",
    description: "Mouse sem fio para escritório.",
    price: 120,
    quantity: 15,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600",
  },
  {
    id: "3",
    name: "Teclado Mecânico",
    description: "Teclado compacto com switches azuis.",
    price: 280,
    quantity: 8,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
  },
  {
    id: "4",
    name: 'Monitor LG 24"',
    description: "Monitor Full HD para estação de trabalho.",
    price: 899.9,
    quantity: 6,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600",
  },
  {
    id: "5",
    name: "Cadeira Ergonômica",
    description: "Cadeira com apoio lombar e ajuste de altura.",
    price: 749.9,
    quantity: 5,
    image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600",
  },
  {
    id: "6",
    name: "Headset Gamer",
    description: "Headset com microfone e áudio imersivo.",
    price: 199.9,
    quantity: 12,
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=600",
  },
  {
    id: "7",
    name: "Webcam Full HD",
    description: "Webcam para aulas, reuniões e gravações.",
    price: 219.9,
    quantity: 9,
    image: "https://images.unsplash.com/photo-1623949556303-b0d17d198863?w=600",
  },
  {
    id: "8",
    name: "Microfone USB",
    description: "Microfone condensador para gravação de áudio.",
    price: 329.9,
    quantity: 7,
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600",
  },
  {
    id: "9",
    name: "SSD 1TB",
    description: "Unidade SSD para melhorar o desempenho do computador.",
    price: 459.9,
    quantity: 11,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600",
  },
  {
    id: "10",
    name: "Memória RAM 16GB",
    description: "Módulo DDR4 para upgrade de computadores.",
    price: 349.9,
    quantity: 10,
    image: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=600",
  },
  {
    id: "11",
    name: "Roteador Wi-Fi",
    description: "Roteador dual band para redes domésticas.",
    price: 269.9,
    quantity: 13,
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600",
  },
  {
    id: "12",
    name: "Tablet Samsung",
    description: "Tablet para estudos, leitura e produtividade.",
    price: 1299.9,
    quantity: 3,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600",
  },
  {
    id: "13",
    name: "Impressora HP",
    description: "Impressora multifuncional para escritório.",
    price: 599.9,
    quantity: 4,
    image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600",
  },
  {
    id: "14",
    name: "Hub USB-C",
    description: "Adaptador com HDMI, USB e leitor de cartão.",
    price: 189.9,
    quantity: 16,
    image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600",
  },
  {
    id: "15",
    name: "Carregador Portátil",
    description: "Power bank com carregamento rápido.",
    price: 149.9,
    quantity: 18,
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600",
  },
  {
    id: "16",
    name: "Smartphone Motorola",
    description: "Smartphone Android para uso diário.",
    price: 1599.9,
    quantity: 5,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600",
  },
  {
    id: "17",
    name: "Caixa de Som Bluetooth",
    description: "Caixa portátil com bateria recarregável.",
    price: 239.9,
    quantity: 14,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600",
  },
  {
    id: "18",
    name: "Suporte para Notebook",
    description: "Suporte ajustável para mesa de trabalho.",
    price: 119.9,
    quantity: 20,
    image: "https://images.unsplash.com/photo-1616628182506-9d9e066cbceb?w=600",
  },
];

let products = [...initialProducts];
let lastProductId = initialProducts.length;

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
  return products.map(mapProduct);
}

export async function getProductById(id) {
  const product = products.find((item) => item.id === id);

  return mapProduct(product);
}

export async function createProduct(productData, userId) {
  lastProductId += 1;

  const product = {
    id: String(lastProductId),
    userId,
    name: productData.name,
    description: productData.description,
    price: parseCurrency(productData.price),
    quantity: Number(productData.quantity),
    image: productData.image,
  };

  products = [product, ...products];

  return mapProduct(product);
}

export async function updateProduct(id, productData) {
  const productIndex = products.findIndex((item) => item.id === id);

  if (productIndex === -1) {
    throw new Error("Produto não encontrado.");
  }

  const updatedProduct = {
    ...products[productIndex],
    name: productData.name,
    description: productData.description,
    price: parseCurrency(productData.price),
    quantity: Number(productData.quantity),
    image: productData.image,
  };

  products = products.map((item) => (item.id === id ? updatedProduct : item));

  return mapProduct(updatedProduct);
}

export async function deleteProduct(id) {
  products = products.filter((item) => item.id !== id);

  return true;
}
