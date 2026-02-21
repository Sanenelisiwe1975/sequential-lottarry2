// Contract address - UPDATE THIS after deploying your contract
export const LOTTERY_CONTRACT_ADDRESS = "0x275A829BA9D035e0e8b93AB02f588ced5d55C3A0"; // Replace with your deployed contract address

// Chain configuration
export const SUPPORTED_CHAINS = {
  SEPOLIA: 11155111,
  MUMBAI: 80001,
  LOCALHOST: 31337,
};

// Update this to match your deployment network
export const ACTIVE_CHAIN = SUPPORTED_CHAINS.SEPOLIA;

// Export the ABI
export { LOTTERY_ABI } from './abi';
