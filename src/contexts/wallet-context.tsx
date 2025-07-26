"use client";

import React, { createContext, useState, useCallback, useEffect } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
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

  const updateWalletState = useCallback(async (ethereum: any) => {
    try {
      const browserProvider = new BrowserProvider(ethereum);
      const accounts = await browserProvider.listAccounts();
      if (accounts.length > 0) {
        const currentSigner = await browserProvider.getSigner();
        const currentAddress = await currentSigner.getAddress();
        const network = await browserProvider.getNetwork();

        setProvider(browserProvider);
        setSigner(currentSigner);
        setAddress(currentAddress);
        setChainId(`0x${network.chainId.toString(16)}`);
      } else {
        disconnectWallet();
      }
    } catch (error) {
      console.error("Error updating wallet state:", error);
      disconnectWallet();
    }
  }, []);
  
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
  };

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
      }
      console.error("Failed to switch network", switchError);
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
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  useEffect(() => {
    const ethereum = getEthereumObject();
    if (ethereum) {
      const handleAccountsChanged = () => updateWalletState(ethereum);
      const handleChainChanged = () => updateWalletState(ethereum);

      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);

      updateWalletState(ethereum);

      return () => {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [updateWalletState]);

  useEffect(() => {
    if (isConnected && chainId && chainId !== MEGAETH_TESTNET.chainId) {
       const ethereum = getEthereumObject();
       if (ethereum) switchNetwork(ethereum);
    }
  }, [isConnected, chainId]);

  return (
    <WalletContext.Provider
      value={{ provider, signer, address, chainId, isConnected, connectWallet, disconnectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
};
