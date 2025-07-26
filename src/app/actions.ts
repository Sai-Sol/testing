'use server';

import { Contract, Wallet, JsonRpcProvider, Network } from "ethers";
import { CONTRACT_ADDRESS, MEGAETH_TESTNET } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";

export async function logJob(jobType: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const privateKey = process.env.SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!privateKey) {
    const errorMsg = "Service account private key is not configured on the server.";
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  try {
    // Create a static network object
    const network = Network.from(MEGAETH_TESTNET.chainId);
    
    // Initialize provider with static network and disable batching to prevent SSL issues
    const rpcProvider = new JsonRpcProvider(MEGAETH_TESTNET.rpcUrls[0], network, { staticNetwork: true });
    
    const serviceAccountWallet = new Wallet(privateKey, rpcProvider);
    const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, serviceAccountWallet);
    
    const tx = await contract.logJob(jobType);
    
    const receipt = await tx.wait();

    if (receipt.status === 1) {
        return { success: true, txHash: tx.hash };
    } else {
        return { success: false, error: "Transaction failed on-chain." };
    }
  } catch (error: any) {
    console.error("Server-side error in logJob:", error);
    return { success: false, error: error.reason || error.message || "An unknown server-side error occurred." };
  }
}
