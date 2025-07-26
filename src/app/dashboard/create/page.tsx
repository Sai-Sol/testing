
"use client";
import JobSubmissionForm from "@/components/job-submission-form";
import { useState } from "react";
import type { AnalyseQasmOutput } from "@/ai/schemas";

export default function CreateJobPage() {
    const [, setJobsLastUpdated] = useState(Date.now());
    const [, setLatestAnalysis] = useState<AnalyseQasmOutput | null>(null);

    const handleJobLogged = (analysis: AnalyseQasmOutput | null) => {
        setJobsLastUpdated(Date.now());
        setLatestAnalysis(analysis);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <JobSubmissionForm onJobLogged={handleJobLogged} />
        </div>
    );
}
