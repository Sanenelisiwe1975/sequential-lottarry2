'use client';

import { useReadContract, useWriteContract } from 'wagmi';
import { LOTTERY_ABI } from '@/constants/abi';
import { LOTTERY_CONTRACT_ADDRESS } from '@/constants';
import { keccak256 } from 'viem';

function numbersToBytes32(numbers: number[]): `0x${string}` {
  const bytes = new Uint8Array(numbers);
  return keccak256(bytes);
}

export function useLotteryContract() {
  const { writeContract, data: hash, isPending } = useWriteContract();

  const { data: roundInfo } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getCurrentRoundInfo',
  });

  const { data: ticketPrice } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'ticketPrice',
  });

  const { data: carryOverBalance } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getCarryOverBalance',
  });

  const { data: prizeTiers } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getPrizeTiers',
  });

  const buyTicket = (numbers: number[]) => {
    if (!ticketPrice) return;
    const numbersAsBytes32 = numbersToBytes32(numbers);
    writeContract({
      address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
      abi: LOTTERY_ABI,
      functionName: 'buyTicket',
      args: [numbersAsBytes32],
      value: ticketPrice as bigint, // Dynamic value from contract
    });
  };

  const claimWinnings = () => {
    writeContract({
      address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
      abi: LOTTERY_ABI,
      functionName: 'claimWinnings',
    });
  };

  return { roundInfo, ticketPrice, carryOverBalance, prizeTiers, buyTicket, claimWinnings, hash, isPending };
}

export function usePlayerWinnings(address: string | undefined) {
  const { data: winnings, refetch } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'playerWinnings',
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });
  return { winnings, refetch };
}