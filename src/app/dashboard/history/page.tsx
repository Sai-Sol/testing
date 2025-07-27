
"use client";
import JobList from "@/components/job-list";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

interface HistoryPageProps {
  jobsLastUpdated?: number;
}

export default function HistoryPage({ jobsLastUpdated: propJobsLastUpdated }: HistoryPageProps) {
    const { user } = useAuth();
    const [jobsLastUpdated, setJobsLastUpdated] = useState(Date.now());
    const [totalJobs, setTotalJobs] = useState(0);

    if (!user) return null;

    return (
        <div>
            <JobList 
                userRole={user.role} 
                jobsLastUpdated={propJobsLastUpdated ?? jobsLastUpdated} 
                onTotalJobsChange={setTotalJobs} 
            />
        </div>
    );
}
