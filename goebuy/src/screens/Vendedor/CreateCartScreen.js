import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import Header from "../../components/Header";
import { useNavigation } from "@react-navigation/native";

const CreateCartScreen = ({ route }) => {
  const { namePage } = route.params;
  const [openDate, setOpenDate] = useState(new Date());
  const [cartName, setCartName] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [description, setDescription] = useState("");
  const navigation = useNavigation();
  const [closeDate, setCloseDate] = useState(new Date());
  const [showOpenPicker, setShowOpenPicker] = useState(false);
  const [showClosePicker, setShowClosePicker] = useState(false);
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [imageUri, setImageUri] = useState(null);

  const handleSubmit = async () => {
    const formData = new FormData();
    const token = await AsyncStorage.getItem("token");
    console.log("Token:", token);

    if (!cartName || !exchangeRate || !description || images.length === 0) {
      alert("Preencha todos os campos e selecione ao menos uma imagem.");
      return;
    }

    formData.append("platform", namePage);
    formData.append("cartName", cartName);
    formData.append("description", description);
    formData.append("exchangeRate", exchangeRate);
    formData.append("openDate", openDate.toISOString());
    formData.append("closeDate", closeDate.toISOString());

    images.forEach((uri, index) => {
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1] : "jpg";

      formData.append("images", {
        uri,
        name: `image_${index}.${ext}`,
        type: `image/${ext}`,
      });
    });

    try {
      const response = await fetch("http://172.20.10.7:5000/api/carts", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Erro no servidor:", text);
        alert("Erro no servidor: " + text);
        return;
      }

      const data = await response.json();
      console.log("Carrinho criado com sucesso:", data);
      alert("Carrinho criado com sucesso!");
      navigation.navigate("Home1");
    } catch (error) {
      console.error("Erro ao criar carrinho:", error);
    }
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permissão de acesso à galeria negada");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newImage = result.assets[0].uri;
      setImages([newImage]);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={styles.container}>
        <Header page={"Criar carrinho"} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.title}>Nome do carrinho</Text>
            <TextInput
              style={styles.input}
              placeholder={"Carrinho da " + namePage}
              placeholderTextColor="#878787"
              value={cartName}
              onChangeText={setCartName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.title}>Data de Abertura</Text>
            <TouchableOpacity
              onPress={() => setShowOpenPicker(true)}
              style={styles.input}
            >
              <Text style={{ color: "#000" }}>
                {openDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showOpenPicker && (
              <DateTimePicker
                value={openDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  if (Platform.OS === "android") {
                    setShowOpenPicker(false); // fecha no Android
                  }

                  if (selectedDate) {
                    setOpenDate(selectedDate);
                  }

                  // No iOS, só mostra o picker se o usuário quiser alterar de novo.
                  if (Platform.OS === "ios" && event.type === "set") {
                    setShowOpenPicker(false); // fecha manualmente no iOS
                  }
                }}
              />
            )}
          </View>

          {/* Linha separadora */}
          <View style={styles.separator} />

          <View style={styles.inputGroup}>
            <Text style={styles.title}>Data de Fecho</Text>
            <TouchableOpacity
              onPress={() => setShowClosePicker(true)}
              style={styles.input}
            >
              <Text style={{ color: "#000" }}>
                {closeDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showClosePicker && (
              <DateTimePicker
                value={closeDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  if (Platform.OS === "android") {
                    setShowClosePicker(false);
                  }

                  if (selectedDate) {
                    setCloseDate(selectedDate);
                  }

                  if (Platform.OS === "ios" && event.type === "set") {
                    setShowClosePicker(false);
                  }
                }}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.title}>Câmbio</Text>
            <TextInput
              style={styles.input}
              placeholder="897 Kz"
              placeholderTextColor="#878787"
              keyboardType="numeric"
              value={exchangeRate}
              onChangeText={setExchangeRate}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.title}>Imagen do Carrinho </Text>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.imageButtonText}>Escolher Imagem</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 10 }}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri }}
                    style={styles.selectedImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.title}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Carrinho de natal..."
              placeholderTextColor="gray"
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Abrir Carrinho</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingTop: "8%",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    borderRadius: 7,
    fontSize: 16,
    padding: 10,
    fontFamily: "Poppins_400Regular",
    color: "#000",
  },
  descriptionInput: {
    height: 130,
    textAlignVertical: "top",
    borderColor: "#704F38",
    fontFamily: "Poppins_400Regular",
    color: "#000",
  },
  button: {
    backgroundColor: "#704F38",
    marginHorizontal: 20,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 60,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Poppins_400Regular",
  },
  title: {
    padding: 10,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
  back: {
    marginBottom: 20,
  },
  imageButton: {
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  imageButtonText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
  selectedImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#dcdcdc",
    marginVertical: 10,
  },
});

export default CreateCartScreen;
