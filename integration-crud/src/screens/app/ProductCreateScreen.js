import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import ProductImagePicker from "../../components/ProductImagePicker";
import QuantityInput from "../../components/QuantityInput";
import ScreenHeader from "../../components/ScreenHeader";
import { useCustomAlert } from "../../context/CustomAlertContext";
import { parseCurrencyInput } from "../../services/formatters";
import * as productService from "../../services/productService";

export default function ProductCreateScreen({ navigation }) {
  const { showAlert } = useCustomAlert();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState("");
  const [imageAsset, setImageAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (submitting) {
      return;
    }

    if (!name || !description || !price || !quantity) {
      showAlert({
        title: "Campos obrigatórios",
        message: "Preencha nome, descrição, preço e quantidade.",
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
      setSubmitting(true);
      await productService.createProduct({
        productData: {
          name,
          description,
          price,
          quantity,
          image,
          imageAsset,
        },
      });
      showAlert({
        title: "Produto cadastrado",
        message: "O produto foi salvo com sucesso.",
        type: "success",
        buttonText: "Voltar para a lista",
        onClose: () => navigation.goBack(),
      });
    } catch (error) {
      showAlert({
        title: "Erro ao cadastrar produto",
        message: error.message,
        type: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <ScreenHeader title="Novo produto" onBack={() => navigation.goBack()} />

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

      <ProductImagePicker
        disabled={submitting}
        imageAsset={imageAsset}
        imageUrl={image}
        onRemoveImage={() => {
          setImage("");
          setImageAsset(null);
        }}
        onSelectImage={setImageAsset}
        productName={name}
      />

      <AppButton
        disabled={submitting}
        icon="save"
        onPress={handleSubmit}
        style={styles.submitButton}
        title={submitting ? "Salvando..." : "Salvar produto"}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f1ea",
  },
  content: {
    padding: 18,
    paddingTop: 58,
    paddingBottom: 32,
  },
  submitButton: {
    marginTop: 8,
  },
});
