# 🚀 UPGRADEABLE CONTRACT - COMPLETE DEPLOYMENT GUIDE

## 📋 What You're Deploying

**Contract:** `TieredSequentialLotteryVRF_Upgradeable.sol`

**Pattern:** UUPS (Universal Upgradeable Proxy Standard)

**Key Feature:** Can upgrade contract logic WITHOUT changing address or losing data!

---

## ⚡ QUICK START (5 Steps)

### Step 1: Setup Project

```bash
cd smart-contracts

# Install dependencies
npm install

# Install upgradeable contracts
npm install @openzeppelin/contracts-upgradeable
npm install @openzeppelin/hardhat-upgrades

# Copy upgradeable files
# - TieredSequentialLotteryVRF_Upgradeable.sol → contracts/
# - deploy-upgradeable.js → scripts/
# - upgrade.js → scripts/
# - hardhat-upgradeable.config.js → hardhat.config.js (replace)
# - package-upgradeable.json → package.json (replace)
```

### Step 2: Configure Environment

```bash
cp .env.example .env
nano .env
```

Add:
```env
PRIVATE_KEY=your_wallet_private_key_without_0x
VRF_SUBSCRIPTION_ID=your_chainlink_subscription_id
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_key
```

### Step 3: Deploy

```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia
```

### Step 4: Add to VRF Subscription

1. Go to https://vrf.chain.link
2. Select your subscription
3. Click "Add Consumer"
4. **Paste the PROXY address** (from deployment output)
5. Confirm transaction

### Step 5: Update Frontend

Edit `frontend/src/constants/index.ts`:
```typescript
export const LOTTERY_CONTRACT_ADDRESS = "0xYourProxyAddress";
```

**Done! Your upgradeable lottery is live! 🎉**

---

## 📖 DETAILED STEP-BY-STEP GUIDE

### Prerequisites

- [ ] Node.js 18+
- [ ] MetaMask with Sepolia ETH (0.5+)
- [ ] Sepolia LINK (2+)
- [ ] Chainlink VRF subscription created
- [ ] Alchemy/Infura RPC URL
- [ ] Etherscan API key

---

### Part 1: Project Setup

#### 1. Create Project Directory

```bash
mkdir lottery-upgradeable
cd lottery-upgradeable
```

#### 2. Initialize Hardhat Project

```bash
npm init -y
npm install --save-dev hardhat
npx hardhat init
# Select: Create a JavaScript project
```

#### 3. Install Dependencies

```bash
# Core dependencies
npm install --save-dev @nomicfoundation/hardhat-toolbox
npm install --save-dev @nomicfoundation/hardhat-ethers
npm install --save-dev @nomicfoundation/hardhat-verify

# Upgradeable contracts (IMPORTANT!)
npm install --save-dev @openzeppelin/hardhat-upgrades
npm install @openzeppelin/contracts-upgradeable
npm install @openzeppelin/contracts

# Chainlink VRF
npm install @chainlink/contracts

# Environment variables
npm install dotenv
```

#### 4. Setup Project Structure

```bash
mkdir -p contracts scripts test deployments
```

#### 5. Copy Files

Copy these files to your project:

**To `contracts/`:**
- `TieredSequentialLotteryVRF_Upgradeable.sol`

**To `scripts/`:**
- `deploy-upgradeable.js`
- `upgrade.js`

**To root:**
- `hardhat-upgradeable.config.js` (rename to `hardhat.config.js`)
- `package-upgradeable.json` (merge with your `package.json`)
- `.env.example`

---

### Part 2: Configuration

#### 1. Update hardhat.config.js

Make sure it includes:
```javascript
require("@openzeppelin/hardhat-upgrades"); // CRITICAL!
```

#### 2. Configure .env

```bash
cp .env.example .env
nano .env
```

Add your values:
```env
# Wallet private key (WITHOUT 0x)
PRIVATE_KEY=abc123def456...

# Chainlink VRF Subscription ID
VRF_SUBSCRIPTION_ID=12345

# RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# API Keys
ETHERSCAN_API_KEY=YOUR_KEY
```

#### 3. Update package.json

