import axios from 'axios';
import dotenv from 'dotenv';
import nlp from 'compromise';

dotenv.config();

const apiKey = process.env.API_KEY;
const modelName = process.env.MODEL_NAME 

const publicos = {
  pessoa_com_tea: 'Responda de forma simples, clara e acolhedora para uma pessoa com Transtorno do Espectro Autista (TEA).',
  pais: 'Responda de forma explicativa e com exemplos para pais que não têm conhecimento técnico.',
  professores: 'Responda de forma técnica e com orientações práticas para professores.',
  crianca: 'Responda de forma muito simples, amigável e fácil de entender para uma criança com TEA.'
} as const;

const TEA_KEYWORDS = new Set([
  'autismo',
  'tea',
  'transtorno',
  'sensorial',
  'neurodivergente',
  'neurodiversidade',
  'espectro',
  'acessibilidade',
  'inclusão'
])

export function isAboutAutism(text: string): boolean {
  const doc = nlp(text.toLowerCase());
  const terms = doc.terms().out('array');

  return terms.some((token: string) => TEA_KEYWORDS.has(token))
}

export type PublicoKey = keyof typeof publicos;

export async function sendPrompt(publicoKey: PublicoKey, pergunta: string): Promise<string> {
  if (!apiKey) {
    throw new Error('API_KEY não está definida nas variáveis de ambiente.');
  }

  const prefixo = publicos[publicoKey];
  const promptCompleto = `${prefixo}\n\n${pergunta}`;

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: modelName,
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente especializado em responder apenas a perguntas sobre acessibilidade e inclusão para pessoas com TEA. Caso suja uma pergunta fora desse contexto de qualquer um dos públicos, responda educadamente que não pode ajudar, e finalize a conversa.'
        },
        {
          role: 'user',
          content: promptCompleto
        }
      ],
      temperature: 0.7
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
}
