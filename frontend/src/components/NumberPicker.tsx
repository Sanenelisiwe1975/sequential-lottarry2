'use client';

import { useState } from 'react';

interface NumberPickerProps {
  selectedNumbers: number[];
  onNumbersChange: (numbers: number[]) => void;
  maxNumbers: number;
}

export default function NumberPicker({ 
  selectedNumbers, 
  onNumbersChange, 
  maxNumbers 
}: NumberPickerProps) {
  const totalNumbers = 49;
  
  const handleNumberClick = (num: number) => {
    if (selectedNumbers.includes(num)) {
      // Remove number
      onNumbersChange(selectedNumbers.filter(n => n !== num));
    } else {
      // Add number if not at max
      if (selectedNumbers.length < maxNumbers) {
        onNumbersChange([...selectedNumbers, num]);
      }
    }
  };

  const handleQuickPick = () => {
    const numbers: number[] = [];
    while (numbers.length < maxNumbers) {
      const num = Math.floor(Math.random() * totalNumbers) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    onNumbersChange(numbers.sort((a, b) => a - b));
  };

  const handleClear = () => {
    onNumbersChange([]);
  };

  return (
    <div>
      {/* Selected Numbers Display */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
        <p className="text-sm font-semibold text-blue-900 mb-3 uppercase tracking-wide">
          Selected Numbers ({selectedNumbers.length}/{maxNumbers})
        </p>
        <div className="flex gap-2 flex-wrap min-h-[3.5rem] items-center">
          {selectedNumbers.length === 0 ? (
            <p className="text-blue-700 text-sm italic">
              Select {maxNumbers} numbers below to continue
            </p>
          ) : (
            selectedNumbers.map((num, idx) => (
              <div
                key={idx}
                className="relative group"
              >
                <div className="w-14 h-14 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-sm border-2 border-blue-600">
                  {num}
                </div>
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-900 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                  {idx + 1}
                </div>
              </div>
            ))
          )}
        </div>
        
        {selectedNumbers.length > 0 && selectedNumbers.length < maxNumbers && (
          <p className="text-sm text-blue-700 mt-3 font-medium">
            Select {maxNumbers - selectedNumbers.length} more number{maxNumbers - selectedNumbers.length !== 1 ? 's' : ''}
          </p>
        )}
        
        {selectedNumbers.length === maxNumbers && (
          <div className="mt-3 bg-green-100 border border-green-300 rounded-lg p-2">
            <p className="text-sm text-green-900 font-semibold text-center">
              Ready to purchase! All {maxNumbers} numbers selected
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleQuickPick}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-900 rounded-lg font-semibold hover:from-violet-200 hover:to-purple-200 transition-all border border-violet-300"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Quick Pick
          </div>
        </button>
        <button
          onClick={handleClear}
          disabled={selectedNumbers.length === 0}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-100 to-slate-100 text-gray-900 rounded-lg font-semibold hover:from-gray-200 hover:to-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All
          </div>
        </button>
      </div>

      {/* Number Grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <p className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          Choose Your Numbers (1-49)
        </p>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: totalNumbers }, (_, i) => i + 1).map((num) => {
            const isSelected = selectedNumbers.includes(num);
            const selectionIndex = selectedNumbers.indexOf(num);
            const isDisabled = !isSelected && selectedNumbers.length >= maxNumbers;

            return (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                disabled={isDisabled}
                className={`
                  relative aspect-square rounded-lg font-bold text-base
                  transition-all duration-200 border-2
                  ${isSelected
                    ? 'bg-blue-500 text-white border-blue-600 shadow-md scale-105'
                    : isDisabled
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-900 border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                  }
                `}
              >
                {num}
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-900 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
                    {selectionIndex + 1}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-slate-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-900 font-semibold mb-1">
              How to Play
            </p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-slate-400 font-bold">•</span>
                <span>Select {maxNumbers} numbers or use Quick Pick for random selection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 font-bold">•</span>
                <span>Numbers must match sequentially to win prizes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-400 font-bold">•</span>
                <span>The more sequential matches, the bigger the prize</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
