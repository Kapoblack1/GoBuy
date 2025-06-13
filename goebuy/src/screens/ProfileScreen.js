import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  MagnifyingGlass,
  Gear,
  Question,
  FileText,
  UserPlus,
  SignOut,
  User,
  CaretRight,
} from "phosphor-react-native";
import {
  CaretLeft,
  House,
  ShoppingCartSimple,
  ShoppingBagOpen,
  Bell,
} from "phosphor-react-native";
import { Check, PencilSimpleLine } from "phosphor-react-native";
const profileImageUrl = require("../../assets/imagens/james.png");
import Header from "../components/Header";
import { useNavigation } from "@react-navigation/native";


const ProfileScreen = () => {
  const navigation = useNavigation();

  function navegar(pagina, namePage) {
    navigation.navigate(pagina, { namePage });
  }
  return (
    <SafeAreaView style={styles.container}>
      <Header page="Perfil"></Header>
      <ScrollView style={styles.scroll}>
        <View style={styles.center}>
          <View style={styles.profileImageContainer}>
            <Image source={profileImageUrl} style={styles.profileImage} />
          </View>
          <TouchableOpacity style={styles.editIcon}>
            <PencilSimpleLine size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.userName}>Alexandre Café</Text>
        </View>
        <View style={styles.menuSection}>
          <MenuItem icon={User} text="Detalhes" style={styles.icon} />
          <MenuItem icon={Gear} text="Definições" style={styles.icon} />
          <MenuItem
            icon={Question}
            text="Centro de Ajuda"
            style={styles.icon}
          />
          <MenuItem
            icon={FileText}
            text="Política de Privacidade"
            style={styles.icon}
          />
          <MenuItem
            icon={UserPlus}
            text="Convidar amigos"
            style={styles.icon}
          />
          <MenuItem icon={SignOut} text="Logout" style={styles.icon} />
        </View>
      </ScrollView>

      <View style={styles.containerBottomBar}>
        <TouchableOpacity onPress={() => navegar("Home")}>
          <House size={35} color="#704F38" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navegar("CarrinhosScreen", "Carrinhos")}>
          <ShoppingCartSimple size={35} color="#704F38" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navegar("OrderScreen")}>
          <ShoppingBagOpen size={35} color="#704F38" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navegar("NotificationsScreen")}>
          <Bell size={35} color="#704F38" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navegar("ProfileScreen")}>
          <User weight="fill" size={35} color="#704F38" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const MenuItem = ({ icon: Icon, text }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => navigation.navigate("LoginScreen")}
    >
      <Icon size={28} color="#704F38" />
      <Text style={styles.menuItemText}>{text}</Text>
      <CaretRight size={24} color="#704F38" style={styles.menuItemIcon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  containerBottomBar: {
    width: "100%",
    height: "10%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "3%",
    backgroundColor: "white",
    bottom: -25,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60, // Metade do tamanho da largura/altura para tornar circular
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
    fontFamily: "Poppins_400Regular",
  },
  menuSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: "4%",
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    justifyContent: "space-between", // Adiciona espaço entre o texto e a seta
  },
  menuItemText: {
    fontSize: 18,
    marginLeft: 15,
    flex: 1, // Faz com que o texto ocupe todo o espaço disponível
    fontFamily: "Poppins_400Regular",
  },
  profileImageContainer: {
    alignItems: "center",
    marginVertical: 30,
    backgroundColor: "#E0E0E0",
    height: 120,
    width: 120,
    borderRadius: 70,
    position: "relative",
  },
  editIcon: {
    position: "absolute", // Posiciona o ícone sobre o contêiner da imagem de perfil
    right: 143, // Ajuste conforme necessário para alinhar onde você quer
    bottom: 35, // Ajuste conforme necessário para alinhar onde você quer
    backgroundColor: "#704F38", // Cor de fundo do ícone para corresponder ao seu esquema de cores
    borderRadius: 32, // Ajuste para corresponder à forma arredondada
    padding: 8, // Ajuste para tamanho correto do toque
    borderWidth: 1.5,
    borderColor: "#FFF", // Cor da borda branca
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 70,
    backgroundColor: "#E0E0E0", // Placeholder color
  },
  center: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 16,
  },
});

export default ProfileScreen;
