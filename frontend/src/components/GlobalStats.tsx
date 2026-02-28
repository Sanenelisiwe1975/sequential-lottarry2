'use client';

import { useGlobalStats } from '@/hooks/useApi';
import { formatEther } from 'viem';

export default function GlobalStats() {
  const { data, loading, error } = useGlobalStats();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-500">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-red-500">Failed to load statistics</p>
      </div>
    );
  }

  if (!data?.data) {
    return null;
  }

  const stats = data.data;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Global Statistics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-3xl font-bold text-blue-600">{stats.totalRounds}</p>
          <p className="text-sm text-gray-600">Total Rounds</p>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-3xl font-bold text-green-600">{stats.totalTickets}</p>
          <p className="text-sm text-gray-600">Tickets Sold</p>
        </div>

        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
          <p className="text-sm text-gray-600">Players</p>
        </div>

        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-3xl font-bold text-yellow-600">{stats.totalWinners}</p>
          <p className="text-sm text-gray-600">Winners</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Prize Pool</p>
          <p className="text-2xl font-bold text-green-700">
            {formatEther(BigInt(stats.totalPrizePool))} ETH
          </p>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Prizes Paid</p>
          <p className="text-2xl font-bold text-blue-700">
            {formatEther(BigInt(stats.totalPrizesPaid))} ETH
          </p>
        </div>
      </div>

      {stats.largestJackpot && (
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-100 rounded-lg border-2 border-yellow-300">
          <p className="text-sm text-gray-600 mb-1">Largest Jackpot</p>
          <p className="text-3xl font-bold text-orange-700">
            {formatEther(BigInt(stats.largestJackpot.prizeAmount))} ETH
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Round {stats.largestJackpot.roundId}
          </p>
        </div>
      )}
    </div>
  );
}
