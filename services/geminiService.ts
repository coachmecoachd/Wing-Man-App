
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { PersonProfile, Message, DatingAdviceResponse, DateOption } from '../types.ts';

let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

export const getReplySuggestion = async (messages: Message[]): Promise<string> => {
  try {
    const gemini = getAiClient();
    const conversationHistory = messages.map(m => `${m.sender === 'me' ? 'Me' : 'Them'}: ${m.text}`).join('\n');
    const prompt = `
      You are Wing Man, a dating assistant AI. Your goal is to help users craft engaging, respectful, and charming replies in their dating conversations.
      Analyze the following conversation and suggest a great reply for "Me". 
      Provide 2-3 distinct options, each with a brief explanation of the vibe (e.g., "Playful & Witty", "Direct & Confident", "Curious & Engaging").
      Format the response in Markdown.

      Conversation History:
      ${conversationHistory}
      
      Suggest a reply for "Me":
      `;
    const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting reply suggestion:", error);
    throw new Error("Failed to get reply suggestion from AI.");
  }
};

export const generateDateIdeas = async (profile: PersonProfile, userZip?: string): Promise<string> => {
    try {
        const gemini = getAiClient();
        const locationContext = userZip ? `The user is located in or near zip code ${userZip}. Please prioritize local venues or activities in this area if specific locations are mentioned.` : '';
        
        const prompt = `
        Based on this person's profile, suggest 3 creative and personalized date ideas. For each idea, provide a title, a brief description, and why it's a good fit for them.
        ${locationContext}
        
        **Profile:**
        - **Name:** ${profile.name}
        - **Description:** ${profile.description}
        - **Likes:** ${profile.likes}
        - **Dislikes:** ${profile.dislikes}
        - **Hobbies:** ${profile.hobbies}
        - **Occupation:** ${profile.occupation}
        ${profile.zipCode ? `- **Their Location (Zip):** ${profile.zipCode}` : ''}
        
        Format your response in Markdown.
        `;
        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating date ideas:", error);
        throw new Error("Failed to generate date ideas.");
    }
};

export const generateStructuredDateIdeas = async (
    zipCode: string, 
    dateTime: string, 
    profile?: PersonProfile
): Promise<DateOption[]> => {
    try {
        const gemini = getAiClient();
        
        let profileContext = "";
        if (profile) {
            profileContext = `
            The date is with: ${profile.name}.
            Their Profile:
            - Description: ${profile.description}
            - Likes: ${profile.likes}
            - Dislikes: ${profile.dislikes}
            - Hobbies: ${profile.hobbies}
            `;
        } else {
            profileContext = "No specific profile selected. Suggest generally great date ideas.";
        }

        const prompt = `
        Plan 4 distinct, creative, and specific date options for Zip Code: ${zipCode} on Date/Time: ${dateTime}.
        
        ${profileContext}
        
        Instructions:
        - You act as a local expert. Suggest *specific* real venues, parks, restaurants, or activity centers known in or near ${zipCode}.
        - If the specific zip code is small, look at the immediate surrounding area.
        - Ensure the ideas fit the time of day (e.g., don't suggest a breakfast place for a 8 PM date).
        - Provide a diverse range of options (e.g. one active, one dining, one cultural/relaxed).
        
        Return a JSON array of 4 objects.
        `;

        const schema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A catchy title for the date idea." },
                    location: { type: Type.STRING, description: "The specific name of the venue or place." },
                    description: { type: Type.STRING, description: "A tempting description of the activity." },
                    reasoning: { type: Type.STRING, description: "Why this is a good fit based on the profile or time." }
                },
                required: ['title', 'location', 'description', 'reasoning']
            }
        };

        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as DateOption[];
    } catch (error) {
        console.error("Error generating structured date ideas:", error);
        throw new Error("Failed to generate date options.");
    }
}

export const generateGiftIdeas = async (profile: PersonProfile, userZip?: string): Promise<string> => {
    try {
        const gemini = getAiClient();
        const locationContext = userZip ? `The user is located in or near zip code ${userZip}. If suggesting experiences or local shops, consider this location.` : '';

        const prompt = `
        You are a thoughtful gift-giving assistant. Based on the provided profile, brainstorm 3-5 unique and personalized gift ideas. For each idea, explain why it would be a great gift for this person.
        ${locationContext}

        Also, for one of the ideas that could be a custom-printed item (like a mug, t-shirt, or poster), provide a detailed, descriptive prompt that could be used with an AI image generator to create a cool design.
        
        **Profile:**
        - **Name:** ${profile.name}
        - **Likes:** ${profile.likes}
        - **Dislikes:** ${profile.dislikes}
        - **Hobbies:** ${profile.hobbies}

        Format your response in Markdown. The image prompt should be clearly labeled and enclosed in a code block.
        `;
        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating gift ideas:", error);
        throw new Error("Failed to generate gift ideas.");
    }
};

export const generateGiftImage = async (prompt: string): Promise<string> => {
    try {
        const gemini = getAiClient();
        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:image/png;base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image was generated.");

    } catch (error) {
        console.error("Error generating gift image:", error);
        throw new Error("Failed to generate image.");
    }
};

export const getDatingAdvice = async (dateType: string, question: string): Promise<DatingAdviceResponse> => {
    try {
        const gemini = getAiClient();
        const prompt = `
        You are Wing Man, an AI dating coach. Provide advice for a "${dateType}" date.
        The user has a specific question: "${question}".
        
        Please provide a comprehensive response in the requested JSON format. The vibe should be confident, friendly, and supportive.
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                keyVibe: { type: Type.STRING, description: "A short, catchy phrase for the date's overall vibe." },
                dos: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 key things to do." },
                donts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 key things to avoid." },
                outfitSuggestion: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING, description: "A brief description of a suitable outfit." },
                        reasoning: { type: Type.STRING, description: "Why this outfit works for the occasion." }
                    },
                    required: ['description', 'reasoning']
                },
                conversationStarters: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 interesting questions or topics to bring up." },
                icebreakerJoke: { type: Type.STRING, description: "A light-hearted, clean joke to break the ice." },
                questionAnswer: { type: Type.STRING, description: "A direct and thoughtful answer to the user's specific question." }
            },
            required: ['keyVibe', 'dos', 'donts', 'outfitSuggestion', 'conversationStarters', 'questionAnswer']
        };

        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        });

        const jsonStr = response.text.trim();
        return JSON.parse(jsonStr) as DatingAdviceResponse;
    } catch (error) {
        console.error("Error getting dating advice:", error);
        throw new Error("Failed to get dating advice. The AI might be having a moment.");
    }
};

export const translateText = async (text: string, sourceLang: string, targetLang: string): Promise<string> => {
    try {
        const gemini = getAiClient();
        const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Only return the translated text, with no extra explanations or formatting.\n\nText: "${text}"`;
        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error translating text:", error);
        throw new Error("Failed to translate text.");
    }
};

export const generateSpeech = async (text: string): Promise<string> => {
    try {
        const gemini = getAiClient();
        const response = await gemini.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate speech.");
    }
};
