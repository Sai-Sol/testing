'use server';
/**
 * @fileOverview An AI agent for analyzing quantum job submissions.
 *
 * - analyseQasm - A function that analyzes user input (QASM or prompt) for a quantum job.
 * - AnalyseQasmInput - The input type for the analyseQasm function.
 * - AnalyseQasmOutput - The return type for the analyseQasm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const AnalyseQasmInputSchema = z.object({
  userInput: z.string().describe('The user provided QASM code or a text prompt.'),
  submissionType: z.enum(['qasm', 'prompt']).describe('The type of submission from the user.'),
});
export type AnalyseQasmInput = z.infer<typeof AnalyseQasmInputSchema>;

export const AnalyseQasmOutputSchema = z.object({
  title: z.string().describe('A short, descriptive title for the job (e.g., "Bell State Generation").'),
  complexity: z.string().describe('A brief analysis of the code complexity (e.g., "Low", "Medium", "High").'),
  analysis: z.string().describe('A one-sentence summary explaining what the code or prompt does.'),
  optimizations: z.string().describe('A one-sentence suggestion for a potential optimization, or "None" if not applicable.'),
});
export type AnalyseQasmOutput = z.infer<typeof AnalyseQasmOutputSchema>;

export async function analyseQasm(input: AnalyseQasmInput): Promise<AnalyseQasmOutput> {
  return analyseQasmFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyseQasmPrompt',
  input: {schema: AnalyseQasmInputSchema},
  output: {schema: AnalyseQasmOutputSchema},
  prompt: `You are a quantum computing expert. A user has submitted the following {{submissionType}}.
  
  Analyze the user's input below and provide a concise analysis based on the required output format.
  
  - If the submission is QASM code, analyze its structure, purpose, and complexity.
  - If the submission is a prompt, interpret the user's request and treat it as a conceptual quantum algorithm.
  - Generate a short, descriptive title for the job.
  - Briefly assess the computational complexity.
  - Provide a one-sentence summary of what the job does.
  - Suggest a simple, one-sentence optimization if applicable.

  User Input:
  \`\`\`
  {{{userInput}}}
  \`\`\`
  `,
});

const analyseQasmFlow = ai.defineFlow(
  {
    name: 'analyseQasmFlow',
    inputSchema: AnalyseQasmInputSchema,
    outputSchema: AnalyseQasmOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
