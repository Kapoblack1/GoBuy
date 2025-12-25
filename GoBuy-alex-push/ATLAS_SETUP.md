# Conectar o backend ao MongoDB Atlas

Este guia mostra como criar um cluster no MongoDB Atlas e conectar o backend Node/Express (Mongoose) do projeto.

## 1) Criar o cluster
- Acesse https://www.mongodb.com/atlas e crie uma conta.
- Crie um **Project** e um **Cluster** (Free tier é suficiente para iniciar).
- Após o cluster provisionado, clique em **Connect** → **Drivers** e copie a **SRV Connection String**.
  - Exemplo: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gobuy?retryWrites=true&w=majority`

## 2) Configurar acesso
- **Database Access**: adicione um usuário de BD com `username` e `password` (Role: Read/Write).
- **Network Access**: adicione IPs permitidos.
  - Para testes, você pode usar `0.0.0.0/0` (libera todos os IPs). Em produção, restrinja aos IPs do provedor (Render, Railway, etc.).

## 3) Atualizar o backend
- No arquivo de env do backend, ajuste a variável `MONGO_URI` com a string do Atlas.
- Exemplo de `back-end/.env`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gobuy?retryWrites=true&w=majority
PORT=5000
```
- O backend já usa Mongoose com `process.env.MONGO_URI` em [back-end/index.js](back-end/index.js).

## 4) Testar localmente
```powershell
cd "C:\Users\Alexandre Café\Downloads\GoBuy-alex-push\GoBuy-alex-push\back-end"
npm install
node index.js
```
- Esperado: `✅ Conectado ao MongoDB!` e servidor escutando em `PORT`.
- Teste uma rota (troque 5000 se necessário):
```powershell
curl http://localhost:5000/api/orders
```

## 5) Hospedar o backend (opcional, recomendado)
- **Render** ou **Railway**:
  - Suba o serviço com `Start command`: `node index.js`.
  - Defina variáveis de ambiente: `MONGO_URI` (Atlas), `PORT`.
  - Copie o **Service URL** (ex.: `https://seu-backend.onrender.com`).

## 6) Apontar o app para o backend público
- Atualize as URLs no app:
  - [goebuy/api.js](goebuy/api.js): `API_URL` → `https://seu-backend.onrender.com/api`
  - [goebuy/config.js](goebuy/config.js): `BASE_URL` → `https://seu-backend.onrender.com`
- Recomenda-se usar env pública do Expo: `EXPO_PUBLIC_API_URL`.

## 7) Dicas e solução de problemas
- **Auth e CORS**: habilite CORS no backend para o domínio do app.
- **Socket.IO**: garanta que o cliente aponte para o mesmo host e porta.
- **Segurança**: não commitar credenciais; use variáveis de ambiente e usuários de BD com roles mínimos.
- **Desempenho**: ative índices nas coleções (ex.: `users`, `orders`) conforme consultas.

## 8) Próximos passos
- Validar fluxo completo (login, pedidos, notificações) com o backend em nuvem.
- Gerar novo build (APK/AAB) apontando para o URL público.
