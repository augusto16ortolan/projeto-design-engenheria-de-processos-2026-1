import { useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "../../components/AppButton";
import AppInput from "../../components/AppInput";
import QuantityInput from "../../components/QuantityInput";
import ScreenHeader from "../../components/ScreenHeader";
import { useCustomAlert } from "../../context/CustomAlertContext";
import { useAuth } from "../../context/AuthContext";
import { parseCurrencyInput } from "../../services/formatters";
import * as productService from "../../services/productService";

export default function ProductCreateScreen({ navigation }) {
  const { showAlert } = useCustomAlert();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState("");

  const { user } = useAuth();

  async function handleSubmit() {
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
      await productService.createProduct(
        {
          name,
          description,
          price,
          quantity,
          image,
        },
        user.id,
      );
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
    }
  }

  return (
    <View style={styles.container}>
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
        icon="save"
        onPress={handleSubmit}
        style={styles.submitButton}
        title="Salvar produto"
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
});
