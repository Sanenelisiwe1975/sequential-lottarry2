'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, polygonMumbai, localhost } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Lottery DApp',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from https://cloud.walletconnect.com
  chains: [sepolia, polygonMumbai, localhost],
  ssr: true,
});
