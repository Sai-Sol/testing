export const quantumJobLoggerABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_jobType", "type": "string" },
      { "internalType": "string", "name": "_ipfsHash", "type": "string" }
    ],
    "name": "logJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllJobs",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "string", "name": "jobType", "type": "string" },
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "uint256", "name": "timeSubmitted", "type": "uint256" }
        ],
        "internalType": "struct QuantumJobLogger.Job[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "jobType",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timeSubmitted",
        "type": "uint256"
      }
    ],
    "name": "JobLogged",
    "type": "event"
  }
];
