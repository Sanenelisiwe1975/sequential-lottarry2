'use client';

import { useState, useEffect } from 'react';
import { formatEther } from 'viem';

interface RoundInfoProps {
  roundInfo: any;
  ticketPrice: bigint | undefined;
  carryOverBalance: bigint | undefined;
}

export default function RoundInfo({ roundInfo, ticketPrice, carryOverBalance }: RoundInfoProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!roundInfo) return;

    const updateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = Number(roundInfo.endTime);
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeRemaining('Round Ended');
        return;
      }

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [roundInfo]);

  if (!roundInfo) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <p className="text-gray-500 mt-4">Loading round information...</p>
      </div>
    );
  }

  const isActive = !roundInfo.isDrawn && Number(roundInfo.endTime) > Math.floor(Date.now() / 1000);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-gray-900">
                Round #{roundInfo.roundId?.toString()}
              </h2>
              <span className={`
                px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                ${isActive 
                  ? 'bg-green-100 text-green-800 border border-green-300' 
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
                }
              `}>
                {isActive ? 'Active' : roundInfo.isDrawn ? 'Drawn' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isActive ? 'Draw in progress' : 'Awaiting draw'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Prize Pool */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-blue-900 uppercase tracking-wide mb-1">
                Prize Pool
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {roundInfo.prizePool ? formatEther(roundInfo.prizePool) : '0.00'}
              </p>
              <p className="text-sm text-blue-700 font-medium mt-1">ETH</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          {carryOverBalance && carryOverBalance > 0n && (
            <div className="bg-blue-100 rounded px-2 py-1 text-xs text-blue-800 font-medium inline-block">
              Includes {formatEther(carryOverBalance)} ETH carry over
            </div>
          )}
        </div>

        {/* Time Remaining */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-5 border border-emerald-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-emerald-900 uppercase tracking-wide mb-1">
                {isActive ? 'Time Remaining' : 'Status'}
              </p>
              <p className="text-3xl font-bold text-emerald-900">
                {timeRemaining || 'Calculating...'}
              </p>
              <p className="text-sm text-emerald-700 font-medium mt-1">
                {isActive ? 'Until draw' : 'Round ended'}
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Ticket Price */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-5 border border-violet-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-violet-900 uppercase tracking-wide mb-1">
                Ticket Price
              </p>
              <p className="text-3xl font-bold text-violet-900">
                {ticketPrice ? formatEther(ticketPrice) : '0.00'}
              </p>
              <p className="text-sm text-violet-700 font-medium mt-1">ETH</p>
            </div>
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      {isActive && (
        <div className="bg-blue-50 border-t border-blue-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-blue-900 font-medium">
              Round is active. Purchase tickets below before the draw!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
