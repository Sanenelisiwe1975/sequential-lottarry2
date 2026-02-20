# Sequential Lottery Smart Contract

A Solidity-based lottery system where players must match 7 numbers (1-49) in **sequential order** to win.

## Features

- **7-Ball Sequential Lottery**: Players choose 7 numbers from 1 to 49
- **Strict Sequential Matching**: All 7 numbers must match in exact order to win
- **Round-Based System**: Multiple lottery rounds with configurable duration
- **Prize Pool**: All ticket sales contribute to the prize pool
- **Multiple Winners**: Prize pool is split equally among all winners
- **Claimable Winnings**: Winners can claim their prizes anytime

## How It Works

### 1. Buying a Ticket

Players select 7 numbers between 1 and 49:
```solidity
buyTicket([7, 14, 21, 28, 35, 42, 49])
```

- Pay the ticket price (default: 0.01 ETH)
- Numbers must be between 1-49
- Numbers can repeat
- Purchase must be during an active round

### 2. Drawing the Lottery

When the round ends, the owner draws the lottery:
```solidity
drawLottery()
```

- Generates 7 random numbers (1-49)
- Checks all tickets for sequential matches
- Distributes prize pool to winners

### 3. Winning Condition

**You MUST match ALL 7 numbers in EXACT sequential order!**

Example:
- Your ticket: `[7, 14, 21, 28, 35, 42, 49]`
- Winning numbers: `[7, 14, 21, 28, 35, 42, 49]` ✅ **WINNER!**
- Winning numbers: `[7, 14, 21, 28, 35, 42, 48]` ❌ (7th number different)
- Winning numbers: `[14, 7, 21, 28, 35, 42, 49]` ❌ (wrong order)

### 4. Claiming Winnings

Winners can claim their share:
```solidity
claimWinnings()
```

## Contract Functions

### Player Functions

- `buyTicket(uint8[7] numbers)` - Purchase a lottery ticket
- `claimWinnings()` - Claim your winnings
- `getCurrentRound()` - View current round information
- `getWinningNumbers(uint256 roundId)` - View winning numbers for a drawn round
- `getRoundWinners(uint256 roundId)` - View winners of a round

### Owner Functions

- `startNewRound(uint256 duration)` - Start a new lottery round
- `drawLottery()` - Draw the lottery and determine winners
- `setTicketPrice(uint256 newPrice)` - Update ticket price for future rounds
- `emergencyWithdraw()` - Emergency fund withdrawal

## Deployment Instructions

### Using Remix IDE

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create a new file `SequentialLottery.sol`
3. Paste the contract code
4. Select compiler version `0.8.0` or higher
5. Compile the contract
6. Deploy to your preferred network (testnet recommended for testing)

### Using Hardhat

```bash
npm install --save-dev hardhat
npx hardhat init
```

Place the contract in `contracts/SequentialLottery.sol` and deploy:

```javascript
const SequentialLottery = await ethers.getContractFactory("SequentialLottery");
const lottery = await SequentialLottery.deploy();
await lottery.deployed();
```

## Example Usage Flow

```javascript
// 1. Owner starts a new round (24 hours duration)
await lottery.startNewRound(86400);

// 2. Players buy tickets
await lottery.buyTicket([1, 2, 3, 4, 5, 6, 7], { value: ethers.utils.parseEther("0.01") });
await lottery.buyTicket([10, 20, 30, 40, 41, 42, 43], { value: ethers.utils.parseEther("0.01") });

// 3. Wait for round to end...

// 4. Owner draws the lottery
await lottery.drawLottery();

// 5. Check winning numbers
const winningNumbers = await lottery.getWinningNumbers(1);
console.log("Winning numbers:", winningNumbers);

// 6. Winners claim their prizes
await lottery.claimWinnings();
```

## Important Security Notes

⚠️ **RANDOMNESS WARNING**: This contract uses pseudo-random number generation which is **NOT secure for production**. 

For production use, integrate **Chainlink VRF** (Verifiable Random Function) for provably fair randomness:

```solidity
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
```

## Gas Optimization Tips

- Buy tickets early in the round to avoid high gas fees
- Claim winnings in batches if you win multiple rounds
- Consider the number of participants (more tickets = higher gas for drawing)

## Testing Checklist

- ✅ Buy ticket with valid numbers
- ✅ Try buying with invalid numbers (should fail)
- ✅ Try buying after round ends (should fail)
- ✅ Draw lottery and verify winners
- ✅ Claim winnings successfully
- ✅ Try claiming twice (should fail)
- ✅ Start new round after drawing

## Contract Variables

- `ticketPrice`: Current price per ticket (0.01 ETH default)
- `currentRoundId`: ID of the active lottery round
- `MIN_NUMBERS`: Minimum number value (1)
- `MAX_NUMBERS`: Maximum number value (49)
- `NUMBERS_COUNT`: Count of numbers per ticket (7)

## Events

- `TicketPurchased`: Emitted when a player buys a ticket
- `LotteryDrawn`: Emitted when lottery is drawn with winning numbers
- `WinningsClaimed`: Emitted when a player claims winnings
- `NewRoundStarted`: Emitted when a new round begins

## License

MIT License - Feel free to use and modify for your projects!

## Disclaimer

This contract is for educational purposes. Always audit smart contracts before deploying to mainnet. The sequential matching requirement makes winning very difficult - adjust the game mechanics as needed for your use case.
