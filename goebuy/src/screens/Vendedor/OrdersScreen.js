// OrdersScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { CaretLeft } from 'phosphor-react-native';
import Header from '../../components/Header'
// Dummy data for the list of orders
const ordersData = [
  {
    id: '1',
    name: 'James',
    cartStatus: 'Vem bem',
    orderStatus: 'Pendente',
    price: 'Pendente',
    avatar: require('../../../assets/imagens/james.png'), // Replace with actual path to avatar image
  },
  {
    id: '2',
    name: 'Aloy Motherless',
    cartStatus: 'Vem bem',
    orderStatus: 'Aceite',
    price: '25000 AOA',
    avatar: require('../../../assets/imagens/aloy.png'), // Replace with actual path to avatar image
  },
  {
    id: '3',
    name: 'Aloy Motherless',
    cartStatus: 'Vem bem',
    orderStatus: 'Aceite',
    price: '25000 AOA',
    avatar: require('../../../assets/imagens/joel.png'), // Replace with actual path to avatar image
  },
  {
    id: '4',
    name: 'Aloy Motherless',
    cartStatus: 'Vem bem',
    orderStatus: 'Aceite',
    price: '25000 AOA',
    avatar: require('../../../assets/imagens/kratos.png'), // Replace with actual path to avatar image
  },
  // ... more orders
];

const OrdersScreen = () => {
  return (
    <View style={styles.container}>
      <Header page={'Pedidos'}></Header>
      <FlatList
        data={ordersData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.orderItem}>
            <Image source={item.avatar} style={styles.avatar} />
            <View style={styles.textContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.detail}>Carrinho: {item.cartStatus}</Text>
              <Text style={styles.detail}>Estado: {item.orderStatus}</Text>
              <Text style={styles.detail}>Preço: {item.price}</Text>
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
    marginTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 65,
    textAlign: 'center',
  },
  orderItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
    marginBottom: 10
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 10,
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
  back:{
    marginBottom: 20
  }
});

export default OrdersScreen;
