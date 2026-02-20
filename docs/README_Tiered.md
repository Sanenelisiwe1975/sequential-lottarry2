# Tiered Sequential Lottery Smart Contract

A Solidity-based lottery system with **tiered prizes** based on sequential number matching. Players choose 7 numbers (1-49), and prizes are awarded based on how many numbers match **sequentially from the start**.

## Revenue Distribution

**From Each Ticket Sale:**
- **10% → Owner Fee** (accumulated and withdrawable by owner)
- **90% → Prize Pool** (distributed to winners or carried over)

## Prize Distribution System

The **90% prize pool** is distributed according to these tiers:

| Sequential Matches | Prize Percentage | Example Prize (100 ETH pool) |
|-------------------|------------------|------------------------------|
| 1 ball            | 0%               | 0 ETH                        |
| 2 balls           | 5%               | 5 ETH (split among winners)  |
| 3 balls           | 10%              | 10 ETH (split among winners) |
| 4 balls           | 15%              | 15 ETH (split among winners) |
| 5 balls           | 20%              | 20 ETH (split among winners) |
| 6 balls           | 20%              | 20 ETH (split among winners) |
| 7 balls (JACKPOT) | 30%              | 30 ETH (split among winners) |

**Total: 100% of prize pool**

## Unclaimed Prizes Carry Over

**Important:** If a prize tier has no winners, that portion of the prize pool **automatically carries over to the next round**!

For example:
- Round 1: Prize pool is 10 ETH
- No one matches 7 balls (30% tier)
- 3 ETH carries over to Round 2
- Round 2 starts with 3 ETH + new ticket sales

## How Sequential Matching Works

Numbers must match **from the beginning** in exact order. Once a number doesn't match, counting stops.

### Examples:

**Winning Numbers: [7, 14, 21, 28, 35, 42, 49]**

| Your Ticket | Result | Matches | Prize Tier |
|-------------|--------|---------|------------|
| [7, 14, 21, 28, 35, 42, 49] | ✅ Perfect! | 7 | 30% (JACKPOT) |
| [7, 14, 21, 28, 35, 42, 48] | ⚠️ Good! | 6 | 20% |
| [7, 14, 21, 28, 35, 99, 99] | ⚠️ Good! | 5 | 20% |
| [7, 14, 21, 28, 99, 99, 99] | ⚠️ OK | 4 | 15% |
| [7, 14, 21, 99, 99, 99, 99] | ⚠️ OK | 3 | 10% |
| [7, 14, 99, 99, 99, 99, 99] | ⚠️ Small | 2 | 5% |
| [7, 99, 99, 99, 99, 99, 99] | ❌ Nothing | 1 | 0% |
| [99, 7, 14, 21, 28, 35, 42] | ❌ Nothing | 0 | 0% |

**Key Point**: The match **stops** at the first wrong number!

## Example Prize Distribution

Let's say **100 tickets** are sold at **0.01 ETH each** = **1 ETH total revenue**:

**Revenue Split:**
- Owner fee (10%): **0.1 ETH** → Goes to owner balance
- Prize pool (90%): **0.9 ETH** → Available for winners

**Prize Distribution (from 0.9 ETH pool):**
- 2 players matched 7 balls → Share 0.27 ETH (30%) = **0.135 ETH each**
- 5 players matched 6 balls → Share 0.18 ETH (20%) = **0.036 ETH each**
- 10 players matched 5 balls → Share 0.18 ETH (20%) = **0.018 ETH each**
- 20 players matched 4 balls → Share 0.135 ETH (15%) = **0.00675 ETH each**
- 30 players matched 3 balls → Share 0.09 ETH (10%) = **0.003 ETH each**
- 50 players matched 2 balls → Share 0.045 ETH (5%) = **0.0009 ETH each**

**If some tiers have no winners:**
- Unawarded portions carry over to Round 2
- Example: No 7-ball winners → 0.27 ETH carries over

## Smart Contract Features

### Player Functions

- **`buyTicket(uint8[7] numbers)`** - Purchase a lottery ticket
  - Pay ticket price (default 0.01 ETH)
  - Choose 7 numbers between 1-49
  - Numbers can repeat

- **`claimWinnings()`** - Claim your accumulated winnings
  - Can claim at any time after winning
  - Automatically transfers to your wallet

- **`getMyTickets(uint256 roundId)`** - View your tickets for a round
  - See all your purchased tickets
  - Check matched balls after draw

- **`getCurrentRoundInfo()`** - Get current round details
  - Prize pool amount
  - Start/end times
  - Draw status

- **`getWinningNumbers(uint256 roundId)`** - View winning numbers (after draw)

- **`getAllTierInfo(uint256 roundId)`** - See all tier results
  - Number of winners per tier
  - Prize amounts per tier

- **`getCarryOverBalance()`** - Check how much will carry to next round

### Owner Functions

- **`startNewRound(uint256 duration)`** - Start a new lottery round
  - Automatically adds carry over balance from previous round
  
- **`drawLottery()`** - Draw winning numbers and distribute prizes
  - Calculates unclaimed prizes for carry over

- **`withdrawOwnerFees()`** - Withdraw accumulated 10% fees
  - Owner can claim their earnings anytime

- **`getOwnerBalance()`** - Check accumulated owner fees

- **`setTicketPrice(uint256 newPrice)`** - Update ticket price

- **`emergencyWithdraw()`** - Emergency fund withdrawal (use with caution)

## Deployment Guide

### Using Remix IDE

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create new file: `TieredSequentialLottery.sol`
3. Paste the contract code
4. Select Solidity compiler `0.8.0+`
5. Compile the contract
6. Deploy to testnet (Sepolia, Mumbai, etc.)

### Using Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

