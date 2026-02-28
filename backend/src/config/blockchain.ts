import { ethers } from 'ethers';
import logger from './logger';

export const initializeProvider = (): ethers.JsonRpcProvider => {
  const rpcUrl = process.env.RPC_URL;

  if (!rpcUrl) {
    throw new Error('RPC_URL not found in environment variables');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  logger.info('🔗 Blockchain provider initialized');

  return provider;
};

export const getContractAddress = (): string => {
  const address = process.env.LOTTERY_CONTRACT_ADDRESS;

  if (!address) {
    throw new Error('LOTTERY_CONTRACT_ADDRESS not found in environment variables');
  }

  return address;
};

export const getChainId = (): number => {
  const chainId = process.env.CHAIN_ID;
  return chainId ? parseInt(chainId) : 11155111; // Default to Sepolia
};
