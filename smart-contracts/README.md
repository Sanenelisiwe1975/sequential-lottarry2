# Smart Contracts - Sequential Lottery

Solidity smart contracts for the Sequential Lottery with Chainlink VRF integration.

## 📁 Structure

```
smart-contracts/
├── contracts/                  # Solidity contracts
│   ├── TieredSequentialLotteryVRF.sol    ⭐ MAIN CONTRACT
│   ├── TieredSequentialLottery.sol       (backup)
│   └── SequentialLottery.sol             (reference)
├── scripts/                    # Deployment scripts
│   └── deploy-lottery-vrf.js
├── test/                       # Contract tests
│   ├── TieredSequentialLottery.test.js
│   └── SequentialLottery.test.js
├── hardhat.config.js           # Hardhat configuration
├── package.json                # Dependencies
└── .env.example                # Environment template
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env
```

Add your credentials:
```env
PRIVATE_KEY=your_wallet_private_key_without_0x
VRF_SUBSCRIPTION_ID=your_chainlink_subscription_id
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Get Chainlink VRF Subscription

1. Visit https://vrf.chain.link
2. Connect wallet
3. Create subscription
4. Fund with 2+ LINK
5. Copy subscription ID to .env

### 4. Compile Contracts

```bash
npm run compile
```

### 5. Run Tests

```bash
npm test
```

### 6. Deploy to Testnet

```bash
# Deploy to Sepolia
npm run deploy:sepolia

# Deploy to Mumbai
npm run deploy:mumbai
```

**IMPORTANT:** After deployment, add the contract address as a consumer in your VRF subscription!

## 📄 Contracts

### TieredSequentialLotteryVRF.sol ⭐

**Main production contract with:**
- ✅ Chainlink VRF for secure randomness
- ✅ Tiered prize system (2-7 sequential matches)
- ✅ 10% owner fee
- ✅ Automatic carry over of unclaimed prizes
- ✅ Round-based gameplay

**Key Functions:**

**Player Functions:**
```solidity
// Buy a lottery ticket
function buyTicket(uint8[7] memory numbers) external payable

// Claim winnings
function claimWinnings() external

// View functions
function getCurrentRoundInfo() external view returns (...)
function getMyTickets(uint256 roundId) external view returns (...)
function getWinningNumbers(uint256 roundId) external view returns (...)
```

**Owner Functions:**
```solidity
// Start a new round
function startNewRound(uint256 duration) external onlyOwner

// Draw lottery (requests VRF)
function drawLottery() external onlyOwner

// Withdraw accumulated fees
function withdrawOwnerFees() external onlyOwner

// Set ticket price
function setTicketPrice(uint256 newPrice) external onlyOwner
```

### Constructor Parameters

```solidity
constructor(
    address vrfCoordinator,    // Chainlink VRF Coordinator
    bytes32 gasLane,          // Gas lane (key hash)
    uint64 subscriptionId,    // Your VRF subscription ID
    uint32 callbackGasLimit   // Gas limit for callback (2,500,000)
)
```

## 🌐 Network Configurations

### Sepolia Testnet

```javascript
vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625"
gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"
callbackGasLimit: 2500000
```

### Polygon Mumbai

```javascript
vrfCoordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed"
gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f"
callbackGasLimit: 2500000
```

### Ethereum Mainnet

```javascript
vrfCoordinator: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909"
gasLane: "0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef"
callbackGasLimit: 2500000
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test

```bash
npx hardhat test test/TieredSequentialLottery.test.js
```

### Test Coverage

```bash
npx hardhat coverage
```

## 📦 Deployment

### Deploy Script

The `deploy-lottery-vrf.js` script automatically:
1. Detects network
2. Uses correct VRF configuration
3. Deploys contract
4. Saves deployment info
5. Shows next steps

### Manual Deployment (Remix)

1. Compile `TieredSequentialLotteryVRF.sol`
2. Deploy with constructor parameters
3. Verify on Etherscan
4. Add as VRF consumer

## 🔍 Verification

### Verify on Etherscan

```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS \
  "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625" \
  "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c" \
  "YOUR_SUBSCRIPTION_ID" \
  "2500000"
```

## 💰 Gas Costs

| Operation | Gas (estimate) | Cost @ 30 gwei |
|-----------|----------------|----------------|
| Deploy    | ~4,500,000     | ~0.135 ETH     |
| Start Round | ~150,000     | ~0.0045 ETH    |
| Buy Ticket | ~200,000      | ~0.006 ETH     |
| Draw (request) | ~150,000  | ~0.0045 ETH    |
| VRF Callback | ~800,000    | ~0.024 ETH     |

## 🔐 Security

### Before Mainnet

- [ ] Complete security audit
- [ ] Test thoroughly on testnet
- [ ] Review all owner functions
- [ ] Verify random number generation
- [ ] Check prize distribution logic
- [ ] Test emergency functions
- [ ] Verify gas limits

### Security Features

- ✅ ReentrancyGuard patterns
- ✅ Access control (onlyOwner)
- ✅ Input validation
- ✅ Safe math (Solidity 0.8+)
- ✅ Chainlink VRF for randomness

## 📚 Resources

- **Chainlink VRF Docs:** https://docs.chain.link/vrf
- **Hardhat Docs:** https://hardhat.org/docs
- **OpenZeppelin:** https://docs.openzeppelin.com

## 🆘 Troubleshooting

### "Insufficient funds"
- Add more LINK to VRF subscription
- Minimum 2 LINK for testnet

### "Consumer not authorized"
- Add contract address to VRF subscription consumers
- Visit vrf.chain.link → Your Subscription → Add Consumer

### "VRF request failed"
- Check subscription has enough LINK
- Verify callback gas limit (2.5M recommended)
- Wait 1-3 minutes for fulfillment

### "Transaction reverted"
- Check round is active
- Verify ticket price is correct
- Ensure numbers are 1-49

## 📝 Notes

- Always test on testnet first
- Keep subscription funded with LINK
- Monitor gas prices for mainnet
- Use .env for sensitive data
- Never commit private keys

## 🎯 Next Steps

1. Deploy to testnet
2. Test all functions
3. Get security audit
4. Deploy to mainnet
5. Update frontend with address

---

**For more details, see `/docs/CHAINLINK_VRF_GUIDE.md`**
