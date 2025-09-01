import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import {
  ChatCircleDots,
  CheckCircle,
  ClipboardText,
  Handshake,
  Package,
  AirplaneTakeoff,
  Truck,
} from "phosphor-react-native";
import Header from "../components/Header";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
const MyOrder = ({ route }) => {
  const navigation = useNavigation();
  const { cart } = route.params;
  const [imageUrl, setImageUrl] = useState(null);
  const [userId, setUserId] = useState(null);
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    console.log("Cart ID recebido:", cart);
    const imageUrl = cart.imageUrls?.[0]
      ? { uri: `${BASE_URL}/${cart.imageUrls[0].replace(/\\/g, "/")}` }
      : require("../../assets/imagens/kratos.png");

    // Fetch seller data if available
    if (cart?.seller) {
      console.log("Fetching seller data for:", cart.seller);
      fetch(`${BASE_URL}/api/auth/${cart.seller}`)
        .then((res) => res.json())
        .then((data) => setSeller(data))
        .catch((err) => console.error("Erro ao buscar vendedor:", err));
    }

    setSeller(cart.seller);
    setImageUrl(imageUrl);
  }, [cart]);

  useEffect(() => {
    // Recupera o ID do comprador do AsyncStorage
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
      console.log("User ID:", id);
    };
    fetchUserId();
  }, []);

  const pedido = {
    id: "CARSH1234567",
    chegada: "12/12/2023",
    link: "shein.cart.1234",
    vendedor: "Romeno do Rosário",
    avaliacao: 3, // Número de estrelas cheias
    totalCarrinhos: "99",
    state: "progresso",
    imagemCarrinho: require("../../assets/imagens/carrinho1.png"),
    imagemVendedor: require("../../assets/imagens/james.png"),
    feito: "12/12/2023",
    aceite: "13/12/2023",
    progresso: "14/12/2023",
    enviado: "15/12/2023",
    entregue: "16/12/2023",
  };

  // Mapeamento de status do BD para nosso sistema interno
  const statusMap = {
  "Pedido Feito": "feito",
  "Aceite": "aceite",
  "Em Progresso": "progresso",
  "Enviado": "enviado",
  "Entregue": "entregue",
  "Negado": "negado",
  "Cancelado": "cancelado",
  "Fechado": "fechado" // <-- Adicionado
};

  // Supondo que você já pegou da API:
  const buyerProgress = cart.buyerCartProgress.find(
    (item) => item.buyer === userId
  );

  // Estado atual do pedido (convertendo do BD para nosso formato interno)
  const currentState = statusMap[buyerProgress?.status] || "feito";

  const estadosPedido = [
  { nome: "feito", label: "Pedido feito", nextIcon: ClipboardText },
  { nome: "progresso", label: "Em Progresso", nextIcon: Package },
  { nome: "aceite", label: "Pedido aceite", nextIcon: Handshake },
  { nome: "enviado", label: "Enviado", nextIcon: AirplaneTakeoff },
  { nome: "entregue", label: "Entregue", nextIcon: Truck },
  { nome: "fechado", label: "Pedido fechado", nextIcon: CheckCircle }, // <-- Adicionado
];

  const getStatusColor = (status) => {
    const orderProgress = [
      "feito",
      "progresso",
      "aceite",
      "enviado",
      "entregue",
      "fechado",
    ];
    const currentIndex = orderProgress.indexOf(currentState);
    const statusIndex = orderProgress.indexOf(status);

    return currentIndex >= statusIndex ? "#704F38" : "#A9A9A9";
  };
  const isFechado =
    cart?.buyerCartProgress?.find((p) => p.buyer === userId)?.status ===
    "Fechado";

  const calcularEstimativaChegada = (closeDate, deliveryDays) => {
    const fechamento = new Date(closeDate);
    fechamento.setDate(fechamento.getDate() + deliveryDays);
    return fechamento.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Status real do comprador no carrinho
  const buyerStatus =
    cart?.buyerCartProgress?.find(
      (p) => p.buyer === userId // seu ID de usuário logado
    )?.status || "Pedido Feito";

  function getBuyerProgress(cart, userId) {
    if (!cart || !cart.buyerCartProgress) {
      console.log("Carrinho inválido ou sem progresso.");
      return null;
    }

    const progress = cart.buyerCartProgress.find((item, i) => {
      console.log(`Item[${i}] buyerId:`, item.buyer);
      console.log(`Comparando com userId:`, userId);
      return item.buyer === userId;
    });

    console.log(
      "Progresso encontrado:",
      progress ? progress.status : "Não encontrado"
    );
    return progress ? progress.status : null;
  }
  // Verifica se o status do buyerCartProgress é "Entregue"
  const isEntregue =
    cart?.buyerCartProgress?.find((p) => p.buyer === userId)?.status ===
    "Entregue";

  getBuyerProgress(cart, userId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header page={"Seguir Pedido"} />
      <ScrollView style={styles.scrollViewStyle}>
        <View style={styles.container}>
          {/* Info do carrinho */}
          <View style={styles.itemContainer}>
            <Image
              source={{
                uri: `${BASE_URL}/${cart.imageUrls[0]}`.replace(/\\/g, "/"),
              }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{cart.cartName}</Text>
              <Text style={styles.itemSpace}>Itens: {cart.itemCount}</Text>
              <Text style={styles.itemSpace}>Total: {cart.totalPrice} AOA</Text>
            </View>
          </View>

          {/* Vendedor */}
          <Text style={styles.sectionTitle}>Vendedor</Text>
          <View style={styles.vendedorInfo}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {cart.seller.profileImage ? (
                <Image
                  source={{
                    uri: `${BASE_URL}/${cart.seller.profileImage.replace(
                      /\\/g,
                      "/"
                    )}`,
                  }}
                  style={styles.vendedorImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require("../../assets/imagens/james.png")}
                  style={styles.vendedorImage}
                />
              )}
              <View style={styles.vendedorDetails}>
                <Text style={styles.vendedorName}>
                  {cart.seller?.name || "Vendedor"}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("ChatScreen")}>
              <ChatCircleDots size={32} color="#704F38" />
            </TouchableOpacity>
          </View>

          {/* Detalhes */}
          <Text style={styles.sectionTitle}>Detalhes do Pedido</Text>
          <View style={styles.detailsContainer}>
            <View style={styles.detail}>
              <Text style={styles.detailText}>Estimativa de Chegada</Text>
              <Text style={styles.detailText1}>
                {calcularEstimativaChegada(cart.closeDate, cart.deliveryDays)}
              </Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailText}>ID do pedido</Text>
              <Text style={styles.detailText1}>{cart._id}</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailText}>Link enviado</Text>
              <Text style={styles.detailText1}>{pedido.link}</Text>
            </View>
          </View>

          {/* Status */}
          <Text style={styles.sectionTitle}>Estado do Pedido</Text>
          <View style={styles.detailsContainer1}>
            {estadosPedido.map((estado, index) => (
              <View key={index} style={styles.state}>
                <View style={styles.stateDetails}>
                  <CheckCircle
                    weight="fill"
                    color={getStatusColor(estado.nome, buyerStatus)}
                    size={40}
                  />
                  <View style={styles.stateText}>
                    <Text style={styles.actualState}>{estado.label}</Text>
                    <Text style={styles.stateDate}>{estado.data}</Text>
                  </View>
                </View>
                <estado.nextIcon color="#704F38" size={35} />
                {index < estadosPedido.length - 1 && (
                  <View
                    style={[
                      styles.verticalLine,
                      {
                        backgroundColor: getStatusColor(
                          estadosPedido[index + 1].nome,
                          buyerStatus
                        ),
                      },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>
          {isEntregue && !isFechado && (
            <TouchableOpacity
              style={{
                backgroundColor: "#704F38",
                padding: 16,
                borderRadius: 25,
                marginVertical: 20,
                alignItems: "center",
              }}
              onPress={() =>
                navigation.navigate("FeedBackScreen", {
                  cart,
                  buyer: { buyerId: userId },
                })
              }
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Terminar Pedido
              </Text>
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
    backgroundColor: "#FFF", // ou a cor de
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 10 : 0,
  },
  scrollViewStyle: {
    flex: 1, // Você pode remover esta linha se você já definiu flex: 1 no estilo safeArea
    // Adicione outros estilos para o ScrollView, se necessário
  },
  container: {
    marginHorizontal: 13,
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
  detailsContainer1: {
    margin: "3%",
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
  state: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stateDetails: {
    display: "flex",
    flexDirection: "row",
    paddingBottom: 30,
  },
  relative: {
    position: "relative",
  },
  stateText: {
    marginLeft: "10%",
    fontFamily: "Poppins_400Regular",
  },
  actualState: {
    fontSize: 18,
    fontFamily: "Poppins_400Regular",
  },
  stateDate: {
    fontSize: 14,
    marginTop: 2,
    color: "#A9A9A9",
    fontFamily: "Poppins_400Regular",
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
    fontSize: 18,
    marginTop: 20,
    marginLeft: "3%",
    fontFamily: "Poppins_600SemiBold",
  },
  descriptionContainer: {
    marginTop: 30,
    borderWidth: 1,
    marginHorizontal: 25,
    borderColor: "#E8E8E8",
    height: 120,
    width: "80%",
    right: 12.5,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 17,
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
});

export default MyOrder;
