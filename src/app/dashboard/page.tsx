
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AdminDashboard from "@/components/admin-dashboard";
import { Bot, Cpu } from "lucide-react";
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
             <Bot size={40} className="text-primary"/>
           </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-lg text-muted-foreground">
            I am QuantumAI, your assistant for the QuantumChain platform.
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
            <CardTitle className="text-sm font-medium">About QuantumChain</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Quantum Aggregator</div>
            <p className="text-xs text-muted-foreground">
              QuantumChain is an aggregator of multiple quantum cloud platforms, providing a single interface to access the world's leading quantum computers.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">About MegaETH</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">High-Throughput L2</div>
             <p className="text-xs text-muted-foreground">
              MegaETH is a high-performance Layer 2 blockchain designed for scalability and speed, making it ideal for logging quantum jobs immutably.
            </p>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Our Partners</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-center gap-8 py-6">
            <div className="flex h-16 w-40 items-center justify-center rounded-lg bg-muted p-4 text-center font-medium text-foreground/80">
              IBM Quantum
            </div>
            <div className="flex h-16 w-40 items-center justify-center rounded-lg bg-muted p-4 text-center font-medium text-foreground/80">
              Google Quantum
            </div>
            <div className="flex h-16 w-40 items-center justify-center rounded-lg bg-muted p-4 text-center font-medium text-foreground/80">
              Amazon Braket
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
