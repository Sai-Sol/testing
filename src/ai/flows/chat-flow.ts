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
          content: [{ text: 'You are a helpful AI assistant for a quantum computing platform. Your name is QuantumAI.' }],
        },
        { role: 'model', content: [{ text: 'Hello! How can I help you with your quantum computing questions today?' }] },
      ],
    });

    return llmResponse.text;
  }
);
