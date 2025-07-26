
"use client";
import JobList from "@/components/job-list";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import type { AnalyseQasmOutput } from "@/ai/schemas";

export default function HistoryPage() {
    const { user } = useAuth();
    const [jobsLastUpdated, setJobsLastUpdated] = useState(Date.now());
    const [totalJobs, setTotalJobs] = useState(0);
    const [latestAnalysis, setLatestAnalysis] = useState<AnalyseQasmOutput | null>(null);

    if (!user) return null;

    return (
        <div>
            <JobList 
                userRole={user.role} 
                jobsLastUpdated={jobsLastUpdated} 
                onTotalJobsChange={setTotalJobs} 
                latestAnalysis={latestAnalysis}
            />
        </div>
    );
}
