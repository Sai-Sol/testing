"use client";

import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Wallet } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function WalletConnectButton() {
  const { isConnected, address, connectWallet } = useWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">
              <Wallet className="mr-2 h-4 w-4 text-green-500" />
              {address ? truncateAddress(address) : "Connected"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{address}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button onClick={connectWallet}>
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
