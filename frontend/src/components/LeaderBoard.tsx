'use client';

import { useTopPlayers } from '@/hooks/useApi';
import { formatEther } from 'viem';

export default function LeaderBoard() {
  const { data, loading, error } = useTopPlayers(10);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Top Players</h2>
        <p className="text-gray-500">Loading leaderboard...</p>
      </div>
    );
  }

  if (error || !data?.data) {
    return null;
  }

  const players = data.data;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">🏆 Top Players</h2>

      <div className="space-y-3">
        {players.map((player: any, index: number) => (
          <div
            key={player.address}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-10 h-10 flex items-center justify-center rounded-full font-bold
                ${index === 0 ? 'bg-yellow-400 text-yellow-900' : ''}
                ${index === 1 ? 'bg-gray-300 text-gray-700' : ''}
                ${index === 2 ? 'bg-orange-400 text-orange-900' : ''}
                ${index > 2 ? 'bg-blue-100 text-blue-700' : ''}
              `}>
                {index + 1}
              </div>

              <div>
                <p className="font-mono text-sm">
                  {player.address.slice(0, 6)}...{player.address.slice(-4)}
                </p>
                <p className="text-xs text-gray-500">
                  {player.ticketsPurchased} tickets • {player.roundsParticipated.length} rounds
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-green-600">
                {formatEther(BigInt(player.totalWon))} ETH
              </p>
              <p className="text-xs text-gray-500">won</p>
            </div>
          </div>
        ))}
      </div>

      {players.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          No players yet. Be the first to play!
        </p>
      )}
    </div>
  );
}
