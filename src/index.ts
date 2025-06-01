import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; 
import http from 'http'; 
import userRoutes from './routes/userRoutes';
import { ChatController } from './controllers/chatController';
import chatRoutes from './routes/chatRoutes';
import prisma from './prisma';

dotenv.config();

const app = express();

const server = http.createServer(app);

const chatController = new ChatController(server);

prisma.$connect()
  .then(() => console.log('Conectado ao PostgreSQL via Prisma!'))
  .catch(err => console.error('Erro na conexão Prisma → PostgreSQL:', err));

app.use(cors({
  origin: '*',  
  methods: ['GET', 'POST'],    
  allowedHeaders: ['Content-Type', 'Authorization'],  
  credentials: true,  
}));

app.use(express.json());
app.use('/api', userRoutes);
app.use('/api', chatRoutes);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

process.on('SIGINT', async () => {
  console.log("O servidor está sendo encerrado. As conversas estão sendo terminadas.")

  await prisma.historic.updateMany({
    where: { terminated: false},
    data : {
      terminated: true,
      endedAt: new Date()
    }
  })
  
  process.exit(0)
})
