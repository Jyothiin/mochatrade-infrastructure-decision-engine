import { GoogleGenAI } from '@google/genai';

const SAFETY_INSTRUCTION = 'Explain only the provided decision model. Do not invent company facts, market data, regulations, partnerships, financial information, or assumptions.';

function getApiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_AI_API_KEY || '';
}

export function isAIExplanationConfigured() {
  return Boolean(getApiKey());
}

export async function explainDecisionWithAI(modelInput) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { available: false, reason: 'No AI API key is configured. The deterministic decision model remains fully available.' };
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = [
    'You are explaining an existing deterministic infrastructure decision model to an operations and architecture review team.',
    SAFETY_INSTRUCTION,
    'Return exactly these five headings: Decision summary, Why the decision was reached, Main trade-offs, What could change the decision, Questions the team should validate.',
    'Use only the supplied values. Be concise, specific, and distinguish calculated outputs from items that require team validation.',
    `MODEL INPUT:\n${JSON.stringify(modelInput, null, 2)}`,
  ].join('\n\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return { available: true, text: response.text || 'The AI returned no explanation.' };
  } catch (error) {
    return {
      available: false,
      reason: error?.message || 'The optional AI explanation could not be generated.',
    };
  }
}