Add these scripts:
```json
{
  "scripts": {
    "deploy:sepolia": "hardhat run scripts/deploy-upgradeable.js --network sepolia",
    "upgrade:sepolia": "hardhat run scripts/upgrade.js --network sepolia"
  }
}
```

---

### Part 3: Deployment

#### 1. Compile Contract

```bash
npx hardhat compile
```

**Expected output:**
```
Compiled 1 Solidity file successfully
```

#### 2. Deploy to Sepolia

```bash
npm run deploy:sepolia
```

**Expected output:**
```
🎰 Deploying Upgradeable Sequential Lottery with Chainlink VRF...

Network: Sepolia Testnet
VRF Coordinator: 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
Subscription ID: 12345
Deployer: 0xYourAddress...
Balance: 0.5 ETH

📦 Deploying upgradeable contract (UUPS Proxy Pattern)...

✅ Deployment successful!

📍 PROXY ADDRESS: 0xAbc123Def456...
   ⚠️  USE THIS ADDRESS FOR EVERYTHING!

🔧 Implementation Address: 0xGhi789Jkl012...
   (Internal use only)

📊 Contract Version: 1

================================================================
🎯 IMPORTANT NEXT STEPS:
================================================================

1. Add PROXY address to VRF subscription
2. Verify contracts
3. Update frontend
4. Start first round

💾 Deployment info saved to: deployments/sepolia-upgradeable-1234567890.json
```

#### 3. Save Important Information

From the output, save:
- ✅ **Proxy Address** (this is what you use everywhere!)
- ✅ Implementation Address (for your records)
- ✅ Deployment file location

---

### Part 4: Post-Deployment

#### 1. Add to VRF Subscription (CRITICAL!)

**Visit:** https://vrf.chain.link

Steps:
1. Connect MetaMask (Sepolia network)
2. Select your subscription
3. Click "Add Consumer"
4. **Paste PROXY address** (NOT implementation!)
5. Confirm transaction
6. Verify it appears in consumers list

#### 2. Verify Contract on Etherscan

```bash
npx hardhat verify --network sepolia 0xYourProxyAddress
```

**Note:** The verification process for proxies is handled automatically by OpenZeppelin's plugin.

#### 3. Update Frontend

Edit `frontend/src/constants/index.ts`:
```typescript
export const LOTTERY_CONTRACT_ADDRESS = "0xYourProxyAddress";
```

#### 4. Test Contract

Using Hardhat console:
```bash
npx hardhat console --network sepolia
```

In console:
```javascript
const lottery = await ethers.getContractAt(
  "TieredSequentialLotteryVRF_Upgradeable", 
  "0xYourProxyAddress"
);

// Check version
await lottery.version(); // Should return 1

// Check current round
await lottery.currentRoundId(); // Should return 1

// Get round info
await lottery.getCurrentRoundInfo();
```

---

## 🔄 HOW TO UPGRADE (Future)

### When to Upgrade

- Fix bugs
- Add new features
- Improve performance
- Enhance security

### Upgrade Process

#### 1. Create V2 Contract

Create `contracts/TieredSequentialLotteryVRF_UpgradeableV2.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TieredSequentialLotteryVRF_Upgradeable.sol";

contract TieredSequentialLotteryVRF_UpgradeableV2 is TieredSequentialLotteryVRF_Upgradeable {
    
    // NEW: Add features here
    uint256 public minTicketsForDraw;
    
    function initializeV2() public reinitializer(2) {
        minTicketsForDraw = 10;
        version = 2;
    }
    
    // Override or add functions...
}
```

#### 2. Update upgrade.js

Edit `scripts/upgrade.js`:
```javascript
// Change this line:
const NEW_CONTRACT_NAME = "TieredSequentialLotteryVRF_UpgradeableV2";
```

#### 3. Run Upgrade

```bash
npm run upgrade:sepolia
```

#### 4. Initialize V2 Features

The upgrade script will automatically:
- Pause contract
- Deploy new implementation
- Update proxy
- Call `initializeV2()` (if available)
- Unpause contract

**Done! Contract upgraded without changing address!** 🎉

---

## 📊 Comparison: Deployment vs Upgrade

### Initial Deployment

