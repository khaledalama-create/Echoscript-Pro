
import { GoogleGenAI } from "@google/genai";
import { ExtractionMode } from "./types";

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
- Status: (Confirmed/Pending/Unclear)
- Analysis: [Text]
- Quote: "[Text]"
### [AUTHORITY]
- Status: (DM/Influencer/Gatekeeper)
- Analysis: [Text]
- Quote: "[Text]"
### [NEED]
- Status: (Critical/Opportunity/Exploratory)
- Analysis: [Text]
- Quote: "[Text]"
### [TIMELINE]
- Status: (Immediate/Medium/Long)
- Analysis: [Text]
- Quote: "[Text]"
## 2. Closing Strategy
- [Advice]
## 3. Lead Summary
- Targeted Area: [Text]
- Company Name: [Name]
- Contact Name: [Name]`,

  followup: `# Role
You are a "Memorable Follow-up" Specialist. Your job is to find the "Social Glue" in a conversation—those tiny details that make a person remember a specific call.

# Task
Analyze the transcript for unique personal details, shared laughs, specific local references, or unique phrasing used by the client. Generate follow-up "hooks" categorized by tone.

# Output Format
## 1. Memorable Hooks
- [PROFESSIONAL]: A hook focusing on a specific business problem they mentioned in a unique way.
- [NICE]: A hook focusing on a personal detail (e.g., upcoming vacation, pet, weather, coffee preference).
- [FUNNY]: A lighthearted reference to a joke made or a "human moment" (e.g., "Sorry for the leaf blower in the background," or a shared laugh about a common struggle).

## 2. The "Recall" Points
- List 3-4 specific quotes or moments that will instantly remind the client of who you are and what you talked about.`
};

export async function processAudioIntelligence(
  base64Audio: string, 
  mimeType: string, 
  mode: ExtractionMode
): Promise<string> {
  const ai = getAIInstance();
  
  const audioPart = {
    inlineData: {
      data: base64Audio,
      mimeType: mimeType,
    },
  };

  const textPart = {
    text: PROMPTS[mode]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [audioPart, textPart] },
      config: {
        temperature: mode === 'transcript' ? 0.1 : 0.7, // Higher temp for creative follow-ups
      }
    });

    if (!response.text) {
      throw new Error("The AI model returned an empty response.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "Failed to process audio.");
  }
}
