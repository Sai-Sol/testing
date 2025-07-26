
"use client";
import JobSubmissionForm from "@/components/job-submission-form";
import { useState } from "react";
import type { AnalyseQasmOutput } from "@/ai/schemas";

export default function CreateJobPage() {
    const [, setJobsLastUpdated] = useState(Date.now());

    const handleJobLogged = () => {
        setJobsLastUpdated(Date.now());
    };

    return (
        <div className="max-w-2xl mx-auto">
            <JobSubmissionForm onJobLogged={handleJobLogged} />
        </div>
    );
}
