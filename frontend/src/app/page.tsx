'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import NumberPicker from '@/components/NumberPicker';
import RoundInfo from '@/components/RoundInfo';
import MyTickets from '@/components/MyTickets';
import PrizeTiers from '@/components/PrizeTiers';
import { useLotteryContract, usePlayerWinnings } from '@/hooks/useLotteryContract';
import { formatEther } from 'viem';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  
  const {
    roundInfo,
    ticketPrice,
    carryOverBalance,
    prizeTiers,
    buyTicket,
    claimWinnings,
    isPending,
    isSuccess,
    isError,
    error,
  } = useLotteryContract();

  const { winnings, refetch: refetchWinnings } = usePlayerWinnings(address);

  const handleBuyTicket = () => {
    if (selectedNumbers.length !== 7) {
      alert('Please select exactly 7 numbers');
      return;
    }
    buyTicket(selectedNumbers);
  };

  const handleClaimWinnings = () => {
    claimWinnings();
  };

  const isRoundActive = roundInfo && !roundInfo.isDrawn && 
    Number(roundInfo.endTime) > Math.floor(Date.now() / 1000);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🎰</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sequential Lottery</h1>
                <p className="text-sm text-gray-600">Win big with sequential number matching!</p>
              </div>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Winnings Banner */}
        {isConnected && winnings && winnings > 0n && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">🎉 Congratulations!</h3>
                <p className="text-3xl font-bold">{formatEther(winnings)} ETH</p>
                <p className="text-sm opacity-90">Available to claim</p>
              </div>
              <button
                onClick={handleClaimWinnings}
                disabled={isPending}
                className="bg-white text-green-600 hover:bg-green-50 font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {isPending ? 'Claiming...' : 'Claim Winnings'}
              </button>
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {isPending && (
          <div className="mb-6 bg-blue-100 border border-blue-300 rounded-lg p-4">
            <p className="text-blue-800">⏳ Transaction pending...</p>
          </div>
        )}
        {isSuccess && (
          <div className="mb-6 bg-green-100 border border-green-300 rounded-lg p-4">
            <p className="text-green-800">✅ Transaction successful!</p>
          </div>
        )}
        {isError && (
          <div className="mb-6 bg-red-100 border border-red-300 rounded-lg p-4">
            <p className="text-red-800">❌ Error: {error?.message}</p>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Round Info & Buy Ticket */}
          <div className="lg:col-span-2 space-y-6">
            {/* Round Info */}
            <RoundInfo 
              roundInfo={roundInfo}
              carryOverBalance={carryOverBalance}
              ticketPrice={ticketPrice}
            />

            {/* Buy Ticket Section */}
            {isConnected && isRoundActive && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Buy Ticket</h2>
                <NumberPicker 
                  onNumbersChange={setSelectedNumbers}
                  disabled={isPending}
                />
                <button
                  onClick={handleBuyTicket}
                  disabled={isPending || selectedNumbers.length !== 7}
                  className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {isPending 
                    ? '⏳ Processing...' 
                    : `🎫 Buy Ticket (${ticketPrice ? formatEther(ticketPrice) : '0'} ETH)`
                  }
                </button>
                {selectedNumbers.length !== 7 && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Select 7 numbers to continue
                  </p>
                )}
              </div>
            )}

            {!isConnected && (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <span className="text-6xl mb-4 block">🔒</span>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600 mb-6">
                  Connect your wallet to participate in the lottery
                </p>
                <ConnectButton />
              </div>
            )}

            {/* My Tickets */}
            {isConnected && (
              <MyTickets 
                roundId={roundInfo?.roundId}
                isDrawn={roundInfo?.isDrawn || false}
              />
            )}
          </div>

          {/* Right Column - Prize Tiers */}
          <div className="space-y-6">
            <PrizeTiers 
              prizeTiers={prizeTiers}
              prizePool={roundInfo?.prizePool}
            />

            {/* How to Play */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">📖 How to Play</h3>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600">1.</span>
                  <span>Select 7 numbers from 1-49 (or use Quick Pick)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600">2.</span>
                  <span>Buy your ticket and wait for the draw</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600">3.</span>
                  <span>Numbers must match <strong>sequentially from position 1</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600">4.</span>
                  <span>Win prizes based on consecutive matches!</span>
                </li>
              </ol>
            </div>

            {/* Revenue Split */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">💰 Revenue Split</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Prize Pool:</span>
                  <span className="font-bold text-green-600">90%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Owner Fee:</span>
                  <span className="font-bold text-blue-600">10%</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-xs text-gray-600">
                  Unclaimed prizes automatically carry over to the next round!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            🎲 Sequential Lottery DApp - Play responsibly
          </p>
        </div>
      </footer>
    </div>
  );
}
