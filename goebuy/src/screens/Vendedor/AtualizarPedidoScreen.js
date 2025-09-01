import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../../config";

const AtualizarPedidoScreen = ({ route }) => {
  const { cart, buyer } = route.params;
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const atualizarStatusProgress = async (novoStatus) => {
    setLoading(true);
    console.log("Atualizando status para:", novoStatus);
    console.log("Cart ID:", cart._id);
    console.log("Buyer ID:", buyer.buyerId);
    if (!cart || !buyer || !buyer.buyerId) {
      Alert.alert("Erro", "Dados do carrinho ou comprador inválidos.");
      setLoading(false);
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");

      // Atualiza o cartProgress
      const responseCart = await fetch(
        `${BASE_URL}/api/carts/${cart._id}/buyer-progress`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            buyerId: buyer.buyerId,
            status: novoStatus,
          }),
        }
      );
      const dataCart = await responseCart.json();
      if (!responseCart.ok) {
        throw new Error(
          dataCart.message || "Erro ao atualizar status do carrinho"
        );
      }

      // Atualiza todas as orders deste comprador para o novo status
      const responseOrders = await fetch(
        `${BASE_URL}/api/orders/cart/${cart._id}/buyer/${buyer.buyerId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            status: novoStatus,
          }),
        }
      );
      const dataOrders = await responseOrders.json();
      if (!responseOrders.ok) {
        throw new Error(
          dataOrders.message || "Erro ao atualizar status das orders"
        );
      }

      Alert.alert("Sucesso", `Status atualizado para ${novoStatus}`);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Atualizar Status do Pedido</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#704F38" }]}
        onPress={() => atualizarStatusProgress("Enviado")}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Marcar como Enviado</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#228B22" }]}
        onPress={() => atualizarStatusProgress("Entregue")}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Marcar como Entregue</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#4682B4" }]}
        onPress={() =>
          navigation.navigate("FeedBackScreen1", {
            cart,
            buyer,
          })
        }
        disabled={loading}
      >
        <Text style={styles.buttonText}>Terminar Pedido</Text>
      </TouchableOpacity>
    </View>
  );

};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 30 },
  button: {
    padding: 16,
    borderRadius: 25,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default AtualizarPedidoScreen;
