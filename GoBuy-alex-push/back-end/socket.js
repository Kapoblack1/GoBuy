const { Server } = require("socket.io");
const { sendNotification } = require('./services/notificationService');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Novo cliente conectado:", socket.id);

    // Handler para join na sala do userId (notificações)
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`🔔 Socket ${socket.id} entrou na sala do userId ${userId}`);
    });

    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`👥 Socket ${socket.id} entrou na conversa ${conversationId}`);
    });

    // Evento para marcar mensagens como lidas
    socket.on("markMessagesAsRead", async (data) => {
      try {
        const { conversationId, userId } = data;
        console.log(`📖 [SOCKET] Marcando mensagens como lidas - Conversa: ${conversationId}, Usuário: ${userId}`);
        
        // Marcar mensagens como lidas
        const result = await Message.updateMany(
          {
            conversationId,
            sender: { $ne: userId }, // Não marcar próprias mensagens
            read: { $ne: true }
          },
          {
            $set: { read: true }
          }
        );

        console.log(`📖 [SOCKET] ${result.modifiedCount} mensagens marcadas como lidas`);
        
        // Emitir evento para todos na conversa sobre a leitura
        io.to(conversationId).emit('messagesMarkedAsRead', {
          conversationId,
          userId,
          markedCount: result.modifiedCount
        });

        // Emitir para a sala do usuário para atualizar contadores na home
        io.to(userId).emit('message-read', {
          conversationId,
          userId,
          markedCount: result.modifiedCount
        });

        console.log(`📖 [SOCKET] Eventos emitidos para conversa ${conversationId} e usuário ${userId}`);

      } catch (error) {
        console.error('📖 [SOCKET] Erro ao marcar mensagens como lidas:', error);
      }
    });

    socket.on("sendMessage", async (data) => {
      // data deve conter: { conversationId, message, senderId }
      if (data && data.conversationId && data.message) {
        console.log(`💬 [SOCKET] Enviando mensagem na conversa ${data.conversationId}`);
        
        // Emitir mensagem para todos na conversa
        io.to(data.conversationId).emit("receiveMessage", data.message);
        
        // Emitir para os usuários individuais (para atualizar contadores)
        try {
          const conversation = await Conversation.findById(data.conversationId);
          if (conversation) {
            // Emitir para cada membro da conversa
            conversation.members.forEach(memberId => {
              if (memberId.toString() !== data.message.sender) {
                // Emitir apenas para quem não enviou a mensagem
                io.to(memberId.toString()).emit("receiveMessage", data.message);
                console.log(`💬 [SOCKET] Mensagem enviada para usuário ${memberId}`);
              }
            });
          }
        } catch (error) {
          console.error('[SOCKET] Erro ao emitir mensagem para usuários:', error);
        }
        
        // Enviar notificação push para o destinatário
        try {
          const conversation = await Conversation.findById(data.conversationId);
          if (conversation && data.senderId) {
            // Determinar quem é o destinatário (quem não é o remetente)
            const recipientId = conversation.members.find(id => id.toString() !== data.senderId);
            
            if (recipientId) {
              // Mensagens não criam notificações no sistema de notificações
              // Elas são tratadas apenas pelo sistema de mensagens
              console.log(`[CHAT] Nova mensagem enviada para ${recipientId} (sem criar notificação)`);
            }
          }
        } catch (error) {
          console.error('[CHAT-PUSH] Erro ao enviar notificação de mensagem:', error);
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Cliente desconectado:", socket.id);
    });
  });

  return io;
}

module.exports = setupSocket;
