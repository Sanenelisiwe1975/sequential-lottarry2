# Chainlink VRF Integration Guide

## 🔗 What is Chainlink VRF?

**Chainlink VRF (Verifiable Random Function)** provides cryptographically secure random numbers on-chain. This is ESSENTIAL for lottery contracts to ensure:
- ✅ **Provably Fair** - Numbers are verifiably random
- ✅ **Tamper-Proof** - Cannot be manipulated by anyone
- ✅ **Transparent** - All randomness is on-chain and auditable

---

## 📋 Prerequisites

Before deploying, you need:

1. **Chainlink VRF Subscription**
   - Create at https://vrf.chain.link
   - Fund with LINK tokens

2. **LINK Tokens**
   - For testnet: Get from faucet
   - For mainnet: Purchase LINK

3. **Network Details**
   - VRF Coordinator address
   - Gas Lane (Key Hash)
   - Subscription ID

---

## 🌐 Network Configuration

### Sepolia Testnet

```solidity
VRF Coordinator: 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
Gas Lane (Key Hash): 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c
Callback Gas Limit: 2,500,000
Subscription Min: 2 LINK
```

**Get Testnet LINK:**
- Faucet: https://faucets.chain.link/sepolia

### Polygon Mumbai Testnet

```solidity
VRF Coordinator: 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed
Gas Lane (Key Hash): 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f
Callback Gas Limit: 2,500,000
Subscription Min: 0.5 LINK
```

**Get Testnet LINK:**
- Faucet: https://faucets.chain.link/mumbai

### Ethereum Mainnet

```solidity
VRF Coordinator: 0x271682DEB8C4E0901D1a1550aD2e64D568E69909
Gas Lane (500 gwei): 0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef
Callback Gas Limit: 2,500,000
```

### Polygon Mainnet

```solidity
VRF Coordinator: 0xAE975071Be8F8eE67addBC1A82488F1C24858067
Gas Lane (200 gwei): 0x6e099d640cde6de9d40ac749b4b594126b0169747122711109c9985d47751f93
Callback Gas Limit: 2,500,000
```

---

## 🚀 Step-by-Step Deployment

### Step 1: Get a Chainlink VRF Subscription

1. **Visit Chainlink VRF**
   - Testnet: https://vrf.chain.link
   - Select your network (Sepolia, Mumbai, etc.)

2. **Create Subscription**
   - Click "Create Subscription"
   - Confirm transaction
   - **Save your Subscription ID**

3. **Fund Subscription**
   - Add LINK tokens (minimum 2 LINK for testnet)
   - Get testnet LINK from faucet if needed

### Step 2: Deploy the Contract

#### Using Remix

1. **Install Chainlink Contracts**
   ```
   npm install @chainlink/contracts
   ```

2. **Deploy Contract with Constructor Parameters:**

   **For Sepolia Testnet:**
   ```solidity
   vrfCoordinator: 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
   gasLane: 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c
   subscriptionId: YOUR_SUBSCRIPTION_ID  // From Step 1
   callbackGasLimit: 2500000
   ```

   **For Mumbai Testnet:**
   ```solidity
   vrfCoordinator: 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed
   gasLane: 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f
   subscriptionId: YOUR_SUBSCRIPTION_ID
   callbackGasLimit: 2500000
   ```

3. **Deploy**
   - Click "Deploy"
   - Confirm transaction
   - **Save the contract address**

#### Using Hardhat

Create `scripts/deploy-vrf.js`:

