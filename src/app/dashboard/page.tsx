"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/header";
import JobSubmissionForm from "@/components/job-submission-form";
import JobList from "@/components/job-list";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [jobsLastUpdated, setJobsLastUpdated] = useState(Date.now());

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleJobLogged = useCallback(() => {
    setJobsLastUpdated(Date.now());
  }, []);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-2">
                <JobSubmissionForm onJobLogged={handleJobLogged} />
            </div>
            <div className="lg:col-span-5">
                <JobList userRole={user.role} jobsLastUpdated={jobsLastUpdated} />
            </div>
        </div>
      </main>
    </div>
  );
}
