import React, { useState } from "react";
import { BASE_URL } from "../../config";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import logo from "../../assets/imagens/logo.png";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    // Implement login logic here
    if (!email || !password) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const data = await response.json();
      if (response.ok && data.user) {
        const token = data.token;
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("userId", data.user._id);
        alert("Login feito com sucesso!"+data.user._id);
        console.log("data.user.isSeller home1");

        if (data.user.isSeller === true) {
          console.log("login home1");
          navigation.navigate("Home1");
        } else {
          console.log("login home");
          navigation.navigate("Home");
        }
      } else {
        alert("Email ou senha inválidos.");
      }
    } catch (error) {
      console.log(error);
      alert("Erro ao fazer login. Tente novamente.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "white" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Login</Text>
          </View>
          <View style={styles.logoContaier}>
            <View>
              <Image style={styles.logo} source={logo}></Image>
            </View>
          </View>

          <View style={styles.inputFieldContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              placeholder="cleusiaast@gmail.com"
              placeholderTextColor="#A9A9A9"
              value={email}
              onChangeText={setEmail}
              style={styles.inputField}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputFieldContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              placeholder="***************"
              placeholderTextColor="#A9A9A9"
              value={password}
              onChangeText={setPassword}
              style={styles.inputField}
              secureTextEntry
            />
            <TouchableOpacity
              onPress={() => console.log("Forgot Password Pressed")}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>
                Esqueceu a password?
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.loginButtonContainer}>
            <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate("RegisterScreen")}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: width * 0.08, // 8% da largura
  },
  headerContainer: {
    marginBottom: height * 0.05,
    marginTop: height * 0.05,
    alignItems: "center",
  },
  headerText: {
    fontSize: width * 0.08, // responsivo
    fontFamily: "Poppins_400Regular",
  },
  inputFieldContainer: {
    marginBottom: height * 0.02,
  },
  inputLabel: {
    fontSize: width * 0.045,
    color: "#000000",
    marginBottom: 10,
    fontFamily: "Poppins_400Regular",
  },
  inputField: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D6D7DA",
    borderRadius: 40,
    padding: 15,
    fontSize: width * 0.04,
    height: height * 0.07,
    fontFamily: "Poppins_400Regular",
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: "#704F38",
    fontSize: width * 0.035,
    fontWeight: "600",
    textDecorationLine: "underline",
    fontFamily: "Poppins_600SemiBold",
  },
  loginButton: {
    backgroundColor: "#704F38",
    borderRadius: 35,
    height: height * 0.08,
    width: width * 0.8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  loginButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: width * 0.045,
    fontFamily: "Poppins_400Regular",
  },
  logo: {
    height: height * 0.25,
    width: width * 0.5,
    resizeMode: "contain",
  },
  logoContaier: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: height * 0.04,
  },
});

export default LoginScreen;
