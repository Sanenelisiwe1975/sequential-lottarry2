'use client';

interface PrizeTiersProps {
  prizeTiers: any;
  prizePool: bigint | undefined;
}

export default function PrizeTiers({ prizeTiers, prizePool }: PrizeTiersProps) {
  if (!prizeTiers) return null;

  // VERY LIGHT professional colors with excellent readability
  const getTierStyles = (matchCount: number) => {
    const styles = {
      7: { // Jackpot
        bg: 'from-amber-50 to-yellow-50',
        border: 'border-amber-200',
        text: 'text-amber-800',
        badge: 'bg-amber-100 text-amber-900',
        circle: 'bg-amber-100 text-amber-900',
        label: 'JACKPOT'
      },
      6: { // Tier 2
        bg: 'from-violet-50 to-purple-50',
        border: 'border-violet-200',
        text: 'text-violet-800',
        badge: 'bg-violet-100 text-violet-900',
        circle: 'bg-violet-100 text-violet-900',
        label: 'TIER 2'
      },
      5: { // Tier 3
        bg: 'from-blue-50 to-sky-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        badge: 'bg-blue-100 text-blue-900',
        circle: 'bg-blue-100 text-blue-900',
        label: 'TIER 3'
      },
      4: { // Tier 4
        bg: 'from-emerald-50 to-green-50',
        border: 'border-emerald-200',
        text: 'text-emerald-800',
        badge: 'bg-emerald-100 text-emerald-900',
        circle: 'bg-emerald-100 text-emerald-900',
        label: 'TIER 4'
      },
      3: { // Tier 5
        bg: 'from-cyan-50 to-teal-50',
        border: 'border-cyan-200',
        text: 'text-cyan-800',
        badge: 'bg-cyan-100 text-cyan-900',
        circle: 'bg-cyan-100 text-cyan-900',
        label: 'TIER 5'
      },
      2: { // Tier 6
        bg: 'from-gray-50 to-slate-50',
        border: 'border-gray-200',
        text: 'text-gray-800',
        badge: 'bg-gray-100 text-gray-900',
        circle: 'bg-gray-100 text-gray-900',
        label: 'TIER 6'
      }
    };
    
    return styles[matchCount as keyof typeof styles] || styles[2];
  };

  const calculateTierPrize = (percentage: number) => {
    if (!prizePool) return '0.0000';
    const prize = (prizePool * BigInt(percentage)) / 10000n;
    return (Number(prize) / 1e18).toFixed(4);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-900 mb-1">Prize Distribution</h3>
        <p className="text-sm text-gray-600">
          Match numbers sequentially to win
        </p>
      </div>

      <div className="space-y-3">
        {prizeTiers
          .slice()
          .reverse()
          .map((tier: any, idx: number) => {
            const matchCount = tier.matchCount;
            const percentage = tier.percentage / 100;
            
            if (matchCount === 1) return null;

            const styles = getTierStyles(matchCount);

            return (
              <div
                key={idx}
                className={`
                  bg-gradient-to-r ${styles.bg} 
                  rounded-lg p-4 border ${styles.border}
                  hover:shadow-sm transition-all duration-200
                `}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left side - Badge and Info */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Number Badge - NO EMOJI */}
                    <div className={`
                      flex-shrink-0 w-14 h-14 rounded-lg
                      ${styles.circle}
                      flex items-center justify-center
                      font-bold border ${styles.border}
                    `}>
                      <div className="text-center">
                        <div className="text-xl font-bold leading-none">{matchCount}</div>
                        <div className="text-[10px] font-semibold uppercase leading-none mt-0.5">
                          {matchCount === 1 ? 'Ball' : 'Balls'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Tier Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`
                          px-2.5 py-0.5 rounded-md text-xs font-bold uppercase
                          ${styles.badge} border ${styles.border}
                        `}>
                          {styles.label}
                        </span>
                      </div>
                      <div className={`font-semibold text-base ${styles.text}`}>
                        {matchCount} Sequential Matches
                      </div>
                      <div className="text-sm text-gray-600 font-medium mt-0.5">
                        {percentage}% of prize pool
                      </div>
                    </div>
                  </div>
                  
                  {/* Right side - Prize Amount */}
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${styles.text}`}>
                      {calculateTierPrize(tier.percentage)}
                    </div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                      ETH
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Split among winners
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-blue-900 font-semibold mb-1">
              How Prizes Work
            </p>
            <p className="text-sm text-blue-800 leading-relaxed">
              Prizes in each tier are split equally among all winners. 
              Any unclaimed prizes automatically carry over to the next round.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
