import axios, { AxiosRequestConfig } from 'axios';

interface StructuredResponse {
  type: 'success' | 'fallback';
  message: string;
  options?: Array<{ text: string; action: string }>;
}

const sessions: Record<string, { lastMessageTimestamp?: number; someContext?: any }> = {};

const ruleBasedResponses = {
  greeting: ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite'],
  help: ['ajuda', 'socorro', 'informação'],
  goodbye: ['tchau', 'até logo', 'até mais'],
};

async function callExternalAIService(
  message: string,
  sessionId: string
): Promise<{ text?: string; confidence?: number; error?: string; aiSpecificData?: any }> {
  const AI_SERVICE_URL = process.env.AI_SERVICE_URL;
  const AI_API_KEY = process.env.AI_API_KEY;
  const AI_REQUEST_TIMEOUT_MS = 10000;

  if (!AI_SERVICE_URL || !AI_API_KEY) {
    return { error: "AI service configuration missing on server." };
  }

  try {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: AI_SERVICE_URL,
      data: {
        userInput: message,
        sessionId: sessionId,
      },
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: AI_REQUEST_TIMEOUT_MS,
    };

    const response = await axios(config);

    if (response.data && response.data.reply) {
      return {
        text: response.data.reply,
        confidence: response.data.confidenceScore || 1.0,
      };
    } else {
      return { error: "Unexpected AI response format." };
    }

  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return { error: 'AI service timeout' };
      }
      if (error.response) {
        return { error: `AI service error: ${error.response.status}` };
      } else if (error.request) {
        return { error: 'AI service no response' };
      }
    }
    return { error: 'Unknown AI service communication error' };
  }
}

export async function processUserMessage(
  message: string,
  sessionId: string
): Promise<StructuredResponse> {
  if (!sessionId) {
    return {
      type: 'fallback',
      message: 'Sessão inválida. Por favor, forneça um ID de sessão.',
    };
  }

  const msgLowerCase = message.toLowerCase();

  if (ruleBasedResponses.greeting.some(word => msgLowerCase.includes(word))) {
    return { type: 'success', message: 'Olá! 👋 Como o AutBot pode te ajudar hoje?' };
  }
  if (ruleBasedResponses.goodbye.some(word => msgLowerCase.includes(word))) {
    return { type: 'success', message: 'Tchau! 👋 Até a próxima interação!' };
  }

  if (!sessions[sessionId]) {
    sessions[sessionId] = { lastMessageTimestamp: Date.now() };
  }
  sessions[sessionId].lastMessageTimestamp = Date.now();

  const aiResult = await callExternalAIService(message, sessionId);

  const MINIMUM_CONFIDENCE_THRESHOLD = parseFloat(process.env.API_MINIMUM_CONFIDENCE || "0.6");

  if (aiResult.error) {
    let userFriendlyMessage = 'Desculpe, estou com dificuldades técnicas para processar sua solicitação agora.';
    if (aiResult.error === 'AI service timeout') {
      userFriendlyMessage = 'Hmm, estou demorando um pouco mais que o normal para pensar... Poderia tentar enviar sua mensagem novamente?';
    } else if (aiResult.error.includes('missing on server')) {
        userFriendlyMessage = 'Parece que há um problema na minha configuração interna. A equipe já foi notificada!';
    }
    return {
      type: 'fallback',
      message: userFriendlyMessage,
      options: [
        { text: 'Tentar de novo', action: 'RETRY_LAST_MESSAGE' },
        { text: 'Preciso de ajuda', action: 'SHOW_GENERAL_HELP' }
      ]
    };
  }

  if (aiResult.text && (aiResult.confidence === undefined || aiResult.confidence >= MINIMUM_CONFIDENCE_THRESHOLD)) {
    return { type: 'success', message: aiResult.text };
  } else {
    let fallbackMessage = 'Desculpe, não tenho certeza se entendi completamente. Poderia reformular sua pergunta?';
    if (aiResult.text) {
      fallbackMessage = `Hum, não tenho 100% de certeza, mas você quis dizer algo relacionado a: "${aiResult.text.substring(0, 70)}..."? Tente ser um pouco mais específico.`;
    }
    return {
      type: 'fallback',
      message: fallbackMessage,
      options: [
        { text: 'Reformular minha pergunta', action: 'RETRY_INPUT_WITH_NEW_PROMPT' },
        { text: 'Ver opções de ajuda', action: 'SHOW_HELP_CATEGORIES' }
      ]
    };
  }
}
