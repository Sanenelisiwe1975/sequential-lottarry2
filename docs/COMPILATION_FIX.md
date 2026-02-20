# 🔧 COMPILATION ERROR FIX

## ❌ **Error: HH606 - Solidity Version Mismatch**

```
The Solidity version pragma statement in these files doesn't match any of the configured compilers
* @openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol (^0.8.22)
* @openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol (^0.8.21)
```

---

## ✅ **QUICK FIX (2 Options)**

### **Option 1: Update Hardhat Config** ⭐ (Recommended)

Replace your `hardhat.config.js` with this:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.22", // For upgradeable contracts
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.20", // For standard contracts
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137
    }
  },
  
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || ""
    }
  }
};
```

**Then:**
```bash
npx hardhat clean
npx hardhat compile
npx hardhat run scripts/deploy-lottery-vrf.js --network sepolia
```

---

### **Option 2: Don't Deploy Upgradeable Version**

If you're deploying 5-minute or VRF-sorted versions (NOT upgradeable), just delete the upgradeable contract:

```bash
rm contracts/TieredSequentialLotteryVRF_Upgradeable.sol
npx hardhat compile
npx hardhat run scripts/deploy-lottery-vrf.js --network sepolia
```

---

## 🎯 **WHY THIS HAPPENS**

### **The Issue:**
- Your contracts use Solidity `0.8.20`
- OpenZeppelin upgradeable contracts require `^0.8.22`
- Hardhat was configured for only `0.8.20`

### **The Solution:**
Configure multiple compiler versions so Hardhat can compile both:
- `0.8.22` for upgradeable contracts
- `0.8.20` for your main contracts

---

## 📋 **STEP-BY-STEP FIX**

### **Step 1: Update Config**

Edit `hardhat.config.js`:

**Change FROM:**
```javascript
solidity: {
  version: "0.8.20",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
}
```

**Change TO:**
```javascript
solidity: {
  compilers: [
    {
      version: "0.8.22", // For upgradeable
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    },
    {
      version: "0.8.20", // For standard
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  ]
}
```

### **Step 2: Clean & Compile**

```bash
npx hardhat clean
npx hardhat compile
```

**Expected Output:**
```
Compiled 7 Solidity files successfully
```

### **Step 3: Deploy**

```bash
npx hardhat run scripts/deploy-lottery-vrf.js --network sepolia
```

**Done!** ✅

---

## 🔍 **WHICH VERSION ARE YOU DEPLOYING?**

### **If Deploying 5-Minute Rounds:**
```javascript
// In deploy-lottery-vrf.js
const DEPLOY_VERSION = "5min";
```
**Contract:** `TieredSequentialLotteryVRF_5MinRounds.sol`
**Solidity:** `0.8.20`
**Fix:** Option 1 or Option 2 (both work)

### **If Deploying VRF Sorted:**
```javascript
const DEPLOY_VERSION = "sorted";
```
**Contract:** `TieredSequentialLotteryVRF_VRFSortedOnly.sol`
**Solidity:** `0.8.20`
**Fix:** Option 1 or Option 2 (both work)

### **If Deploying Upgradeable:**
```javascript
const DEPLOY_VERSION = "upgradeable";
```
**Contract:** `TieredSequentialLotteryVRF_Upgradeable.sol`
**Solidity:** `0.8.20` (but uses OpenZeppelin `^0.8.22`)
**Fix:** Option 1 ONLY (must support both versions)

---

## ⚡ **QUICK COMMANDS**

### **Full Fix:**
```bash
# 1. Update hardhat.config.js (see above)

# 2. Clean
npx hardhat clean

# 3. Compile
npx hardhat compile

# 4. Deploy
npx hardhat run scripts/deploy-lottery-vrf.js --network sepolia
```

### **Quick Workaround (No Upgradeable):**
```bash
# Delete upgradeable contract
rm contracts/TieredSequentialLotteryVRF_Upgradeable.sol

# Deploy
npx hardhat run scripts/deploy-lottery-vrf.js --network sepolia
```

---

## 🎯 **RECOMMENDED APPROACH**

**Use Option 1** (Update Config) because:
- ✅ Keeps all contract versions
- ✅ Fixes the issue permanently
- ✅ Future-proof
- ✅ Takes 2 minutes

**Steps:**
1. Copy the config code above
2. Replace your `hardhat.config.js`
3. Run `npx hardhat clean`
4. Run `npx hardhat compile`
5. Deploy!

---

## 🆘 **STILL NOT WORKING?**

### **Error: "Module not found"**
```bash
npm install @openzeppelin/contracts @openzeppelin/contracts-upgradeable
```

### **Error: "Invalid API key"**
```bash
# Check your .env file
cat .env

# Make sure you have:
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0x...
```

### **Error: "Insufficient funds"**
```bash
# Get Sepolia ETH from faucet:
https://sepoliafaucet.com
```

---

## ✅ **SUMMARY**

**Problem:** Solidity version mismatch
**Cause:** OpenZeppelin upgradeable needs ^0.8.22
**Solution:** Configure multiple compiler versions

**Quick Fix:**
1. Update `hardhat.config.js` with multiple compilers
2. Clean and compile
3. Deploy!

**Time:** 2-3 minutes

---

**This fixes the compilation error permanently!** ✨
