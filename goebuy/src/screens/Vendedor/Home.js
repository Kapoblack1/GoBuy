import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Platform,
  Alert,
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import io from 'socket.io-client';
import {
  House,
  ShoppingCartSimple,
  ShoppingBagOpen,
  Bell,
  User,
  Star,
  TrendUp,
  Package,
  Chat,
} from "phosphor-react-native";
import shein from "../../../assets/imagens/shein.jpg";
import zara from "../../../assets/imagens/zara.jpg";
import ali from "../../../assets/imagens/ali.png";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../../config";

const Home = () => {
  console.log('[DEBUG][VENDEDOR] Home montado!');
  const navigation = useNavigation();

  // Estados para dashboard
  const [vendorStats, setVendorStats] = useState({
    activeCarrinhos: 0,
    monthlyOrders: 0,
    rating: 0,
    totalEarnings: 0
  });
  const [vendorName, setVendorName] = useState("Vendedor");
  const [notifications, setNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0); // Contador de mensagens não lidas
  const [recentCarts, setRecentCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loadingCartId, setLoadingCartId] = useState(null); // Para mostrar loading no carrinho específico
  const [isAccountActive, setIsAccountActive] = useState(true); // Estado para verificar se a conta está ativa
  const socketRef = useRef(null);

  // Função para buscar apenas notificações não lidas
  const fetchUnreadNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log('[VENDOR-HOME-NOTIFICATIONS] Token não encontrado');
        return;
      }

      const response = await fetch(`${BASE_URL}/api/notifications`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const notificationsData = await response.json();
        console.log('[VENDOR-HOME-NOTIFICATIONS] Notificações carregadas:', notificationsData.length);
        
        // Contar notificações não lidas (excluindo mensagens)
        const unreadCount = notificationsData.filter(notif => 
          !notif.read && !notif.isRead && notif.type !== 'message'
        ).length;
        console.log('[VENDOR-HOME-NOTIFICATIONS] Notificações não lidas (sem mensagens):', unreadCount);
        
        setNotifications(unreadCount);
      } else {
        console.log('[VENDOR-HOME-NOTIFICATIONS] Erro ao buscar notificações:', response.status);
      }
    } catch (error) {
      console.error('[VENDOR-HOME-NOTIFICATIONS] Erro ao buscar notificações:', error);
    }
  };

  // Função para buscar mensagens não lidas
  const fetchUnreadMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userIdStorage = await AsyncStorage.getItem('userId');
      
      if (!token || !userIdStorage) {
        console.log('[VENDOR-HOME-MESSAGES] Token ou userId não encontrado');
        return;
      }

      // Buscar conversas do usuário
      const conversationsResponse = await fetch(`${BASE_URL}/api/chat/conversations/${userIdStorage}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (conversationsResponse.ok) {
        const conversations = await conversationsResponse.json();
        console.log('[VENDOR-HOME-MESSAGES] Conversas encontradas:', conversations.length);
        
        // Para cada conversa, verificar mensagens não lidas
        let totalUnread = 0;
        for (const conversation of conversations) {
          const messagesResponse = await fetch(`${BASE_URL}/api/messages/unread/${conversation._id}/${userIdStorage}`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (messagesResponse.ok) {
            const unreadCount = await messagesResponse.json();
            totalUnread += unreadCount.count || 0;
          }
        }
        
        console.log('[VENDOR-HOME-MESSAGES] Total de mensagens não lidas:', totalUnread);
        setUnreadMessages(totalUnread);
      } else {
        console.log('[VENDOR-HOME-MESSAGES] Erro ao buscar conversas:', conversationsResponse.status);
      }
    } catch (error) {
      console.error('[VENDOR-HOME-MESSAGES] Erro ao buscar mensagens não lidas:', error);
    }
  };

  // Hook para atualizar notificações sempre que a tela entrar em foco
  useFocusEffect(
    React.useCallback(() => {
      console.log('[VENDOR-HOME-FOCUS] Tela Vendedor Home entrou em foco - atualizando dados...');
      
      // Atualizar dados completos da Home do Vendedor sempre que entrar na tela
      const updateVendorHomeData = async () => {
        try {
          // Executar todas as funções em paralelo para maior eficiência
          await Promise.all([
            fetchVendorData(true), // true = é focus update
            fetchUnreadNotifications(), // Buscar notificações não lidas
            fetchUnreadMessages() // Buscar mensagens não lidas
          ]);
          
          console.log('[VENDOR-HOME-FOCUS] Dados do vendedor atualizados com sucesso');
          
          // Após 500ms, fazer uma segunda verificação para garantir precisão
          setTimeout(async () => {
            console.log('[VENDOR-HOME-FOCUS] Segunda verificação de mensagens não lidas...');
            await fetchUnreadMessages();
          }, 500);
          
        } catch (error) {
          console.error('[VENDOR-HOME-FOCUS] Erro ao atualizar dados do vendedor:', error);
        }
      };
      
      updateVendorHomeData();
    }, [])
  );

  // Função para formatar números com pontos
  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Função para simular registro de tokens (apenas para desenvolvimento)
  const simulateTokenRegistration = async () => {
    try {
      console.log('[SIMULATE-TOKENS] Simulando registro de tokens...');
      
      Alert.alert(
        "Simular Registro de Tokens",
        "APENAS PARA DESENVOLVIMENTO:\n\nDeseja simular o registro de tokens para todos os seus compradores? Isso permite testar notificações sem esperar que eles abram o app.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Simular",
            onPress: async () => {
              try {
                const token = await AsyncStorage.getItem('token');
                
                if (!token) {
                  Alert.alert('Erro', 'Token de autenticação não encontrado');
                  return;
                }

                console.log('[SIMULATE-TOKENS] Enviando solicitação via API...');
                
                const response = await fetch(`${BASE_URL}/api/notifications/simulate-token-registration`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });

                console.log('[SIMULATE-TOKENS] Status da resposta:', response.status);

                if (response.ok) {
                  const result = await response.json();
                  console.log('[SIMULATE-TOKENS] Resposta da API:', result);
                  
                  Alert.alert(
                    'Tokens Simulados!',
                    `${result.totalRegistered} tokens simulados registrados para ${result.totalBuyers} compradores.\n\n🎮 Agora você pode testar notificações push normalmente!\n\n⚠️ Nota: Tokens simulados funcionam apenas para desenvolvimento.`,
                    [{ text: 'OK' }]
                  );
                } else {
                  const errorData = await response.text();
                  console.log('[SIMULATE-TOKENS] Erro na API:', errorData);
                  Alert.alert('Erro', 'Falha ao simular registro de tokens');
                }
              } catch (error) {
                console.log('[SIMULATE-TOKENS] Erro na requisição:', error);
                Alert.alert('Erro', 'Falha na conexão com o servidor');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.log('[SIMULATE-TOKENS] Erro geral:', error);
      Alert.alert('Erro', 'Falha ao simular registro de tokens');
    }
  };

  // Função para solicitar que compradores atualizem tokens
  const requestTokenRefresh = async () => {
    try {
      console.log('[TOKEN-REFRESH] Solicitando atualização de tokens...');
      
      Alert.alert(
        "Atualizar Notificações",
        "Deseja solicitar que seus compradores atualizem suas notificações? Eles receberão uma mensagem pedindo para reabrir o app.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Solicitar",
            onPress: async () => {
              try {
                const token = await AsyncStorage.getItem('token');
                
                if (!token) {
                  Alert.alert('Erro', 'Token de autenticação não encontrado');
                  return;
                }

                console.log('[TOKEN-REFRESH] Enviando solicitação via API...');
                
                const response = await fetch(`${BASE_URL}/api/notifications/request-token-refresh`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });

                console.log('[TOKEN-REFRESH] Status da resposta:', response.status);

                if (response.ok) {
                  const result = await response.json();
                  console.log('[TOKEN-REFRESH] Resposta da API:', result);
                  
                  Alert.alert(
                    'Solicitação Enviada!',
                    `${result.totalNotified} de ${result.totalWithoutTokens} compradores foram notificados para atualizar suas notificações.\n\nEles receberão uma mensagem pedindo para reabrir o app.`,
                    [{ text: 'OK' }]
                  );
                } else {
                  const errorData = await response.text();
                  console.log('[TOKEN-REFRESH] Erro na API:', errorData);
                  Alert.alert('Erro', 'Falha ao enviar solicitações de atualização');
                }
              } catch (error) {
                console.log('[TOKEN-REFRESH] Erro na requisição:', error);
                Alert.alert('Erro', 'Falha na conexão com o servidor');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.log('[TOKEN-REFRESH] Erro geral:', error);
      Alert.alert('Erro', 'Falha ao solicitar atualização de tokens');
    }
  };

  // Função para testar push notifications enviando para todos os compradores
  const testPushNotification = async () => {
    try {
      console.log('[TEST] Iniciando teste de notificação para compradores...');
      
      Alert.alert(
        "Teste de Notificação",
        "Deseja enviar uma notificação de teste para todos os seus compradores?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Enviar",
            onPress: async () => {
              try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                  Alert.alert('Erro', 'Token de autenticação não encontrado');
                  return;
                }

                console.log('[TEST] Enviando notificação via API...');
                console.log('[TEST] URL:', `${BASE_URL}/api/notifications/test-broadcast`);
                console.log('[TEST] Token:', token ? 'Token encontrado' : 'Token não encontrado');
                
                const response = await fetch(`${BASE_URL}/api/notifications/test-broadcast`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                });

                console.log('[TEST] Status da resposta:', response.status);
                console.log('[TEST] Headers da resposta:', response.headers);

                // Verificar se a resposta é JSON válido
                const contentType = response.headers.get('content-type');
                console.log('[TEST] Content-Type:', contentType);

                if (!contentType || !contentType.includes('application/json')) {
                  const textResponse = await response.text();
                  console.log('[TEST] Resposta não é JSON:', textResponse);
                  Alert.alert('Erro', 'Resposta inválida do servidor. Verifique os logs.');
                  return;
                }

                const result = await response.json();
                
                if (response.ok) {
                  console.log('[TEST] Resposta da API:', result);
                  Alert.alert(
                    'Sucesso! 🎉', 
                    `Notificação enviada para ${result.totalSent} de ${result.totalBuyers} compradores.\n\nTodos os seus compradores receberam a mensagem de teste!`,
                    [{ text: 'OK' }]
                  );
                } else {
                  console.log('[TEST] Erro na API:', result);
                  Alert.alert('Erro', result.error || 'Falha ao enviar notificações');
                }
              } catch (error) {
                console.log('[TEST] Erro na requisição:', error);
                console.log('[TEST] Tipo do erro:', error.constructor.name);
                console.log('[TEST] Stack trace:', error.stack);
                Alert.alert('Erro', `Erro de conexão: ${error.message}`);
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.log('[TEST] Erro ao testar notificação:', error);
      Alert.alert('Erro', 'Falha ao testar notificação push');
    }
  };

  // Função para testar notificações locais (pop-up no próprio dispositivo)
  const testLocalNotification = async () => {
    try {
      console.log('[TEST-LOCAL] Testando notificação local...');
      
      Alert.alert(
        "Teste Local",
        "Deseja testar uma notificação pop-up local no seu dispositivo?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Testar",
            onPress: async () => {
              try {
                await PushNotificationService.testPopupNotification();
                console.log('[TEST-LOCAL] Notificação local enviada');
              } catch (error) {
                console.log('[TEST-LOCAL] Erro ao enviar notificação local:', error);
                Alert.alert('Erro', 'Falha ao testar notificação local');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.log('[TEST-LOCAL] Erro ao testar notificação local:', error);
      Alert.alert('Erro', 'Falha ao testar notificação local');
    }
  };

  // Buscar dados do vendedor e estatísticas
  const fetchVendorData = async (isFocusUpdate = false) => {
    try {
      if (!isFocusUpdate) {
        setLoading(true);
      }
      setError(null);
      
      const updateType = isFocusUpdate ? 'FOCUS UPDATE' : 'LOADING';
      console.log(`[VENDOR-HOME ${updateType}] Iniciando busca de dados do vendedor...`);
      
      const token = await AsyncStorage.getItem('token');
      const userIdStorage = await AsyncStorage.getItem('userId');
      
      if (!token || !userIdStorage) {
        console.log(`[VENDOR-HOME ${updateType}] Token ou userId não encontrado`);
        setError('Erro de autenticação');
        return;
      }

      setUserId(userIdStorage);
      console.log(`[VENDOR-HOME ${updateType}] Carregando dados para userId:`, userIdStorage);

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // 1. Buscar dados do usuário
      const userResponse = await fetch(`${BASE_URL}/api/auth/${userIdStorage}`, { headers });
      
      let userRating = 0; // Rating específico do usuário
      let totalEarnings = 0; // Ganhos do banco de dados
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('[VENDOR-HOME] Dados do usuário:', userData);
        setVendorName(userData.name || 'Vendedor');
        userRating = userData.rating || 0; // Capturar rating específico do usuário
        totalEarnings = userData.totalEarnings || 0; // Ganhos do banco
        console.log('[VENDOR-HOME] Rating do usuário:', userRating);
        console.log('[VENDOR-HOME] Ganhos do banco:', totalEarnings);
        
        // ✅ VERIFICAR SE A CONTA ESTÁ ATIVA
        const accountActive = userData.isActive ?? true; // Default true para compatibilidade
        setIsAccountActive(accountActive);
        
        if (!accountActive || !userData.isEmailVerified) {
          console.log('[VENDOR-HOME] ⚠️ Conta não ativa ou email não verificado');
          Alert.alert(
            'Conta não verificada',
            'Por favor, verifique seu email para ativar sua conta e acessar todos os recursos.',
            [
              {
                text: 'Verificar agora',
                onPress: () => {
                  navigation.navigate('EmailVerificationScreen', {
                    email: userData.email,
                    userName: userData.name,
                    userId: userData.id,
                    isSeller: true,
                    fromLogin: true
                  });
                }
              },
              {
                text: 'Depois',
                style: 'cancel'
              }
            ]
          );
        }
      } else {
        console.log('[VENDOR-HOME] Erro ao buscar dados do usuário:', userResponse.status);
      }

      // 2. Buscar carrinhos do vendedor específico
      const cartsResponse = await fetch(`${BASE_URL}/api/carts/seller/${userIdStorage}`, { headers });
      
      if (cartsResponse.ok) {
        const cartsData = await cartsResponse.json();
        console.log('[VENDOR-HOME] Carrinhos do vendedor logado:', cartsData);
        
        // Processar dados dos carrinhos (já filtrados pelo backend)
        const activeCarrinhos = cartsData.filter(cart => cart.isOpen && !cart.isClosed).length;
        
        // Calcular pedidos do mês atual apenas do vendedor logado
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyOrders = cartsData.filter(cart => {
          const cartDate = new Date(cart.openDate);
          return cartDate.getMonth() === currentMonth && cartDate.getFullYear() === currentYear;
        }).length;

        console.log('[VENDOR-HOME] � GANHOS DO BANCO DE DADOS:', {
          totalEarnings: totalEarnings,
          ganhosFormatados: Math.round(totalEarnings),
          ganhosComPontos: Math.round(totalEarnings).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        });

        // Adicionar contagem de itens aos carrinhos recentes do vendedor
        const recentCartsWithStats = cartsData
          .sort((a, b) => new Date(b.openDate) - new Date(a.openDate))
          .slice(0, 5)
          .map(cart => ({
            ...cart,
            itemCount: cart.items?.length || cart.itemCount || 0
          }));

        setVendorStats({
          activeCarrinhos,
          monthlyOrders,
          rating: userRating, // Usar rating específico do usuário
          totalEarnings: Math.round(totalEarnings)
        });

        setRecentCarts(recentCartsWithStats);
        
        console.log('[VENDOR-HOME] Estatísticas do vendedor logado:', {
          userId: userIdStorage,
          activeCarrinhos,
          monthlyOrders,
          rating: userRating,
          totalEarnings: Math.round(totalEarnings),
          totalCartsFound: cartsData.length
        });
      } else {
        console.log('[VENDOR-HOME] Erro ao buscar carrinhos:', cartsResponse.status);
      }

      // 3. Buscar notificações do usuário
      const notificationsResponse = await fetch(`${BASE_URL}/api/notifications`, { headers });
      
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        console.log('[VENDOR-HOME] Notificações do usuário:', notificationsData.length, 'total');
        
        // Contar notificações não lidas (excluindo mensagens)
        const unreadCount = notificationsData.filter(notif => 
          !notif.read && !notif.isRead && notif.type !== 'message'
        ).length;
        console.log('[VENDOR-HOME] Notificações não lidas (sem mensagens):', unreadCount);
        setNotifications(unreadCount);
      } else {
        console.log('[VENDOR-HOME] Erro ao buscar notificações:', notificationsResponse.status);
      }

    } catch (error) {
      console.log('[VENDOR-HOME] Erro geral:', error);
      setError('Erro ao carregar dados. Toque para tentar novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Função para refresh
  const onRefresh = async () => {
    console.log('[VENDEDOR HOME PULL-TO-REFRESH] Usuário puxou para atualizar dashboard');
    setRefreshing(true);
    
    try {
      // Executar todas as funções em paralelo para maior eficiência
      await Promise.all([
        fetchVendorData(),
        fetchUnreadNotifications(),
        fetchUnreadMessages()
      ]);
      
      console.log('[VENDEDOR HOME PULL-TO-REFRESH] Dashboard atualizado com sucesso');
    } catch (error) {
      console.error('[VENDEDOR HOME PULL-TO-REFRESH] Erro durante refresh:', error);
    }
    // O setRefreshing(false) é feito dentro do fetchVendorData
  };

  // Função para retry em caso de erro
  const handleRetry = () => {
    setError(null);
    fetchVendorData();
  };

  useEffect(() => {
    fetchVendorData();
  }, []);

  // useEffect para configurar Socket.io e receber notificações em tempo real
  useEffect(() => {
    const setupSocket = async () => {
      try {
        const userIdStorage = await AsyncStorage.getItem('userId');
        
        if (!userIdStorage) {
          console.log('[VENDOR-HOME-SOCKET] UserId não encontrado');
          return;
        }

        console.log('[VENDOR-HOME-SOCKET] Configurando socket para vendedor userId:', userIdStorage);
        
        // Conectar ao socket
        socketRef.current = io(BASE_URL.replace('/api', ''), {
          transports: ['websocket'],
          query: { userId: userIdStorage },
        });

        socketRef.current.on('connect', () => {
          console.log('[VENDOR-HOME-SOCKET] Conectado! Socket ID:', socketRef.current.id);
        });

        // Entrar na sala do usuário
        socketRef.current.emit('join', userIdStorage);
        console.log('[VENDOR-HOME-SOCKET] Emitindo join para sala/userId:', userIdStorage);

        // Ouvir evento de notificação em tempo real
        socketRef.current.on('notification', (notif) => {
          console.log('[VENDOR-HOME-SOCKET] 🔔 Nova notificação recebida:', notif);
          
          // Ignorar mensagens de chat (não devem incrementar contador de notificações)
          if (notif.type === 'message') {
            console.log('[VENDOR-HOME-SOCKET] Ignorando notificação de mensagem');
            return;
          }
          
          // Atualizar contador de notificações imediatamente
          setNotifications(prev => {
            const newCount = prev + 1;
            console.log('[VENDOR-HOME-SOCKET] Atualizando contador:', prev, '->', newCount);
            return newCount;
          });
        });

        // Ouvir evento de nova mensagem em tempo real
        socketRef.current.on('receiveMessage', (message) => {
          console.log('[VENDOR-HOME-SOCKET] 💬 Nova mensagem recebida:', message);
          
          // Só aumentar contador se a mensagem não for do próprio usuário
          if (message.sender !== userIdStorage) {
            setUnreadMessages(prev => {
              const newCount = prev + 1;
              console.log('[VENDOR-HOME-SOCKET] Atualizando contador de mensagens:', prev, '->', newCount);
              return newCount;
            });
          }
        });

        // Ouvir quando notificações são marcadas como lidas
        socketRef.current.on('notification-read', (data) => {
          console.log('[VENDOR-HOME-SOCKET] 📖 Notificação marcada como lida:', data);
          
          // Atualizar contador diminuindo
          if (data.count !== undefined) {
            // Se o servidor enviar a contagem atualizada
            setNotifications(data.count);
            console.log('[VENDOR-HOME-SOCKET] Contador atualizado pelo servidor:', data.count);
          } else {
            // Fallback: diminuir 1
            setNotifications(prev => {
              const newCount = Math.max(0, prev - 1);
              console.log('[VENDOR-HOME-SOCKET] Diminuindo contador:', prev, '->', newCount);
              return newCount;
            });
          }
        });

        // Ouvir quando mensagens são marcadas como lidas
        socketRef.current.on('message-read', (data) => {
          console.log('[VENDOR-HOME-SOCKET] 📖 Mensagem marcada como lida:', data);
          
          // Buscar novamente as mensagens não lidas (mais preciso)
          fetchUnreadMessages();
        });

        // Ouvir quando todas as mensagens de uma conversa são marcadas como lidas
        socketRef.current.on('messagesMarkedAsRead', (data) => {
          console.log('[VENDOR-HOME-SOCKET] 📖 Conversa marcada como lida:', data);
          
          // Buscar novamente o contador total de mensagens não lidas
          fetchUnreadMessages();
        });

        socketRef.current.on('disconnect', () => {
          console.log('[VENDOR-HOME-SOCKET] Socket desconectado');
        });

        socketRef.current.on('error', (error) => {
          console.log('[VENDOR-HOME-SOCKET] Erro no socket:', error);
        });

      } catch (error) {
        console.error('[VENDOR-HOME-SOCKET] Erro ao configurar socket:', error);
      }
    };

    setupSocket();

    // Cleanup do socket
    return () => {
      if (socketRef.current) {
        console.log('[VENDOR-HOME-SOCKET] Desconectando socket...');
        socketRef.current.disconnect();
      }
    };
  }, []);

  const nextPage = (namePage) => {
    console.log(`Navegando para criar carrinho da ${namePage}`);
    navigation.navigate("CreateCartScreen", { namePage: namePage });
  };

  const navegar = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="#F8F9FA" 
        translucent={false}
      />
      
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        
        {/* Header Moderno com Saudação */}
        <View style={styles.modernHeader}>
          <View style={styles.greetingSection}>
            <Text style={styles.greetingText}>Olá, {vendorName}! 👋</Text>
            <Text style={styles.subGreetingText}>Vamos vender hoje?</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navegar("ChatsScreen")}>
              <Chat size={20} color="#704F38" weight="bold" />
              {unreadMessages > 0 && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>{unreadMessages > 99 ? '99+' : unreadMessages}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navegar("NotificationsScreen")}>
              <Bell size={20} color="#704F38" weight="bold" />
              {notifications > 0 && (
                <View style={styles.actionBadge}>
                  <Text style={styles.actionBadgeText}>{notifications > 99 ? '99+' : notifications}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Mostrar erro se houver */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Dashboard de Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.primaryStat]}>
              <View style={styles.statIconContainer}>
                <ShoppingCartSimple size={24} color="#FFF" weight="bold" />
              </View>
              <Text style={styles.statNumber}>{vendorStats.activeCarrinhos}</Text>
              <Text style={styles.statLabel}>Carrinhos Activos</Text>
            </View>
            
            <View style={[styles.statCard, styles.secondaryStat]}>
              <View style={styles.statIconContainer}>
                <Package size={20} color="#704F38" weight="bold" />
              </View>
              <Text style={styles.statNumberSecondary}>{vendorStats.monthlyOrders}</Text>
              <Text style={styles.statLabelSecondary}>Pedidos do Mês</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.secondaryStat]}>
              <View style={styles.statIconContainer}>
                <Star size={20} color="#FFD700" weight="fill" />
              </View>
              <Text style={styles.statNumberSecondary}>
                {vendorStats.rating > 0 ? vendorStats.rating.toFixed(1) : '--'}
              </Text>
              <Text style={styles.statLabelSecondary}>Avaliação</Text>
            </View>

            <View style={[styles.statCard, styles.secondaryStat]}>
              <View style={styles.statIconContainer}>
                <TrendUp size={20} color="#2E7D32" weight="bold" />
              </View>
              <Text style={styles.statNumberSecondary}>{formatNumber(vendorStats.totalEarnings)} Kz</Text>
              <Text style={styles.statLabelSecondary}>Ganhos</Text>
            </View>
          </View>
        </View>

        {/* Seção de Criação de Carrinhos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Criar Novo Carrinho</Text>
          <Text style={styles.sectionSubtitle}>Escolha a plataforma</Text>
        </View>

        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.options}
          contentContainerStyle={styles.optionsContent}
        >
          <TouchableOpacity onPress={()=>nextPage("Shein")} style={styles.modernOptionContainer}>
            <View style={[styles.modernOption, styles.sheinGradient]}>
              <ImageBackground source={shein} style={styles.modernImage} imageStyle={styles.imageStyle}>
                <View style={styles.modernOverlay}>
                  <Text style={styles.modernOptionTitle}>Shein</Text>
                  <Text style={styles.modernOptionSubtitle}>Moda & Acessórios</Text>
                </View>
              </ImageBackground>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={()=>nextPage("Zara")} style={styles.modernOptionContainer}>
            <View style={[styles.modernOption, styles.zaraGradient]}>
              <ImageBackground source={zara} style={styles.modernImage} imageStyle={styles.imageStyle}>
                <View style={styles.modernOverlay}>
                  <Text style={styles.modernOptionTitle}>Zara</Text>
                  <Text style={styles.modernOptionSubtitle}>Fashion Premium</Text>
                </View>
              </ImageBackground>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={()=>nextPage("AliExpress")} style={styles.modernOptionContainer}>
            <View style={[styles.modernOption, styles.aliGradient]}>
              <ImageBackground source={ali} style={styles.modernImage} imageStyle={styles.imageStyle}>
                <View style={styles.modernOverlay}>
                  <Text style={styles.modernOptionTitle}>AliExpress</Text>
                  <Text style={styles.modernOptionSubtitle}>Variedade Global</Text>
                </View>
              </ImageBackground>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Carrinhos Recentes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Seus Carrinhos Recentes</Text>
          <Text style={styles.sectionSubtitle}>Últimas atividades</Text>
        </View>

        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentCartsContent}
        >
          {loading ? (
            // Loading placeholder
            <View style={styles.recentCartCard}>
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          ) : recentCarts.length > 0 ? (
            recentCarts.map((cart, index) => {
              // Determinar status e cor
              let status = 'Ativo';
              let statusColor = '#2E7D32';
              
              if (cart.isClosed) {
                status = 'Fechado';
                statusColor = '#9E9E9E';
              } else if (!cart.isOpen) {
                status = 'Fechando';
                statusColor = '#FF6B35';
              }

              // Calcular dias desde criação
              const daysSince = Math.floor((Date.now() - new Date(cart.openDate)) / (1000 * 60 * 60 * 24));
              const dateText = daysSince === 0 ? 'Hoje' : 
                              daysSince === 1 ? 'Ontem' : 
                              `${daysSince} dias atrás`;

              return (
                <TouchableOpacity
                  key={cart._id}
                  style={styles.recentCartCard}
                  onPress={async () => {
                    // Evitar múltiplos cliques
                    if (loadingCartId === cart._id) {
                      console.log('[VENDOR-HOME] ⏳ Já carregando dados do carrinho, aguarde...');
                      return;
                    }

                    // Navegar baseado no status do carrinho com dados atualizados
                    console.log('[VENDOR-HOME] 🔄 Navegação do carrinho (buscando dados atualizados):', {
                      cartName: cart.cartName,
                      cartId: cart._id,
                      isOpen: cart.isOpen,
                      isClosed: cart.isClosed,
                      status: cart.isClosed ? 'Fechado' : cart.isOpen ? 'Ativo' : 'Fechando'
                    });
                    
                    try {
                      // Mostrar loading para este carrinho específico
                      setLoadingCartId(cart._id);
                      
                      // Sempre buscar dados atualizados do carrinho antes de navegar
                      const token = await AsyncStorage.getItem('token');
                      
                      if (!token) {
                        console.log('[VENDOR-HOME] ❌ Token não encontrado');
                        return;
                      }

                      console.log('[VENDOR-HOME] 🔄 Buscando dados atualizados do carrinho...');
                      
                      const response = await fetch(`${BASE_URL}/api/carts/${cart._id}`, {
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      });

                      if (response.ok) {
                        const updatedCart = await response.json();
                        console.log('[VENDOR-HOME] ✅ Dados atualizados obtidos:', {
                          cartName: updatedCart.cartName,
                          isOpen: updatedCart.isOpen,
                          isClosed: updatedCart.isClosed,
                          hasProgress: updatedCart.buyerCartProgress ? updatedCart.buyerCartProgress.length : 0,
                          itemCount: updatedCart.items ? updatedCart.items.length : 0,
                          status: updatedCart.isClosed ? 'Fechado' : updatedCart.isOpen ? 'Ativo' : 'Fechando'
                        });
                        
                        // Navegar com dados atualizados
                        if (updatedCart.isClosed) {
                          // Carrinho fechado -> Tela de detalhes (implementar conforme necessário)
                          console.log('[VENDOR-HOME] ➡️ Navegando para carrinho fechado (dados atualizados)');
                          // navigation.navigate("MyCartDetailScreen", { cart: updatedCart });
                          Alert.alert(
                            'Carrinho Fechado',
                            `O carrinho "${updatedCart.cartName}" está fechado.\n\nStatus: ${updatedCart.items?.length || 0} itens processados.`,
                            [{ text: 'OK' }]
                          );
                        } else {
                          // Carrinho ativo -> OrderScreen1 com dados atualizados
                          console.log('[VENDOR-HOME] ➡️ Navegando para OrderScreen1 (dados atualizados)');
                          navigation.navigate("OrderScreen1", { cart: updatedCart });
                        }
                      } else {
                        console.log('[VENDOR-HOME] ❌ Erro ao buscar dados atualizados:', response.status);
                        // Fallback: navegar com dados locais (podem estar desatualizados)
                        console.log('[VENDOR-HOME] ⚠️ Usando dados locais como fallback');
                        
                        if (cart.isClosed) {
                          Alert.alert(
                            'Carrinho Fechado',
                            `O carrinho "${cart.cartName}" está fechado.`,
                            [{ text: 'OK' }]
                          );
                        } else {
                          navigation.navigate("OrderScreen1", { cart });
                        }
                      }
                    } catch (error) {
                      console.log('[VENDOR-HOME] ❌ Erro na requisição:', error);
                      // Fallback: navegar com dados locais
                      console.log('[VENDOR-HOME] ⚠️ Usando dados locais como fallback devido a erro');
                      
                      if (cart.isClosed) {
                        Alert.alert(
                          'Carrinho Fechado',
                          `O carrinho "${cart.cartName}" está fechado.`,
                          [{ text: 'OK' }]
                        );
                      } else {
                        navigation.navigate("OrderScreen1", { cart });
                      }
                    } finally {
                      // Remover loading
                      setLoadingCartId(null);
                    }
                  }}
                >
                  {loadingCartId === cart._id ? (
                    // Mostrar loading para este carrinho específico
                    <View style={[styles.recentCartCard, styles.loadingCard]}>
                      <Text style={styles.loadingText}>Carregando dados atualizados...</Text>
                    </View>
                  ) : (
                    <>
                      <View style={styles.recentCartStatus}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={styles.statusText}>{status}</Text>
                      </View>
                      <Text style={styles.recentCartTitle}>{cart.cartName}</Text>
                      <Text style={styles.recentCartDate}>Criado {dateText}</Text>
                      <View style={styles.recentCartStats}>
                        <Text style={styles.recentCartStat}>{cart.itemCount || 0} pedidos</Text>
                        <Text style={styles.recentCartStat}>{formatNumber(cart.totalPrice || 0)} Kz</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.recentCartCard}>
              <Text style={styles.emptyText}>Nenhum carrinho criado ainda</Text>
              <Text style={styles.emptySubtext}>Comece criando seu primeiro carrinho!</Text>
            </View>
          )}
        </ScrollView>

      </ScrollView>

      {/* Bottom Navigation Modernizada */}
      <View style={styles.modernBottomBar}>
        <TouchableOpacity style={[styles.navButton, styles.activeNavButton]}>
          <House weight="fill" size={28} color="#704F38" />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navegar("VendedorCartsScreen")}>
          <ShoppingCartSimple size={28} color="#9E9E9E" />
          <Text style={styles.navText}>Carrinhos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={() => navegar("MycartsScreen")}>
          <ShoppingBagOpen size={28} color="#9E9E9E" />
          <Text style={styles.navText}>Pedidos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={() => navegar("NotificationsScreen")}>
          <View style={styles.navIconContainer}>
            <Bell size={28} color="#9E9E9E" />
            {notifications > 0 && <View style={styles.navBadge} />}
          </View>
          <Text style={styles.navText}>Alertas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={() => navegar("ProfileScreen")}>
          <User size={28} color="#9E9E9E" />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight - 20 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  
  // Header Moderno
  modernHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 36,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  greetingSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: 24,
    fontFamily: "Poppins_600SemiBold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  subGreetingText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#666666",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionButton: {
    position: "relative",
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  actionBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  actionBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  // Manter notificationButton para compatibilidade (agora usado como actionButton)
  notificationButton: {
    position: "relative",
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Error handling
  errorContainer: {
    backgroundColor: "#FFEBEE",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  errorText: {
    color: '#FF5722',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: "Poppins_400Regular",
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: "Poppins_500Medium",
  },

  // Dashboard de Estatísticas
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryStat: {
    backgroundColor: "#704F38",
    marginRight: 8,
  },
  secondaryStat: {
    backgroundColor: "#FFFFFF",
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: "#FFFFFF",
    textAlign: "center",
  },
  statNumberSecondary: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  statLabelSecondary: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#666666",
    textAlign: "center",
  },

  // Seções
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#666666",
  },

  // Cards de Plataformas Modernos
  options: {
    marginBottom: 32,
  },
  optionsContent: {
    paddingHorizontal: 16,
  },
  modernOptionContainer: {
    marginHorizontal: 4,
  },
  modernOption: {
    width: 200,
    height: 280,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modernImage: {
    flex: 1,
    justifyContent: "flex-end",
  },
  imageStyle: {
    borderRadius: 20,
  },
  modernOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: 20,
    alignItems: "center",
  },
  modernOptionTitle: {
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  modernOptionSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#FFFFFF",
    opacity: 0.9,
  },

  // Carrinhos Recentes
  recentCartsContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  recentCartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    width: 180,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recentCartStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: "#666666",
  },
  recentCartTitle: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  recentCartDate: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#9E9E9E",
    marginBottom: 12,
  },
  recentCartStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  recentCartStat: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#704F38",
  },
  loadingText: {
    color: "#666",
    fontSize: 14,
    textAlign: 'center',
    fontFamily: "Poppins_400Regular",
  },
  emptyText: {
    color: "#333",
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: "Poppins_500Medium",
  },
  emptySubtext: {
    color: "#666",
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    fontFamily: "Poppins_400Regular",
  },

  // Bottom Navigation Moderna
  modernBottomBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeNavButton: {
    backgroundColor: "#F5F1ED",
    borderRadius: 12,
    marginHorizontal: 4,
  },
  navIconContainer: {
    position: "relative",
  },
  navBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    backgroundColor: "#FF3B30",
    borderRadius: 4,
  },
  navText: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "#9E9E9E",
    marginTop: 4,
  },
  activeNavText: {
    color: "#704F38",
    fontFamily: "Poppins_500Medium",
  },
});

export default Home;