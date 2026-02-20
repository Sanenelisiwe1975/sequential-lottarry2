# 🚀 DEPLOYMENT GUIDE - ALL VERSIONS

## ✅ YES! Deployment Scripts Included

All contract versions have deployment scripts ready to use!

---

## 📦 **DEPLOYMENT SCRIPT**

**File:** `scripts/deploy-lottery-vrf.js`

**Supports 4 Contract Versions:**
1. ✅ 5-Minute Rounds (`5min`) ⭐ NEW
2. ✅ VRF Sorted (`sorted`) ⭐ NEW
3. ✅ Secure 24h (`secure`)
4. ✅ Upgradeable (`upgradeable`)

---

## 🎯 **QUICK DEPLOY (3 Steps)**

### **Step 1: Choose Your Version**

Edit `scripts/deploy-lottery-vrf.js` line 25:

```javascript
// 🎯 CHANGE THIS to deploy different versions:
const DEPLOY_VERSION = "5min"; // Options: "5min", "sorted", "secure", "upgradeable"
```

**Options:**
- `"5min"` → TieredSequentialLotteryVRF_5MinRounds ⭐
- `"sorted"` → TieredSequentialLotteryVRF_VRFSortedOnly ⭐
- `"secure"` → TieredSequentialLotteryVRF_Secure
- `"upgradeable"` → TieredSequentialLotteryVRF_Upgradeable

---

### **Step 2: Configure Environment**

```bash
cd smart-contracts
cp .env.example .env
nano .env
```

**Add:**
```env
PRIVATE_KEY=your_wallet_private_key
VRF_SUBSCRIPTION_ID=12345
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_key
```

---

### **Step 3: Deploy!**

```bash
# Install dependencies
npm install

# Deploy to Sepolia
npm run deploy:sepolia

# Or deploy to other networks:
npm run deploy:mumbai
npm run deploy:mainnet
npm run deploy:polygon
```

**Done!** ✅

---

## 📋 **DEPLOYMENT OUTPUT**

When you deploy, you'll see:

```
🎰 Deploying Sequential Lottery with Chainlink VRF...

📝 Selected Contract: TieredSequentialLotteryVRF_5MinRounds
📝 Version: 5min

🌐 Network: Sepolia Testnet
📡 VRF Coordinator: 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
🔑 Gas Lane: 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c
⛽ Callback Gas Limit: 2500000
🎫 Subscription ID: 12345

🚀 Deploying contract...

📍 Deploying from: 0xYourAddress
💰 Balance: 0.5 ETH

✅ TieredSequentialLotteryVRF_5MinRounds deployed!
📍 Address: 0xContractAddress

============================================================
🎉 DEPLOYMENT SUCCESSFUL!
============================================================

📋 CONTRACT DETAILS:
   Contract: TieredSequentialLotteryVRF_5MinRounds
   Version: 5min
   Address: 0xContractAddress
   Network: Sepolia Testnet
   Deployer: 0xYourAddress

⏱️  5-MINUTE ROUNDS INFO:
   - Round Duration: 5 minutes (300 seconds)
   - Countdown: Continuous (independent of tickets)
   - Draws per day: 288 (if all have tickets)
   - Anyone can call drawLottery()
   - Empty rounds allowed (skip VRF)

🔔 NEXT STEPS:

1️⃣  Add contract as VRF consumer:
   → Go to: https://vrf.chain.link
   → Select your subscription
   → Click 'Add Consumer'
   → Paste address: 0xContractAddress

2️⃣  Verify contract:
   → npx hardhat verify --network sepolia 0xContractAddress ...

3️⃣  Update frontend:
   → Open: frontend/src/constants/index.ts
   → Set LOTTERY_CONTRACT_ADDRESS = "0xContractAddress"

4️⃣  Frontend countdown timer:
   → Implement real-time countdown (updates every second)
   → Show 'Draw Lottery' button when round ends
   → See: docs/5_MINUTE_ROUNDS_GUIDE.md

5️⃣  Test the contract:
   → Buy a ticket
   → Wait 5 minutes for round to end
   → Call drawLottery()
   → Check results

============================================================

💾 Deployment info saved to: deployments/sepolia-5min-1234567890.json

✨ Deployment complete! Good luck! 🍀
```

