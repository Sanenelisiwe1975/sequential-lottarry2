'use client';

import { useState } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther } from 'viem';

// Fixed Imports
import NumberPicker from '../components/NumberPicker';
import RoundInfo from '../components/RoundInfo';
import MyTickets from '../components/MyTickets';
import PrizeTiers from '../components/PrizeTiers';
import { useLotteryContract, usePlayerWinnings } from '@/hooks/useLotteryContract';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  // Hook for contract data & actions
  const { 
    roundInfo, 
    ticketPrice, 
    carryOverBalance, 
    prizeTiers, 
    buyTicket, 
    claimWinnings,
    hash,
    isPending 
  } = useLotteryContract();

  // Hook for user winnings
  const { winnings, refetch: refetchWinnings } = usePlayerWinnings(address);
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleBuyTicket = async () => {
    if (selectedNumbers.length !== 7) {
      alert('Please select exactly 7 numbers');
      return;
    }
    buyTicket(selectedNumbers);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎰</span>
            <h1 className="text-2xl font-bold">Sequential Lottery</h1>
          </div>
          <ConnectButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Claim Winnings Banner */}
        {isConnected && winnings && BigInt(winnings.toString()) > 0n && (
          <div className="mb-6 bg-green-100 border-2 border-green-300 rounded-xl p-6 flex justify-between items-center animate-pulse">
            <div>
              <p className="text-green-800 font-bold uppercase text-xs tracking-wider">You won!</p>
              <p className="text-2xl font-black text-green-900">{formatEther(winnings as bigint)} ETH available</p>
            </div>
            <button 
              onClick={() => claimWinnings()}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-all shadow-md"
            >
              Withdraw to Wallet
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RoundInfo 
              roundInfo={roundInfo} 
              ticketPrice={ticketPrice as bigint} 
              carryOverBalance={carryOverBalance as bigint} 
            />
            
            {isConnected && (
              <div className="space-y-4">
                <NumberPicker 
                  onNumbersSelected={setSelectedNumbers} 
                  disabled={isPending || isConfirming} 
                />
                <button
                  onClick={handleBuyTicket}
                  disabled={selectedNumbers.length !== 7 || isPending || isConfirming}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-all"
                >
                  {isPending || isConfirming ? 'Processing Transaction...' : `Purchase Ticket (${ticketPrice ? formatEther(ticketPrice as bigint) : '0.01'} ETH)`}
                </button>
              </div>
            )}
            
            {isConnected && roundInfo && (
              <MyTickets roundId={roundInfo.roundId} address={address} />
            )}
          </div>

          <aside className="space-y-6">
            <PrizeTiers prizeTiers={prizeTiers} prizePool={roundInfo?.prizePool} />
          </aside>
        </div>
      </main>
    </div>
  );
}