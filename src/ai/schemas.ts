/**
 * @fileOverview Zod schemas for the AI flows.
 * This file exports the Zod schemas used to validate inputs and outputs
 * for the Genkit flows, separating them from the 'use server' file.
 */

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