---

## 🔧 **SWITCHING VERSIONS**

### **Deploy 5-Minute Rounds:**
```javascript
const DEPLOY_VERSION = "5min";
```
```bash
npm run deploy:sepolia
```

### **Deploy VRF Sorted:**
```javascript
const DEPLOY_VERSION = "sorted";
```
```bash
npm run deploy:sepolia
```

### **Deploy Standard Secure:**
```javascript
const DEPLOY_VERSION = "secure";
```
```bash
npm run deploy:sepolia
```

### **Deploy Upgradeable:**
```javascript
const DEPLOY_VERSION = "upgradeable";
```
```bash
npx hardhat run scripts/deploy-upgradeable.js --network sepolia
```

---

## 📝 **PACKAGE.JSON SCRIPTS**

Already included in `package.json`:

```json
{
  "scripts": {
    "deploy:sepolia": "hardhat run scripts/deploy-lottery-vrf.js --network sepolia",
    "deploy:mumbai": "hardhat run scripts/deploy-lottery-vrf.js --network mumbai",
    "deploy:mainnet": "hardhat run scripts/deploy-lottery-vrf.js --network mainnet",
    "deploy:polygon": "hardhat run scripts/deploy-lottery-vrf.js --network polygon"
  }
}
```

---

## ✅ **VERIFICATION**

After deployment, verify on Etherscan:

```bash
npx hardhat verify --network sepolia \
  0xContractAddress \
  "0xVRFCoordinator" \
  "0xGasLane" \
  "subscriptionId" \
  "callbackGasLimit"
```

**The script shows the exact command to run!**

---

## 🎯 **WHAT GETS SAVED**

After deployment, you'll find:

```
smart-contracts/
└── deployments/
    ├── sepolia-5min-1234567890.json    (timestamped)
    └── sepolia-5min-latest.json        (always latest)
```

**Contents:**
```json
{
  "network": "sepolia",
  "networkName": "Sepolia Testnet",
  "contractName": "TieredSequentialLotteryVRF_5MinRounds",
  "version": "5min",
  "address": "0xContractAddress",
  "vrfCoordinator": "0x...",
  "gasLane": "0x...",
  "callbackGasLimit": "2500000",
  "subscriptionId": "12345",
  "deployer": "0xYourAddress",
  "timestamp": "2026-02-16T13:30:00.000Z",
  "blockNumber": 12345678
}
```

---

## 🆘 **TROUBLESHOOTING**

### **"VRF_SUBSCRIPTION_ID not set!"**
```bash
# Add to .env file:
VRF_SUBSCRIPTION_ID=12345
```

### **"Network not configured!"**
```bash
# Supported networks:
- sepolia
- mumbai
- mainnet
- polygon

# Deploy with:
npm run deploy:sepolia
```

### **"Insufficient funds"**
```bash
# Get testnet tokens:
- Sepolia ETH: https://sepoliafaucet.com
- Sepolia LINK: https://faucets.chain.link/sepolia
```

### **"Contract not found"**
```bash
# Make sure contract file exists:
ls contracts/TieredSequentialLotteryVRF_5MinRounds.sol

# Compile first:
npx hardhat compile
```

---

## 🎉 **SUMMARY**

### **Deployment Script:**
✅ **Included** - `scripts/deploy-lottery-vrf.js`
✅ **Supports 4 versions** - 5min, sorted, secure, upgradeable
✅ **Auto-configures** - Network settings, VRF params
✅ **Saves deployment info** - JSON files for reference
✅ **Shows next steps** - Clear instructions

### **To Deploy:**
1. Choose version (edit line 25)
2. Configure .env
3. Run `npm run deploy:sepolia`

**That's it!** 🚀

---

**Deployment scripts are ready to use!** ✨
