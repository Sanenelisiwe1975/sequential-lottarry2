'use client';

import { useState } from 'react';

interface NumberPickerProps {
  onNumbersSelected: (numbers: number[]) => void;
  disabled?: boolean;
}

export default function NumberPicker({ onNumbersSelected, disabled = false }: NumberPickerProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  const handleNumberClick = (num: number) => {
    if (disabled) return;

    if (selectedNumbers.includes(num)) {
      // Remove number
      const newNumbers = selectedNumbers.filter(n => n !== num);
      setSelectedNumbers(newNumbers);
      onNumbersSelected(newNumbers);
    } else {
      // Add number (max 7)
      if (selectedNumbers.length < 7) {
        const newNumbers = [...selectedNumbers, num].sort((a, b) => a - b);
        setSelectedNumbers(newNumbers);
        onNumbersSelected(newNumbers);
      }
    }
  };

  const handleQuickPick = () => {
    if (disabled) return;
    
    const numbers: number[] = [];
    while (numbers.length < 7) {
      const num = Math.floor(Math.random() * 49) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    const sortedNumbers = numbers.sort((a, b) => a - b);
    setSelectedNumbers(sortedNumbers);
    onNumbersSelected(sortedNumbers);
  };

  const handleClear = () => {
    if (disabled) return;
    setSelectedNumbers([]);
    onNumbersSelected([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Pick Your Numbers</h3>
        <div className="flex gap-2">
          <button
            onClick={handleQuickPick}
            disabled={disabled}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Quick Pick
          </button>
          <button
            onClick={handleClear}
            disabled={disabled || selectedNumbers.length === 0}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Selected Numbers Display */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-blue-900">
            Selected: {selectedNumbers.length}/7
          </span>
          {selectedNumbers.length === 7 && (
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
              ✓ Ready
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap min-h-[48px] items-center">
          {selectedNumbers.length === 0 ? (
            <span className="text-gray-400 text-sm">Select 7 numbers from the grid below</span>
          ) : (
            selectedNumbers.map((num) => (
              <div
                key={num}
                className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-lg shadow-md"
              >
                {num}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Number Grid */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {Array.from({ length: 49 }, (_, i) => i + 1).map((num) => {
          const isSelected = selectedNumbers.includes(num);
          return (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              disabled={disabled}
              className={`
                h-12 rounded-lg font-semibold text-base transition-all
                ${isSelected
                  ? 'bg-blue-600 text-white shadow-lg scale-105 border-2 border-blue-700'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}
              `}
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* Helper Text */}
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium mb-1">💡 Tips:</p>
        <ul className="space-y-1 text-xs">
          <li>• Click numbers to select/deselect</li>
          <li>• Numbers are automatically sorted in ascending order</li>
          <li>• You must select exactly 7 numbers to buy a ticket</li>
          <li>• Use "Quick Pick" for random selection</li>
        </ul>
      </div>
    </div>
  );
}