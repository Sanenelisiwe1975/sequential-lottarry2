# 🎯 START HERE - First Time Setup

## 👋 Welcome!

You've downloaded the complete Sequential Lottery project!

This guide will get you from zero to a working lottery in **30 minutes**.

---

## ✅ STEP 1: Prerequisites (5 minutes)

### Install Software:
- [ ] Node.js 18+ - Download from https://nodejs.org
- [ ] MetaMask - Install from https://metamask.io

### Get Testnet Tokens (FREE):
- [ ] Sepolia ETH - https://sepoliafaucet.com (0.5 ETH)
- [ ] Sepolia LINK - https://faucets.chain.link/sepolia (2 LINK)

### Get API Keys (FREE):
- [ ] WalletConnect ID - https://cloud.walletconnect.com
- [ ] Alchemy RPC URL - https://alchemy.com
- [ ] Etherscan API Key - https://etherscan.io/apis

### Create VRF Subscription:
- [ ] Go to https://vrf.chain.link
- [ ] Create subscription
- [ ] Fund with 2 LINK
- [ ] Save subscription ID

**All done? Continue!**

---

## ✅ STEP 2: Deploy Contract (10 minutes)

```bash
# Navigate to smart contracts
cd smart-contracts

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env
```

**Add to .env:**
```env
PRIVATE_KEY=your_wallet_private_key
VRF_SUBSCRIPTION_ID=12345
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_key
```

**Deploy:**
```bash
npm run deploy:sepolia
```

**Save the contract address from output!**

**Add to VRF:**
1. Go to https://vrf.chain.link
2. Select subscription
3. Add Consumer → Paste contract address

---

## ✅ STEP 3: Setup Frontend (10 minutes)

```bash
cd ../frontend

# Install
npm install

# Configure
cp .env.example .env.local
nano .env.local
```

**Add to .env.local:**
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id
```

**Update contract address:**
```bash
nano src/constants/index.ts
```

Change:
```typescript
export const LOTTERY_CONTRACT_ADDRESS = "0xYourAddress";
```

**Run:**
```bash
npm run dev
```

**Visit http://localhost:3000**

---

## ✅ STEP 4: Test It! (5 minutes)

1. Open browser: http://localhost:3000
2. Click "Connect Wallet"
3. Pick 7 numbers
4. Click "Buy Ticket"
5. Confirm in MetaMask
6. See your ticket!

**It works! 🎉**

---

## 📖 Next Steps

### Read These Guides:

**Full Deployment:**
- `docs/COMPLETE_DEPLOYMENT_GUIDE.md`

**Security:**
- `docs/SECURITY_ENHANCEMENTS.md`

**Upgradeability:**
- `docs/UPGRADEABILITY_GUIDE.md`

---

## 🆘 Issues?

### "Module not found"
```bash
npm install
```

### "Cannot connect wallet"
- Check MetaMask installed
- Check on Sepolia network
- Clear browser cache

### "Contract not found"
- Update address in src/constants/index.ts
- Make sure contract deployed

**Full troubleshooting:** `docs/COMPLETE_DEPLOYMENT_GUIDE.md`

---

## 🎯 Quick Reference

**Deploy Contract:**
```bash
cd smart-contracts
npm run deploy:sepolia
```

**Run Frontend:**
```bash
cd frontend
npm run dev
```

**Verify Contract:**
```bash
npx hardhat verify --network sepolia 0xAddress
```

---

**You're all set! Start building! 🚀**
