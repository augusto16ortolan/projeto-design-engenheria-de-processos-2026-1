import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import AppButton from "../../components/AppButton";
import ProductImage from "../../components/ProductImage";
import ScreenHeader from "../../components/ScreenHeader";
import AppText from "../../components/AppText";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useCustomAlert } from "../../context/CustomAlertContext";
import { formatCurrency } from "../../services/formatters";
import * as productService from "../../services/productService";

export default function ProductDetailsScreen({ navigation, route }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { showAlert } = useCustomAlert();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === "ADMIN";

  async function loadProduct() {
    try {
      setLoading(true);
      const data = await productService.getProductById(route.params.productId);
      setProduct(data);
    } catch (error) {
      showAlert({
        title: "Erro ao carregar produto",
        message: error.message,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadProduct();
    }, [route.params.productId]),
  );

  function handleAddToCart() {
    try {
      addToCart(product);
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Detalhes do produto"
          onBack={() => navigation.goBack()}
        />
        <AppText variant="muted" style={styles.emptyText}>
          Carregando produto...
        </AppText>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Detalhes do produto"
          onBack={() => navigation.goBack()}
        />
        <AppText variant="muted" style={styles.emptyText}>
          Produto não encontrado.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Detalhes do produto"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.card}>
        <ProductImage
          name={product.name}
          sourceUrl={product.image}
          style={styles.image}
          iconSize={42}
        />
        <AppText variant="title" style={styles.name}>
          {product.name}
        </AppText>
        <AppText variant="subtitle" style={styles.description}>
          {product.description}
        </AppText>

        <View style={styles.row}>
          <View style={styles.labelGroup}>
            <MaterialIcons name="payments" size={19} color="#69707d" />
            <AppText variant="label" style={styles.label}>
              Preço
            </AppText>
          </View>
          <AppText style={styles.value}>
            {formatCurrency(product.price)}
          </AppText>
        </View>

        <View style={styles.row}>
          <View style={styles.labelGroup}>
            <MaterialIcons name="inventory-2" size={19} color="#69707d" />
            <AppText variant="label" style={styles.label}>
              Quantidade
            </AppText>
          </View>
          <AppText style={styles.value}>{product.quantity}</AppText>
        </View>
      </View>

      {isAdmin ? (
        <AppButton
          icon="edit"
          onPress={() =>
            navigation.navigate("ProductEdit", { productId: product.id })
          }
          style={styles.primaryButton}
          title="Editar produto"
        />
      ) : (
        <AppButton
          disabled={Number(product.quantity) <= 0}
          icon="add-shopping-cart"
          onPress={handleAddToCart}
          style={styles.primaryButton}
          title={
            Number(product.quantity) <= 0
              ? "Produto sem estoque"
              : "Adicionar ao carrinho"
          }
        />
      )}
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
  card: {
    padding: 14,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eee4d8",
  },
  image: {
    width: "100%",
    height: 230,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#ebe2d7",
  },
  name: {
    fontSize: 26,
  },
  description: {
    marginTop: 10,
    marginBottom: 18,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: "#f0ebe4",
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    color: "#69707d",
  },
  value: {
    color: "#20242c",
    fontWeight: "800",
  },
  primaryButton: {
    marginTop: 16,
  },
  emptyText: {
    marginTop: 24,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 16,
  },
});
