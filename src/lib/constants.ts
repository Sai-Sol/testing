export const HARDCODED_USERS = [
  { email: "admin@example.com", password: "password", role: "admin" },
  { email: "user@example.com", password: "password", role: "user" },
];

export const CONTRACT_ADDRESS = "0xd1471126F18d76be253625CcA75e16a0F1C5B3e2";

export const MEGAETH_TESTNET = {
  chainId: "0x2328", // 9000
  chainName: "Megaeth Testnet",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://testnet.megaeth.io"],
  blockExplorerUrls: ["https://www.megaexplorer.xyz/"],
};
