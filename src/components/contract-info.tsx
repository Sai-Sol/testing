"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Check, Clipboard, FileText, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContractInfo() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    toast({
        title: "Copied to clipboard!",
        description: "Contract address copied successfully."
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-headline text-xl flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Contract Information
        </CardTitle>
        <CardDescription>
          The smart contract address for all quantum jobs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 p-3 bg-background rounded-lg">
          <p className="font-mono text-sm break-all">
            {CONTRACT_ADDRESS}
          </p>
          <Button variant="ghost" size="icon" onClick={copyToClipboard}>
            {copied ? <Check className="h-4 w-4 text-primary" /> : <Clipboard className="h-4 w-4" />}
          </Button>
        </div>
        <a
            href={`https://www.megaexplorer.xyz/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
        >
            <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Explorer
            </Button>
        </a>
      </CardContent>
    </Card>
  );
}
