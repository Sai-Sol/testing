"use client";

import React, { createContext, useState, useCallback, useEffect } from "react";
import { BrowserProvider, JsonRpcSigner, Network } from "ethers";
import { MEGAETH_TESTNET } from "@/lib/constants";

interface WalletContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  address: string | null;
  chainId: string | null;
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
  }, []);

  const updateWalletState = useCallback(async (ethereum: any) => {
    try {
      const browserProvider = new BrowserProvider(ethereum);
      const accounts = await browserProvider.listAccounts();
      if (accounts.length > 0) {
        const currentSigner = await browserProvider.getSigner();
        const currentAddress = await currentSigner.getAddress();
        const network: Network = await browserProvider.getNetwork();

        setProvider(browserProvider);
        setSigner(currentSigner);
        setAddress(currentAddress);
        setChainId(formatChainId(network.chainId));
      } else {
        disconnectWallet();
      }
    } catch (error) {
      console.error("Error updating wallet state:", error);
      disconnectWallet();
    }
  }, [disconnectWallet]);

  const switchNetwork = async (ethereum: any) => {
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MEGAETH_TESTNET.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [MEGAETH_TESTNET],
          });
        } catch (addError) {
          console.error("Failed to add network", addError);
        }
      } else {
        console.error("Failed to switch network", switchError);
      }
    }
  };

  const connectWallet = async () => {
    const ethereum = getEthereumObject();
    if (!ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      await updateWalletState(ethereum);
      
      const currentChainId = await ethereum.request({ method: 'eth_chainId' });
      if (currentChainId !== MEGAETH_TESTNET.chainId) {
        await switchNetwork(ethereum);
      }

    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  useEffect(() => {
    const ethereum = getEthereumObject();
    if (ethereum && ethereum.isMetaMask) {
      const handleAccountsChanged = () => updateWalletState(ethereum);
      const handleChainChanged = () => window.location.reload();

      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);

      // Eagerly connect if already permitted
      ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          updateWalletState(ethereum);
        }
      });

      return () => {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [updateWalletState]);

  return (
    <WalletContext.Provider
      value={{ provider, signer, address, chainId, isConnected, connectWallet, disconnectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
};
