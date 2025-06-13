// ChatScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { CaretLeft } from 'phosphor-react-native';
import Header from '../../components/Header'

// Dummy data for the list
const chatData = [
  {
    id: '1',
    name: 'Ana Cristovão',
    message: 'Gostaria de comprar a camisa de cobre vermelha a tamanho 6 ...',
    avatar: require('../../../assets/imagens/james.png'), // Replace with actual path to image
  },
  {
    id: '2',
    name: 'Ana Cristovão',
    message: 'Gostaria de comprar a camisa de cobre vermelha a tamanho 6 ...',
    avatar: require('../../../assets/imagens/aloy.png'), // Replace with actual path to image
  },
  {
    id: '3',
    name: 'Ana Cristovão',
    message: 'Gostaria de comprar a camisa de cobre vermelha a tamanho 6 ...',
    avatar: require('../../../assets/imagens/kratos.png'), // Replace with actual path to image
  },
  {
    id: '4',
    name: 'Ana Cristovão',
    message: 'Gostaria de comprar a camisa de cobre vermelha a tamanho 6 ...',
    avatar: require('../../../assets/imagens/joel.png'), // Replace with actual path to image
  },
  // ... more chat entries
];

const ChatScreen = () => {
  return (
    <View style={styles.container}>
      <Header page={'Chat'}></Header>
      <View style={styles.containerList}>
        <FlatList
          data={chatData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chatItem}>
              <Image source={item.avatar} style={styles.avatar} />
              <View style={styles.textContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.message}>{item.message}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    marginTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 65,
    textAlign: "center",
    fontFamily: 'Poppins_400Regular',

  },
  containerList: {
    marginHorizontal: 30
  },
  chatItem: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,

  },
  textContainer: {
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 5,
    fontFamily: 'Poppins_400Regular',

  },
  message: {
    fontSize: 14,
    color: 'grey',
    paddingHorizontal: 20,
    fontFamily: 'Poppins_400Regular',

  },
  back: {
    marginBottom: 20
  }
});

export default ChatScreen;
