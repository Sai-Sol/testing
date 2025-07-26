"use client";

import React, { createContext, useState, useCallback, useEffect } from "react";
import { BrowserProvider, JsonRpcSigner, Network, formatEther } from "ethers";

interface WalletContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  address: string | null;
  chainId: string | null;
  balance: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

export const WalletContext = createContext<WalletContextType | null>(null);

// Helper to format chainId to a hex string
const formatChainId = (chainId: bigint | number | string) => {
  return `0x${BigInt(chainId).toString(16)}`;
};

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  const isConnected = !!address;

  const getEthereumObject = () => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      return window.ethereum;
    }
    return null;
  };
  
  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    setBalance(null);
  }, []);

  const updateWalletState = useCallback(async (ethereum: any) => {
    try {
      const browserProvider = new BrowserProvider(ethereum);
      const accounts = await browserProvider.listAccounts();
      if (accounts.length > 0) {
        const currentSigner = await browserProvider.getSigner();
        const currentAddress = await currentSigner.getAddress();
        const network: Network = await browserProvider.getNetwork();
        const currentBalance = await browserProvider.getBalance(currentAddress);

        setProvider(browserProvider);
        setSigner(currentSigner);
        setAddress(currentAddress);
        setChainId(formatChainId(network.chainId));
        setBalance(formatEther(currentBalance));
      } else {
        disconnectWallet();
      }
    } catch (error) {
      console.error("Error updating wallet state:", error);
      disconnectWallet();
    }
  }, [disconnectWallet]);

  const connectWallet = async () => {
    const ethereum = getEthereumObject();
    if (!ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      // Request account access
      await ethereum.request({ method: "eth_requestAccounts" });
      await updateWalletState(ethereum);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  useEffect(() => {
    const ethereum = getEthereumObject();
    if (ethereum && ethereum.isMetaMask) {
      const handleAccountsChanged = () => updateWalletState(ethereum);
      const handleChainChanged = (newChainId: string) => {
        setChainId(formatChainId(newChainId));
        updateWalletState(ethereum);
      }

      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);

      return () => {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [updateWalletState]);

  return (
    <WalletContext.Provider
      value={{ provider, signer, address, chainId, balance, isConnected, connectWallet, disconnectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
};
