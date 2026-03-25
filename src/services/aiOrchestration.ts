import { GoogleGenAI } from "@google/genai";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function orchestrateSecurityAction(finding: any, userId?: string) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are the ASRO Orchestration Brain. 
    A security finding has been detected: ${JSON.stringify(finding)}
    
    Decide which agent should handle this and what the next action should be.
    Return a JSON response with:
    - agentId: the ID of the agent to assign (agent-1, agent-2, agent-3, agent-4)
    - action: a short description of the action
    - message: a log message for the dashboard
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const result = JSON.parse(response.text);

    // Log the action to Firestore
    await addDoc(collection(db, "activity_logs"), {
      timestamp: new Date().toISOString(),
      type: "AI_ORCHESTRATION",
      message: result.message,
      agentId: result.agentId,
      details: result,
      userId
    });

    return result;
  } catch (error) {
    console.error("Orchestration failed", error);
    return null;
  }
}