Create `scripts/deploy.js`:

```javascript
async function main() {
  const TieredSequentialLottery = await ethers.getContractFactory("TieredSequentialLottery");
  const lottery = await TieredSequentialLottery.deploy();
  await lottery.waitForDeployment();
  
  console.log("Lottery deployed to:", await lottery.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Usage Example

```javascript
// 1. Buy tickets
await lottery.buyTicket([7, 14, 21, 28, 35, 42, 49], { 
  value: ethers.parseEther("0.01") 
});

// 2. Check current round
const roundInfo = await lottery.getCurrentRoundInfo();
console.log("Prize Pool:", ethers.formatEther(roundInfo.prizePool), "ETH");

// 3. Wait for round to end, then owner draws
await lottery.drawLottery();

// 4. Check results
const winningNumbers = await lottery.getWinningNumbers(1);
console.log("Winning Numbers:", winningNumbers);

// 5. View tier breakdown
const [matches, counts, prizes] = await lottery.getAllTierInfo(1);
for (let i = 0; i < matches.length; i++) {
  console.log(`${matches[i]} matches: ${counts[i]} winners, ${ethers.formatEther(prizes[i])} ETH each`);
}

// 6. Check your tickets
const myTickets = await lottery.getMyTickets(1);
myTickets.forEach(ticket => {
  console.log("Your numbers:", ticket.numbers);
  console.log("Matched balls:", ticket.matchedBalls);
});

// 7. Claim winnings
const winnings = await lottery.playerWinnings(yourAddress);
if (winnings > 0) {
  await lottery.claimWinnings();
}

// 8. Check carry over and owner balance
const carryOver = await lottery.getCarryOverBalance();
console.log("Carry over to next round:", ethers.formatEther(carryOver), "ETH");

const ownerFees = await lottery.getOwnerBalance();
console.log("Owner accumulated fees:", ethers.formatEther(ownerFees), "ETH");

// 9. Owner withdraws fees
await lottery.withdrawOwnerFees();
```

## Key Concepts

### Owner Fee (10%)
- Deducted from each ticket purchase
- Accumulated in `ownerBalance`
- Owner can withdraw anytime using `withdrawOwnerFees()`
- Separate from prize pool

### Sequential Matching
- Matches are counted **from position 0 onwards**
- Stops at the **first mismatch**
- Order matters: [7, 14, 21] ≠ [14, 7, 21]

### Prize Pool Distribution
- 90% of ticket sales go to prize pool (after 10% owner fee)
- Distributed across 6 tiers (2-7 matches)
- Each tier's prize is split equally among winners
- **Unclaimed prizes automatically carry over to next round**

### Carry Over Mechanism
- If a tier has no winners, that prize percentage isn't lost
- Unclaimed amounts accumulate in `carryOverBalance`
- Next round starts with: carry over + 90% of new ticket sales
- Creates growing jackpots if high tiers go unclaimed

### Multiple Winners
If multiple players match the same tier, they **share** that tier's allocation:
- 10 ETH pool, 5% tier = 0.5 ETH total
- 10 winners in that tier = 0.05 ETH each

## Gas Optimization Tips

- Buy tickets early (less competition for block space)
- Claim winnings in batches if you play multiple rounds
- Drawing lottery can be gas-intensive with many tickets (owner pays)

## Testing Checklist

✅ Buy ticket with valid numbers  
✅ Buy ticket with invalid numbers (should fail)  
✅ Buy ticket with wrong payment (should fail)  
✅ Draw lottery and verify tier distribution  
✅ Verify sequential matching logic  
✅ Claim winnings from multiple tiers  
✅ Try claiming twice (should fail)  
✅ Verify 100% of pool is distributed  

## Security Considerations

### ⚠️ IMPORTANT: Random Number Generation

This contract uses **pseudo-random** number generation which is **NOT SECURE** for production use.

**For Production**: Integrate **Chainlink VRF** (Verifiable Random Function):

```solidity
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
```

### Other Security Notes
- Contract has been designed to prevent reentrancy attacks
- Owner cannot manipulate drawings after tickets are sold
- Prize distribution is deterministic and transparent
- All state changes emit events for transparency

## Events

The contract emits these events for tracking:

- `TicketPurchased` - When a player buys a ticket
- `LotteryDrawn` - When winning numbers are generated
- `WinnerDetermined` - For each winner in each tier
- `TierSummary` - Summary of each tier's results
- `WinningsClaimed` - When a player claims winnings
- `NewRoundStarted` - When a new round begins

## Frequently Asked Questions

**Q: What if no one matches 7 balls?**  
A: The 30% allocation for that tier remains in the contract and can be managed by the owner.

**Q: Can I buy multiple tickets?**  
A: Yes! Buy as many as you want with different number combinations.

**Q: How long do I have to claim winnings?**  
A: Indefinitely - winnings are held until you claim them.

**Q: Can the same numbers win in multiple tiers?**  
A: No - each ticket is assigned to only one tier (its highest sequential match count).

**Q: What happens to the prize pool if there are no winners?**  
A: Unclaimed portions automatically carry over to the next round, creating bigger jackpots!

**Q: How does the owner fee work?**  
A: 10% of every ticket sale goes to the owner's balance. The owner can withdraw these fees at any time using `withdrawOwnerFees()`.

**Q: What if Round 2 also has unclaimed prizes?**  
A: They continue to carry over! The carry over balance keeps growing until someone wins that tier.

## License

MIT License - Free to use and modify!

## Support

For issues, questions, or contributions, please refer to the contract code and comments.

---

**Disclaimer**: This is educational software. Always audit smart contracts before deploying to mainnet with real funds. The sequential matching requirement makes winning challenging - adjust game parameters as needed for your use case.
