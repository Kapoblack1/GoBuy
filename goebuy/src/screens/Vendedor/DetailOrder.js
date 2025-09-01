import React, { use, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Modal,
  Button,
  Linking,
} from "react-native";
import { ChatCircleDots, Handshake, X } from "phosphor-react-native";
import Header from "../../components/Header";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DetailOrder = ({ route }) => {
  const { cart, buyer } = route.params;
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [buyerData, setBuyerData] = useState(buyer);
  const [cartData, setCartData] = useState(cart);

  const fetchBuyerOrders = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/orders/cart/${cart._id}/buyer/${buyer.buyerId}`
      );
      const orders = await res.json();
      setBuyerData({ ...buyerData, orders });
    } catch (err) {
      console.error("Erro ao atualizar pedidos:", err);
    }
  };

  const atualizarBuyerCartProgress = async (cartId, buyerId, novoStatus) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/carts/${cartId}/buyer-progress`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            buyerId,
            status: novoStatus,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || "Erro ao atualizar progresso do comprador"
        );
      }
      setCartData(data.cart); // Atualiza o cart local com o novo progresso
      return data;
    } catch (error) {
      console.error("Erro ao atualizar buyerCartProgress:", error);
      alert(error.message);
    }
  };

  // Função para verificar se deve mostrar o botão
  const podeAtualizarPedido = () => {
    const progress = cartData.buyerCartProgress?.find(
      (item) => item.buyer?.toString() === buyer.buyerId?.toString()
    );
    const status = progress?.status;
    return status === "Aceite" || status === "Enviado" || status === "Entregue";
  };

  const atualizarStatus = async (cartId, buyerId, novoStatus) => {
    try {
      const token = await AsyncStorage.getItem("token");
      // Atualiza status das orders
      const response = await fetch(
        `${BASE_URL}/api/orders/cart/${cartId}/buyer/${buyerId}/status`,
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
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erro ao atualizar status");
      }
      // Atualiza buyerCartProgress do carrinho e o cart local
      await atualizarBuyerCartProgress(cartId, buyerId, novoStatus);

      alert("Status atualizado com sucesso!");
      await fetchBuyerOrders(); // Atualiza os pedidos na tela
      return data;
    } catch (error) {
      console.error("Erro no atualizarStatus:", error);
      alert(error.message);
    }
  };

  useEffect(() => {
    console.log("Cart data received:", cart);
    console.log("Buyer data received:", buyer);
  }, [cart, buyer]);

  const comprovativoUrl = cart.paymentProofs?.[0]?.proofUrl
    ? `${BASE_URL}/${cart.paymentProofs[0].proofUrl.replace(/\\/g, "/")}`
    : null;
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header page={"Seguir Pedido"} />
      <ScrollView style={styles.scrollViewStyle}>
        <View style={styles.container}>
          {/* Info do carrinho */}
          <View style={styles.itemContainer}>
            <Image
              source={{
                uri: `${BASE_URL}/${cart.imageUrls[0].replace(/\\/g, "/")}`,
              }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>
                {cart.cartName || "Carrinho sem nome"}
              </Text>
              <Text style={styles.itemSpace}>Itens: {cart.itemCount || 0}</Text>
              <Text style={styles.itemSpace}>
                Total: {cart.totalPrice || "Pendente"} AOA
              </Text>
            </View>
          </View>

          {/* Info do comprador */}
          <Text style={styles.sectionTitle}>Comprador</Text>
          <View style={styles.vendedorInfo}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={
                  buyer.avatar || require("../../../assets/imagens/james.png")
                }
                style={styles.vendedorImage}
                resizeMode="cover"
              />
              <View style={styles.vendedorDetails}>
                <Text style={styles.vendedorName}>
                  {buyer.name || "Nome não disponível"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("ChatScreen", { buyer })}
            >
              <ChatCircleDots size={32} color="#704F38" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Detalhes dos Pedidos</Text>

          {buyerData.orders.map((order, idx) => (
            <View key={order._id || idx} style={{ marginBottom: 20 }}>
              {/* Infos do pedido */}
              <View style={styles.detailsContainer}>
                <View style={{ marginBottom: 10 }}>
                  <Text style={styles.detailText}>Descrição</Text>
                  <Text style={styles.descriptionText}>
                    {order.description || "N/A"}
                  </Text>
                </View>

                <View style={styles.detail}>
                  <Text style={styles.detailText}>Preço (USD)</Text>
                  <Text style={styles.detailText1}>
                    {order.priceUSD ? `$${order.priceUSD}` : "N/A"}
                  </Text>
                </View>

                <View style={styles.detail}>
                  <Text style={styles.detailText}>Link do Produto</Text>
                  <Text style={styles.detailText1}>
                    {order.productLink || "N/A"}
                  </Text>
                </View>

                <View style={styles.detail}>
                  <Text style={styles.detailText}>Status</Text>
                  <Text style={styles.detailText1}>{order.status}</Text>
                </View>
              </View>

              {/* Fotos do pedido */}
              <Text style={styles.sectionLabel}>Fotos</Text>
              <View style={styles.imagesRow}>
                {(order.images || []).map((img, i) => {
                  const imageUri = `${BASE_URL}/${img.replace(/\\/g, "/")}`;
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setSelectedImage(imageUri)}
                    >
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.detailImage}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <Modal visible={!!selectedImage} transparent={true}>
            <View style={styles.modalContainer}>
              <Image
                source={
                  typeof selectedImage === "string"
                    ? { uri: selectedImage }
                    : selectedImage
                }
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
              <Button title="Fechar" onPress={() => setSelectedImage(null)} />
            </View>
          </Modal>

          {/* Botões */}

          <TouchableOpacity
            style={[styles.button, !comprovativoUrl && { opacity: 0.5 }]}
            disabled={!comprovativoUrl}
            onPress={() => {
              if (comprovativoUrl) {
                navigation.navigate("PdfViewer", {
                  uri: comprovativoUrl,
                  cart: cart,
                });
              }
            }}
          >
            <Text style={styles.buttonText}>Comprovativo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() =>
              atualizarStatus(cart._id, buyer.buyerId, "Cancelado")
            }
          >
            <X size={20} color="#fff" />
            <Text style={styles.acceptText}>Rejeitar Todos os Pedidos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => atualizarStatus(cart._id, buyer.buyerId, "Aceite")}
          >
            <Handshake size={20} color="#fff" />
            <Text style={styles.acceptText}>Aceitar Todos os Pedidos</Text>
          </TouchableOpacity>

          {podeAtualizarPedido() && (
            <TouchableOpacity
              style={[styles.acceptButton, { backgroundColor: "#704F38" }]}
              onPress={() =>
                navigation.navigate("AtualizarPedidoScreen", {
                  cart: cartData,
                  buyer: buyerData,
                })
              }
            >
              <Text style={styles.acceptText}>Atualizar Pedido</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#FFF", // ou a cor de
  },
  scrollViewStyle: {
    flex: 1, // Você pode remover esta linha se você já definiu flex: 1 no estilo safeArea
    // Adicione outros estilos para o ScrollView, se necessário
  },
  container: {
    marginHorizontal: 20,
    backgroundColor: "#FFF",
  },
  center: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "300",
    margin: 16,
  },
  itemContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    borderBottomColor: "#DEDEDE",
    borderBottomWidth: 1,
  },
  itemSpace: {
    paddingBottom: 3,
    color: "#878787",
    fontFamily: "Poppins_400Regular",
  },
  itemImage: {
    width: 100,
    height: 100,
    marginRight: 16,
    borderRadius: 8, // Adicione um borderRadius se as imagens deveriam ter cantos arredondados
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: "400",
    fontSize: 18,
    marginBottom: 4,
    fontFamily: "Poppins_400Regular",
  },
  detailsContainer: {
    margin: "3%",
    paddingBottom: 20,
    borderBottomColor: "#DEDEDE",
    borderBottomWidth: 1,
  },

  detail: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  detailText: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
  detailText1: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },

  relative: {
    position: "relative",
  },

  verticalLine: {
    height: 49,
    width: 5,
    backgroundColor: "#704F38",
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 18,
    paddingBottom: 0,
    paddingTop: 0,
    top: 36,
    position: "absolute",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 20,
    marginLeft: 20,
    fontFamily: "Poppins_500Medium",
  },
  descriptionContainer: {
    marginTop: 30,
    borderWidth: 1,
    marginHorizontal: 25,
    borderColor: "#E8E8E8",
    height: 120,
    width: "90%",
    alignContent: "center",
    alignItems: "center",
    borderRadius: 10,
    padding: 5,
    paddingTop: 10,
  },
  description: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
  },
  vendedorInfo: {
    flexDirection: "row",
    marginTop: 20,
    marginLeft: "3%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vendedorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  vendedorDetails: {
    marginLeft: 10,
  },
  vendedorName: {
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: "Poppins_400Regular",
  },
  totalCarrinhos: {
    fontSize: 16,
  },
  starsContainer: {
    flexDirection: "row",
    marginTop: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 25,
  },
  input: {
    width: "100%",
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 5,
  },
  descriptionInput: {
    textAlignVertical: "top", // Para alinhar o texto no topo no Android
    height: 130,
  },
  foto: {
    width: 100,
    height: 90,
    borderRadius: 5,
    marginRight: 10,
    marginTop: 5,
  },
  itemCarrinhoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: "#e1e1e1",
    backgroundColor: "#fff", // Cor de fundo para cada item do carrinho
  },
  itemNome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#704F38", // Cor do texto para o nome do item
  },
  row: {
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
  },
  itemPreco: {
    fontSize: 16,
    color: "#704F38", // Cor do texto para o preço do item
  },
  sectionLabel: { fontWeight: "bold", marginTop: 8 },
  linkText: { color: "blue", marginBottom: 5 },
  imagesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, // opcional, para espaçamento entre imagens
  },
  detailImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#8B5E3C",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  acceptButton: {
    flexDirection: "row",
    backgroundColor: "#8B5E3C",
    padding: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  acceptText: { color: "#fff", fontWeight: "bold", marginLeft: 8 },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "100%",
    height: "80%",
  },
  descriptionText: {
    fontSize: 14,
    color: "#333",
    marginTop: 2,
    lineHeight: 20,
  },
});

export default DetailOrder;
