import { Request, Response } from 'express';
import { processUserMessage } from '../services/chatbotService';

export class ChatController {
  public async handleMessage(req: Request, res: Response): Promise<Response> {
    const userInput = req.body.message;

    if (!userInput) {
      return res.status(400).json({ message: "Mensagem do usuário não pode ser vazia." });
    }

    try {
      const aiResponse = await callAIService(userInput); // Chama o serviço de IA

      const MINIMUM_CONFIDENCE = 0.7;
      if (!aiResponse || aiResponse.confidence < MINIMUM_CONFIDENCE || !aiResponse.text) {
        return res.json({
          type: 'fallback',
          message: "Desculpe, não consegui entender. Você poderia tentar explicar de outra forma?",
          options: [/* Mais opções de FallBack, me ajudem, se possível */]
        });
      }

      return res.json({
        type: 'success',
        message: aiResponse.text
      });

    } catch (error) {
      console.error("Erro ao chamar serviço de IA:", error);
      // Fallback para erro na chamada do serviço de IA
      return res.status(500).json({
        type: 'fallback',
        message: "Ocorreu um problema técnico ao processar sua solicitação. Tente novamente mais tarde."
      });
    }
  }
}

export const handleUserMessage = async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Mensagem e sessionId são obrigatórios.' });
    }

    const responseMessage = processUserMessage(message, sessionId);
    
    return res.json({ response: responseMessage });
  } catch (error) {
    console.error('Erro no handleUserMessage:', error);
    return res.status(500).json({ error: 'Erro ao processar a mensagem.' });
  }
};
