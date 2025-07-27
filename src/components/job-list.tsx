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
import { ExternalLink, HardDrive, Filter, Activity, CheckCircle, Clock, DollarSign, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";

// AI-powered job description summarizer
const summarizeJobDescription = (description: string, jobType: string): string => {
  const lowerDesc = description.toLowerCase();
  
  // QASM code detection and summarization
  if (lowerDesc.includes('openqasm') || lowerDesc.includes('qreg') || lowerDesc.includes('creg')) {
    if (lowerDesc.includes('bell') || (lowerDesc.includes('h ') && lowerDesc.includes('cx'))) {
      return "Bell State Entanglement Circuit";
    }
    if (lowerDesc.includes('grover')) {
      return "Grover's Search Algorithm Implementation";
    }
    if (lowerDesc.includes('shor')) {
      return "Shor's Factorization Algorithm";
    }
    if (lowerDesc.includes('teleport')) {
      return "Quantum Teleportation Protocol";
    }
    if (lowerDesc.includes('measure')) {
      return "Quantum Measurement Circuit";
    }
    return "Custom Quantum Circuit Implementation";
  }
  
  // Natural language prompt summarization
  if (lowerDesc.includes('factor') || lowerDesc.includes('shor')) {
    return "Integer Factorization using Shor's Algorithm";
  }
  if (lowerDesc.includes('search') || lowerDesc.includes('grover')) {
    return "Database Search using Grover's Algorithm";
  }
  if (lowerDesc.includes('bell') || lowerDesc.includes('entangl')) {
    return "Quantum Entanglement Demonstration";
  }
  if (lowerDesc.includes('teleport')) {
    return "Quantum Teleportation Experiment";
  }
  if (lowerDesc.includes('random') || lowerDesc.includes('rng')) {
    return "Quantum Random Number Generation";
  }
  if (lowerDesc.includes('superposition')) {
    return "Quantum Superposition Analysis";
  }
  if (lowerDesc.includes('optimization') || lowerDesc.includes('qaoa')) {
    return "Quantum Optimization Problem Solving";
  }
  if (lowerDesc.includes('simulation') || lowerDesc.includes('vqe')) {
    return "Quantum System Simulation";
  }
  if (lowerDesc.includes('machine learning') || lowerDesc.includes('qml')) {
    return "Quantum Machine Learning Model";
  }
  
  // Fallback to first meaningful words
  const words = description.split(' ').filter(word => word.length > 3);
  const summary = words.slice(0, 4).join(' ');
  return summary.length > 50 ? `${summary.substring(0, 47)}...` : summary || "Quantum Computing Task";
};

const generateJobId = (txHash: string): string => {
  return `QC-${txHash.slice(2, 8).toUpperCase()}`;
};

type Job = {
  user: string;
  jobType: string;
  ipfsHash: string;
  timeSubmitted: string;
  txHash: string;
  metadata?: {
    type: string;
    description: string;
    submissionType: string;
    priority: string;
    estimatedCost: string;
    estimatedTime: string;
  };
};

interface JobListProps {
  userRole: "admin" | "user";
  jobsLastUpdated: number;
  onTotalJobsChange: (count: number) => void;
}

export default function JobList({ userRole, jobsLastUpdated, onTotalJobsChange }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterByUser, setFilterByUser] = useState(false);
  const { provider, isConnected, signer } = useWallet();
  const { user } = useAuth();
  const [openJob, setOpenJob] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!isConnected || !provider) {
      setError("Please connect your wallet to view job history.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, provider);
      const filter = contract.filters.JobLogged();
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000);

      const logs = await contract.queryFilter(filter, fromBlock, 'latest');

      const parsedJobs: Job[] = logs.map((log: any) => {
        let metadata;
        try {
          metadata = JSON.parse(log.args.ipfsHash);
        } catch {
          metadata = null;
        }

        return {
          user: log.args.user,
          jobType: log.args.jobType,
          ipfsHash: log.args.ipfsHash,
          timeSubmitted: new Date(Number(log.args.timeSubmitted) * 1000).toISOString(),
          txHash: log.transactionHash,
          metadata,
        };
      }).reverse();

      setJobs(parsedJobs);
      onTotalJobsChange(parsedJobs.length);
    } catch (e: any) {
      console.error("Failed to fetch jobs:", e);
      setError(`Failed to fetch jobs from the blockchain. Please refresh and try again. Error: ${e.message}`);
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
  const getJobTitle = (job: Job) => {
    if (job.metadata?.description || job.ipfsHash) {
      const description = job.metadata?.description || job.ipfsHash;
      return summarizeJobDescription(description, job.jobType);
    }
    return "Quantum Computing Task";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 border-red-600';
      case 'medium': return 'text-yellow-600 border-yellow-600';
      case 'low': return 'text-green-600 border-green-600';
      default: return 'text-gray-600 border-gray-600';
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'IBM Quantum': return 'bg-blue-500';
      case 'Google Quantum': return 'bg-green-500';
      case 'Amazon Braket': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="h-full bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm shadow-xl border-primary/20">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Quantum Job History
            </CardTitle>
            <CardDescription>
              Track all quantum jobs submitted to the blockchain with detailed execution metrics.
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
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
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
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <Collapsible key={job.txHash} open={openJob === job.txHash} onOpenChange={() => setOpenJob(openJob === job.txHash ? null : job.txHash)}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md w-full text-left bg-gradient-to-r from-background/50 to-background/30">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getProviderColor(job.jobType)}`}></div>
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                          <Activity size={20} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-base text-foreground flex items-center gap-2">
                          <span className="text-primary font-mono text-sm">{generateJobId(job.txHash)}</span>
                          <span>•</span>
                          <span>{getJobTitle(job)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
                          <span className="font-mono">Tx: {job.txHash.slice(0, 8)}...{job.txHash.slice(-6)}</span>
                          <Badge variant="outline" className="text-green-400 border-green-400/50">
                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                            Verified on Blockchain
                          </Badge>
                          {job.metadata?.priority && (
                            <Badge variant="outline" className={getPriorityColor(job.metadata.priority)}>
                              {job.metadata.priority.toUpperCase()}
                            </Badge>
                          )}
                          <span>{formatDistanceToNow(new Date(job.timeSubmitted), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{job.jobType}</div>
                      {job.metadata?.estimatedCost && (
                        <div className="text-xs text-muted-foreground">{job.metadata.estimatedCost}</div>
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="px-4 pb-4">
                  <div className="ml-8 space-y-4 bg-muted/30 rounded-lg p-4 border-l-4 border-primary">
                    {job.metadata && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <div>
                            <div className="text-xs text-muted-foreground">Estimated Time</div>
                            <div className="font-medium">{job.metadata.estimatedTime}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <div>
                            <div className="text-xs text-muted-foreground">Estimated Cost</div>
                            <div className="font-medium">{job.metadata.estimatedCost}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-purple-500" />
                          <div>
                            <div className="text-xs text-muted-foreground">Submission Type</div>
                            <div className="font-medium capitalize">{job.metadata.submissionType}</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-primary">Job Details</h4>
                      {job.metadata ? (
                        <div className="space-y-2">
                          <p className="text-sm"><strong>Job ID:</strong> {generateJobId(job.txHash)}</p>
                          <p className="text-sm"><strong>Summary:</strong> {getJobTitle(job)}</p>
                          <p className="text-sm"><strong>Provider:</strong> {job.metadata.type}</p>
                          <p className="text-sm"><strong>Priority:</strong> {job.metadata.priority}</p>
                          <p className="text-sm"><strong>Submission Type:</strong> {job.metadata.submissionType}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm"><strong>Job ID:</strong> {generateJobId(job.txHash)}</p>
                          <p className="text-sm"><strong>Summary:</strong> {getJobTitle(job)}</p>
                        </div>
                      )}
                      <p className="text-sm font-mono break-all"><strong>Blockchain Hash:</strong> {job.txHash}</p>
                      <div className="pt-2">
                        <a href={`https://www.megaexplorer.xyz/tx/${job.txHash}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Verify on Blockchain Explorer
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}