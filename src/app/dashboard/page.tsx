
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
            Welcome back, {user?.email}!
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
            <div className="flex flex-col items-center justify-center h-16 w-40 p-4 bg-muted rounded-lg fill-current text-foreground/80">
                <svg viewBox="0 0 1024 409.6" xmlns="http://www.w3.org/2000/svg" className="h-8">
                  <g>
                    <path d="m783.5 409.6h-54.3v-108.8h-108.6v108.8h-54.3v-273h54.3v108.8h108.6v-108.8h54.3z"></path>
                    <path d="m512.1 409.6h-54.3v-273h54.3z"></path>
                    <path d="m349.5 256h-108.6v-54.4h108.6v-54.2h-108.6v-54.4h108.6v-54.3h-162.9v273h162.9z"></path>
                    <path d="m1024 228.9v-54.2h-54.2v-54.4h-54.4v54.4h-54.2v54.2h54.2v54.4h54.4v-54.4z"></path>
                    <path d="m1024 355.2v-27.2h-27.1v-27.1h-27.2v27.1h-27.1v27.2h27.1v27.1h27.2v-27.1z"></path>
                    <path d="m915.4 136.6v-27.3h27.2v-27.1h27.1v27.1h27.2v27.3h-27.2v27.1h-27.1v-27.1z"></path>
                    <path d="m1024 27.2v-27.2h-27.1v54.3h27.1z"></path>
                    <path d="m915.4 54.3v-54.3h-27.2v54.3z"></path>
                    <path d="m0 27.2v-27.2h27.1v54.3h-27.1z"></path>
                    <path d="m108.4 54.3v-54.3h27.2v54.3z"></path>
                  </g>
                </svg>
            </div>
            <div className="flex flex-col items-center justify-center h-16 w-40 p-4 bg-muted rounded-lg fill-current text-foreground/80">
              <svg viewBox="0 0 300 95" xmlns="http://www.w3.org/2000/svg" className="h-8">
                <path d="M92.3 94.2c-10.3 0-19.4-3.8-26.4-10.2-7.1-6.3-11.2-14.7-11.2-24.1s4.1-17.8 11.2-24.1c7-6.3 16.1-10.2 26.4-10.2 11.2 0 19.9 4.3 26.4 11.2l-6.1 7.2c-5.1-5.6-11.2-8.5-19.1-8.5-6.8 0-12.5 2.1-17.2 6.3-4.9 4.2-7.4 9.8-7.4 17.8s2.5 13.7 7.4 17.8c4.7 4.2 10.4 6.3 17.2 6.3 8.3 0 15.3-3.6 20.3-9.4l6.1 7.1c-5.8 6.9-14.4 10.5-27.6 10.5zm65.1-48.4c-1.4-1.4-2.8-2.2-4.1-2.2-1.3 0-2.6.8-3.9 2.2l-6.8 6.8v31.4h-8.8V30.1h8.8v22.8l11-11c2.2-2.3 4.8-3.6 7.7-3.6 2.6 0 4.8.8 6.5 2.3 1.7 1.5 2.6 3.6 2.6 6v31.4h-8.8V53c0-3.3-1-5.7-2.9-7.2zm44 48.4V30.1h8.8v64.1h-8.8zm30.3-64.1h8.8v64.1h-8.8V30.1zm33.5 64.1c-10.2 0-18.4-3.3-24.4-9.8V94.2h-8.8V30.1h8.8v29.5c6.1-6.5 14.3-9.8 24.4-9.8 8.8 0 16.2 3.1 22.3 9.4 6.2 6.3 9.4 14.2 9.4 23.9 0 9.7-3.1 17.7-9.4 23.9-6.1 6.3-13.5 9.4-22.3 9.4zm5.7-47.5c-4.6-4.2-10-6.3-16.1-6.3-6.2 0-11.4 2.1-15.6 6.3-4.3 4.2-6.5 9.6-6.5 16.1 0 6.5 2.2 11.9 6.5 16.1s9.4 6.3 15.6 6.3c6.1 0 11.5-2.1 16.1-6.3 4.6-4.2 6.9-9.6 6.9-16.1-.1-6.5-2.4-11.9-6.9-16.1zM0 30.1h8.8v24.2L29.9 30h11.1L21.3 52.3 43.1 94h-11L20.3 64.4 8.8 76.8V94H0V30.1z"></path>
              </svg>
            </div>
             <div className="flex flex-col items-center justify-center h-16 w-40 p-4 bg-muted rounded-lg fill-current text-foreground/80">
               <svg viewBox="0 0 180 32" xmlns="http://www.w3.org/2000/svg" className="h-7">
                  <path d="M125.8 17.2a9.5 9.5 0 0 0-1.4-5.2 9 9 0 0 0-8.1-4.1h-20v23h8.2v-9.2h10.4l7.2 9.2h9.1l-8.2-10.4a9.2 9.2 0 0 0 1-3.3zm-11-1.7h-8.4V11h8.4a2.2 2.2 0 0 1 2.4 2.2 2.2 2.2 0 0 1-2.4 2.3zM161.9 20.3a20.4 20.4 0 0 0-1-6.2 8.4 8.4 0 0 0-4-4.2 10.9 10.9 0 0 0-6.3-1.6 15.1 15.1 0 0 0-6.2 1.3 10.3 10.3 0 0 0-4.6 3.7l3.2 2.3a6.4 6.4 0 0 1 3-2.5 7.6 7.6 0 0 1 4.1-.9 5.3 5.3 0 0 1 5.3 1.9 6.7 6.7 0 0 1 2.1 4.8c0 .3 0 .7-.1 1.2a18.3 18.3 0 0 1-3.1 6.1 13.2 13.2 0 0 1-5.3 4.4 12.8 12.8 0 0 1-7.2 2.2 13.1 13.1 0 0 1-6-1.2 10.1 10.1 0 0 1-4.2-3.6l-3.2 2.5a13.9 13.9 0 0 0 4.7 4.2 15.7 15.7 0 0 0 7.2 1.6 12.2 12.2 0 0 0 6.9-1.8 9.3 9.3 0 0 0 4.5-5.1 14.5 14.5 0 0 0 1.2-6.5zm3.8-12.4h2.5L149.2 31h-2.5zm-32.5 0h2.5L116.8 31h-2.5zm-33.3-1.3h8.3v23h-8.3zm-7.3 23h-8.3V8h8.3v14.4L71 8h8.3L69.2 18l10.3 13h-8.4L62.8 22zm-25.2-1.7a10.2 10.2 0 0 1-6.7-2.3 8.3 8.3 0 0 1-2.6-6.1V8h8.3v12.2a3.1 3.1 0 0 0 1 2.4 3.4 3.4 0 0 0 2.6 1 3.4 3.4 0 0 0 2.6-1 3.1 3.1 0 0 0 1-2.4V8h8.2v12.3a8.3 8.3 0 0 1-2.6 6.1 10.2 10.2 0 0 1-6.7 2.3zM0 8h8.3v14.7a3.8 3.8 0 0 0 1.1 2.8 4 4 0 0 0 3 1.1 4 4 0 0 0 3-1.1 3.8 3.8 0 0 0 1-2.8V8h8.3v15a8.7 8.7 0 0 1-2.6 6.5 9.7 9.7 0 0 1-6.8 2.5 9.7 9.7 0 0 1-6.8-2.5A8.7 8.7 0 0 1 0 23z" fill-rule="evenodd"></path>
               </svg>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    