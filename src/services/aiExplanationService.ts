// src/services/aiExplanationService.ts
import { Question, PlayerAnswer } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

/* ------------------------------------------------------------------ */
/* Type Definitions */
export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  imageUrl?: string;
  imageFile?: File | null;
  publicId?: string;
  options: QuizOption[];
  correctOption: string;
  timeLimit: number;
  Marks: number;
  explanation?: string;
}
/* ------------------------------------------------------------------ */

/* ---------- Multiple API keys for automatic fail‑over ------------ */
const GEMINI_API_KEYS = [
  'AIzaSyDT1-vJgJ55at6ePceAWNOUVchmmozVTms',
  'AIzaSyA-HGWK-h5vO2h9GgD9Wsun-guwtKNZnJ4',
  'AIzaSyCffAGwlO4tWbfxuRGn5MMdwPNnQLhiGzcY'
];

let currentApiKeyIndex = 0;
const getGenAI = () => new GoogleGenerativeAI(GEMINI_API_KEYS[currentApiKeyIndex]);
const switchApiKey = () => { currentApiKeyIndex = (currentApiKeyIndex + 1) % GEMINI_API_KEYS.length; };
const resetApiKeyIndex  = () => { currentApiKeyIndex = 0; };

/* ───────────────────────── Generate MCQs ────────────────────────── */
export const generateExplanation = async (
questionText: string): Promise<string> => {
  const prompt = `Generate a detailed explanation for the following question:

"${questionText}"

Return ONLY the explanation text, without any additional formatting or conversational elements.`
  const MAX_API_KEY_RETRIES = GEMINI_API_KEYS.length;

  for (let apiRetry = 0; apiRetry < MAX_API_KEY_RETRIES; apiRetry++) {
    try {
      const model   = getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result  = await model.generateContent(prompt);
      const explanationText = result.response.text();

      resetApiKeyIndex();
      return explanationText;                                    // ✅ success
    } catch (err: any) {
      if (err.response?.status === 429) {
        switchApiKey();
        console.warn(
          `Explanation generation quota exceeded. Switched key. Retries left: ${MAX_API_KEY_RETRIES - 1 - apiRetry}`
        );
      } else {
        resetApiKeyIndex();
        throw new Error(
          'Failed to generate explanation from AI. ' +
          (err instanceof Error ? err.message : JSON.stringify(err))
        );
      }
    }
  }

  resetApiKeyIndex();
  throw new Error('All API keys exhausted for explanation generation. Please try again later.');
};

/* ───────────────────── Player Accuracy Helper ───────────────────── */
export const calculateCorrectAnswerRate = (answers: PlayerAnswer[]): number => {
  if (!answers?.length) return 100;
  const correct = answers.filter(a => a.correct).length;
  return (correct / answers.length) * 100;
};

/* ─────────────────────── AI Explanation Block ───────────────────── */
export const generateAIExplanation = async (
  question: Question,
  selectedOption: string
): Promise<string> => {
  const correctOpt = question.options.find(o => o.id === question.correctOption);
  const chosenOpt  = question.options.find(o => o.id === selectedOption);

  if (!correctOpt) {
    return "Sorry, I couldn't generate an explanation for this question.";
  }

  const prompt = `Given the following quiz question and options, provide a concise and accurate explanation.

Question: ${question.text}
Correct Answer: ${correctOpt.text} (${correctOpt.id.toUpperCase()})
Selected Answer: ${chosenOpt?.text || selectedOption} (${selectedOption.toUpperCase()})

Provide a single, unified, and concise explanation. This explanation should:
1. Briefly state the core concept or principle related to the correct answer (1‑2 sentences).
2. Explain why the selected answer is wrong (if applicable).
3. Explain why the correct answer is right.
Do not add any introduction or conclusion.`;

  const MAX_API_KEY_RETRIES = GEMINI_API_KEYS.length;
  let explanation = '';

  for (let apiRetry = 0; apiRetry < MAX_API_KEY_RETRIES; apiRetry++) {
    try {
      const model  = getGenAI().getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      explanation  = result.response.text();
      resetApiKeyIndex();
      break;                                            // ✅ success
    } catch (err: any) {
      if (err.response?.status === 429) {
        switchApiKey();
        console.warn(
          `Explain quota exceeded. Switched key. Retries left: ${MAX_API_KEY_RETRIES - 1 - apiRetry}`
        );
      } else {
        resetApiKeyIndex();
        explanation =
          'Failed to get a detailed explanation from AI: ' +
          (err instanceof Error ? err.message : JSON.stringify(err));
        break;
      }
    }
  }

  if (!explanation) {
    explanation =
      'Failed to get a detailed explanation from AI. All API keys have exceeded their quota. Please try again tomorrow.';
  }

  return `
<div class="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg mt-4 border border-blue-200 dark:border-blue-800">
  <h3 class="text-lg font-bold mb-2 text-blue-700 dark:text-blue-300">AI Explanation</h3>
  <p class="mb-3">Let me explain this question step by step:</p>
  <div class="space-y-2">
    <p><strong>Question:</strong> ${question.text}</p>
    <p><strong>Your answer:</strong> ${chosenOpt?.text || selectedOption}
       ${selectedOption !== question.correctOption ? '(incorrect)' : '(correct)'}</p>
    <p><strong>Correct answer:</strong> ${correctOpt.text}</p>
    <p class="mt-2"><strong>Explanation:</strong></p>
    <p>${explanation.replace(/\n/g, '<br/>')}</p>
  </div>
  <p class="text-xs text-blue-500 dark:text-blue-400 mt-4">
     This explanation was generated by AI to help you understand the concept better.
  </p>
</div>`;
};
