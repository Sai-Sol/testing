
"use client";
import JobSubmissionForm from "@/components/job-submission-form";
import { useState } from "react";
import HistoryPage from "../history/page";

export default function CreateJobPage() {
    const [jobsLastUpdated, setJobsLastUpdated] = useState(Date.now());


    const handleJobLogged = () => {
        setJobsLastUpdated(Date.now());
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <JobSubmissionForm onJobLogged={handleJobLogged} />
            <HistoryPage jobsLastUpdated={jobsLastUpdated} />
        </div>
    );
}
