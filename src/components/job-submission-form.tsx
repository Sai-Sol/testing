
"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Contract } from "ethers";
import { motion, AnimatePresence } from "framer-motion";

import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, WandSparkles, Terminal, Bot, BrainCircuit, Lightbulb, BarChart3, Info } from "lucide-react";

import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";
import { analyseQasm, type AnalyseQasmOutput } from "@/ai/flows/analyse-qasm-flow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const formSchema = z.object({
  jobType: z.string().min(1, { message: "Job type cannot be empty." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  submissionType: z.enum(["prompt", "qasm"]),
});

const computerTimeFactors: Record<string, { base: number; factor: number }> = {
  "IBM Quantum": { base: 25, factor: 0.15 },
  "Google Quantum": { base: 15, factor: 0.1 },
  "Amazon Braket": { base: 20, factor: 0.2 },
};

interface JobSubmissionFormProps {
  onJobLogged: (analysis: AnalyseQasmOutput | null) => void;
}

export default function JobSubmissionForm({ onJobLogged }: JobSubmissionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyseQasmOutput | null>(null);
  const { isConnected, signer } = useWallet();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobType: "IBM Quantum",
      description: "",
      submissionType: "prompt",
    },
  });

  const selectedJobType = form.watch("jobType");
  const descriptionValue = form.watch("description");
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      form.setValue('description', e.target.value);
      if (analysisResult) {
          setAnalysisResult(null); // Reset analysis if user edits description
      }
  }

  const estimatedTime = useMemo(() => {
    if (!selectedJobType || !descriptionValue) return "5 - 10 seconds";
    const { base, factor } = computerTimeFactors[selectedJobType];
    const length = descriptionValue.length;
    const time = base + length * factor;
    return `${Math.round(time)} - ${Math.round(time * 1.5)} seconds`;
  }, [selectedJobType, descriptionValue]);

  async function handleAnalyze(values: z.infer<typeof formSchema>) {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyseQasm({
        userInput: values.description,
        submissionType: values.submissionType,
      });
      setAnalysisResult(result);
    } catch (error) {
      console.error("AI analysis failed:", error);
      toast({
        variant: "destructive",
        title: "AI Analysis Failed",
        description: "Could not analyze the submission. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }
  
  async function handleLogJob() {
    if (!signer || !analysisResult) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot log job. Wallet not connected or analysis not complete.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, signer);
      
      const { jobType, submissionType, description } = form.getValues();
      const jobTitle = analysisResult?.title || "Untitled Job";
      const fullDescription = `[${jobType} | ${submissionType}] ${description}`;

      toast({
        title: "Please Confirm in Your Wallet",
        description: "Confirm the transaction to log your job on the blockchain.",
      });

      const tx = await contract.logJob(jobTitle, fullDescription);
      
      await tx.wait();

      toast({
        title: "Transaction Successful!",
        description: "Your quantum job has been securely logged.",
        action: (
          <Button asChild variant="link">
            <a href={`https://www.megaexplorer.xyz/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
              View on Explorer
            </a>
          </Button>
        ),
      });

      form.reset({
        jobType: jobType,
        description: "",
        submissionType: submissionType,
      });
      setAnalysisResult(null);
      onJobLogged(analysisResult);
      
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.reason || error.message || "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: errorMessage.length > 100 ? `${errorMessage.substring(0, 100)}...` : errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <Card className="shadow-lg border-primary/20 bg-card/80 backdrop-blur-sm">
       <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAnalyze)}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Terminal className="h-6 w-6 text-primary" />
              Log a New Job
            </CardTitle>
            <CardDescription>
              Submit your quantum job to a provider. The job will be logged on-chain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="jobType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantum Provider</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IBM Quantum">IBM Quantum</SelectItem>
                      <SelectItem value="Google Quantum">Google Quantum</SelectItem>
                      <SelectItem value="Amazon Braket">Amazon Braket</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs defaultValue="prompt" onValueChange={(value) => form.setValue('submissionType', value as "prompt" | "qasm")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="prompt"><WandSparkles className="mr-2"/>Prompt</TabsTrigger>
                <TabsTrigger value="qasm"><Bot className="mr-2"/>QASM Code</TabsTrigger>
              </TabsList>
              <TabsContent value="prompt" className="mt-4">
                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Prompt</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., 'Factor the number 15 using Shor's algorithm'" className="font-mono" rows={6} {...field} onChange={handleDescriptionChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent value="qasm" className="mt-4">
                 <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>QASM Code</FormLabel>
                        <FormControl>
                          <Textarea placeholder={'OPENQASM 2.0;\\nqreg q[2];\\ncreg c[2];\\nh q[0];\\ncx q[0],q[1];\\nmeasure q -> c;'} className="font-mono" rows={6} {...field} onChange={handleDescriptionChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </TabsContent>
            </Tabs>

            <AnimatePresence>
              {isAnalyzing && (
                  <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center justify-center gap-2 text-muted-foreground p-4 bg-muted/50 rounded-lg"
                  >
                      <Loader2 className="animate-spin" />
                      <p>QuantumAI is analyzing your submission...</p>
                  </motion.div>
              )}
              {analysisResult && (
                  <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                  >
                      <Alert>
                          <BrainCircuit className="h-4 w-4" />
                          <AlertTitle className="font-headline text-lg">AI Analysis Complete</AlertTitle>
                          <AlertDescription>
                              Here's what QuantumAI thinks about your submission.
                          </AlertDescription>
                      </Alert>
                      <div className="grid gap-4 mt-4 text-sm">
                          <div className="p-4 rounded-lg bg-background border">
                              <h4 className="font-semibold flex items-center gap-2 mb-2 text-primary"><Info /> Title & Summary</h4>
                              <p className="font-bold text-lg">{analysisResult.title}</p>
                              <p className="text-muted-foreground">{analysisResult.analysis}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 rounded-lg bg-background border">
                                  <h4 className="font-semibold flex items-center gap-2 mb-2"><BarChart3/>Complexity</h4>
                                  <p className="font-mono text-lg">{analysisResult.complexity}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-background border">
                                  <h4 className="font-semibold flex items-center gap-2 mb-2"><Lightbulb />Optimization</h4>
                                  <p>{analysisResult.optimizations}</p>
                              </div>
                          </div>
                      </div>
                  </motion.div>
              )}
            </AnimatePresence>

          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
              <div className="text-sm text-center text-muted-foreground bg-background/50 rounded-lg p-3">
                Estimated time to completion: <span className="font-medium text-foreground">{estimatedTime}</span>
              </div>
              
              {!analysisResult ? (
                 <Button type="submit" disabled={isAnalyzing || !isConnected || !form.formState.isValid}>
                    {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Analyze Job"}
                 </Button>
              ) : (
                <Button onClick={handleLogJob} disabled={isLoading || !isConnected} className="w-full font-semibold bg-green-600 hover:bg-green-700">
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging Job...</> : 
                  "Log Job"}
                </Button>
              )}

              {!isConnected && <p className="text-sm text-center text-yellow-500">Connect your wallet to enable logging.</p>}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
