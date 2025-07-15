import { PlayerAnswer, Question } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface QuizOption {
  id: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  text: string;
  imageUrl?: string;
  imageFile?: File | null;
  publicId?: string; // Add publicId for Cloudinary
  options: QuizOption[];
  correctOption: string;
  timeLimit: number;
  Marks: number;
}

const GEMINI_API_KEY = "AIzaSyA-HGWK-h5vO2h9GgD9Wsun-guwtKNZnJ4"; // TODO: Replace with your actual Gemini API Key. Use environment variables in production.

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generate an AI explanation for a question
 * @param question The question that needs explanation
 * @param selectedOption The option selected by the player
 * @returns A step-by-step explanation of the question
 */
export const generateExplanation = async (topic: string, numQuestions: number): Promise<QuizQuestion[]> => {
  try {
    const prompt = `Generate ${numQuestions} multiple-choice questions about ${topic}. Each question should have 4 options (A, B, C, D) and indicate the correct answer. The output should be a JSON array of objects, where each object has 'text', 'options' (an array of objects with 'id' and 'text'), and 'correctOption'.`;

    let aiGeneratedQuestions: QuizQuestion[] = [];
    const MAX_RETRIES = 2;
    let retries = 0;
    let success = false;

    while (retries < MAX_RETRIES && !success) {
      try {
        console.log("AI Explanation Prompt:", prompt); // Log the prompt for debugging
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const rawResponse = response.text();
        try {
          // Attempt to extract JSON from the raw response, as the AI might include extra text
          const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);
          let jsonString = rawResponse;
          if (jsonMatch && jsonMatch[1]) {
            jsonString = jsonMatch[1];
          } else {
            // Fallback for cases where the AI doesn't wrap in ```json
            const firstBracket = rawResponse.indexOf('[');
            const lastBracket = rawResponse.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
              jsonString = rawResponse.substring(firstBracket, lastBracket + 1);
            }
          }
          aiGeneratedQuestions = JSON.parse(jsonString);
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError, "Raw response:", rawResponse);
          throw new Error("Invalid JSON response from AI.");
        }
        success = true;
      } catch (error: any) {
        console.error(`Error calling AI service (attempt ${retries + 1}/${MAX_RETRIES}):`, error);
        if (error.response && error.response.status === 429) { // Check for Too Many Requests status
          const delay = Math.pow(2, retries) * 1000; // Exponential backoff
          console.warn(`Rate limit exceeded. Retrying in ${delay / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
        } else {
          let detailedErrorMessage = "Failed to get a detailed explanation from AI. Please try again later.";
          if (error instanceof Error) {
            detailedErrorMessage = `Failed to get a detailed explanation from AI: ${error.message}`;
          } else {
            detailedErrorMessage = `Failed to get a detailed explanation from AI: ${JSON.stringify(error)}`;
          }
          throw new Error(detailedErrorMessage);
          break; // Exit loop for non-429 errors
        }
      }
    }

    if (!success) {
      throw new Error("Failed to generate questions from AI after multiple attempts due to quota limits. Please check your API plan.");
    }

    return aiGeneratedQuestions;
  } catch (error) {
    console.error("Error generating AI explanation:", error);
    throw error;
  }
};