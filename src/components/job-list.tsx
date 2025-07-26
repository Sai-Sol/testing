"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Contract } from "ethers";
import { formatDistanceToNow } from "date-fns";
import { useWallet } from "@/hooks/use-wallet";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, HardDrive, Filter, Bot, BrainCircuit, ScanText, FileCode, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";
import type { AnalyseQasmOutput } from "@/ai/schemas";

type Job = {
  user: string;
  jobType: string;
  ipfsHash: string;
  timeSubmitted: string;
  txHash: string;
  analysis?: AnalyseQasmOutput | null;
};

interface JobListProps {
  userRole: "admin" | "user";
  jobsLastUpdated: number;
  onTotalJobsChange: (count: number) => void;
  latestAnalysis: AnalyseQasmOutput | null;
}

export default function JobList({ userRole, jobsLastUpdated, onTotalJobsChange, latestAnalysis }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterByUser, setFilterByUser] = useState(false);
  const { provider, isConnected, signer } = useWallet();
  const { user } = useAuth();
  const [openJob, setOpenJob] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!provider) {
      if (!isConnected) {
        setError("Please connect your wallet to view job history.");
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, provider);
      const filter = contract.filters.JobLogged();
      const currentBlock = await provider.getBlockNumber();
      // Query last 100,000 blocks to avoid RPC errors
      const fromBlock = Math.max(0, currentBlock - 100000); 

      const logs = await contract.queryFilter(filter, fromBlock, 'latest');

      const parsedJobs: Job[] = logs.map(log => ({
        user: log.args.user,
        jobType: log.args.jobType,
        ipfsHash: log.args.ipfsHash,
        timeSubmitted: new Date(Number(log.args.timeSubmitted) * 1000).toISOString(),
        txHash: log.transactionHash,
      })).reverse(); // Show most recent first

      setJobs(parsedJobs);
      onTotalJobsChange(parsedJobs.length);
    } catch (e: any) {
      console.error("Failed to fetch jobs:", e);
      setError("Failed to fetch jobs from the blockchain. Please ensure you are on the correct network and refresh.");
      setJobs([]);
      onTotalJobsChange(0);
    } finally {
      setIsLoading(false);
    }
  }, [provider, isConnected, onTotalJobsChange]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, jobsLastUpdated]);
  
  // Add latest analysis to the most recent job
  useEffect(() => {
    if (latestAnalysis && jobs.length > 0) {
      setJobs(prevJobs => {
        const newJobs = [...prevJobs];
        if (newJobs[0] && newJobs[0].txHash) { // Ensure job exists and has a txHash
            newJobs[0].analysis = latestAnalysis;
        }
        return newJobs;
      });
    }
  }, [latestAnalysis, jobs.length]);


  const filteredJobs = useMemo(() => {
    if (userRole === "admin" && filterByUser && user?.email && signer) {
        return jobs.filter(job => job.user.toLowerCase() === signer.address.toLowerCase());
    }
    if (userRole === "user" && user && signer) {
      return jobs.filter(job => job.user.toLowerCase() === signer.address.toLowerCase());
    }
    return jobs;
  }, [jobs, filterByUser, userRole, user, signer]);

  return (
    <Card className="h-full bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/10">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle className="font-headline text-2xl flex items-center gap-2"><ScanText/>Job History</CardTitle>
                <CardDescription>
                  A log of all jobs submitted to the contract. Click a job for details.
                </CardDescription>
            </div>
            {userRole === "admin" && (
              <Button
                variant={filterByUser ? "secondary" : "outline"}
                onClick={() => setFilterByUser(prev => !prev)}
                className="shadow-md"
              >
                <Filter className="mr-2 h-4 w-4" />
                {filterByUser ? "Show All Jobs" : "Show My Jobs Only"}
              </Button>
            )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          </div>
        ) : error ? (
            <Alert variant="destructive">
                <AlertTitle>Could Not Fetch Jobs</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <HardDrive className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No Jobs Found</p>
            <p className="text-sm">{userRole === 'user' ? "Your submitted jobs will appear here." : "No jobs have been logged to the contract yet."}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredJobs.map((job) => (
              <Collapsible key={job.txHash} open={openJob === job.txHash} onOpenChange={() => setOpenJob(openJob === job.txHash ? null : job.txHash)}>
                <CollapsibleTrigger asChild>
                   <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary"><Bot size={20}/></div>
                        <div>
                           <div className="font-medium">{job.jobType}</div>
                           <div className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(job.timeSubmitted), { addSuffix: true })}</div>
                        </div>
                      </div>
                      <ChevronDown className="h-5 w-5 transition-transform duration-300 data-[state=open]:rotate-180" />
                   </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 pl-6 border-l-2 border-primary ml-6 space-y-4">
                    <div className="flex flex-col gap-2">
                       <h4 className="font-semibold flex items-center gap-2 text-primary"><FileCode/>User Input</h4>
                       <p className="font-mono text-sm bg-background p-3 rounded-md max-h-48 overflow-auto border">{job.ipfsHash}</p>
                    </div>

                    {job.analysis && (
                        <div className="flex flex-col gap-2">
                            <h4 className="font-semibold flex items-center gap-2 text-primary"><BrainCircuit/> AI Analysis</h4>
                            <p className="text-sm text-muted-foreground">{job.analysis.analysis}</p>
                            <p className="text-sm mt-2"><strong className="text-foreground">Complexity:</strong> {job.analysis.complexity}</p>
                            <p className="text-sm"><strong className="text-foreground">Suggested Optimizations:</strong> {job.analysis.optimizations}</p>
                        </div>
                    )}
                    
                    <a href={`https://www.megaexplorer.xyz/tx/${job.txHash}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Transaction
                        </Button>
                    </a>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
