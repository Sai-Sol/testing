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
import { Loader2, Clock, Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";

import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";

const formSchema = z.object({
  jobType: z.string().min(1, { message: "Job type cannot be empty." }),
  description: z.string().min(1, { message: "Description cannot be empty." }),
});

const computerTimeFactors: Record<string, { base: number; factor: number }> = {
  "Shor's Algorithm": { base: 25, factor: 0.15 },
  "Grover's Algorithm": { base: 15, factor: 0.1 },
  "Quantum Simulation": { base: 20, factor: 0.2 },
  "Custom": { base: 5, factor: 0.05 },
};

interface JobSubmissionFormProps {
  onJobLogged: () => void;
}

export default function JobSubmissionForm({ onJobLogged }: JobSubmissionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, signer } = useWallet();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobType: undefined,
      description: "",
    },
  });

  const selectedJobType = form.watch("jobType");
  const descriptionValue = form.watch("description");

  const estimatedTime = useMemo(() => {
    if (!selectedJobType || !descriptionValue) return null;
    const { base, factor } = computerTimeFactors[selectedJobType] || computerTimeFactors["Custom"];
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

    setIsLoading(true);
    try {
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, signer);
      
      toast({
        title: "Transaction Submitted",
        description: "Please confirm the transaction in your wallet.",
      });

      const tx = await contract.logJob(values.jobType, values.description);
      
      await tx.wait();

      toast({
          title: "Success!",
          description: `Your job has been logged.`,
          action: (
            <Button asChild variant="link">
              <a
                href={`https://www.megaexplorer.xyz/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Transaction
              </a>
            </Button>
          ),
        });

      form.reset({
        jobType: values.jobType,
        description: "",
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
  }

  return (
    <Card className="shadow-lg border-primary/20">
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Terminal className="h-6 w-6" />
              Log a New Job
            </CardTitle>
            <CardDescription>
              Submit your quantum job to the blockchain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="jobType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a job type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Shor's Algorithm">Shor&apos;s Algorithm</SelectItem>
                        <SelectItem value="Grover's Algorithm">Grover&apos;s Algorithm</SelectItem>
                        <SelectItem value="Quantum Simulation">Quantum Simulation</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description / Input Data</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter prime factors, simulation parameters, etc." className="font-mono" rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {estimatedTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                  <Clock className="h-4 w-4" />
                  <span>Estimated Simulation Time: {estimatedTime}</span>
                </div>
              )}
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
              <Button type="submit" disabled={isLoading || !isConnected} className="w-full font-semibold">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging...</>
                ) : "Log Job on Megaeth"}
              </Button>
              {!isConnected && <p className="text-sm text-center text-yellow-500">Connect your wallet to enable logging.</p>}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
