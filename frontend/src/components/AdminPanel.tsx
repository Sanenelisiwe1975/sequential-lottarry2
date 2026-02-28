'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { LOTTERY_ABI } from '@/constants/abi';
import { LOTTERY_CONTRACT_ADDRESS } from '@/constants';

export default function AdminPanel() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const startNewRound = () => {
    writeContract({
      address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
      abi: LOTTERY_ABI,
      functionName: 'startNewRound',
    });
  };

  const drawLottery = () => {
    writeContract({
      address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
      abi: LOTTERY_ABI,
      functionName: 'drawLottery',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
      <h3 className="text-xl font-bold mb-4 text-purple-900">⚙️ Admin Controls</h3>

      <div className="space-y-3">
        <button
          onClick={startNewRound}
          disabled={isPending || isConfirming}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition-all"
        >
          {isPending || isConfirming ? 'Processing...' : '🎯 Start New Round'}
        </button>

        <button
          onClick={drawLottery}
          disabled={isPending || isConfirming}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-all"
        >
          {isPending || isConfirming ? 'Processing...' : '🎲 Draw Lottery'}
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
        <p className="font-medium mb-2">ℹ️ Info:</p>
        <ul className="space-y-1 text-xs">
          <li>• <strong>Start New Round:</strong> Begins a new 5-minute lottery round</li>
          <li>• <strong>Draw Lottery:</strong> Ends current round and picks winning numbers</li>
          <li>• Can only draw after 5 minutes have passed</li>
        </ul>
      </div>
    </div>
  );
}
