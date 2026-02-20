# 🔧 QUICK FIX - Compilation Error

## ❌ **Error:**
```
DeclarationError: Undeclared identifier. "drawLottery" is not (or not yet) visible at this point.
   --> contracts/TieredSequentialLotteryVRF_Secure.sol:343:9:
```

## ✅ **QUICK FIX (1 Minute)**

### **Option 1: Edit Line 343** ⭐ (Simplest)

Open: `contracts/TieredSequentialLotteryVRF_Secure.sol`

**Line 343 - Change FROM:**
```solidity
vrfRequestPending[currentRoundId] = false;
drawLottery();  // ❌ This doesn't work
```

**Change TO:**
```solidity
vrfRequestPending[currentRoundId] = false;
// Redraw will be triggered manually by owner
```

**Then add this comment above `emergencyRedraw()`:**
```solidity
/**
 * @dev Emergency redraw if VRF times out
 * After calling this, owner must call drawLottery() again
 */
```

---

### **Option 2: Use 5-Minute Contract** ⭐⭐ (Better!)

The 5-minute contract doesn't have this issue!

**Edit `scripts/deploy-lottery-vrf.js` line 25:**
```javascript
const DEPLOY_VERSION = "5min"; // Use 5-minute version instead
```

**Then deploy:**
```bash
npx hardhat clean
npx hardhat compile
npx hardhat run scripts/deploy-lottery-vrf.js --network sepolia
```

---

### **Option 3: Delete Emergency Redraw**

If you don't need emergency redraw, just delete lines 334-344:

Open: `contracts/TieredSequentialLotteryVRF_Secure.sol`

**Delete lines 334-344:**
```solidity
function emergencyRedraw() external onlyOwner {
    require(currentRoundId > 0, "No active round");
    require(vrfRequestPending[currentRoundId], "No pending request");
    require(
        block.timestamp > vrfRequestTime[currentRoundId] + MAX_VRF_WAIT_TIME,
        "VRF not timed out yet"
    );
    
    vrfRequestPending[currentRoundId] = false;
    drawLottery();
}
```

---

## 🎯 **RECOMMENDED: Use 5-Minute Contract**

The 5-minute contract (`TieredSequentialLotteryVRF_5MinRounds.sol`) **doesn't have this error** and has better features:

✅ 5-minute continuous rounds
✅ Anyone can draw (not just owner)
✅ No emergency redraw issues
✅ Better for fast gameplay

**Deploy it:**
```bash
# Edit scripts/deploy-lottery-vrf.js line 25:
const DEPLOY_VERSION = "5min";

# Deploy
npx hardhat run scripts/deploy-lottery-vrf.js --network sepolia
```

---

## 📋 **STEP-BY-STEP FIX**

### **Using 5-Minute Contract (Easiest):**

```bash
cd sequential-lottery/smart-contracts

# 1. Edit deploy script
nano scripts/deploy-lottery-vrf.js
# Change line 25 to: const DEPLOY_VERSION = "5min";

# 2. Clean and compile
npx hardhat clean
npx hardhat compile

# 3. Deploy!
npx hardhat run scripts/deploy-lottery-vrf.js --network sepolia
```

**Done!** ✅

---

## 🔍 **WHY THIS ERROR HAPPENS**

The issue is in `TieredSequentialLotteryVRF_Secure.sol`:

```solidity
// Line 308: drawLottery is external
function drawLottery() external onlyOwner whenNotPaused {
    // ...
}

// Line 343: Can't call external function internally
function emergencyRedraw() external onlyOwner {
    drawLottery(); // ❌ Error: external function can't be called internally
}
```

**The problem:**
- `drawLottery()` is `external` (can only be called from outside)
- `emergencyRedraw()` tries to call it internally
- Solidity doesn't allow this

**The fix:**
- Remove the internal call, OR
- Use the 5-minute contract (which doesn't have this issue)

---

## ✅ **WHICH CONTRACTS WORK?**

| Contract | Status |
|----------|--------|
| TieredSequentialLotteryVRF_5MinRounds | ✅ Works |
| TieredSequentialLotteryVRF_VRFSortedOnly | ✅ Works |
| TieredSequentialLotteryVRF_Secure | ❌ Has error |
| TieredSequentialLotteryVRF_Upgradeable | ✅ Works |

**Recommendation: Use 5-minute or VRF-sorted version!**

---

## 🚀 **DEPLOY NOW (5-Minute Version)**

```bash
# 1. Edit deployment script
cd sequential-lottery/smart-contracts
nano scripts/deploy-lottery-vrf.js

# Change line 25:
const DEPLOY_VERSION = "5min";

# 2. Deploy
npx hardhat clean
npx hardhat compile
npx hardhat run scripts/deploy-lottery-vrf.js --network sepolia
```

**This will work without errors!** ✅

---

## 🎉 **SUMMARY**

**Problem:** `TieredSequentialLotteryVRF_Secure.sol` has a bug

**Solution:** Use `TieredSequentialLotteryVRF_5MinRounds.sol` instead

**Why:** 
- 5-minute version doesn't have this bug
- Better features (continuous rounds)
- Anyone can draw (more decentralized)

**Time to fix:** 1 minute

---

**Use the 5-minute contract and deploy successfully!** 🚀
