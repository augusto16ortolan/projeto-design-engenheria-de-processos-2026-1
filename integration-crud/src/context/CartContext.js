import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

function mapCartItem(product, quantity) {
  return {
    product: {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      quantity: Number(product.quantity),
      image: product.image,
    },
    quantity,
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  function addToCart(product) {
    if (Number(product.quantity) <= 0) {
      throw new Error("Produto sem estoque disponível.");
    }

    const existingItem = items.find((item) => item.product.id === product.id);

    if (existingItem?.quantity >= Number(product.quantity)) {
      throw new Error("Quantidade máxima em estoque já está no carrinho.");
    }

    if (existingItem) {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.product.id === product.id
            ? mapCartItem(product, item.quantity + 1)
            : item,
        ),
      );
      return;
    }

    setItems((currentItems) => [mapCartItem(product, 1), ...currentItems]);
  }

  function incrementItem(productId) {
    const existingItem = items.find((item) => item.product.id === productId);

    if (!existingItem) {
      return;
    }

    if (existingItem.quantity >= Number(existingItem.product.quantity)) {
      throw new Error("Quantidade máxima em estoque já está no carrinho.");
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }

  function decrementItem(productId) {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeItem(productId) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(
    () =>
      items.reduce(
        (total, item) => total + Number(item.product.price) * item.quantity,
        0,
      ),
    [items],
  );

  const value = {
    items,
    addToCart,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider.");
  }

  return context;
}
