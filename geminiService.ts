
import { GoogleGenAI } from "@google/genai";
import { ExtractionMode } from "./types";

const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

const PROMPTS: Record<ExtractionMode, string> = {
  transcript: `Please provide a verbatim transcription of the following audio. Label speakers as "Speaker 1", "Speaker 2", etc. Focus on accuracy and include all spoken content.`,
  
  bant: `# Role
You are a Senior Sales Operations Analyst and Deal Strategist. Your goal is to analyze the provided sales call transcript to equip the Account Executive (AE) with the critical information needed to close the deal.

# Task
Analyze the transcript using the BANT qualification framework. Use the EXACT following status labels. For each section, provide strategic context and a direct quote.

# Output Format

## 1. BANT Qualification Analysis

### [BUDGET]
- Status: (Budget Confirmed | Budget Pending | Budget Unclear | No Budget)
- Analysis: [Detailed breakdown]
- Quote: "[Direct evidence from audio]"

### [AUTHORITY]
- Status: (Decision Maker | Influencer | Gatekeeper | Unknown)
- Analysis: [Detailed breakdown]
- Quote: "[Direct evidence from audio]"

### [NEED]
- Status: (Critical Pain | Opportunity | Exploratory | No Fit)
- Analysis: [Detailed breakdown]
- Quote: "[Direct evidence from audio]"

### [TIMELINE]
- Status: (Immediate <1mo | Medium-term 1-3mo | Long-term 3mo+ | Unknown)
- Analysis: [Detailed breakdown]
- Quote: "[Direct evidence from audio]"

## 2. Closing Strategy
- [Actionable advice 1]
- [Actionable advice 2]
- [Actionable advice 3]

## 3. Contact Intelligence
- Primary Contact Email: [Extract email]
- Targeted Area: [Department/Region/Vertical]
- Company Name: [Name]
- Contact Name: [Name]`,

  contact: `You are a Contact Intelligence Agent. Extract all personal and corporate identification information from the audio. 
  Focus on:
  - Full Names
  - Professional Email Addresses
  - Phone Numbers
  - Company Names
  - Job Titles
  
  Format as a clean, structured directory.`
};

/**
 * Processes audio with specific AI intelligence based on the mode.
 */
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
        temperature: mode === 'transcript' ? 0.1 : 0.4,
      }
    });

    if (!response.text) {
      throw new Error("The model did not return any text output.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini Intelligence Error:", error);
    throw new Error(error.message || "Failed to process audio intelligence.");
  }
}
