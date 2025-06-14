import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MagnifyingGlass } from "phosphor-react-native";
import Header from '../../components/Header';
import BottomNavigation from "../../components/BottomNavigation";
import { useNavigation } from "@react-navigation/native";

const CarrinhosScreen = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const sellerId = await AsyncStorage.getItem("userId"); // ou "sellerId"
        console.log("ID do vendedor:", sellerId);
        if (!sellerId) {
          console.warn("Vendedor não autenticado.");
          return;
        }

        const response = await fetch(`http://172.20.10.7:5000/api/carts/seller/${sellerId}`);
        const data = await response.json();
        setCarts(data);
        console.log("Carrinhos do vendedor:", data);
      } catch (error) {
        console.error("Erro ao buscar carrinhos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarts();
  }, []);

  const handleItemPress = (item) => {
    console.log("Item pressionado:", item);
    navigation.navigate("OrderScreen", { cartId: item._id, cartName: item.cartName });
  };

  const filteredCarts = carts.filter((item) =>
    item.cartName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItem = ({ item }) => (
  <TouchableOpacity onPress={() => handleItemPress(item)} style={styles.itemTouchable}>
    <View style={styles.itemContainer}>
      {item.imageUrls && item.imageUrls.length > 0 && (
        <Image
          source={{ uri: `http://172.20.10.7:5000/${item.imageUrls[0].replace(/\\/g, "/")}` }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.cartName}</Text>
        <Text style={styles.itemSpace}>Abertura: {new Date(item.openDate).toLocaleDateString()}</Text>
        <Text style={styles.itemSpace}>Fecho: {new Date(item.closeDate).toLocaleDateString()}</Text>
        <Text style={styles.itemSpace}>Preço: {item.exchangeRate} Kz</Text>
      </View>
    </View>
    <View style={styles.separator} />
  </TouchableOpacity>
);


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header page={'Meus Carrinhos'} />
        <View style={styles.contentContainer}>
          <View style={styles.searchContainer}>
            <MagnifyingGlass
              size={24}
              color="#878787"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Pesquisar carrinho"
              style={styles.searchInput}
              placeholderTextColor="#878787"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#704F38" />
          ) : (
            <FlatList
              data={filteredCarts}
              renderItem={renderItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.flatListContentContainer}
              ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Nenhum carrinho encontrado</Text>}
            />
          )}
        </View>
      </View>
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  searchIcon: {
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    height: 40,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  itemTouchable: {},
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
    marginBottom: 4,
    fontFamily: 'Poppins_400Regular',
  },
  itemSpace: {
    paddingBottom: 3,
    color: "#878787",
    fontFamily: 'Poppins_400Regular',
  },
  separator: {
    height: 1,
    width: "90%",
    backgroundColor: "#DEDEDE",
    margin: 20,
  },
  flatListContentContainer: {
    paddingBottom: 100,
  },
});

export default CarrinhosScreen;
