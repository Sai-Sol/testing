"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Contract, Wallet, JsonRpcProvider } from "ethers";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Clock, Terminal, Bot } from "lucide-react";
import { CONTRACT_ADDRESS, MEGAETH_TESTNET } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";

const formSchema = z.object({
  provider: z.string({ required_error: "Please select a quantum provider." }),
  inputType: z.enum(["qasm", "prompt"]),
  inputValue: z.string().min(1, { message: "Input cannot be empty." }),
});

const computerTimeFactors: Record<string, { base: number; factor: number }> = {
  "IBM Quantum": { base: 5, factor: 0.05 },
  "Google Quantum AI": { base: 10, factor: 0.1 },
  "Amazon Braket": { base: 8, factor: 0.08 },
};

interface JobSubmissionFormProps {
  onJobLogged: () => void;
}

export default function JobSubmissionForm({ onJobLogged }: JobSubmissionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useWallet();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: undefined,
      inputType: "qasm",
      inputValue: "",
    },
  });

  const selectedProvider = form.watch("provider");
  const inputValue = form.watch("inputValue");

  const estimatedTime = useMemo(() => {
    if (!selectedProvider || !inputValue) return null;
    const { base, factor } = computerTimeFactors[selectedProvider];
    const length = inputValue.length;
    const time = base + length * factor;
    return `${Math.round(time)} - ${Math.round(time * 1.5)} minutes`;
  }, [selectedProvider, inputValue]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!process.env.SERVICE_ACCOUNT_PRIVATE_KEY) {
      toast({
        variant: "destructive",
        title: "Service Account Not Configured",
        description: "The service account private key is missing. Please contact support.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const rpcProvider = new JsonRpcProvider(MEGAETH_TESTNET.rpcUrls[0]);
      const serviceAccountWallet = new Wallet(process.env.SERVICE_ACCOUNT_PRIVATE_KEY, rpcProvider);
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, serviceAccountWallet);
      
      const jobTypeString = `${values.provider} (${values.inputType}): ${values.inputValue.substring(0, 50)}${values.inputValue.length > 50 ? '...' : ''}`;
      
      const tx = await contract.logJob(jobTypeString);
      
      toast({
        title: "Transaction Submitted",
        description: "Waiting for confirmation...",
      });

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
        ...values,
        inputValue: "",
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
  
  const handleTabChange = (value: string) => {
    form.setValue("inputType", value as "qasm" | "prompt");
    form.setValue("inputValue", "");
  };

  return (
    <Card className="shadow-lg border-primary/20">
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Log a New Job</CardTitle>
            <CardDescription>
              Select a provider and submit your QASM code or prompt.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="provider"
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

              <Tabs defaultValue="qasm" className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="qasm"><Terminal className="mr-2 h-4 w-4" /> QASM Code</TabsTrigger>
                  <TabsTrigger value="prompt"><Bot className="mr-2 h-4 w-4" /> Prompt</TabsTrigger>
                </TabsList>
                <FormField
                  control={form.control}
                  name="inputValue"
                  render={({ field }) => (
                  <FormItem>
                    <TabsContent value="qasm" className="mt-4">
                        <FormLabel>QASM Input</FormLabel>
                        <FormControl>
                           <Textarea placeholder={'// QASM 2.0; \nOPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[2];\ncreg c[2];\nh q[0];\ncx q[0],q[1];\nmeasure q -> c;'} className="mt-2 font-mono" rows={6} {...field} />
                        </FormControl>
                    </TabsContent>
                    <TabsContent value="prompt" className="mt-4">
                        <FormLabel>Prompt Input</FormLabel>
                        <FormControl>
                           <Textarea placeholder="Describe the quantum job you want to run..." className="mt-2" rows={6} {...field} />
                        </FormControl>
                    </TabsContent>
                    <FormMessage />
                   </FormItem>
                  )}
                />
              </Tabs>

              {estimatedTime && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                  <Clock className="h-4 w-4" />
                  <span>Estimated Compute Time: {estimatedTime}</span>
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
