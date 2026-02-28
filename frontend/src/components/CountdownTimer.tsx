'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: bigint | number;
  onComplete?: () => void;
}

export default function CountdownTimer({ endTime, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    total: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({
    total: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTimeNumber = typeof endTime === 'bigint' ? Number(endTime) : endTime;
      const now = Math.floor(Date.now() / 1000);
      const difference = endTimeNumber - now;

      if (difference <= 0) {
        setTimeLeft({
          total: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
        });
        if (onComplete) {
          onComplete();
        }
        return;
      }

      const minutes = Math.floor(difference / 60);
      const seconds = difference % 60;

      setTimeLeft({
        total: difference,
        minutes,
        seconds,
        isExpired: false,
      });
    };

    // Initial calculation
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime, onComplete]);

  const getProgressPercentage = () => {
    const roundDuration = 5 * 60; // 5 minutes in seconds
    const elapsed = roundDuration - timeLeft.total;
    return (elapsed / roundDuration) * 100;
  };

  const getStatusColor = () => {
    if (timeLeft.isExpired) return 'bg-red-500';
    if (timeLeft.total < 60) return 'bg-orange-500 animate-pulse';
    if (timeLeft.total < 120) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = () => {
    if (timeLeft.isExpired) return 'text-red-600';
    if (timeLeft.total < 60) return 'text-orange-600';
    if (timeLeft.total < 120) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (timeLeft.isExpired) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center">
        <div className="text-red-600 font-bold text-lg mb-2">⏰ Round Ended</div>
        <p className="text-red-500 text-sm">Waiting for lottery draw...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-blue-300 rounded-xl p-6">
      {/* Countdown Display */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 font-semibold mb-2">⏱️ Time Remaining</p>
        <div className="flex items-center justify-center gap-2">
          {/* Minutes */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 min-w-[80px] shadow-lg">
            <div className="text-4xl font-bold text-white">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-blue-100 uppercase tracking-wider">Minutes</div>
          </div>

          {/* Separator */}
          <div className="text-4xl font-bold text-blue-600 animate-pulse">:</div>

          {/* Seconds */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 min-w-[80px] shadow-lg">
            <div className="text-4xl font-bold text-white">
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-purple-100 uppercase tracking-wider">Seconds</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${getStatusColor()}`}
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Status Message */}
      <div className={`text-center text-sm font-semibold ${getTextColor()}`}>
        {timeLeft.total < 60 && '🔥 Hurry! Less than 1 minute left!'}
        {timeLeft.total >= 60 && timeLeft.total < 120 && '⚡ Only 2 minutes remaining!'}
        {timeLeft.total >= 120 && timeLeft.total < 180 && '✨ 3 minutes left to play!'}
        {timeLeft.total >= 180 && '🎰 Round in progress - Buy your ticket now!'}
      </div>
    </div>
  );
}
