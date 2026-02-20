# Quick Start Guide - Deploy Your Lottery DApp

Follow these steps to get your lottery DApp up and running quickly.

## Step 1: Deploy Smart Contract

First, deploy your `TieredSequentialLottery.sol` contract:

### Using Remix
1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create new file: `TieredSequentialLottery.sol`
3. Paste the contract code
4. Compile with Solidity 0.8.0+
5. Deploy to Sepolia testnet
6. **Copy the deployed contract address**

### Using Hardhat
```bash
npx hardhat run scripts/deploy.js --network sepolia
# Copy the deployed address
```

## Step 2: Get WalletConnect Project ID

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Sign up for free account
3. Create new project
4. Copy your Project ID

## Step 3: Setup Frontend

### Install Dependencies
```bash
cd lottery-dapp
npm install
```

### Configure Environment
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your WalletConnect Project ID
nano .env.local
```

Add this line:
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id
```

### Update Contract Address

Edit `src/constants/index.ts`:
```typescript
export const LOTTERY_CONTRACT_ADDRESS = "0xYOUR_CONTRACT_ADDRESS_HERE";
```

### Update Chain (if not using Sepolia)

Edit `src/constants/index.ts`:
```typescript
// Choose your network
export const ACTIVE_CHAIN = SUPPORTED_CHAINS.SEPOLIA; // or MUMBAI, LOCALHOST
```

## Step 4: Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## Step 5: Test the DApp

### Get Testnet ETH
- Sepolia: https://sepoliafaucet.com
- Mumbai: https://mumbaifaucet.com

### Test Workflow
1. Connect your wallet (MetaMask)
2. Switch to correct network (Sepolia)
3. Select 7 numbers
4. Buy a ticket
5. Wait for confirmation
6. View your ticket

## Step 6: Start Lottery Round (Owner Only)

If you're the contract owner, you need to start a round:

```javascript
// In browser console or using a script
await contract.startNewRound(86400); // 1 day = 86400 seconds
```

Or create an admin panel in the dApp for this.

## Step 7: Deploy to Production

### Deploy to Vercel (Recommended)

1. Push code to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repo
4. Add environment variable:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
5. Deploy!

### Alternative: Deploy to Netlify

```bash
npm run build
# Upload .next folder to Netlify
```

## Troubleshooting

### "Cannot connect wallet"
- ✅ Check WalletConnect Project ID is correct
- ✅ Make sure you're on the right network
- ✅ Try clearing browser cache

### "Transaction fails"
- ✅ Check you have enough testnet ETH
- ✅ Verify contract address is correct
- ✅ Make sure round is active

### "Contract not found"
- ✅ Verify contract is deployed
- ✅ Check contract address matches
- ✅ Ensure you're on the correct network

## Optional: Add Admin Panel

Create `src/app/admin/page.tsx` for owner functions:

```typescript
'use client';

import { useLotteryContract } from '@/hooks/useLotteryContract';

export default function AdminPanel() {
  const { drawLottery, startNewRound, withdrawOwnerFees } = useLotteryContract();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      
      <div className="space-y-4">
        <button 
          onClick={() => startNewRound(86400)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Start New Round (24h)
        </button>
        
        <button 
          onClick={drawLottery}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Draw Lottery
        </button>
        
        <button 
          onClick={withdrawOwnerFees}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Withdraw Fees
        </button>
      </div>
    </div>
  );
}
```

## Next Steps

1. ✅ Customize the design
2. ✅ Add more features (history, statistics)
3. ✅ Implement admin panel
4. ✅ Add social sharing
5. ✅ Mobile app (React Native)

## Resources

- Contract ABI: Already included in `src/constants/abi.ts`
- Testnet Faucets: 
  - Sepolia: https://sepoliafaucet.com
  - Mumbai: https://mumbaifaucet.com
- WalletConnect: https://cloud.walletconnect.com
- Vercel Deployment: https://vercel.com/docs

## Security Checklist

- [ ] Contract audited (for mainnet)
- [ ] Environment variables secured
- [ ] No private keys in code
- [ ] HTTPS enabled (production)
- [ ] Rate limiting implemented
- [ ] Input validation added

---

**You're all set! Happy building! 🚀**
