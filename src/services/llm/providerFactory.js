import { GeminiProvider } from './providers/geminiProvider.js';
import { GroqProvider } from './providers/groqProvider.js';

export function getLlmProvider(providerName = null) {
  const selectedProvider = (providerName || import.meta.env.VITE_LLM_PROVIDER || 'gemini').toLowerCase();

  if (selectedProvider === 'groq') {
    return new GroqProvider(import.meta.env.VITE_GROQ_API_KEY);
  }

  // Default Primary Provider: Gemini
  return new GeminiProvider(import.meta.env.VITE_GEMINI_API_KEY);
}

/**
 * Controlled LLM Provider Routing with Automatic Fallback:
 * 1. Try Primary Provider (Gemini)
 * 2. If Gemini fails / times out / returns invalid JSON -> Try Fallback Provider (Groq)
 * 3. If Both fail -> STOP PROCESSING safely with zero fallback candidate data
 */
export async function executeLlmWithFallback(taskFunction) {
  const geminiProvider = getLlmProvider('gemini');
  const groqProvider = getLlmProvider('groq');

  // Attempt 1: Gemini Primary
  try {
    const result = await taskFunction(geminiProvider);
    if (result && result.success !== false) {
      return { ...result, providerUsed: 'gemini' };
    }
    console.warn("Gemini Primary returned invalid result. Initiating Groq Fallback...");
  } catch (err) {
    console.warn("Gemini Primary failed. Initiating Groq Fallback...", err);
  }

  // Attempt 2: Groq Fallback
  try {
    const fallbackResult = await taskFunction(groqProvider);
    if (fallbackResult && fallbackResult.success !== false) {
      return { ...fallbackResult, providerUsed: 'groq' };
    }
    console.warn("Groq Fallback returned invalid result.");
  } catch (fallbackErr) {
    console.error("Groq Fallback failed as well.", fallbackErr);
  }

  // Controlled Failure Safety: Stop processing cleanly without fabricating or using candidate fallbacks
  throw new Error("AI processing is temporarily unavailable. Your original CV has not been modified. Please try again later.");
}
