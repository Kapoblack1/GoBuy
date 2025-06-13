// Navigation.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import Home from '../screens/Home';
import Home1 from '../screens/Vendedor/Home';
import DetailsCarrinhoScreen from '../screens/DetailsCarrinho';
import AllCarrinhosScreen from '../screens/AllCarrinhosScreen';
import OrderScreen from '../screens/OrderScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CarrinhosScreen from '../screens/CarrinhosScreen';
import DetailsCarrinhoScreen1 from '../screens/DetailsCarrinhos1';
import Carrinhos from '../screens/Vendedor/Carrinhos';
import ChatScreen from '../screens/Vendedor/ChatsScreen';
import CreateCartScreen from '../screens/Vendedor/CreateCartScreen';
import OrderScreen1 from '../screens/Vendedor/OrdersScreen';
import MyCartsScreen from '../screens/Vendedor/MyCartsScreen';
import MyOrder from '../screens/MyOrder';


const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LoginScreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
       
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="DetailsCarrinhoScreen" component={DetailsCarrinhoScreen} />
        <Stack.Screen name="AllCarrinhosScreen" component={AllCarrinhosScreen} />
        <Stack.Screen name="OrderScreen" component={OrderScreen} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="CarrinhosScreen" component={CarrinhosScreen} />
        <Stack.Screen name="Carrinhos" component={Carrinhos} />
        <Stack.Screen name="DetailsCarrinhos1" component={DetailsCarrinhoScreen1} />
        <Stack.Screen name="Home1" component={Home1} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="MycartsScreen" component={MyCartsScreen} />
        <Stack.Screen name="CreateCartScreen" component={CreateCartScreen} />
        <Stack.Screen name="OrderScreen1" component={OrderScreen1} />
        <Stack.Screen name="MyOrder" component={MyOrder} />
      </Stack.Navigator>
      
      

    </NavigationContainer>
  );
};//DocumentViewerScree