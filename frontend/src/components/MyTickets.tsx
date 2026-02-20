'use client';

import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { LOTTERY_CONTRACT_ADDRESS, LOTTERY_ABI } from '@/constants';

interface MyTicketsProps {
  roundId: bigint;
  address: `0x${string}` | undefined;
}

export default function MyTickets({ roundId, address }: MyTicketsProps) {
  const { data: tickets, refetch } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: 'getMyTickets',
    args: [roundId],
    query: {
      enabled: !!address,
    },
  });

  const { data: winningNumbers } = useReadContract({
    address: LOTTERY_CONTRACT_ADDRESS,
    abi: LOTTERY_ABI,
    functionName: 'getWinningNumbers',
    args: [roundId],
    query: {
      enabled: !!roundId,
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (!tickets || (tickets as any[]).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tickets Yet</h3>
        <p className="text-gray-600">
          You haven't purchased any tickets for this round.
        </p>
      </div>
    );
  }

  const ticketsArray = tickets as any[];
  const hasWinningNumbers = winningNumbers && (winningNumbers as any).length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">My Tickets</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm font-semibold border border-blue-200">
            {ticketsArray.length} {ticketsArray.length === 1 ? 'Ticket' : 'Tickets'}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {ticketsArray.map((ticket: any, idx: number) => {
          const numbers = ticket.numbers || [];
          const matchedBalls = Number(ticket.matchedBalls || 0);

          return (
            <div
              key={idx}
              className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-5 border border-gray-200 hover:shadow-sm transition-shadow"
            >
              {/* Ticket Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                    <span className="text-blue-900 font-bold text-lg">#{idx + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Ticket {idx + 1}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(Number(ticket.purchaseTime) * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>

                {hasWinningNumbers && matchedBalls > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center border border-green-300">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-green-700 font-semibold text-sm">
                      {matchedBalls} Match{matchedBalls !== 1 ? 'es' : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* Your Numbers */}
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Your Numbers</p>
                <div className="flex gap-2 flex-wrap">
                  {numbers.map((num: number, i: number) => {
                    const isMatched = hasWinningNumbers && i < matchedBalls;
                    const isMismatch = hasWinningNumbers && i === matchedBalls;

                    return (
                      <div
                        key={i}
                        className={`
                          w-12 h-12 rounded-lg flex items-center justify-center
                          font-bold text-base border-2 transition-all
                          ${isMatched 
                            ? 'bg-green-100 border-green-400 text-green-900' 
                            : isMismatch
                            ? 'bg-red-100 border-red-400 text-red-900'
                            : 'bg-white border-gray-300 text-gray-900'
                          }
                        `}
                      >
                        {num}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Winning Numbers (if drawn) */}
              {hasWinningNumbers && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Winning Numbers</p>
                  <div className="flex gap-2 flex-wrap">
                    {(winningNumbers as any[]).map((num: number, i: number) => {
                      const isMatched = i < matchedBalls;

                      return (
                        <div
                          key={i}
                          className={`
                            w-12 h-12 rounded-lg flex items-center justify-center
                            font-bold text-base border-2
                            ${isMatched
                              ? 'bg-blue-100 border-blue-400 text-blue-900'
                              : 'bg-gray-100 border-gray-300 text-gray-700'
                            }
                          `}
                        >
                          {num}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Match Status */}
              {hasWinningNumbers && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {matchedBalls >= 2 ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-green-900">
                          Winner! {matchedBalls} sequential matches
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700 text-center">
                        {matchedBalls === 1 
                          ? '1 match - No prize (need 2+ sequential)'
                          : 'No sequential matches - Better luck next time!'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Waiting for Draw */}
              {!hasWinningNumbers && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900 text-center font-medium">
                    Awaiting draw results...
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {hasWinningNumbers && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Legend</p>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-green-100 border-2 border-green-400"></div>
              <span className="text-gray-700">Matched</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-red-100 border-2 border-red-400"></div>
              <span className="text-gray-700">First mismatch</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white border-2 border-gray-300"></div>
              <span className="text-gray-700">Not checked</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
