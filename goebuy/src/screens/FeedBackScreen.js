import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
} from "react-native";
import { Star, CameraPlus } from "phosphor-react-native";

const FeedbackScreen = () => {
  const item = {
    id: "1",
    title: "Vem Bem",
    source: "Carrinho Shein",
    items: 5,
    total: "25000Kz",
    status: "ativo",
    pagamento: false,
    image: require("../../assets/imagens/carrinho1.png"),
  };

  const [fotos, setFotos] = useState([
    { id: "1", uri: require("../../assets/imagens/carrinho1.png") },
    { id: "2", uri: require("../../assets/imagens/carrinho2.png") },
    { id: "3", uri: require("../../assets/imagens/carrinho3.png") },
    // Adicione mais objetos conforme necessário
  ]);
  const handleSendFeedback = () => {
    // Implemente a lógica para enviar o feedback
    console.log("Feedback enviado!");
  };

  // Função para lidar com o cancelamento do feedback
  const handleCancelFeedback = () => {
    // Implemente a lógica para cancelar o feedback
    console.log("Feedback cancelado!");
  };
  // Função para lidar com o pressionamento do item
  const handleItemPress = () => {
    console.log("Item pressionado:", item);
    // Ação a ser executada quando um item é pressionado
    // Por exemplo, navegar para uma nova tela com os detalhes do item
  };

  const removerFoto = (id) => {
    setFotos(fotos.filter((foto) => foto.id !== id));
  };

  const renderItem = ({ item }) => (
    <View style={styles.fotoContainer}>
      <Image source={item.uri} style={styles.foto} />
      <TouchableOpacity
        style={styles.removerFotoButton}
        onPress={() => removerFoto(item.id)}
      >
        <Text style={styles.removerFotoTexto}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Feedback</Text>
      </View>
      <ScrollView style={styles.scrollViewContainer}>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={handleItemPress}
            style={styles.itemTouchable}
          >
            <View style={styles.itemContainer}>
              <Image source={item.image} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSpace}>Source: {item.source}</Text>
                <Text style={styles.itemSpace}>{item.items} itens</Text>
                <Text style={styles.itemSpace}>Total: {item.total}</Text>
              </View>
            </View>
            <View style={styles.separator} />
          </TouchableOpacity>
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackQuestion}>Como foi o seu pedido?</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.feedbackContainer}>
            <Text style={styles.pontuacao}>A sua pontuação</Text>
          </View>
          <View style={styles.starsContainer}>
            <Star
              size={50}
              color="#878787"
              style={styles.searchIcon}
              weight="fill"
            />
            <Star
              size={50}
              color="#878787"
              style={styles.searchIcon}
              weight="fill"
            />
            <Star
              size={50}
              color="#878787"
              style={styles.searchIcon}
              weight="fill"
            />
            <Star
              size={50}
              color="#878787"
              style={styles.searchIcon}
              weight="fill"
            />
            <Star
              size={50}
              color="#878787"
              style={styles.searchIcon}
              weight="fill"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.titleFeed}>
            <Text style={{ fontFamily: 'Poppins_400Regular'}}>Dê um feedback detalhado</Text>
          </View>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            multiline
            placeholderTextColor={"#878787"}
            placeholder="Digite aqui..."
            numberOfLines={4}
            blurOnSubmit={true} // Adiciona esta linha
            onSubmitEditing={() => { }} // Adicione esta linha para esconder o teclado
          />
          <TouchableOpacity style={styles.cameraPlus}>
            <CameraPlus
              size={20}
              color="#704F38"
              style={styles.searchIcon}
              weight="fill"
            />
            <Text style={styles.adicionar}>Adicionar foto</Text>
          </TouchableOpacity>
          <FlatList
            horizontal
            data={fotos}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.fotosList}
          />
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={handleCancelFeedback}
              style={[styles.button, styles.cancelButton]}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSendFeedback}
              style={[styles.button, styles.sendButton]}
            >
              <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scrollViewContainer: {
    flex: 1,
  },
  container: {
    margin: "3%",
  },
  headerContainer: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'Poppins_600SemiBold',

  },
  itemContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  itemImage: {
    width: 100,
    height: 100,
    marginRight: 16,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',


  },
  itemSpace: {
    color: "#878787",
    fontFamily: 'Poppins_400Regular',

  },
  separator: {
    height: 1,
    backgroundColor: "#DEDEDE",
    marginVertical: 10,
  },
  feedbackContainer: {
    padding: 20,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    // Estilos adicionais se necessário
  },
  feedbackQuestion: {
    fontSize: 26,
    fontFamily: 'Poppins_400Regular',
  },
  pontuacao: {
    fontSize: 14,
    color: "#878787",
    fontFamily: 'Poppins_400Regular',

  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
  },
  searchIcon: {
    margin: "2%",
    marginVertical: 0,
  },
  titleFeed: {
    marginVertical: "2%",
    fontFamily: 'Poppins_400Regular',

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
  descriptionInput: {
    textAlignVertical: "top", // Para alinhar o texto no topo no Android
    height: 130,
    fontFamily: 'Poppins_400Regular',

  },
  input: {
    width: "100%",
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 5,
  },
  cameraPlus: {
    flexDirection: "row",
    marginTop: "2%",
  },
  adicionar: {
    color: "#704F38",
    fontFamily: 'Poppins_400Regular',

  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
  },
  button: {
    paddingVertical: 20,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    minWidth: "39%",
    height: "36%"
  },
  cancelButton: {
    backgroundColor: "#CCCCCC", // Cor do botão cancelar
    fontFamily: 'Poppins_400Regular',

  },
  sendButton: {
    backgroundColor: "#704F38", // Cor do botão enviar
    fontFamily: 'Poppins_400Regular',

  },
  buttonText: {
    color: "#FFF", // Cor do texto do botão
    fontSize: 16,
    fontWeight: "bold",
  },
  fotoContainer: {
    position: 'relative',
    marginRight: 25,
    marginTop: 15,
    marginBottom: 10,
  },
  foto: {
    width: 100,
    height: 90,
    borderRadius: 5,
  },
  removerFotoButton: {
    position: 'absolute',
    right: -10,
    top: -10,
    backgroundColor: '#704F38',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removerFotoTexto: {
    color: 'white',
    fontSize: 14,
  },
  // Adicione estilos adicionais se necessário
});

export default FeedbackScreen;
