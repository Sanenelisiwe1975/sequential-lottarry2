'use client';

import { useReadContract, useWriteContract } from 'wagmi';
import { LOTTERY_ABI } from '@/constants/abi';
import { LOTTERY_CONTRACT_ADDRESS } from '@/constants';

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

    // Convert numbers array to the format expected by the contract: uint8[7]
    // The contract expects: function buyTicket(uint8[7] memory numbers)
    const numbersAsUint8 = numbers as readonly [number, number, number, number, number, number, number];

    console.log('Buying ticket with numbers:', numbersAsUint8);
    console.log('Ticket price:', ticketPrice);

    writeContract({
      address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
      abi: LOTTERY_ABI,
      functionName: 'buyTicket',
      args: [numbersAsUint8],
      value: ticketPrice as bigint,
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
