'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, polygonMumbai, localhost } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Lottery DApp',
  projectId: '4822be6bc96f9a8a0b8faf6fb2934a6f', // Get from https://cloud.walletconnect.com
  chains: [sepolia, polygonMumbai, localhost],
  ssr: true,
});