```javascript
const hre = require("hardhat");

async function main() {
  // Network configurations
  const networks = {
    sepolia: {
      vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
      gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
      subscriptionId: "YOUR_SUBSCRIPTION_ID", // UPDATE THIS
      callbackGasLimit: "2500000"
    },
    mumbai: {
      vrfCoordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
      gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
      subscriptionId: "YOUR_SUBSCRIPTION_ID", // UPDATE THIS
      callbackGasLimit: "2500000"
    }
  };

  const network = hre.network.name;
  const config = networks[network];

  console.log("Deploying to", network);
  console.log("VRF Coordinator:", config.vrfCoordinator);
  console.log("Subscription ID:", config.subscriptionId);

  const LotteryVRF = await hre.ethers.getContractFactory("TieredSequentialLotteryVRF");
  const lottery = await LotteryVRF.deploy(
    config.vrfCoordinator,
    config.gasLane,
    config.subscriptionId,
    config.callbackGasLimit
  );

  await lottery.waitForDeployment();
  const address = await lottery.getAddress();

  console.log("Lottery deployed to:", address);
  console.log("\nIMPORTANT: Add this contract as a consumer to your VRF subscription!");
  console.log("Visit: https://vrf.chain.link");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Deploy:
```bash
npx hardhat run scripts/deploy-vrf.js --network sepolia
```

### Step 3: Add Contract as Consumer

**CRITICAL STEP - Don't skip this!**

1. **Go back to VRF Subscription**
   - Visit https://vrf.chain.link
   - Select your subscription

2. **Add Consumer**
   - Click "Add Consumer"
   - Paste your deployed contract address
   - Confirm transaction

3. **Verify**
   - Your contract should appear in the consumers list

---

## 🎮 How to Use the Contract

### Owner Functions

#### Start a New Round
```solidity
// Start 24-hour round
contract.startNewRound(86400);
```

#### Draw Lottery (Request Random Numbers)
```solidity
// This now requests random numbers from Chainlink VRF
contract.drawLottery();

// Emits: LotteryDrawRequested(roundId, requestId)
// Wait for Chainlink to fulfill the request
// Then emits: LotteryDrawn(roundId, winningNumbers)
```

**Important:** The draw is now a **two-step process**:
1. `drawLottery()` requests random numbers from Chainlink
2. Chainlink VRF calls back with random numbers (automatic)
3. Winners are determined and prizes distributed (automatic)

### Timeline

```
Owner calls drawLottery()
    ↓
VRF Request sent to Chainlink (instant)
    ↓
Chainlink processes request (1-3 minutes)
    ↓
fulfillRandomWords() called automatically
    ↓
Winning numbers generated
    ↓
Winners determined & prizes distributed
    ↓
Users can claim winnings
```

---

## 💰 Cost Estimation

### Gas Costs

| Operation | Estimated Gas | Cost (at 30 gwei) |
|-----------|---------------|-------------------|
| Deploy Contract | ~4,500,000 | ~0.135 ETH |
| Start Round | ~150,000 | ~0.0045 ETH |
| Buy Ticket | ~200,000 | ~0.006 ETH |
| Draw Lottery (request) | ~150,000 | ~0.0045 ETH |
| VRF Callback | ~800,000 | ~0.024 ETH |

### LINK Costs

- **Sepolia Testnet**: ~0.25 LINK per request
- **Mainnet**: ~0.25-2 LINK per request (varies by gas price)

**Important:** Make sure your subscription has enough LINK!

---

## 🔍 Monitoring & Debugging

### Check VRF Request Status

```javascript
// Get the VRF request ID
const roundInfo = await contract.lotteryRounds(roundId);
const requestId = roundInfo.vrfRequestId;

