import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import AppText from "../../components/AppText";
import QuantityInput from "../../components/QuantityInput";
import ScreenHeader from "../../components/ScreenHeader";
import {
  formatDecimalInput,
  parseCurrencyInput,
} from "../../services/formatters";
import { useCustomAlert } from "../../context/CustomAlertContext";
import * as productService from "../../services/productService";

export default function ProductEditScreen({ navigation, route }) {
  const { showAlert } = useCustomAlert();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    async function loadProduct() {
      const data = await productService.getProductById(route.params.productId);
      setProduct(data);
      setName(data?.name ?? "");
      setDescription(data?.description ?? "");
      setPrice(data ? formatDecimalInput(data.price) : "");
      setQuantity(data ? String(data.quantity) : "");
      setImage(data?.image ?? "");
      setLoading(false);
    }

    loadProduct();
  }, [route.params.productId]);

  async function handleSubmit() {
    if (!product) {
      showAlert({
        title: "Produto não encontrado",
        message: "Volte para a lista e tente novamente.",
        type: "danger",
      });
      return;
    }

    if (!name || !description || !price || !quantity || !image) {
      showAlert({
        title: "Campos obrigatórios",
        message: "Preencha todos os campos do produto.",
        type: "warning",
      });
      return;
    }

    const parsedPrice = parseCurrencyInput(price);
    const parsedQuantity = Number(quantity);

    if (
      Number.isNaN(parsedPrice) ||
      Number.isNaN(parsedQuantity) ||
      !Number.isInteger(parsedQuantity) ||
      parsedPrice < 0 ||
      parsedQuantity < 0
    ) {
      showAlert({
        title: "Dados inválidos",
        message:
          "Informe um preço válido e uma quantidade inteira. Os valores não podem ser negativos.",
        type: "danger",
      });
      return;
    }

    try {
      await productService.updateProduct(product.id, {
        name,
        description,
        price,
        quantity,
        image,
      });
      showAlert({
        title: "Produto atualizado",
        message: "As alterações foram salvas com sucesso.",
        type: "success",
        buttonText: "Voltar para a lista",
        onClose: () => navigation.goBack(),
      });
    } catch (error) {
      showAlert({
        title: "Erro ao atualizar produto",
        message: error.message,
        type: "danger",
      });
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Editar produto"
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
          title="Editar produto"
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
      <ScreenHeader title="Editar produto" onBack={() => navigation.goBack()} />

      <AppInput
        icon="inventory-2"
        label="Nome"
        onChangeText={setName}
        placeholder="Nome do produto"
        value={name}
      />

      <AppInput
        icon="description"
        label="Descrição"
        multiline
        onChangeText={setDescription}
        placeholder="Descrição do produto"
        value={description}
      />

      <AppInput
        icon="payments"
        keyboardType="numeric"
        label="Preço (R$)"
        onChangeText={setPrice}
        placeholder="0,00"
        value={price}
      />

      <QuantityInput onChangeText={setQuantity} value={quantity} />

      <AppInput
        autoCapitalize="none"
        icon="image"
        keyboardType="url"
        label="Imagem"
        onChangeText={setImage}
        placeholder="https://exemplo.com/produto.jpg"
        value={image}
      />

      <AppButton
        icon="check-circle"
        onPress={handleSubmit}
        style={styles.submitButton}
        title="Atualizar produto"
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
  submitButton: {
    marginTop: 8,
  },
  emptyText: {
    marginTop: 24,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 16,
  },
});
