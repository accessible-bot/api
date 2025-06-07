import { WebSocketServer, WebSocket, Data } from 'ws';
import { generateSummary, PublicoKey, sendPrompt } from '../services/chatService';
import prisma from '../prisma';

const MAX_MESSAGES = 50;

interface ClientMessage {
  userId: string;
  publico: PublicoKey;
  pergunta: string;
}

export class ChatController {
  wss: WebSocketServer;

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket) => {
      let currentUserId: string | null = null
      let currentHistoricId: string | null = null

      console.log("Cliente conectado via WebSocket!")
      
      ws.on('message', async (data: Data) => {
        try {
          const rawMsg: ClientMessage = JSON.parse(data.toString());
          currentUserId = rawMsg.userId;

          if (
            !rawMsg.userId ||
            typeof rawMsg.userId !== 'string' ||
            !rawMsg.publico ||
            !rawMsg.pergunta ||
            typeof rawMsg.pergunta !== 'string'
          ) {
            ws.send(JSON.stringify({ error: 'Dados inválidos na mensagem recebida.' }));
            return;
          }

          const userExists = await prisma.user.findUnique({
            where: { id: rawMsg.userId },
          });

          if (!userExists) {
            ws.send(JSON.stringify({ error: 'Usuário não encontrado.' }));
            return;
          }

          let chatHistoric = await prisma.historic.findFirst({
            where: {
              userId: rawMsg.userId,
              terminated: false,
            },
            include: {
              messages: {
                orderBy: { createdAt: 'asc' },
              },
            },
          });

          if (!chatHistoric) {
            chatHistoric = await prisma.historic.create({
              data: {
                userId: rawMsg.userId,
                endedAt: new Date(),
                terminated: false,
              },
              include: {
                messages: true,
              },
            });
          }

          currentHistoricId = chatHistoric.historicId;

          await prisma.message.create({
            data: {
              role: 'user',
              content: rawMsg.pergunta,
              createdAt: new Date(),
              historic: {
                connect: { historicId: chatHistoric.historicId }
              },
            },
          });

          const resposta = await sendPrompt(rawMsg.publico, rawMsg.pergunta);

          await prisma.message.create({
            data: {
              role: 'assistant',
              content: resposta,
              createdAt: new Date(),
              historic: {
                connect: { historicId: chatHistoric.historicId },
              },
            },
          });
    
          await prisma.historic.update({
            where: { historicId: chatHistoric.historicId },
            data: { endedAt: new Date() },
          });

          ws.send(
            JSON.stringify({
              role: 'assistant',
              content: resposta,
            })
          );


        } catch (error) {
            console.error('Erro no WS chat:', error);
            ws.send(JSON.stringify({ error: 'Erro no processamento da mensagem' }));
          }   
      });

      ws.on('close', async () => {
        if (currentHistoricId) {
          console.log(`WebSocket encerrado. Atualizando histórico ${currentHistoricId} como terminado.`)

          await prisma.historic.update( {
            where: { historicId: currentHistoricId},
            data: {
              terminated: true,
              endedAt: new Date()
            }
          })
        }

        const mensagens = await prisma.message.findMany({
          where: { historicId: currentHistoricId!},
          orderBy: {createdAt: 'asc'}
        })

        const primeiraPergunta = mensagens.find(m => m.role == 'user')?.content || '';
        const resumo = await generateSummary(primeiraPergunta);

        await prisma.conversationSummary.create({
          data: {
            summary: resumo,
            historic: {
              connect: { historicId: currentHistoricId! }
            }
          }
        })


      })

    });
  }
}
