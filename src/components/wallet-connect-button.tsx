"use client";

import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { LogOut, Wallet, Copy, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function WalletConnectButton() {
  const { isConnected, address, connectWallet, disconnectWallet, balance, chainId } = useWallet();
  const { toast } = useToast();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const isCorrectNetwork = chainId === "0x2328"; // MegaETH Testnet

  if (isConnected && address) {
    return (
       <div className="flex items-center gap-2">
        {!isCorrectNetwork && (
          <Badge variant="destructive" className="text-xs">
            Wrong Network
          </Badge>
        )}
        {balance && (
          <Badge variant="outline" className="text-sm font-mono bg-green-50 text-green-700 border-green-200">
            {parseFloat(balance).toFixed(4)} ETH
          </Badge>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200">
              <Wallet className={`mr-2 h-4 w-4 ${isCorrectNetwork ? 'text-green-500' : 'text-red-500'}`} />
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
                {balance && (
                  <p className="text-xs leading-none text-muted-foreground">
                    Balance: {parseFloat(balance).toFixed(4)} ETH
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Address</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <a href={`https://www.megaexplorer.xyz/address/${address}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>View on Explorer</span>
              </a>
            </DropdownMenuItem>
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
    <Button onClick={connectWallet} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
