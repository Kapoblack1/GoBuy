// OrdersScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import Header from '../../components/Header';
import { BASE_URL } from '../../../config';
import { useNavigation } from "@react-navigation/native";

const OrdersScreen = ({ route }) => {
  const { cart } = route.params;
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const navigation = useNavigation();


useEffect(() => {
  const fetchBuyersInfo = async () => {
    console.log("Cart data received:", cart);

    if (cart && cart.buyerCartProgress) {
      const buyersWithInfo = await Promise.all(
        cart.buyerCartProgress.map(async (item, index) => {
          console.log(`\n📦 Comprador ${index + 1}`);
          console.log("ID:", item._id || index.toString());
          console.log("Buyer ID:", item.buyer || "Sem buyer ID");

          let buyerInfo = null;
          let buyerOrders = [];

          try {
            // 1️⃣ Buscar dados completos do comprador
            const res = await fetch(`${BASE_URL}/api/auth/${item.buyer}`);
            buyerInfo = await res.json();

            // 2️⃣ Buscar TODAS as ordens desse comprador nesse carrinho
            const ordersRes = await fetch(
              `${BASE_URL}/api/orders/cart/${cart._id}/buyer/${item.buyer}`
            );

            console.log("Orders status:", ordersRes.status);
            console.log("Orders content-type:", ordersRes.headers.get("content-type"));

            const rawResponse = await ordersRes.text(); // lê apenas uma vez
            console.log("Orders raw response:", rawResponse);

            try {
              buyerOrders = JSON.parse(rawResponse); // tenta converter para JSON
            } catch (parseErr) {
              console.error("❌ Erro ao converter ordens para JSON:", parseErr);
              buyerOrders = [];
            }
          } catch (err) {
            console.error("❌ Erro ao buscar comprador ou ordens:", err);
          }

          return {
            id: item._id || index.toString(),
            name: buyerInfo?.name || "Nome não disponível",
            cartStatus: cart.cartName || "Carrinho sem nome",
            orderStatus: item.status || "Sem status",
            price: item.price ? `${item.price} AOA` : "Pendente",
            avatar: buyerInfo?.avatar
              ? { uri: buyerInfo.avatar }
              : require("../../../assets/imagens/james.png"),
            orders: buyerOrders,
            buyerId: item.buyer || "ID não disponível",
            cartId: cart._id || "ID do carrinho não disponível",
          };
        })
      );
      setBuyers(buyersWithInfo);
    }
  };

  fetchBuyersInfo();
}, [cart]);




  

  return (
    <View style={styles.container}>
      <Header page={'Pedidos'} />
      <FlatList
  data={buyers}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <TouchableOpacity
      style={styles.orderItem}
      onPress={() =>
        alert("Order pressed:"+ item.orders) ||
        navigation.navigate("DetailOrder", {
          cart,
          buyer: item,
        })
      }
    >
      <Image source={item.avatar} style={styles.avatar} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.detail}>Carrinho: {item.cartStatus}</Text>
        <Text style={styles.detail}>Comprador ID: {item.buyerId}</Text>
        <Text style={styles.detail}>Estado: {item.orderStatus}</Text>
        <Text style={styles.detail}>Preço: {cart.totalPrice} Kz</Text>
      </View>
    </TouchableOpacity>
  )}
/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  orderItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  textContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins_600SemiBold',
  },
  detail: {
    fontSize: 14,
    color: 'grey',
    fontFamily: 'Poppins_400Regular',
  },
});

export default OrdersScreen;