console.log("VRF Request ID:", requestId);
```

### View on VRF Dashboard

1. Visit https://vrf.chain.link
2. Select your subscription
3. View "Recent Requests"
4. Find your request by ID

### Common Issues

**Issue: "Request not fulfilled"**
- ✅ Check subscription has enough LINK
- ✅ Verify contract is added as consumer
- ✅ Wait 1-3 minutes for fulfillment

**Issue: "Insufficient funds"**
- ✅ Add more LINK to subscription
- ✅ Minimum 2 LINK recommended

**Issue: "Consumer not authorized"**
- ✅ Add contract address to subscription consumers
- ✅ Wait for transaction confirmation

---

## 📊 Differences from Original Contract

### What Changed?

1. **Constructor Parameters**
   ```solidity
   // Old (pseudo-random)
   constructor() { ... }
   
   // New (Chainlink VRF)
   constructor(
       address vrfCoordinator,
       bytes32 gasLane,
       uint64 subscriptionId,
       uint32 callbackGasLimit
   ) { ... }
   ```

2. **Draw Process**
   ```solidity
   // Old - instant draw
   function drawLottery() {
       winningNumbers = generateRandomNumbers(); // Pseudo-random
       distributePrizes();
   }
   
   // New - two-step process
   function drawLottery() {
       requestId = requestRandomWords(); // Request from Chainlink
       // Wait for callback...
   }
   
   function fulfillRandomWords(requestId, randomWords) {
       // Called automatically by Chainlink
       winningNumbers = convertToLotteryNumbers(randomWords);
       distributePrizes();
   }
   ```

3. **New Events**
   ```solidity
   event LotteryDrawRequested(uint256 indexed roundId, uint256 requestId);
   // Emitted when VRF request is made
   ```

### What Stayed the Same?

✅ All prize tiers (2-7 matches)
✅ 10% owner fee
✅ Carry over mechanism  
✅ Sequential matching logic
✅ All player functions (buyTicket, claimWinnings)
✅ All view functions

---

## 🧪 Testing

### Test on Sepolia

```bash
# 1. Deploy contract
npx hardhat run scripts/deploy-vrf.js --network sepolia

# 2. Add contract to VRF subscription
# (Do this on vrf.chain.link)

# 3. Test the flow
# - Start round
# - Buy tickets
# - End round
# - Draw lottery
# - Wait 1-3 minutes
# - Check winners
```

### Verify Random Numbers

The random numbers are:
- ✅ Unpredictable
- ✅ Tamper-proof
- ✅ Verifiable on-chain
- ✅ Generated by Chainlink oracle network

---

## 📱 Frontend Integration

### Update Contract Address

```typescript
// src/constants/index.ts
export const LOTTERY_CONTRACT_ADDRESS = "0xYourNewVRFContractAddress";
```

### Handle Two-Step Draw

The frontend already supports this! The contract emits events:
1. `LotteryDrawRequested` - Draw initiated
2. `LotteryDrawn` - Numbers generated (1-3 min later)

Users will see:
```
"Drawing lottery..." → "Waiting for random numbers..." → "Winners determined!"
```

### No Frontend Changes Needed!

The ABI is the same, all functions work identically from the user's perspective.

---

## 🔐 Security Benefits

### Why Chainlink VRF?

**Old (Pseudo-Random):**
❌ Uses blockhash - miners can manipulate
❌ Uses timestamp - predictable
❌ Can be gamed by sophisticated attackers
❌ Not auditable

**New (Chainlink VRF):**
✅ Cryptographically secure random numbers
✅ Impossible to predict or manipulate
✅ Verifiable on-chain
✅ Industry standard for lotteries and gaming
✅ Used by major protocols (PoolTogether, etc.)

---

## 📚 Resources

- **Chainlink VRF Docs**: https://docs.chain.link/vrf/v2/introduction
- **VRF Dashboard**: https://vrf.chain.link
- **Get Testnet LINK**: https://faucets.chain.link
- **Chainlink Discord**: https://discord.gg/chainlink

---

## ✅ Deployment Checklist

- [ ] Created Chainlink VRF subscription
- [ ] Funded subscription with LINK (min 2 LINK)
- [ ] Got subscription ID
- [ ] Got network parameters (coordinator, gas lane)
- [ ] Deployed contract with correct parameters
- [ ] Added contract as consumer to subscription
- [ ] Verified contract on block explorer
- [ ] Started first round
- [ ] Tested buy ticket
- [ ] Tested draw lottery
- [ ] Waited for VRF callback
- [ ] Verified winners determined
- [ ] Updated frontend contract address
- [ ] Tested end-to-end flow

---

## 🚨 Important Notes

1. **Always use testnet first** before mainnet
2. **Keep subscription funded** - auto-top-up recommended
3. **Monitor gas prices** - affects LINK costs
4. **Set appropriate callback gas limit** - 2.5M is safe
5. **Wait for VRF fulfillment** - can take 1-3 minutes

**You now have a production-ready, provably fair lottery! 🎰**
