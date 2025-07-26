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
import { Link, Clipboard, Check } from "lucide-react";

import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";

type Job = {
  user: string;
  jobType: string;
  timestamp: string;
  txHash: string;
};

interface JobListProps {
  userRole: "admin" | "user";
  jobsLastUpdated: number;
}

export default function JobList({ userRole, jobsLastUpdated }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const { provider } = useWallet();

  const fetchJobs = useCallback(async () => {
    if (!provider) {
      setError("Wallet provider not available. Please connect your wallet.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, provider);
      const filter = contract.filters.JobLogged();
      const logs = await contract.queryFilter(filter);

      const parsedJobs: Job[] = logs.map(log => {
        const event = log as EventLog;
        return {
          user: event.args.user,
          jobType: event.args.jobType,
          timestamp: new Date(Number(event.args.timestamp) * 1000).toISOString(),
          txHash: event.transactionHash,
        };
      }).reverse(); // Show most recent jobs first

      setJobs(parsedJobs);
    } catch (e: any) {
      console.error("Failed to fetch jobs:", e);
      setError("Failed to fetch jobs from the blockchain. Please try refreshing.");
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

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
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 rounded-lg border">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );

  return (
    <Card>
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
        ) : error ? (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg font-medium">No Jobs Found</p>
            <p>Once jobs are logged, they will appear here.</p>
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
                        {copied === `user-${job.txHash}` ? <Check size={14} className="text-green-500" /> : <Clipboard size={14} />}
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
                      className="flex items-center justify-end gap-2 text-primary hover:underline"
                    >
                      <Link size={14} />
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
