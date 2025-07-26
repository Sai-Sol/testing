"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase } from "lucide-react";
import { HARDCODED_USERS } from "@/lib/constants";

interface AdminDashboardProps {
  totalJobs: number;
}

export default function AdminDashboard({ totalJobs }: AdminDashboardProps) {
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem("quantum-users-db");
      const users = storedUsers ? JSON.parse(storedUsers) : HARDCODED_USERS;
      setTotalUsers(users.length);
    } catch (error) {
      console.error("Failed to parse users from localStorage", error);
      setTotalUsers(HARDCODED_USERS.length);
    }
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalJobs}</div>
          <p className="text-xs text-muted-foreground">
            Total jobs logged on the contract
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            Total registered users in the system
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