```bash
npm run deploy:sepolia

Creates:
- Proxy Contract (0xAbc...)
- Implementation V1 (0xDef...)
```

### Future Upgrade

```bash
npm run upgrade:sepolia

Creates:
- Same Proxy (0xAbc...) ← NO CHANGE!
- New Implementation V2 (0xGhi...)
```

**Users don't notice anything!** ✅

---

## 🐛 Troubleshooting

### Deployment Issues

**Error: "Cannot find module '@openzeppelin/hardhat-upgrades'"**
```bash
npm install @openzeppelin/hardhat-upgrades
```

**Error: "VRF_SUBSCRIPTION_ID not set"**
```bash
# Check .env file
cat .env | grep VRF_SUBSCRIPTION_ID

# Should show: VRF_SUBSCRIPTION_ID=12345
```

**Error: "insufficient funds"**
```bash
# Get more Sepolia ETH
# Visit: https://sepoliafaucet.com
```

### Upgrade Issues

**Error: "Proxy address not found"**
```bash
# Check deployments folder
ls deployments/

# Or set manually
export PROXY_ADDRESS=0xYourProxyAddress
npm run upgrade:sepolia
```

**Error: "Storage layout incompatible"**
```
This means your V2 contract breaks storage layout.
Fix by only adding NEW variables at the END.
```

**Error: "Not the owner"**
```bash
# Make sure you're using the deployer wallet
# Check owner:
const lottery = await ethers.getContractAt("...", "0xProxy");
await lottery.owner();
```

---

## ✅ Deployment Checklist

### Before Deployment

- [ ] Compiled successfully
- [ ] Tests pass
- [ ] VRF subscription created
- [ ] VRF subscription funded (2+ LINK)
- [ ] .env configured
- [ ] Deployer wallet has 0.5+ ETH

### After Deployment

- [ ] Proxy address saved
- [ ] Implementation address saved
- [ ] Added to VRF subscription
- [ ] Verified on Etherscan
- [ ] Frontend updated
- [ ] Tested buy ticket
- [ ] Tested draw lottery
- [ ] Deployment file saved

### Before Upgrade

- [ ] V2 contract created
- [ ] Tests pass
- [ ] Storage layout validated
- [ ] Upgrade script updated
- [ ] Announced to users
- [ ] Backup plan ready

---

## 📁 Files Summary

### Required Files

1. **TieredSequentialLotteryVRF_Upgradeable.sol**
   - Main upgradeable contract
   - Place in: `contracts/`

2. **deploy-upgradeable.js**
   - Deployment script
   - Place in: `scripts/`

3. **upgrade.js**
   - Upgrade script (for future)
   - Place in: `scripts/`

4. **hardhat-upgradeable.config.js**
   - Hardhat config with upgrades plugin
   - Rename to: `hardhat.config.js`

5. **package-upgradeable.json**
   - Dependencies for upgradeable contracts
   - Merge with your `package.json`

---

## 💡 Pro Tips

### Tip 1: Keep Deployment Records
```bash
# Deployments are auto-saved to:
deployments/sepolia-upgradeable-1234567890.json
deployments/sepolia-latest.json

# Always commit these to Git (after removing sensitive data)
```

### Tip 2: Test Upgrades on Testnet
```bash
# ALWAYS test upgrade on testnet first!
npm run upgrade:sepolia

# Then verify everything works
# Only then upgrade mainnet
```

### Tip 3: Use Multi-Sig for Mainnet
```javascript
// After deployment, transfer ownership to Gnosis Safe
const lottery = await ethers.getContractAt("...", "0xProxy");
await lottery.transferOwnership("0xGnosisSafeAddress");
```

### Tip 4: Pause Before Upgrade
```javascript
// Already handled by upgrade script
// But good practice:
await lottery.pause();
// Perform upgrade
await lottery.unpause();
```

---

## 🎉 You're Ready!

You now have:
- ✅ Complete deployment script
- ✅ Complete upgrade script
- ✅ Updated package.json
- ✅ Updated hardhat.config.js
- ✅ Complete guide

**Deploy your upgradeable lottery now!**

```bash
npm run deploy:sepolia
```

**Good luck! 🎰**
