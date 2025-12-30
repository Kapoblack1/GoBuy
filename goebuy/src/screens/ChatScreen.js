import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { CaretLeft, PaperPlaneRight } from "phosphor-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";
import { BASE_URL } from "../../config";
import james from "../../assets/imagens/avatar.webp";

export default function ChatScreen({ route, navigation }) {
  const { conversationId, sellerId, buyerId, buyerName } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  // Recupera id do user logado
  useEffect(() => {
    const fetchUser = async () => {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
    };
    console.log("User ID:", userId);
    fetchUser();
  }, []);

  useEffect(() => {
    if (socketRef.current && conversationId && userId) {
      console.log("📡 Entrando na conversa:", conversationId);
      socketRef.current.emit("joinConversation", conversationId);
      
      // Marcar mensagens como lidas quando entrar na conversa
      console.log("📖 Marcando mensagens como lidas...");
      socketRef.current.emit("markMessagesAsRead", { 
        conversationId, 
        userId 
      });

      // Também chamar a API para marcar como lidas
      markMessagesAsRead();
    }
  }, [conversationId, userId, socketRef.current]);

  // Função para marcar mensagens como lidas via API
  const markMessagesAsRead = async () => {
    try {
      if (!conversationId || !userId) {
        console.log('📖 [CHAT-API] Dados insuficientes:', { conversationId, userId });
        return;
      }

      console.log('📖 [CHAT-API] Iniciando marcação via API...');

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log('📖 [CHAT-API] Token não encontrado');
        return;
      }

      console.log('📖 [CHAT-API] Fazendo requisição para:', `${BASE_URL}/api/messages/mark-read/${conversationId}/${userId}`);

      const response = await fetch(`${BASE_URL}/api/messages/mark-read/${conversationId}/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📖 [CHAT-API] Status da resposta:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('📖 [CHAT-API] Sucesso - mensagens marcadas:', result);
      } else {
        console.log('📖 [CHAT-API] Erro HTTP:', response.status);
        const errorText = await response.text();
        console.log('📖 [CHAT-API] Texto do erro:', errorText);
      }
    } catch (error) {
      console.error('📖 [CHAT-API] Erro na requisição:', error);
    }
  };

  // Conectar socket
  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(BASE_URL.replace("/api", ""), {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Conectado ao socket:", socketRef.current.id);
      if (conversationId) {
        console.log("📡 Entrando na sala:", conversationId);
        socketRef.current.emit("joinConversation", conversationId);
      }
    });

    socketRef.current.on("receiveMessage", (message) => {
      console.log("📩 Mensagem recebida:", message);

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) return prev; // evita duplicação
        
        const newMessage = {
          _id: message._id,
          text: message.text || "",
          createdAt: new Date(message.createdAt),
          isFromCurrentUser: message.sender === userId,
          sender: message.sender,
          senderName: message.senderName || "Usuário"
        };
        
        return [...prev, newMessage].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      });
    });

    // Escutar quando mensagens são marcadas como lidas
    socketRef.current.on('messagesMarkedAsRead', (data) => {
      console.log('📖 [CHAT-SCREEN] Mensagens marcadas como lidas:', data);
    });

    socketRef.current.on('message-read', (data) => {
      console.log('📖 [CHAT-SCREEN] Evento message-read recebido:', data);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [conversationId, userId]);

  // Buscar mensagens iniciais
  useEffect(() => {
    console.log("📨 Buscando mensagens para conversa:", conversationId);
    const fetchMessages = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!conversationId) return;

      const res = await fetch(`${BASE_URL}/api/messages/${conversationId}`, {
        headers: { Authorization: token },
      });
      const data = await res.json();

      const formattedMessages = data.map((msg) => ({
        _id: msg._id,
        text: msg.text || "",
        createdAt: new Date(msg.createdAt),
        isFromCurrentUser: msg.sender === userId,
        sender: msg.sender,
        senderName: msg.senderName || "Usuário"
      })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setMessages(formattedMessages);
    };

    if (userId) {
      fetchMessages();
    }
  }, [conversationId, userId]);

  // Enviar mensagem
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const token = await AsyncStorage.getItem("token");
    const messageText = inputMessage.trim();
    setInputMessage("");

    const res = await fetch(`${BASE_URL}/api/messages`, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId,
        text: messageText,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      const newMessage = {
        _id: data._id,
        text: data.text || "",
        createdAt: new Date(data.createdAt),
        isFromCurrentUser: true,
        sender: data.sender,
        senderName: "Você"
      };

      setMessages(prev => [...prev, newMessage]);

      if (socketRef.current) {
        // Enviar com informações completas para o socket
        socketRef.current.emit("sendMessage", {
          conversationId,
          message: data,
          senderId: userId
        });
      }

      // Scroll para o final
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else {
      console.log("❌ Erro ao enviar:", data);
    }
  };

  // Renderizar cada mensagem
  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.isFromCurrentUser ? styles.myMessage : styles.otherMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isFromCurrentUser ? styles.myBubble : styles.otherBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isFromCurrentUser ? styles.myMessageText : styles.otherMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={[
          styles.messageTime,
          item.isFromCurrentUser ? styles.myMessageTime : styles.otherMessageTime
        ]}>
          {item.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  // Marcar mensagens como lidas quando sair da tela
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      console.log('📖 [CHAT-SCREEN] Saindo da tela - garantindo que mensagens estão marcadas como lidas');
      
      if (socketRef.current && conversationId && userId) {
        // Garantir que as mensagens estão marcadas como lidas ao sair
        socketRef.current.emit("markMessagesAsRead", { 
          conversationId, 
          userId 
        });
        
        // Também chamar a API novamente
        markMessagesAsRead();
      }
    });

    return unsubscribe;
  }, [navigation, conversationId, userId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <CaretLeft size={24} color="white" />
        </TouchableOpacity>
        <Image source={james} style={styles.pfp} resizeMode="cover" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.name}>{buyerName || "Comprador"}</Text>
          <Text style={styles.status}>Online</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderMessage}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            style={styles.messagesList}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputMessage.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputMessage.trim()}
          >
            <PaperPlaneRight size={20} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#704F38" 
  },
  header: {
    backgroundColor: "#704F38",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  pfp: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    marginLeft: 20 
  },
  status: { 
    color: "white", 
    fontSize: 14 
  },
  name: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesList: {
    flex: 1,
    paddingVertical: 16,
  },
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 8,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myBubble: {
    backgroundColor: '#704F38',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#333333',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999999',
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    backgroundColor: '#F9F9F9',
  },
  sendButton: {
    backgroundColor: '#704F38',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
});
