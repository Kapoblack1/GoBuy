import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  SafeAreaView,
  Platform,
  ScrollView,
} from "react-native";
import {
  CaretLeft,
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
const MyOrder = () => {

  const navigation = useNavigation();

  // Mock data, substitua com seus dados reais conforme necessário
  const carrinho = {
    nome: "Vem Bem",
    abertura: "12/12/2023",
    descricao:
      "Carrinho de natal, todos os produtos chegam 1 semana antes do natal, aproveita.",
    vendedor: "Romeno do Rosário",
    avaliacao: 3, // Número de estrelas cheias
    totalCarrinhos: "99",
    imagemCarrinho: require("../../assets/imagens/carrinho1.png"), // Substitua pelo caminho correto da sua imagem
    imagemVendedor: require("../../assets/imagens/james.png"), // Substitua pelo caminho correto da sua imagem
    abertura: "10/20/2024",
    fecho: "20/10/2024",
    itens: 5,
    total: 25000,
  };

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

  const estadosPedido = [
    {
      nome: "feito",
      label: "Pedido feito",
      data: pedido.feito,
      nextIcon: ClipboardText,
    },
    {
      nome: "aceite",
      label: "Pedido aceite",
      data: pedido.aceite,
      nextIcon: Handshake,
    },
    {
      nome: "progresso",
      label: "Em Progresso",
      data: pedido.progresso,
      nextIcon: Package,
    },
    {
      nome: "enviado",
      label: "Enviado",
      data: pedido.enviado,
      nextIcon: AirplaneTakeoff,
    },
    {
      nome: "entregue",
      label: "Entregue",
      data: pedido.entregue,
      nextIcon: Truck,
    },
  ];

  const getStatusColor = (status) => {
    const orderProgress = [
      "feito",
      "aceite",
      "progresso",
      "enviado",
      "entregue",
    ];
    const currentIndex = orderProgress.indexOf(pedido.state);
    const statusIndex = orderProgress.indexOf(status);

    return currentIndex >= statusIndex ? "#704F38" : "#A9A9A9"; // Castanho para ativo, cinzento para inativo
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollViewStyle}>
        <View style={styles.container}>
          <Header page={"Seguir Pedido"}></Header>
          <View style={styles.itemContainer}>
            <Image
              source={carrinho.imagemCarrinho}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{carrinho.nome}</Text>
              <Text style={styles.itemSpace}>Itens: {carrinho.itens}</Text>
              <Text style={styles.itemSpace}>Total: {carrinho.total} AOA</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Vendedor</Text>
          <View style={styles.vendedorInfo}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Image
                source={pedido.imagemCarrinho}
                style={styles.vendedorImage}
                resizeMode="cover"
              />
              <View style={styles.vendedorDetails}>
                <Text style={styles.vendedorName}>{carrinho.vendedor}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("ChatScreen")}>
              <ChatCircleDots size={32} color="#704F38" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Detalhes do Pedido</Text>
          <View style={styles.detailsContainer}>
            <View style={styles.detail}>
              <Text style={styles.detailText}>Estimativa de Chegada</Text>
              <Text style={styles.detailText1}>{pedido.chegada}</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailText}>ID do pedido</Text>
              <Text style={styles.detailText1}>{pedido.id}</Text>
            </View>
            <View style={styles.detail}>
              <Text style={styles.detailText}>Link enviado</Text>
              <Text style={styles.detailText1}>{pedido.link}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Estado do Pedido</Text>
          <View style={styles.detailsContainer1}>
            <View style={styles.detailsContainer1}>
              {estadosPedido.map((estado, index) => (
                <View key={index} style={styles.state}>
                  <View style={styles.stateDetails}>
                    <CheckCircle
                      weight="fill"
                      color={getStatusColor(estado.nome)}
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
                            estadosPedido[index + 1].nome
                          ),
                        },
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF", // ou a cor de
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
