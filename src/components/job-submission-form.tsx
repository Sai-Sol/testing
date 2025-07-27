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
import { Input } from "@/components/ui/input";
import { Loader2, Terminal, Zap, Clock, DollarSign, Activity } from "lucide-react";

import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";

const formSchema = z.object({
  jobType: z.string().min(1, { message: "Job type cannot be empty." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  submissionType: z.enum(["prompt", "qasm"]),
  priority: z.enum(["low", "medium", "high"]),
  estimatedCost: z.string().optional(),
});

const computerTimeFactors: Record<string, { base: number; factor: number; cost: number }> = {
  "IBM Quantum": { base: 25, factor: 0.15, cost: 0.001 },
  "Google Quantum": { base: 15, factor: 0.1, cost: 0.0015 },
  "Amazon Braket": { base: 20, factor: 0.2, cost: 0.0012 },
};

const priorityMultipliers = {
  low: 1,
  medium: 1.5,
  high: 2.5,
};

interface JobSubmissionFormProps {
  onJobLogged: () => void;
}

export default function JobSubmissionForm({ onJobLogged }: JobSubmissionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);
  const { isConnected, signer, provider } = useWallet();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobType: "IBM Quantum",
      description: "",
      submissionType: "prompt",
      priority: "medium",
      estimatedCost: "",
    },
  });

  const selectedJobType = form.watch("jobType");
  const descriptionValue = form.watch("description");
  const priority = form.watch("priority");
  
  const { estimatedTime, estimatedCost } = useMemo(() => {
    if (!selectedJobType || !descriptionValue) return { estimatedTime: "5 - 10 seconds", estimatedCost: "0.001 ETH" };
    
    const { base, factor, cost } = computerTimeFactors[selectedJobType];
    const length = descriptionValue.length;
    const baseTime = base + length * factor;
    const priorityMultiplier = priorityMultipliers[priority];
    
    const timeInSeconds = baseTime / priorityMultiplier;
    const highTimeInSeconds = timeInSeconds * 1.5;
    const totalCost = cost * priorityMultiplier;

    const formatDisplayTime = (seconds: number) => {
      if (seconds < 60) return `${Math.round(seconds)} sec`;
      return `${(seconds / 60).toFixed(1)} min`;
    };
    
    const timeRange = highTimeInSeconds < 60 
      ? `${Math.round(timeInSeconds)} - ${Math.round(highTimeInSeconds)} seconds`
      : `${formatDisplayTime(timeInSeconds)} - ${formatDisplayTime(highTimeInSeconds)}`;

    return {
      estimatedTime: timeRange,
      estimatedCost: `${totalCost.toFixed(4)} ETH`
    };
  }, [selectedJobType, descriptionValue, priority]);

  // Estimate gas cost
  const estimateGas = async () => {
    if (!signer || !provider) return;
    
    try {
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, signer);
      const gasEstimate = await contract.logJob.estimateGas(
        form.getValues().jobType,
        form.getValues().description
      );
      const gasPrice = await provider.getFeeData();
      const totalGasCost = gasEstimate * (gasPrice.gasPrice || BigInt(0));
      setGasEstimate((Number(totalGasCost) / 1e18).toFixed(6));
    } catch (error) {
      console.error("Gas estimation failed:", error);
    }
  };

  const handleLogJob = async (values: z.infer<typeof formSchema>) => {
    if (!signer) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Wallet not connected. Please connect your wallet first.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, signer);
      
      // Create a more detailed job description
      const jobMetadata = {
        type: values.jobType,
        description: values.description,
        submissionType: values.submissionType,
        priority: values.priority,
        timestamp: Date.now(),
        estimatedCost: estimatedCost,
        estimatedTime: estimatedTime,
      };

      const jobDescription = JSON.stringify(jobMetadata);

      toast({
        title: "Please Confirm in Your Wallet",
        description: "Confirm the transaction to log your quantum job on the blockchain.",
      });

      // Estimate gas first
      await estimateGas();

      const tx = await contract.logJob(values.jobType, jobDescription);
      
      toast({
        title: "Transaction Submitted",
        description: "Your transaction is being processed...",
      });

      await tx.wait();

      toast({
        title: "Success! 🎉",
        description: "Your quantum job has been securely logged on the blockchain.",
        action: (
          <Button asChild variant="link">
            <a href={`https://www.megaexplorer.xyz/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer">
              View Transaction
            </a>
          </Button>
        ),
      });

      form.reset({
        jobType: values.jobType,
        description: "",
        submissionType: values.submissionType,
        priority: "medium",
      });
      
      onJobLogged();
      
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
  };

  return (
    <Card className="shadow-xl border-primary/20 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogJob)}>
          <CardHeader className="pb-4">
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Terminal className="h-6 w-6 text-primary" />
              Submit Quantum Job
            </CardTitle>
            <CardDescription>
              Submit your quantum computing job to be executed on leading quantum platforms and logged immutably on the blockchain.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jobType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Quantum Provider
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Select a provider" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IBM Quantum">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            IBM Quantum
                          </div>
                        </SelectItem>
                        <SelectItem value="Google Quantum">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Google Quantum
                          </div>
                        </SelectItem>
                        <SelectItem value="Amazon Braket">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Amazon Braket
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Priority Level
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-green-600 border-green-600">Low</Badge>
                            Standard processing
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-yellow-600 border-yellow-600">Medium</Badge>
                            Faster processing
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-red-600 border-red-600">High</Badge>
                            Priority processing
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Tabs defaultValue="prompt" onValueChange={(value) => form.setValue('submissionType', value as "prompt" | "qasm")}>
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="prompt" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Natural Language
                </TabsTrigger>
                <TabsTrigger value="qasm" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  QASM Code
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="prompt" className="mt-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your quantum computing task (e.g., 'Create a quantum circuit to factor the number 15 using Shor's algorithm')" 
                          className="font-mono bg-background/50 min-h-[120px]" 
                          {...field} 
                        />
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
                        <Textarea 
                          placeholder={'OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[2];\ncreg c[2];\nh q[0];\ncx q[0],q[1];\nmeasure q -> c;'} 
                          className="font-mono bg-background/50 min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            {/* Job Estimates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Estimated Time</span>
                </div>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{estimatedTime}</p>
              </div>
              
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">Estimated Cost</span>
                </div>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">{estimatedCost}</p>
              </div>
              
              {gasEstimate && (
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Gas Cost</span>
                  </div>
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{gasEstimate} ETH</p>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex-col items-stretch gap-4 pt-6">
            <Button 
              type="submit" 
              disabled={isLoading || !isConnected} 
              className="w-full font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
              onClick={() => estimateGas()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Processing Transaction...
                </>
              ) : (
                <>
                  <Terminal className="mr-2 h-4 w-4" />
                  Submit & Log Job
                </>
              )}
            </Button>

            {!isConnected && (
              <Alert>
                <AlertTitle>Wallet Required</AlertTitle>
                <AlertDescription>
                  Please connect your MetaMask wallet to submit quantum jobs to the blockchain.
                </AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}