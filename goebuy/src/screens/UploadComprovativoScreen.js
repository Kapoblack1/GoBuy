import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function UploadComprovativoScreen({ route }) {
  const { cartId, seller, totalPrice, cart } = route.params;
  const [file, setFile] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    console.log("Cart ID recebido:", cartId);
    console.log("Total a ser pago:", totalPrice);
  }, []);

  // 📌 Selecionar PDF
  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const selected = result.assets[0];
      if (selected.mimeType !== "application/pdf") {
        Alert.alert("Formato inválido", "Por favor selecione um arquivo PDF.");
        return;
      }

      setFile(selected);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível selecionar o arquivo.");
    }
  };

  // 📌 Enviar PDF para o backend
  const uploadPDF = async () => {
    if (!file) {
      Alert.alert("Atenção", "Selecione um arquivo PDF antes de enviar.");
      return;
    }

    const formData = new FormData();
    formData.append("paymentProof", {
      uri: file.uri,
      type: "application/pdf",
      name: file.name || "comprovativo.pdf",
    });

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return console.warn("Token não encontrado.");

      const response = await fetch(
        `${BASE_URL}/api/carts/${cartId}/payment-proof`,
        {
          method: "POST",
          headers: {
            Authorization: token,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Sucesso", "Comprovativo enviado com sucesso!");
        const token = await AsyncStorage.getItem("token");
        const updatedRes = await fetch(`${BASE_URL}/api/carts/${cartId}`, {
          headers: { Authorization: token },
        });
        const updatedCart = await updatedRes.json();

        navigation.navigate("MyOrder", { cart: updatedCart });
      } else {
        Alert.alert("Erro", data.error || "Falha ao enviar comprovativo.");
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro no upload.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagamento ao Vendedor</Text>
      <Text style={styles.sellerName}>{seller.name}</Text>

      {seller.contasBancarias?.map((conta, index) => (
        <View key={conta._id || index} style={styles.contaContainer}>
          <Text style={styles.contaText}>Banco: {conta.banco}</Text>
          <Text style={styles.contaText}>IBAN: {conta.iban}</Text>
        </View>
      ))}

      <Text style={styles.total}>
        💰 Total a Pagar: {totalPrice.toLocaleString()} Kz
      </Text>

      <Text style={styles.warning}>
        ⚠️ Certifique-se de enviar o valor exato e guardar o comprovativo.
      </Text>

      <TouchableOpacity style={styles.selectButton} onPress={pickPDF}>
        <Text style={styles.buttonText}>Selecionar PDF</Text>
      </TouchableOpacity>

      {file && (
        <Text style={styles.selectedFile}>📄 {file.name || "arquivo.pdf"}</Text>
      )}

      <TouchableOpacity style={styles.uploadButton} onPress={uploadPDF}>
        <Text style={styles.buttonText}>Enviar Comprovativo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: "5%",
    paddingTop: "10%",
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#000",
    textAlign: "center",
    marginBottom: "2%",
  },
  sellerName: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: "#704F38",
    textAlign: "center",
    marginBottom: "5%",
  },
  contaContainer: {
    backgroundColor: "#F9F9F9",
    borderRadius: 10,
    paddingVertical: "3%",
    paddingHorizontal: "4%",
    marginBottom: "4%",
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  contaText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#333",
  },
  warning: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#B02A2A",
    textAlign: "center",
    marginVertical: "5%",
  },
  selectButton: {
    backgroundColor: "#704F38",
    borderRadius: 30,
    paddingVertical: "3%",
    alignItems: "center",
    marginBottom: "4%",
  },
  uploadButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 30,
    paddingVertical: "3%",
    alignItems: "center",
    marginTop: "2%",
  },
  buttonText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#fff",
  },
  selectedFile: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#555",
    textAlign: "center",
    marginBottom: "3%",
  },
  total: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginVertical: "3%",
  },
});
