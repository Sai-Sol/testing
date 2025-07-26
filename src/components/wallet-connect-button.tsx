"use client";

import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { LogOut, Wallet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "./ui/badge";

export default function WalletConnectButton() {
  const { isConnected, address, connectWallet, disconnectWallet, balance } = useWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
       <div className="flex items-center gap-2">
        {balance && (
          <Badge variant="outline" className="text-sm font-mono">
            {parseFloat(balance).toFixed(4)} ETH
          </Badge>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Wallet className="mr-2 h-4 w-4 text-green-500" />
              {truncateAddress(address)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  Connected Wallet
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {address}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer text-red-500 focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Disconnect</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
       </div>
    );
  }

  return (
    <Button onClick={connectWallet}>
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
