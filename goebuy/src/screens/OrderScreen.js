import React, { useState, useRef, useEffect, useCallback,  } from 'react';
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions, FlatList, Image, ActivityIndicator } from 'react-native';
import { BASE_URL } from '../../config';
import { Upload, ArrowRight } from 'phosphor-react-native';
import Header from '../components/Header';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';


const OrderScreen = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('Ativos');
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Recupera o ID do comprador do AsyncStorage
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
      console.log("User ID:", id);
    };
    fetchUserId();
  }, []);

  const isCartFechado = (cart) => {
  const normalizedUserId = String(userId || "").trim();
  const progress = cart.buyerCartProgress?.find(p => {
    const buyerId = p?.buyer && typeof p.buyer === "object"
      ? String(p.buyer._id || "").trim()
      : String(p.buyer || "").trim();
    return buyerId === normalizedUserId;
  });
  return progress?.status === "Fechado";
};


useFocusEffect(
  useCallback(() => {
    const fetchCarts = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        if (!token) return console.warn("Token não encontrado.");

        const response = await fetch(`${BASE_URL}/api/carts/buyer/my-carts`, {
          headers: { Authorization: token },
        });

        const data = await response.json();
        setCarts(data);
        console.log("Carts fetched:", data);
      } catch (error) {
        console.error("Erro ao buscar carrinhos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarts();
  }, [])
);


 // Filtra os carrinhos conforme o estado do cartprogress do usuário
const filteredCarts = carts.filter(cart => {
  const fechado = isCartFechado(cart);
  if (selectedTab === 'Ativos') {
    return !cart.isFinished && !fechado;
  } else {
    return cart.isFinished || fechado;
  }
});

  const renderOrderItem = ({ item }) => {
  const imageUrl = item.imageUrls?.[0]
    ? { uri: `${BASE_URL}/${item.imageUrls[0].replace(/\\/g, '/')}` }
    : require('../../assets/imagens/kratos.png');

  const normalizedUserId = String(userId || "").trim();

  // Verifica se já enviou comprovativo
  const hasProof = item.paymentProofs?.some(proof => {
    const buyerId = proof?.buyer && typeof proof.buyer === "object"
      ? String(proof.buyer._id || "").trim()
      : String(proof.buyer || "").trim();
    return buyerId === normalizedUserId;
  });

  // Pega o status do progresso do comprador
  const myProgress = item.buyerCartProgress?.find(progress => {
    const buyerId = progress?.buyer && typeof progress.buyer === "object"
      ? String(progress.buyer._id || "").trim()
      : String(progress.buyer || "").trim();
    return buyerId === normalizedUserId;
  });

  const isPending = myProgress?.status === "Em Progresso";

  return (
    <View style={styles.orderItem}>
      <View style={styles.orderItemTop}>
        <Image source={imageUrl} style={styles.orderItemImage} />
        <View style={styles.orderItemDetails}>
          <Text style={styles.orderItemTitle}>{item.cartName}</Text>
          <Text style={styles.itemSpace}>Loja: {item.platform}</Text>
          <Text style={styles.itemSpace}>Itens: {item.itemCount}</Text>
          <Text style={styles.itemSpace}>Taxa: {item.exchangeRate} Kz</Text>
          <Text style={styles.itemSpace}>Vendedor: {item.seller?.name}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          if (!hasProof) {
            navigation.navigate("UploadComprovativoScreen", {
              cart : item,
              cartId: item._id,
              seller: item.seller,
              orderId: item.orderId,
              totalPrice: item.totalPrice,
            });
          } else {
            navigation.navigate("MyOrder", { cart: item });
          }
        }}
      >
        {hasProof ? (
          <>
            <Text style={styles.actionTitle}>
              {isPending ? "Pendente" : "Seguir Pedido"}
            </Text>
            <ArrowRight size={20} color="#FFF" />
          </>
        ) : (
          <>
            <Text style={styles.actionTitle}>Enviar Comprovativo</Text>
            <Upload size={20} color="#FFF" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};




  const tabIndicator = useRef(new Animated.Value(0)).current;
  const windowWidth = Dimensions.get('window').width;
  const tabWidth = windowWidth / 2 - 10;

  const handleTabPress = (tabName) => {
    setSelectedTab(tabName);
    Animated.spring(tabIndicator, {
      toValue: tabName === 'Ativos' ? 0 : tabWidth,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <Header page={'Meus Pedidos'} />
      <View style={styles.tabsContainer}>
        <View style={styles.tabUnderline} />
        <TouchableOpacity style={styles.tab} onPress={() => handleTabPress('Ativos')}>
          <Text style={[styles.tabText, selectedTab === 'Ativos' && styles.activeTabText]}>
            Ativos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => handleTabPress('Completos')}>
          <Text style={[styles.tabText, selectedTab === 'Completos' && styles.activeTabText]}>
            Completos
          </Text>
        </TouchableOpacity>
        <Animated.View
          style={[
            styles.tabIndicator,
            { width: tabWidth, transform: [{ translateX: tabIndicator }] },
          ]}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#704F38" />
      ) : (
        <FlatList
          data={filteredCarts}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          style={styles.orderList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: "2.2%",
    paddingTop: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: "15%",
    marginBottom: 20,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative', // Adicionado para a linha cinza
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 16,
    color: 'grey',
    fontFamily: 'Poppins_400Regular',

  },
  activeTabText: {
    color: 'black',
    fontFamily: 'Poppins_600SemiBold',

  },
  tabIndicator: {
    height: 4,
    backgroundColor: '#704F38',
    position: 'absolute',
    bottom: 0,
  },
  tabContent: {
    flex: 1,
  },
  orderList: {
    flex: 1,
  },
  actionButton: {
    alignItems: 'center',
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",

  },
  actionTitle: {
    color: "white",
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    marginRight: 5,
    paddingTop: 5
  },
  orderItem: {
  backgroundColor: '#F9F9F9',
  padding: 16,
  borderRadius: 10,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: '#EAEAEA',
},

orderItemTop: {
  flexDirection: 'row',
  marginBottom: 12,
},

orderItemImage: {
  width: "30%",
  height: "100%",
  marginRight: 12,
  borderRadius: 8,
},

orderItemDetails: {
  flex: 1,
  justifyContent: 'space-around',
},

orderItemTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  fontFamily: 'Poppins_600SemiBold',
},

itemSpace: {
  color: "#878787",
  fontFamily: 'Poppins_400Regular',
  marginBottom: 4,
},

actionButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#704F38",
  paddingVertical: 7,
  borderRadius: 30,
},

actionTitle: {
  color: "white",
  marginRight: 6,
  fontFamily: 'Poppins_400Regular',
  fontSize: 14,
},
});

export default OrderScreen;
