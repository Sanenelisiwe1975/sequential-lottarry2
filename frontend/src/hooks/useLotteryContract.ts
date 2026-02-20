'use client';

import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { LOTTERY_ABI } from '@/constants/abi';
import { LOTTERY_CONTRACT_ADDRESS } from '@/constants';
import { useEffect } from 'react';

export function useLotteryContract() {
  const { writeContract, isPending, isSuccess, isError, error } = useWriteContract();

  // Read current round info
  const { data: roundInfo, refetch: refetchRoundInfo } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getCurrentRoundInfo',
  });

  // Read ticket price
  const { data: ticketPrice } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'ticketPrice',
  });

  // Read carry over balance
  const { data: carryOverBalance, refetch: refetchCarryOver } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getCarryOverBalance',
  });

  // Read owner balance
  const { data: ownerBalance } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getOwnerBalance',
  });

  // Read prize tiers
  const { data: prizeTiers } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getPrizeTiers',
  });

  // Buy ticket function
  const buyTicket = (numbers: number[]) => {
    if (!ticketPrice) return;
    
    writeContract({
      address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
      abi: LOTTERY_ABI,
      functionName: 'buyTicket',
      args: [numbers as any],
      value: ticketPrice as bigint,
    });
  };

  // Claim winnings function
  const claimWinnings = () => {
    writeContract({
      address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
      abi: LOTTERY_ABI,
      functionName: 'claimWinnings',
    });
  };

  // Draw lottery (owner only)
  const drawLottery = () => {
    writeContract({
      address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
      abi: LOTTERY_ABI,
      functionName: 'drawLottery',
    });
  };

  // Start new round (owner only)
  const startNewRound = (duration: number) => {
    writeContract({
      address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
      abi: LOTTERY_ABI,
      functionName: 'startNewRound',
      args: [BigInt(duration)],
    });
  };

  // Withdraw owner fees (owner only)
  const withdrawOwnerFees = () => {
    writeContract({
      address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
      abi: LOTTERY_ABI,
      functionName: 'withdrawOwnerFees',
    });
  };

  // Watch for ticket purchases
  useWatchContractEvent({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    eventName: 'TicketPurchased',
    onLogs: () => {
      refetchRoundInfo();
    },
  });

  // Watch for lottery drawn
  useWatchContractEvent({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    eventName: 'LotteryDrawn',
    onLogs: () => {
      refetchRoundInfo();
      refetchCarryOver();
    },
  });

  return {
    // Read data
    roundInfo,
    ticketPrice,
    carryOverBalance,
    ownerBalance,
    prizeTiers,
    
    // Write functions
    buyTicket,
    claimWinnings,
    drawLottery,
    startNewRound,
    withdrawOwnerFees,
    
    // Transaction states
    isPending,
    isSuccess,
    isError,
    error,
    
    // Refetch functions
    refetchRoundInfo,
    refetchCarryOver,
  };
}

// Hook to get user's tickets for a specific round
export function useMyTickets(roundId: bigint | undefined, address: string | undefined) {
  const { data: tickets, refetch } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getMyTickets',
    args: roundId !== undefined ? [roundId] : undefined,
    query: {
      enabled: !!roundId && !!address,
    },
  });

  return { tickets, refetch };
}

// Hook to get player winnings
export function usePlayerWinnings(address: string | undefined) {
  const { data: winnings, refetch } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'playerWinnings',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return { winnings, refetch };
}

// Hook to get winning numbers for a round
export function useWinningNumbers(roundId: bigint | undefined, isDrawn: boolean) {
  const { data: winningNumbers } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getWinningNumbers',
    args: roundId !== undefined ? [roundId] : undefined,
    query: {
      enabled: !!roundId && isDrawn,
    },
  });

  return { winningNumbers };
}

// Hook to get tier info for a round
export function useTierInfo(roundId: bigint | undefined, isDrawn: boolean) {
  const { data: tierInfo } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
    abi: LOTTERY_ABI,
    functionName: 'getAllTierInfo',
    args: roundId !== undefined ? [roundId] : undefined,
    query: {
      enabled: !!roundId && isDrawn,
    },
  });

  return { tierInfo };
}
