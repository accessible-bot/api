import axios from 'axios';

const hfToken = process.env.HUGGINGFACE_API_TOKEN;

function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\n\r\t]/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

export async function getSimilarityScores(sourceSentence: string, sentences: string[]): Promise<number[]> {
  const cleanSource = cleanText(sourceSentence);
  const cleanSentences = sentences.map(cleanText);

  try {
    const response = await axios.post(
      "https://router.huggingface.co/embed",
      {
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: [cleanSource, ...cleanSentences],
      },
      {
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const embeddings: number[][] = response.data.embeddings;

    if (!embeddings || embeddings.length < 2) {
      throw new Error("Embeddings inválidos");
    }

    const sourceEmbedding = embeddings[0];
    const otherEmbeddings = embeddings.slice(1);

    return otherEmbeddings.map((embed: number[]) =>
      cosineSimilarity(sourceEmbedding, embed)
    );

  } catch (error) {
    console.error("Erro no HF embeddings, usando fallback:", error);

    return sentences.map(() => 0);
  }
}
