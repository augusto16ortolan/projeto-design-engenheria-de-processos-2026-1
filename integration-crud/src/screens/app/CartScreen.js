import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import AppButton from "../../components/AppButton";
import AppText from "../../components/AppText";
import ProductImage from "../../components/ProductImage";
import ScreenHeader from "../../components/ScreenHeader";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useCustomAlert } from "../../context/CustomAlertContext";
import { formatCurrency } from "../../services/formatters";
import * as orderService from "../../services/orderService";

export default function CartScreen({ navigation }) {
  const { user } = useAuth();
  const {
    items,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    totalPrice,
  } = useCart();
  const { showAlert, showConfirm } = useCustomAlert();

  async function handleIncrement(productId) {
    try {
      await incrementItem(productId);
    } catch (error) {
      showAlert({
        title: "Estoque insuficiente",
        message: error.message,
        type: "warning",
      });
    }
  }

  function confirmRemove(item) {
    showConfirm({
      title: "Remover item",
      message: `Deseja remover ${item.product.name} do carrinho?`,
      confirmText: "Remover",
      cancelText: "Cancelar",
      type: "danger",
      onConfirm: () => removeItem(item.product.id),
    });
  }

  async function handleCheckout() {
    try {
      await orderService.createOrder(user, items);
      clearCart();

      showAlert({
        title: "Compra realizada",
        message: "Seu pedido foi criado com sucesso.",
        type: "success",
        buttonText: "Voltar para produtos",
        onClose: () =>
          navigation.navigate("MainTabs", { screen: "ProductsTab" }),
      });
    } catch (error) {
      showAlert({
        title: "Não foi possível finalizar",
        message: error.message,
        type: "danger",
      });
    }
  }

  function renderItem({ item }) {
    const subtotal = item.quantity * item.product.price;

    return (
      <View style={styles.card}>
        <ProductImage
          name={item.product.name}
          sourceUrl={item.product.image}
          style={styles.productImage}
        />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <AppText numberOfLines={1} style={styles.productName}>
              {item.product.name}
            </AppText>
            <Pressable
              hitSlop={8}
              onPress={() => confirmRemove(item)}
              style={styles.removeButton}
            >
              <MaterialIcons name="delete-outline" size={21} color="#b42318" />
            </Pressable>
          </View>

          <AppText variant="muted" style={styles.priceText}>
            {formatCurrency(item.product.price)} cada
          </AppText>

          <View style={styles.itemFooter}>
            <View style={styles.quantityControl}>
              <Pressable
                hitSlop={8}
                onPress={() => decrementItem(item.product.id)}
                style={styles.quantityButton}
              >
                <MaterialIcons name="remove" size={18} color="#424b5a" />
              </Pressable>
              <AppText style={styles.quantityText}>{item.quantity}</AppText>
              <Pressable
                hitSlop={8}
                onPress={() => handleIncrement(item.product.id)}
                style={styles.quantityButton}
              >
                <MaterialIcons name="add" size={18} color="#424b5a" />
              </Pressable>
            </View>

            <AppText style={styles.subtotalText}>
              {formatCurrency(subtotal)}
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="shopping-cart" size={56} color="#b8afa6" />
        <AppText variant="title" style={styles.emptyTitle}>
          Carrinho vazio
        </AppText>
        <AppText variant="muted" style={styles.emptyDescription}>
          Adicione produtos ao carrinho para finalizar uma compra.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Carrinho" onBack={() => navigation.goBack()} />

      <FlatList
        contentContainerStyle={styles.list}
        data={items}
        keyExtractor={(item) => item.product.id}
        ListEmptyComponent={renderEmpty}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      {items.length ? (
        <View style={styles.summary}>
          <View>
            <AppText variant="muted">Total</AppText>
            <AppText variant="title" style={styles.totalText}>
              {formatCurrency(totalPrice)}
            </AppText>
          </View>

          <AppButton
            icon="check-circle"
            onPress={handleCheckout}
            style={styles.checkoutButton}
            title="Finalizar compra"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    paddingTop: 58,
    backgroundColor: "#f5f1ea",
  },
  list: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  card: {
    flexDirection: "row",
    marginBottom: 14,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eee4d8",
  },
  productImage: {
    width: 82,
    height: 92,
    borderRadius: 14,
    backgroundColor: "#ebe2d7",
  },
  cardContent: {
    flex: 1,
    paddingLeft: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  productName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#20242c",
  },
  removeButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#fff0ed",
  },
  priceText: {
    marginTop: 4,
  },
  itemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#f4f0ea",
  },
  quantityText: {
    minWidth: 22,
    textAlign: "center",
    fontWeight: "800",
  },
  subtotalText: {
    color: "#2d7d59",
    fontWeight: "800",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 90,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 22,
  },
  emptyDescription: {
    marginTop: 8,
    maxWidth: 280,
    textAlign: "center",
  },
  summary: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eee4d8",
    shadowColor: "#1f513e",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  totalText: {
    fontSize: 22,
  },
  checkoutButton: {
    flex: 1,
  },
});
