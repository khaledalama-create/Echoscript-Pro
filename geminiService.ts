
import { GoogleGenAI } from "@google/genai";
import { ExtractionMode, ChatMessage } from "./types";

const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. This application requires a valid API key in the environment variables to function.");
  }
  return new GoogleGenAI({ apiKey });
};

const PROMPTS: Record<ExtractionMode, string> = {
  transcript: `Please provide a verbatim transcription of the following audio. Label speakers as "Speaker 1", "Speaker 2", etc. Focus on accuracy and include all spoken content.`,
  
  bant: `# Role
You are a Senior Sales Operations Analyst and Deal Strategist. Your goal is to analyze the provided sales call transcript to equip the Account Executive (AE) with the critical information needed to close the deal.

# Task
Analyze the transcript using the BANT framework. Provide strategic context and quotes.

# Output Format
## 1. BANT Qualification Analysis
### [BUDGET]
### [AUTHORITY]
### [NEED]
### [TIMELINE]
## 2. Closing Strategy
## 3. Lead Summary`,

  followup: `# Role
You are a "Memorable Follow-up" Specialist. Your job is to find the "Social Glue" in a conversation—those tiny details that make a person remember a specific call.

# Task
Analyze the transcript for unique personal details, shared laughs, specific local references, or unique phrasing used by the client. Generate follow-up "hooks" categorized by tone.

# Output Format
## 1. Memorable Hooks
## 2. The "Recall" Points`,

  chat: `You are an Interactive Intelligence Assistant. I have provided an audio/video recording of a conversation. 
  Your goal is to answer any questions the user has about this recording. 
  Be precise, quote directly when helpful, and maintain a helpful, professional tone. 
  If a question cannot be answered from the recording, state that clearly.`
};

export async function processAudioIntelligence(
  base64Audio: string, 
  mimeType: string, 
  mode: ExtractionMode,
  history: ChatMessage[] = []
): Promise<string> {
  const ai = getAIInstance();
  
  const audioPart = {
    inlineData: {
      data: base64Audio,
      mimeType: mimeType,
    },
  };

  // For initial chat setup or other modes
  if (mode !== 'chat' || history.length === 0) {
    const textPart = { text: PROMPTS[mode] };
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [audioPart, textPart] },
      config: { temperature: mode === 'transcript' ? 0.1 : 0.7 }
    });
    return response.text || "No response generated.";
  }

  // For ongoing chat conversations
  const formattedHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  // Add the audio as context to the first turn of the conversation
  // We insert it into the first user message parts if it exists, or create a new turn
  const contents = [
    {
      role: 'user' as const,
      parts: [audioPart, { text: PROMPTS.chat }]
    },
    ...formattedHistory
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: { temperature: 0.5 }
    });

    return response.text || "I couldn't process that request.";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "Failed to process chat.");
  }
}
