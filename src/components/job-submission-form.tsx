"use client";

import { useState } from "react";
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
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";

const formSchema = z.object({
  jobType: z.string().min(3, "Job type must be at least 3 characters long."),
});

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
      jobType: "",
    },
  });

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
        description: "Your job has been logged on the blockchain.",
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
        description: error?.data?.message || error.message || "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Log a New Job</CardTitle>
        <CardDescription>
          Submit a job type to be permanently recorded on the Megaeth Testnet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="jobType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Quantum Simulation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading || !isConnected} className="w-full sm:w-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Logging..." : "Log Job"}
            </Button>
             {!isConnected && <p className="text-sm text-destructive mt-2">Connect your wallet to enable logging.</p>}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
