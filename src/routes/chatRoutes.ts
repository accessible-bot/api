import express, { Request, Response } from 'express';
import prisma from '../prisma';

const chatRoutes = express.Router();

chatRoutes.get('/chat/history/:userId', async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
   const historics = await prisma.historic.findMany({
    where: {
      userId: userId
    },
    include : {
      messages: true
    }
   })

   if (historics.length == 0) {
    res.status(404).json( {error: 'Nenhum histórico encontrado para este usuário.'});
    return;
   }

   res.status(200).json(historics);

  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

export default chatRoutes;
