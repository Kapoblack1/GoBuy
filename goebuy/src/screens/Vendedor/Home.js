import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  ImageBackground,
} from "react-native";
import {
  CaretLeft,
  House,
  ShoppingCartSimple,
  ShoppingBagOpen,
  Bell,
  User,
} from "phosphor-react-native";
import shein from "../../../assets/imagens/shein.jpg";
import zara from "../../../assets/imagens/zara.jpg";
import ali from "../../../assets/imagens/ali.png";
import carrinhos from "../../mocks/mocks";
import { useNavigation } from "@react-navigation/native";


const Home = () => {
  const navigation = useNavigation();

  const handleItemPress = (item) => {
    // Ação a ser executada quando um item é pressionado
    // Por exemplo, navegar para uma nova tela com os detalhes do item
    console.log("Item pressionado:", item);
    navigation.navigate("DetailsCarrinhoScreen");
  };

  function nextPage(namePage){
    //bora fazer
    console.log(namePage)
    navigation.navigate("CreateCartScreen",{namePage});
  }

  function navegar(pagina) {
    navigation.navigate(pagina);
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)} style={styles.item}>
      <View style={styles.imageContainer}>
        <Image
          style={styles.carrinhoImage}
          source={item.image}
          resizeMode="cover"
        ></Image>
      </View>
      <View style={styles.carrinhoDetails}>
        <Text style={styles.carrinhoName}>{item.name}</Text>
        <Text style={styles.carrinhoDetail}>Preço: {item.price}</Text>
        <Text style={styles.carrinhoDetail}>Fecho: {item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Carrinhos</Text>
        </View>

        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.options}
        >
          <TouchableOpacity onPress={()=>nextPage("Shein")}>
            <View style={styles.option}>
              <ImageBackground source={shein} style={styles.image}>
                <View style={styles.optionDetails}>
                  <Text>Criar carrinhos Shein</Text>
                </View>
              </ImageBackground>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={()=>nextPage("Zara")}>
            <View style={styles.option}>
              <ImageBackground source={zara} style={styles.image}>
                <View style={styles.optionDetails}>
                  <Text>Criar carrinhos Zara</Text>
                </View>
              </ImageBackground>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>nextPage("Aliexpress")}>
            <View style={styles.option}>
              <ImageBackground source={ali} style={styles.image}>
                <View style={styles.optionDetails}>
                  <Text>Criar carrinhos Aliexpress</Text>

                </View>
              </ImageBackground>
            </View>
          </TouchableOpacity>
        </ScrollView>

      </ScrollView>

      <View style={styles.containerBottomBar}>
        <TouchableOpacity>
          <House weight="fill" size={35} color="#704F38" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navegar("MycartsScreen")}>
          <ShoppingCartSimple size={35} color="#704F38" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navegar("OrderScreen")}>
          <ShoppingBagOpen size={35} color="#704F38" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navegar("NotificationsScreen")}>
          <Bell size={35} color="#704F38" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navegar("ProfileScreen")}>
          <User size={35} color="#704F38" />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  containerBottomBar: {
    width: "100%",
    height: "10%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "3%",
    backgroundColor: "white",
  },
  container: {
    marginBottom: 20,
    marginTop: 30,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  headerText: {
    fontSize: 26,
    margin: 16,
    fontFamily: "Poppins_600SemiBold",
    alignContent: "center",
  },
  options: {
    display: "flex",
    flexDirection: "row",
  },
  optionsText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
  },
  option: {
    width: 220,
    height: 400,
    borderRadius: 40,
    marginHorizontal: 8,
    shadowColor: "#704F38",
    shadowOffset: { width: 4, height: 5 },
    shadowOpacity: 0.2,
  },
  optionDetails: {
    backgroundColor: "#e1e1e1",
    justifyContent: "center",
    alignContent: "center",
    width: "70%",
    padding: 7,
    borderRadius: 15,
  },
  carrinhoName: {
    fontFamily: "Poppins_500Medium",
  },
  carrinhoDetail: {
    fontFamily: "Poppins_400Regular",
  },
  carrinhoDetails: {
    backgroundColor: "#F8F9FD",
    paddingRight: 20,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    height: "100%",
    paddingTop: 7,
  },
  imageContainer: {
    backgroundColor: "#F8F9FD",
    paddingRight: 10,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
  },
  image: {
    flex: 1,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    margin: 16,
    fontFamily: "Poppins_500Medium",
    alignContent: "center",
  },
  carrinhoImage: {
    width: 80,
    height: 80,
    borderRadius: 25,
    resizeMode: "cover",
  },
  carrinhos: {
    marginHorizontal: 16,
  },
  item: {
    display: "flex",
    flexDirection: "row",
    marginHorizontal: 8,
  },
});

export default Home;
