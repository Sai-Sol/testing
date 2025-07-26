
"use client";
import JobSubmissionForm from "@/components/job-submission-form";
import { useState } from "react";
import type { AnalyseQasmOutput } from "@/ai/schemas";
import HistoryPage from "../history/page";

export default function CreateJobPage() {
    const [jobsLastUpdated, setJobsLastUpdated] = useState(Date.now());
    const [latestAnalysis, setLatestAnalysis] = useState<AnalyseQasmOutput | null>(null);


    const handleJobLogged = (analysis: AnalyseQasmOutput | null) => {
        setJobsLastUpdated(Date.now());
        setLatestAnalysis(analysis);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <JobSubmissionForm onJobLogged={handleJobLogged} />
            <HistoryPage jobsLastUpdated={jobsLastUpdated} latestAnalysis={latestAnalysis} />
        </div>
    );
}
