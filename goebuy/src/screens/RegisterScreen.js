import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Check, PencilSimpleLine } from "phosphor-react-native";
import avatar from "../../assets/imagens/avatar.webp";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roles, setRoles] = useState({ buyer: false, seller: false });
  const [isSeller, setIsSeller] = useState(false);
  // ou true, se for vendedor
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const navigation = useNavigation();

  const handleRegister = async () => {
    // Implement registration logic here
    console.log("Register Pressed", { name, email, password, confirmPassword });
    if (password !== confirmPassword) {
      alert("As passwords não coincidem.");
      return;
    }

    if (roles === null) {
      alert("Selecione um tipo de conta.");
      return;
    }
    if (!agreeToTerms) {
      alert("Você deve concordar com os termos e condições.");
      return;
    }
    if (!name || !email || !password || !phone) {
      alert("Preencha todos os campos!");
      return;
    }
    if (password.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (phone.length < 8) {
      alert("O telefone deve ter pelo menos 8 caracteres.");
      return;
    }
    if (name.length < 3) {
      alert("O nome deve ter pelo menos 3 caracteres.");
      return;
    }
    if (email.length < 5) {
      alert("O email deve ter pelo menos 5 caracteres.");
      return;
    }
    if (roles.seller === true) {
      setIsSeller(true);
    }

    try {
      const response = await fetch(
        "http://192.168.1.60:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            isSeller, // ou true, se for vendedor
            phone, // inclua o telefone se desejar
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Registrado com sucesso!");
        navigation.navigate("Home");
      } else {
        alert(data.error || "Erro ao registrar");
      }
    } catch (error) {
      console.log("Error registering user:", error);
      alert("Erro ao criar conta. Tente novamente mais tarde.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Criar conta</Text>
        </View>
        <View style={styles.center}>
          <View style={styles.profileImageContainer}>
            <Image source={avatar} style={styles.pfp}></Image>
          </View>
          <TouchableOpacity style={styles.editIcon}>
            <PencilSimpleLine size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.title}>Nome</Text>
          <TextInput
            placeholder="Cleusia dos Anjos"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <Text style={styles.title}>Email</Text>
          <TextInput
            placeholder="cleusiaast@gmail.com"
            value={email}
            onChangeText={(text) => setEmail(text.toLowerCase())}
            style={styles.input}
            keyboardType="email-address"
          />
          <Text style={styles.title}>Telefone</Text>
          <TextInput
            placeholder="956314947"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
          />
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              onPress={() => {setRoles({ buyer: true, seller: false })
              setIsSeller(false);} }
              style={styles.checkbox}
            >
              {roles.buyer && (
                <View style={styles.checked}>
                  <Check size={20} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Sou Comprador</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              onPress={() => {
                setRoles({ buyer: false, seller: true });
                setIsSeller(true); // <-- atualiza o estado no momento da seleção
              }}
              style={styles.checkbox}
            >
              {roles.seller && (
                <View style={styles.checked}>
                  <Check size={20} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Sou Vendedor</Text>
          </View>

          <Text style={styles.title}>Password</Text>
          <TextInput
            placeholder="******************"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
          <Text style={styles.title}>Confirmação da Password</Text>
          <TextInput
            placeholder="******************"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry
          />
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              style={styles.checkbox}
            >
              {agreeToTerms && (
                <View style={styles.checked}>
                  <Check size={20} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              Concordo com os
              <Text style={styles.linkText}> Termos & Condições </Text>e com a
              <Text style={styles.linkText}> Política de Privacidade.</Text>
            </Text>
          </View>
          <View style={styles.loginButtonContainer}>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: width * 0.01,
    paddingBottom: height * 0.05,
  },
  header: {
    marginTop: height * 0.06,
    marginBottom: height * 0.03,
    marginHorizontal: width * 0.1,
    alignItems: "center",
  },
  headerText: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    fontFamily: "Poppins_400Regular",
  },
  profileImageContainer: {
    alignItems: "center",
    marginVertical: height * 0.04,
    backgroundColor: "#E0E0E0",
    height: width * 0.3,
    width: width * 0.3,
    borderRadius: (width * 0.3) / 2,
    position: "relative",
  },
  pfp: {
    height: "100%",
    width: "100%",
    borderRadius: (width * 0.3) / 2,
  },
  editIcon: {
    position: "absolute",
    left: "54%",
    bottom: height * 0.022,
    backgroundColor: "#704F38",
    borderRadius: 32,
    padding: width * 0.02,
    borderWidth: 1.5,
    borderColor: "#FFF",
  },
  inputContainer: {
    paddingHorizontal: width * 0.08,
    paddingBottom: height * 0.03,
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D6D7DA",
    borderRadius: 40,
    padding: width * 0.034,
    marginBottom: height * 0.025,
    fontSize: width * 0.04,
    fontFamily: "Poppins_400Regular",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  checkbox: {
    height: width * 0.07,
    width: width * 0.07,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D6D7DA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: width * 0.02,
  },
  checked: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    backgroundColor: "#704F38",
  },
  checkboxLabel: {
    flex: 1,
    fontSize: width * 0.032,
    color: "#686868",
    fontFamily: "Poppins_400Regular",
  },
  linkText: {
    color: "#704F38",
    textDecorationLine: "underline",
  },
  registerButton: {
    marginTop: height * 0.03,
    backgroundColor: "#704F38",
    borderRadius: 35,
    height: height * 0.08,
    width: width * 0.8,
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonText: {
    color: "#FFF",
    fontSize: width * 0.045,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
  },
  title: {
    fontWeight: "bold",
    marginBottom: height * 0.015,
    fontSize: width * 0.045,
    fontFamily: "Poppins_400Regular",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  center1: {
    justifyContent: "center",
    alignItems: "center",
    left: 2,
  },
  loginButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RegisterScreen;
