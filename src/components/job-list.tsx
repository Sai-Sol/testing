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
import { ExternalLink, Clipboard, Check, HardDrive, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";

type Job = {
  user: string;
  jobType: string;
  ipfsHash: string;
  timeSubmitted: string;
  txHash?: string; // Optional, as it's not in the struct
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
  const [copied, setCopied] = useState<string | null>(null);
  const { provider, isConnected } = useWallet();
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

      const parsedJobs: Job[] = fetchedJobs.map((job: any) => ({
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
    if (userRole === "admin" && filterByUser && user?.email) {
      const currentUserAddress = jobs.find(job => job.user.toLowerCase() === user.email.toLowerCase())?.user;
       if(user.email === 'p1@example.com' && provider) {
         return jobs.filter(job => job.user.toLowerCase() === signer?.address.toLowerCase());
       }
      return jobs.filter(job => job.user.toLowerCase() === user.email.toLowerCase());
    }
    if (userRole === "user" && user) {
        if(provider && (window as any).ethereum?.selectedAddress) {
            return jobs.filter(job => job.user.toLowerCase() === (window as any).ethereum.selectedAddress.toLowerCase());
        }
    }
    return jobs;
  }, [jobs, filterByUser, userRole, user, provider]);
  
  const {signer} = useWallet()

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
          renderSkeleton()
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
                <TableHead>User</TableHead>
                <TableHead>Job Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job, index) => (
                <TableRow key={`${job.user}-${job.timeSubmitted}-${index}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{`${job.user.slice(0, 6)}...${job.user.slice(-4)}`}</span>
                      <button onClick={() => copyToClipboard(job.user, `user-${index}`)} className="text-muted-foreground hover:text-foreground">
                        {copied === `user-${index}` ? <Check size={14} className="text-primary" /> : <Clipboard size={14} />}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{job.jobType}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {job.ipfsHash}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(job.timeSubmitted), { addSuffix: true })}
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
