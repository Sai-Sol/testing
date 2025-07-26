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
import { Loader2, Clock } from "lucide-react";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";

const formSchema = z.object({
  jobType: z.string({ required_error: "Please select a quantum computer." }),
});

const computerTimeEstimates: Record<string, string> = {
  "IBM Quantum": "5-15 minutes",
  "Google Quantum AI": "10-25 minutes",
  "Amazon Braket": "8-20 minutes",
};

interface JobSubmissionFormProps {
  onJobLogged: () => void;
}

export default function JobSubmissionForm({ onJobLogged }: JobSubmissionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signer, isConnected } = useWallet();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobType: undefined,
    },
  });

  const selectedComputer = form.watch("jobType");

  const estimatedTime = useMemo(() => {
    if (!selectedComputer) return null;
    return computerTimeEstimates[selectedComputer];
  }, [selectedComputer]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isConnected || !signer) {
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
      const tx = await contract.logJob(values.jobType);
      
      toast({
        title: "Transaction Submitted",
        description: "Waiting for confirmation...",
      });

      await tx.wait();

      toast({
        title: "Success!",
        description: `Your job on ${values.jobType} has been logged.`,
        action: (
          <a
            href={`https://www.megaexplorer.xyz/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline"
          >
            View Transaction
          </a>
        ),
      });

      form.reset();
      onJobLogged();
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error?.reason || error.message || "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Log a New Job</CardTitle>
            <CardDescription>
              Select a quantum computer to run your job on the Megaeth Testnet.
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
                          <SelectValue placeholder="Select a quantum computer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IBM Quantum">IBM Quantum</SelectItem>
                        <SelectItem value="Google Quantum AI">Google Quantum AI</SelectItem>
                        <SelectItem value="Amazon Braket">Amazon Braket</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {estimatedTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                  <Clock className="h-4 w-4" />
                  <span>Estimated Time: {estimatedTime}</span>
                </div>
              )}
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
              <Button type="submit" disabled={isLoading || !isConnected} className="w-full sm:w-auto">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Logging..." : "Log Job"}
              </Button>
              {!isConnected && <p className="text-sm text-yellow-500">Connect your wallet to enable logging.</p>}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
