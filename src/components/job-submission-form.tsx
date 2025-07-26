"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Contract } from "ethers";

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
import { Loader2, WandSparkles, Terminal, Bot } from "lucide-react";

import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";
import { analyseQasm, type AnalyseQasmOutput } from "@/ai/flows/analyse-qasm-flow";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

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
  const submissionType = form.watch("submissionType");

  const estimatedTime = useMemo(() => {
    if (!selectedJobType || !descriptionValue) return "5 - 10 seconds";
    const { base, factor } = computerTimeFactors[selectedJobType];
    const length = descriptionValue.length;
    const time = base + length * factor;
    return `${Math.round(time)} - ${Math.round(time * 1.5)} seconds`;
  }, [selectedJobType, descriptionValue]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!signer) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to log a job.",
      });
      return;
    }

    setIsAnalyzing(true);
    let analysisResult: AnalyseQasmOutput | null = null;
    try {
      analysisResult = await analyseQasm({
        userInput: values.description,
        submissionType: values.submissionType,
      });
    } catch (error) {
      console.error("AI analysis failed:", error);
      toast({
        variant: "destructive",
        title: "AI Analysis Failed",
        description: "Could not analyze the submission. Proceeding without AI enhancements.",
      });
    } finally {
      setIsAnalyzing(false);
    }

    setIsLoading(true);
    try {
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, signer);
      
      const jobTitle = analysisResult?.title || "Untitled Job";
      const fullDescription = `[${values.jobType} | ${values.submissionType}] ${values.description}`;

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
        jobType: values.jobType,
        description: "",
        submissionType: values.submissionType,
      });
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

  const isLoadingState = isLoading || isAnalyzing;

  return (
    <Card className="shadow-lg border-primary/20 bg-card/80 backdrop-blur-sm">
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                        <Textarea placeholder="e.g., 'Factor the number 15 using Shor's algorithm'" className="font-mono" rows={6} {...field} />
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
                          <Textarea placeholder={'OPENQASM 2.0;\nqreg q[2];\ncreg c[2];\nh q[0];\ncx q[0],q[1];\nmeasure q -> c;'} className="font-mono" rows={6} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
              <Button type="submit" disabled={isLoadingState || !isConnected} className="w-full font-semibold">
                {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> :
                 isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging Job...</> : 
                 "Analyze & Log Job"}
              </Button>
              {!isConnected && <p className="text-sm text-center text-yellow-500">Connect your wallet to enable logging.</p>}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
