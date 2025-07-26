'use server';
/**
 * @fileOverview A simple chat flow that uses Gemini to generate responses.
 *
 * - chat - A function that takes a message history and returns a response from the AI.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const chat = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    const llmResponse = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.0-flash',
      history: [
        {
          role: 'user',
          content: [{ text: `You are QuantumAI, a specialized AI assistant for the QuantumChain platform. Your expertise is strictly limited to quantum computing, blockchain technology, and related scientific or technical fields. Do not answer questions outside this scope. If a user asks about an unrelated topic (e.g., history, art, cooking), you must politely decline and state that your purpose is to assist with quantum computing and related technologies. Your primary goal is to provide accurate, helpful, and concise information within your designated domain.` }],
        },
        { role: 'model', content: [{ text: 'Hello! As QuantumAI, I can help you with your quantum computing and blockchain questions. What would you like to know?' }] },
      ],
    });

    return llmResponse.text;
  }
);
