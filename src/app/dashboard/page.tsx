"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AdminDashboard from "@/components/admin-dashboard";
import { Atom, Cpu, Zap, Shield, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardHomePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-4"
      >
        <Avatar className="h-20 w-20 border-4 border-primary/50 shadow-lg">
           <AvatarFallback className="bg-primary/20">
             <Atom size={40} className="text-primary"/>
           </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Welcome back, {user?.name || user?.email}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Access the world's leading quantum computers through our secure blockchain platform.
          </p>
        </div>
      </motion.div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {user?.role === 'admin' && (
          <div className="lg:col-span-3">
            <AdminDashboard totalJobs={0} /> 
          </div>
        )}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blockchain Security</CardTitle>
            <Atom className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Immutable Logs</div>
            <p className="text-xs text-muted-foreground">
              Every quantum computation is permanently recorded on the blockchain, ensuring tamper-proof verification and complete audit trails.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantum Security</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Tamper-Proof</div>
             <p className="text-xs text-muted-foreground">
              Traditional quantum cloud systems can be tampered with. Our blockchain-based approach ensures computational integrity and prevents unauthorized modifications.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification System</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">User Verification</div>
            <p className="text-xs text-muted-foreground">
              Users can independently verify that their quantum computations haven't been altered, providing complete transparency and trust in the system.
            </p>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>System Architecture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">1. Quantum Execution</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">Jobs are executed on quantum cloud platforms with real-time monitoring</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">2. Blockchain Logging</h3>
                <p className="text-sm text-green-700 dark:text-green-300">Results are cryptographically hashed and stored on the immutable ledger</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border border-purple-200 dark:border-purple-800">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">3. Verification</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">Users can verify computational integrity through blockchain records</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
