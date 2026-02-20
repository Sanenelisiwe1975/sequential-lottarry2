# Lottery Revenue Flow & Carry Over Mechanism

## Revenue Flow Per Round

```
┌─────────────────────────────────────────────────────────────┐
│                    TICKET SALES (100%)                      │
│                    Example: 100 ETH                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │    REVENUE DISTRIBUTION     │
              └─────────────────────────────┘
                     │              │
                     │              │
        ┌────────────┘              └─────────────┐
        ▼                                         ▼
┌──────────────────┐                    ┌──────────────────┐
│   OWNER FEE      │                    │   PRIZE POOL     │
│      10%         │                    │      90%         │
│    (10 ETH)      │                    │    (90 ETH)      │
└──────────────────┘                    └──────────────────┘
        │                                         │
        │                                         ▼
        │                          ┌──────────────────────────┐
        │                          │  PRIZE DISTRIBUTION      │
        │                          │  (Based on Winners)      │
        │                          └──────────────────────────┘
        │                                         │
        │                          ┌──────────────┴──────────────┐
        │                          │                             │
        ▼                          ▼                             ▼
┌──────────────────┐    ┌──────────────────┐        ┌──────────────────┐
│ Owner Balance    │    │  Player Winnings │        │  Carry Over      │
│ (Withdrawable)   │    │  (Claimable)     │        │  (To Next Round) │
└──────────────────┘    └──────────────────┘        └──────────────────┘
```

## Prize Pool Distribution (90 ETH Example)

```
                    ┌──────────────────────────────┐
                    │    PRIZE POOL: 90 ETH        │
                    │    (90% of ticket sales)     │
                    └──────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │   TIER ALLOCATION         │
                    └─────────────┬─────────────┘
                                  │
        ┌─────────┬───────┬───────┼───────┬───────┬─────────┐
        │         │       │       │       │       │         │
        ▼         ▼       ▼       ▼       ▼       ▼         ▼
    ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
    │2 BALL│ │3 BALL│ │4 BALL│ │5 BALL│ │6 BALL│ │7 BALL│
    │  5%  │ │ 10%  │ │ 15%  │ │ 20%  │ │ 20%  │ │ 30%  │
    │4.5ETH│ │ 9ETH │ │13.5  │ │ 18   │ │ 18   │ │ 27   │
    └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘
       │        │        │        │        │        │
       ▼        ▼        ▼        ▼        ▼        ▼
  ┌────────────────────────────────────────────────────┐
  │         Has Winners?                               │
  └────────────────────────────────────────────────────┘
       │                                            │
       ▼ YES                                   NO  ▼
  ┌─────────────┐                          ┌──────────────┐
  │ Split among │                          │ CARRY OVER   │
  │  Winners    │                          │ to Next Round│
  └─────────────┘                          └──────────────┘
```

## Multi-Round Carry Over Example

### Round 1
```
Starting Balance: 0 ETH
Ticket Sales: 100 tickets × 0.01 ETH = 1 ETH

Revenue Split:
├─ Owner Fee (10%): 0.1 ETH → Owner Balance
└─ Prize Pool (90%): 0.9 ETH

Results:
├─ 2 balls (5%): 10 winners → 0.045 ETH distributed
├─ 3 balls (10%): 5 winners → 0.09 ETH distributed
├─ 4 balls (15%): 3 winners → 0.135 ETH distributed
├─ 5 balls (20%): 0 winners → 0.18 ETH CARRIES OVER ✓
├─ 6 balls (20%): 0 winners → 0.18 ETH CARRIES OVER ✓
└─ 7 balls (30%): 0 winners → 0.27 ETH CARRIES OVER ✓

Total Carry Over to Round 2: 0.63 ETH
```

### Round 2
```
Starting Balance: 0.63 ETH (from Round 1)
Ticket Sales: 150 tickets × 0.01 ETH = 1.5 ETH

Revenue Split:
├─ Owner Fee (10%): 0.15 ETH → Owner Balance
└─ Prize Pool (90%): 1.35 ETH

Prize Pool Calculation:
  Carry Over: 0.63 ETH
+ New Sales:  1.35 ETH
─────────────────────
  Total Pool: 1.98 ETH  ← BIGGER JACKPOT!

Results:
├─ 2 balls (5%): 20 winners → 0.099 ETH distributed
├─ 3 balls (10%): 15 winners → 0.198 ETH distributed
├─ 4 balls (15%): 8 winners → 0.297 ETH distributed
├─ 5 balls (20%): 2 winners → 0.396 ETH distributed ✓
├─ 6 balls (20%): 1 winner → 0.396 ETH distributed ✓
└─ 7 balls (30%): 0 winners → 0.594 ETH CARRIES OVER ✓

Total Carry Over to Round 3: 0.594 ETH
```

### Round 3
```
Starting Balance: 0.594 ETH (from Round 2)
Ticket Sales: 200 tickets × 0.01 ETH = 2 ETH

Prize Pool Calculation:
  Carry Over: 0.594 ETH
+ New Sales:  1.8 ETH (90% of 2 ETH)
─────────────────────
  Total Pool: 2.394 ETH  ← EVEN BIGGER!

The jackpot keeps growing until someone wins!
```

## Owner Balance Accumulation

```
Round 1: 0.1 ETH collected
Round 2: 0.15 ETH collected
Round 3: 0.2 ETH collected
─────────────────────────
Total Owner Balance: 0.45 ETH (withdrawable anytime)
```

## Key Features Summary

✓ **10% Owner Fee** - Automatic deduction from each ticket
✓ **90% Prize Pool** - Available for distribution
✓ **Automatic Carry Over** - Unclaimed prizes roll to next round
✓ **Growing Jackpots** - Prizes accumulate until won
✓ **Transparent** - All amounts tracked on-chain
✓ **Separate Balances** - Owner fees separate from prize pool

## Winner Claim Flow

```
Player buys ticket → Round ends → Lottery drawn
                                       │
                    ┌──────────────────┴────────────────┐
                    │                                   │
                    ▼                                   ▼
            Ticket matches              Ticket doesn't match
            (2+ sequential)              or matches 0-1
                    │                           │
                    ▼                           ▼
        Prize added to                    No prize
        playerWinnings[address]
                    │
                    ▼
        Player calls claimWinnings()
                    │
                    ▼
        ETH transferred to player wallet
```

## Contract Balance Breakdown

At any time, the contract holds:

```
Contract Balance = Player Winnings + Owner Balance + Carry Over Balance

Example:
  Player Winnings (unclaimed): 0.5 ETH
+ Owner Balance: 0.3 ETH
+ Carry Over Balance: 0.8 ETH
────────────────────────────────────
  Total Contract Balance: 1.6 ETH
```

## Security Notes

- Owner fees are separate from prize pool (can't affect prizes)
- Carry over is automatic (owner can't claim it)
- Players can claim winnings anytime
- All transactions are transparent on-chain
- Emergency withdraw available for critical issues only
