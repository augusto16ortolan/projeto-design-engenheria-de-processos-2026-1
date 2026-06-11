import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import AppText from "../../components/AppText";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { formatCurrency } from "../../services/formatters";
import * as orderService from "../../services/orderService";

function formatDate(value) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderListScreen() {
  const { logout, user, token } = useAuth();
  const { clearCart } = useCart();
  const [orders, setOrders] = useState([]);
  const isAdmin = user?.role === "ADMIN";

  async function loadOrders() {
    const data = await orderService.getOrders(token);
    const visibleOrders = isAdmin
      ? data
      : data.filter((order) => order.customer.id === user?.id);

    setOrders(visibleOrders);
  }

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [isAdmin, user?.id]),
  );

  async function handleLogout() {
    clearCart();
    await logout();
  }

  function renderOrder({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <AppText style={styles.orderTitle}>Pedido #{item.id}</AppText>
            <AppText variant="muted" style={styles.customerText}>
              {item.customer.name} • {formatDate(item.createdAt)}
            </AppText>
          </View>

          <MaterialIcons name="receipt-long" size={24} color="#69707d" />
        </View>

        <View style={styles.items}>
          {item.items.map((orderItem) => (
            <View key={orderItem.productId} style={styles.orderItem}>
              <AppText variant="muted" style={styles.itemName}>
                {orderItem.quantity}x {orderItem.name}
              </AppText>
              <AppText style={styles.itemValue}>
                {formatCurrency(orderItem.subtotal)}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <AppText variant="label">Total</AppText>
          <AppText style={styles.totalText}>
            {formatCurrency(item.total)}
          </AppText>
        </View>
      </View>
    );
  }

  function renderEmpty() {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="receipt-long" size={56} color="#b8afa6" />
        <AppText variant="title" style={styles.emptyTitle}>
          Nenhum pedido
        </AppText>
        <AppText variant="muted" style={styles.emptyDescription}>
          {isAdmin
            ? "Os pedidos finalizados pelos usuários comuns aparecerão aqui."
            : "Suas compras finalizadas aparecerão aqui."}
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <AppText variant="muted" style={styles.greeting}>
            {isAdmin ? "Gestão" : "Minhas compras"}
          </AppText>
          <AppText variant="title">Pedidos</AppText>
        </View>

        <Pressable onPress={handleLogout} style={styles.headerButton}>
          <MaterialIcons name="logout" size={22} color="#424b5a" />
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={styles.list}
        data={orders}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        renderItem={renderOrder}
        showsVerticalScrollIndicator={false}
      />
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
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
  },
  headerButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
    backgroundColor: "#eee8df",
  },
  card: {
    marginBottom: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eee4d8",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  orderTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#20242c",
  },
  customerText: {
    marginTop: 4,
  },
  items: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f0ebe4",
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 10,
  },
  itemName: {
    flex: 1,
  },
  itemValue: {
    fontWeight: "800",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0ebe4",
  },
  totalText: {
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
});
