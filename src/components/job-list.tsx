"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Contract, EventLog } from "ethers";
import { formatDistanceToNow } from "date-fns";
import { useWallet } from "@/hooks/use-wallet";
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
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, Clipboard, Check, HardDrive } from "lucide-react";

import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";

type Job = {
  user: string;
  jobType: string;
  timestamp: string;
  txHash: string;
};

const mockJobs: Job[] = [
  {
    user: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
    jobType: "IBM Quantum (qasm): // Grovers Search...",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    txHash: "0x2a91f952a2498b9816a10a1203a743343358055598d363753e10a34c11452f1d",
  },
  {
    user: "0x5a2ABc28330756B9189E2565564349479a4918f8",
    jobType: "Google Quantum AI (prompt): Factorize 15",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    txHash: "0x4ed2b3e0c03975586617a221f7e09b1f4c7a6e12e2e85a6e45f1b13a1a68c0d1",
  },
  {
    user: "0x8a1B5A2E8B9075784E97850551C2a2754160E3F3",
    jobType: "Amazon Braket (qasm): // Bell State...",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    txHash: "0xbe19b9343343358055598d363753e10a34c11452f1d2a91f952a2498b9816a10",
  },
];

interface JobListProps {
  userRole: "admin" | "user";
  jobsLastUpdated: number;
  onTotalJobsChange: (count: number) => void;
}

const MAX_BLOCK_RANGE = 100000;

export default function JobList({ userRole, jobsLastUpdated, onTotalJobsChange }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const { provider, isConnected } = useWallet();

  const fetchJobs = useCallback(async () => {
    if (!provider) {
       if (isConnected) {
        setError("Wallet provider not available, please try reconnecting your wallet.");
       } else {
        setError("Please connect your wallet to view job history.");
       }
      setJobs(mockJobs);
      onTotalJobsChange(mockJobs.length);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, provider);
      const eventFilter = contract.filters.JobLogged();
      
      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latestBlock - MAX_BLOCK_RANGE);

      const logs = await contract.queryFilter(eventFilter, fromBlock, latestBlock);

      const parsedJobs: Job[] = logs.map(log => {
        const event = log as EventLog;
        return {
          user: event.args.user,
          jobType: event.args.jobType,
          timestamp: new Date(Number(event.args.timestamp) * 1000).toISOString(),
          txHash: event.transactionHash,
        };
      }).reverse();
      
      const allJobs = [...parsedJobs, ...mockJobs];
      setJobs(allJobs);
      onTotalJobsChange(allJobs.length);
    } catch (e: any) {
      console.error("Failed to fetch jobs:", e);
      setError("Failed to fetch jobs from the blockchain. Displaying example jobs.");
      setJobs(mockJobs);
      onTotalJobsChange(mockJobs.length);
    } finally {
      setIsLoading(false);
    }
  }, [provider, isConnected, onTotalJobsChange]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, jobsLastUpdated]);

  const filteredJobs = useMemo(() => {
    if (!filter) return jobs;
    return jobs.filter(job => job.user.toLowerCase().includes(filter.toLowerCase()));
  }, [jobs, filter]);

  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopied(identifier);
    setTimeout(() => setCopied(null), 2000);
  };

  const renderSkeleton = () => (
     <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-2">
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                 <Skeleton className="h-8 w-24" />
            </div>
        ))}
    </div>
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle className="font-headline text-2xl">Job History</CardTitle>
                <CardDescription>
                  A log of all jobs submitted to the contract.
                </CardDescription>
            </div>
            {userRole === "admin" && (
                <Input
                placeholder="Filter by user address..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="max-w-xs"
                />
            )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          renderSkeleton()
        ) : error && jobs.length === mockJobs.length ? ( // Only show error alert if it fails AND we only have mocks
            <Alert variant="destructive">
                <AlertTitle>Could Not Fetch Real-time Jobs</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <HardDrive className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No Jobs Found</p>
            <p className="text-sm">Once jobs are logged, they will appear here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Job Type</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.txHash}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{`${job.user.slice(0, 6)}...${job.user.slice(-4)}`}</span>
                      <button onClick={() => copyToClipboard(job.user, `user-${job.txHash}`)} className="text-muted-foreground hover:text-foreground">
                        {copied === `user-${job.txHash}` ? <Check size={14} className="text-primary" /> : <Clipboard size={14} />}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{job.jobType}</Badge>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(job.timestamp), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <a
                      href={`https://www.megaexplorer.xyz/tx/${job.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline"
                    >
                      <ExternalLink size={14} />
                      View
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
