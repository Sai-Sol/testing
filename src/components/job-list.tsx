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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, Clipboard, Check, HardDrive, Filter, Bot, BrainCircuit, ScanText, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";

import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";
import type { AnalyseQasmOutput } from "@/ai/schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Job = {
  user: string;
  jobType: string;
  ipfsHash: string;
  timeSubmitted: string;
  txHash?: string;
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
  const [copied, setCopied] = useState<string | null>(null);
  const { provider, isConnected, signer } = useWallet();
  const { user } = useAuth();

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
      const fetchedJobs = await contract.getAllJobs();

      const parsedJobs: Job[] = fetchedJobs.map((job: any, index: number) => ({
        user: job.user,
        jobType: job.jobType,
        ipfsHash: job.ipfsHash,
        timeSubmitted: new Date(Number(job.timeSubmitted) * 1000).toISOString(),
      })).reverse();
      
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

  const filteredJobs = useMemo(() => {
    if (userRole === "admin" && filterByUser && user?.email && signer) {
        return jobs.filter(job => job.user.toLowerCase() === signer.address.toLowerCase());
    }
    if (userRole === "user" && user && signer) {
      return jobs.filter(job => job.user.toLowerCase() === signer.address.toLowerCase());
    }
    return jobs;
  }, [jobs, filterByUser, userRole, user, signer]);
  
  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopied(identifier);
    setTimeout(() => setCopied(null), 2000);
  };
  
  const renderJobDialog = (job: Job, analysis: AnalyseQasmOutput | null) => (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle className="font-headline text-2xl flex items-center gap-2"><ScanText/>Job Details</DialogTitle>
        <DialogDescription>
           Detailed information for job submitted {formatDistanceToNow(new Date(job.timeSubmitted), { addSuffix: true })}.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/50">
           <h4 className="font-semibold flex items-center gap-2"><FileCode/>User Input</h4>
           <p className="font-mono text-sm bg-background p-2 rounded-md max-h-48 overflow-auto">{job.ipfsHash}</p>
           <div className="flex items-center text-xs text-muted-foreground gap-4 pt-2">
            <span>Submitted by: {job.user}</span>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(job.user, `dialog-user`)}>
               {copied === `dialog-user` ? <Check size={14} className="text-primary" /> : <Clipboard size={14} />}
            </Button>
           </div>
        </div>

        {analysis && (
            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-semibold flex items-center gap-2"><BrainCircuit/> AI Analysis</h4>
                <p className="text-sm text-muted-foreground">{analysis.analysis}</p>
                <p className="text-sm mt-2"><strong className="text-foreground">Complexity:</strong> {analysis.complexity}</p>
                <p className="text-sm"><strong className="text-foreground">Suggested Optimizations:</strong> {analysis.optimizations}</p>
            </div>
        )}
      </div>
    </DialogContent>
  );

  return (
    <Card className="h-full bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle className="font-headline text-2xl">Job History</CardTitle>
                <CardDescription>
                  A log of all jobs submitted to the contract. Click a row for details.
                </CardDescription>
            </div>
            {userRole === "admin" && (
              <Button
                variant={filterByUser ? "secondary" : "outline"}
                onClick={() => setFilterByUser(prev => !prev)}
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
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Explorer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job, index) => (
                <Dialog key={`${job.timeSubmitted}-${index}`}>
                    <DialogTrigger asChild>
                      <TableRow className="cursor-pointer">
                        <TableCell>
                          <div className="font-medium flex items-center gap-2">
                             <div className="p-2 bg-primary/10 rounded-md text-primary"><Bot size={16}/></div>
                             <span>{job.jobType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{`${job.user.slice(0, 6)}...${job.user.slice(-4)}`}</Badge>
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(job.timeSubmitted), { addSuffix: true })}
                        </TableCell>
                         <TableCell className="text-right">
                          <Button variant="ghost" size="icon" asChild onClick={(e) => e.stopPropagation()}>
                              <a href={`https://www.megaexplorer.xyz/address/${job.user}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    </DialogTrigger>
                   {renderJobDialog(job, index === 0 ? latestAnalysis : null)}
                </Dialog>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
