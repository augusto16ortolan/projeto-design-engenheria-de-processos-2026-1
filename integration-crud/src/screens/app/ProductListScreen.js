import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import EmptyStateImage from "../../assets/empty_state.svg";
import AppText from "../../components/AppText";
import ProductImage from "../../components/ProductImage";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useCustomAlert } from "../../context/CustomAlertContext";
import { formatCurrency } from "../../services/formatters";
import * as productService from "../../services/productService";

export default function ProductListScreen({ navigation }) {
  const { logout, user, token } = useAuth();
  const { addToCart, totalItems } = useCart();
  const { showAlert, showConfirm } = useCustomAlert();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const isAdmin = user?.role === "ADMIN";

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await productService.getProducts(token);
      setProducts(data);
    } catch (error) {
      showAlert({
        title: "Erro ao carregar produtos",
        message: error.message,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, []),
  );

  function confirmDelete(product) {
    showConfirm({
      title: "Remover produto",
      message: `Deseja remover ${product.name}? Essa ação não pode ser desfeita.`,
      confirmText: "Remover",
      cancelText: "Cancelar",
      type: "danger",
      onConfirm: async () => {
        try {
          await productService.deleteProduct(product.id);
          loadProducts();
        } catch (error) {
          showAlert({
            title: "Erro ao remover produto",
            message: error.message,
            type: "danger",
          });
        }
      },
    });
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      showAlert({
        title: "Erro ao sair",
        message: error.message,
        type: "danger",
      });
    }
  }

  async function handleAddToCart(product) {
    try {
      await addToCart(product);
      showAlert({
        title: "Produto adicionado",
        message: `${product.name} foi adicionado ao carrinho.`,
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: "Não foi possível adicionar",
        message: error.message,
        type: "warning",
      });
    }
  }

  function renderProduct({ item }) {
    return (
      <Pressable
        onPress={() =>
          navigation.navigate("ProductDetails", { productId: item.id })
        }
        style={styles.card}
      >
        <ProductImage
          name={item.name}
          sourceUrl={item.image}
          style={styles.productImage}
        />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <AppText numberOfLines={1} style={styles.productName}>
              {item.name}
            </AppText>
            <AppText style={styles.productPrice}>
              {formatCurrency(item.price)}
            </AppText>
          </View>

          <AppText
            numberOfLines={2}
            variant="muted"
            style={styles.productDescription}
          >
            {item.description}
          </AppText>

          <View style={styles.cardFooter}>
            <View style={styles.quantityBadge}>
              <MaterialIcons name="inventory-2" size={15} color="#58616f" />
              <AppText style={styles.productQuantity}>
                {item.quantity} em estoque
              </AppText>
            </View>

            {isAdmin ? (
              <View style={styles.actions}>
                <Pressable
                  hitSlop={8}
                  onPress={(event) => {
                    event.stopPropagation();
                    navigation.navigate("ProductEdit", { productId: item.id });
                  }}
                  style={styles.iconButton}
                >
                  <MaterialIcons name="edit" size={20} color="#2563eb" />
                </Pressable>
                <Pressable
                  hitSlop={8}
                  onPress={(event) => {
                    event.stopPropagation();
                    confirmDelete(item);
                  }}
                  style={[styles.iconButton, styles.deleteIconButton]}
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={21}
                    color="#b42318"
                  />
                </Pressable>
              </View>
            ) : (
              <Pressable
                hitSlop={8}
                onPress={(event) => {
                  event.stopPropagation();
                  handleAddToCart(item);
                }}
                style={[
                  styles.iconButton,
                  Number(item.quantity) <= 0 && styles.disabledIconButton,
                ]}
              >
                <MaterialIcons
                  name="add-shopping-cart"
                  size={20}
                  color="#2d7d59"
                />
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    );
  }

  function renderEmptyList() {
    return (
      <View style={styles.emptyState}>
        <EmptyStateImage width={220} height={165} />
        <AppText variant="title" style={styles.emptyTitle}>
          Não há produtos
        </AppText>
        <AppText variant="muted" style={styles.emptyDescription}>
          Cadastre o primeiro produto para começar.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <AppText variant="muted" style={styles.greeting}>
            Olá, {user?.name}
          </AppText>
          <AppText variant="title" style={styles.screenTitle}>
            Produtos
          </AppText>
        </View>

        <View style={styles.headerActions}>
          {!isAdmin ? (
            <Pressable
              onPress={() => navigation.navigate("Cart")}
              style={styles.headerButton}
            >
              <MaterialIcons name="shopping-cart" size={22} color="#424b5a" />
              {totalItems > 0 ? (
                <View style={styles.cartBadge}>
                  <AppText style={styles.cartBadgeText}>{totalItems}</AppText>
                </View>
              ) : null}
            </Pressable>
          ) : null}

          <Pressable onPress={handleLogout} style={styles.headerButton}>
            <MaterialIcons name="logout" size={22} color="#424b5a" />
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#2d7d59" size="large" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={products}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyList}
          renderItem={renderProduct}
          showsVerticalScrollIndicator={false}
          onRefresh={() => loadProducts()}
          refreshing={loading}
        />
      )}

      {isAdmin ? (
        <Pressable
          onPress={() => navigation.navigate("ProductCreate")}
          style={styles.fab}
        >
          <MaterialIcons name="add" size={30} color="#ffffff" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 58,
    backgroundColor: "#f5f1ea",
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
  screenTitle: {
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  headerButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
    backgroundColor: "#eee8df",
  },
  cartBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#2d7d59",
  },
  cartBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
  },
  list: {
    flexGrow: 1,
    paddingBottom: 96,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 90,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 90,
  },
  emptyTitle: {
    marginTop: 18,
    fontSize: 22,
  },
  emptyDescription: {
    marginTop: 8,
    maxWidth: 260,
    textAlign: "center",
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
    width: 86,
    height: 96,
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
    gap: 10,
  },
  productName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#20242c",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2d7d59",
  },
  productDescription: {
    marginTop: 7,
    lineHeight: 19,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  quantityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: "#f4f0ea",
  },
  productQuantity: {
    color: "#58616f",
    fontSize: 12,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 6,
  },
  iconButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#eef4ff",
  },
  deleteIconButton: {
    backgroundColor: "#fff0ed",
  },
  disabledIconButton: {
    opacity: 0.45,
  },
  fab: {
    position: "absolute",
    right: 22,
    bottom: 26,
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 31,
    backgroundColor: "#2d7d59",
    shadowColor: "#1f513e",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 7,
  },
});
