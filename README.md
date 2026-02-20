# 🎰 Sequential Lottery - Complete DApp

A full-stack decentralized lottery application with provably fair random numbers using Chainlink VRF.

## 🚀 Project Structure

```
sequential-lottery/
├── smart-contracts/     # Solidity contracts & deployment
├── frontend/           # Next.js 14 user interface
└── docs/              # Complete documentation
```

## ✨ Features

- 🎲 **7-Ball Lottery** - Choose 7 numbers from 1-49
- 🔗 **Chainlink VRF** - Provably fair random numbers
- 💰 **Tiered Prizes** - Win based on sequential matches (2-7 balls)
- 💵 **Owner Revenue** - 10% fee on all ticket sales
- 🔄 **Carry Over** - Unclaimed prizes roll to next round
- 📱 **Modern UI** - Responsive Next.js frontend
- 🔐 **Secure** - Auditable smart contracts

## 🎯 Prize Distribution

| Sequential Matches | Prize Percentage |
|-------------------|------------------|
| 2 balls           | 5%               |
| 3 balls           | 10%              |
| 4 balls           | 15%              |
| 5 balls           | 20%              |
| 6 balls           | 20%              |
| 7 balls (Jackpot) | 30%              |

**Total: 100% of prize pool (90% of ticket sales)**

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or Web3 wallet
- Chainlink VRF subscription
- Testnet ETH and LINK tokens

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd sequential-lottery
```

### 2. Setup Smart Contracts

```bash
cd smart-contracts
npm install
cp .env.example .env
# Edit .env with your private key and VRF subscription ID
```

### 3. Deploy Contract

```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia

# Save the deployed contract address!
```

### 4. Setup Frontend

```bash
cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local with WalletConnect Project ID
```

### 5. Update Contract Address

Edit `frontend/src/constants/index.ts`:
```typescript
export const LOTTERY_CONTRACT_ADDRESS = "0xYourContractAddress";
```

### 6. Run Frontend

```bash
npm run dev
# Visit http://localhost:3000
```

## 📁 Project Details

### Smart Contracts

Located in `smart-contracts/`

**Main Contract:** `TieredSequentialLotteryVRF.sol`
- Chainlink VRF integration
- Tiered prize system
- Owner fee mechanism
- Carry over system

**Commands:**
```bash
cd smart-contracts
npm run compile        # Compile contracts
npm run test          # Run tests
npm run deploy:sepolia # Deploy to Sepolia
npm run deploy:mumbai  # Deploy to Mumbai
```

**Documentation:** See `docs/CHAINLINK_VRF_GUIDE.md`

### Frontend

Located in `frontend/`

**Stack:**
- Next.js 14
- TypeScript
- Tailwind CSS
- RainbowKit (wallet connection)
- Wagmi (Web3 hooks)

**Commands:**
```bash
cd frontend
npm run dev           # Development server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Lint code
```

**Documentation:** See `frontend/README.md`

### Documentation

Located in `docs/`

- `PROJECT_OVERVIEW.md` - Complete project guide
- `CHAINLINK_VRF_GUIDE.md` - VRF setup instructions
- `REPOSITORY_STRUCTURE.md` - File organization
- `QUICKSTART.md` - Fast setup guide
- `DEPLOYMENT_CHECKLIST.md` - Pre-launch checklist

## 🔧 Configuration

### Smart Contracts

Edit `smart-contracts/.env`:
```env
PRIVATE_KEY=your_wallet_private_key
VRF_SUBSCRIPTION_ID=your_chainlink_subscription_id
SEPOLIA_RPC_URL=your_alchemy_or_infura_url
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Frontend

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

## 🌐 Networks

### Testnet (Recommended for testing)
- **Sepolia** - Ethereum testnet
- **Mumbai** - Polygon testnet

### Mainnet (Production)
- **Ethereum** - Main network
- **Polygon** - Layer 2

Get testnet tokens:
- ETH: https://sepoliafaucet.com
- LINK: https://faucets.chain.link
- MATIC: https://mumbaifaucet.com

## 🔗 Chainlink VRF Setup

1. Visit https://vrf.chain.link
2. Create subscription
3. Fund with LINK (minimum 2 LINK for testnet)
4. Deploy contract with subscription ID
5. Add contract as consumer

**Detailed guide:** `docs/CHAINLINK_VRF_GUIDE.md`

## 🧪 Testing

### Smart Contracts
```bash
cd smart-contracts
npm test
```

### Frontend
```bash
cd frontend
npm run build  # Test production build
```

## 📦 Deployment

### Smart Contract to Testnet
```bash
cd smart-contracts
npm run deploy:sepolia
```

### Frontend to Vercel
```bash
cd frontend
vercel deploy
# Or connect GitHub repo to Vercel
```

## 🎮 How to Play

1. **Connect Wallet** - Use MetaMask or any Web3 wallet
2. **Buy Ticket** - Select 7 numbers (1-49) and pay ticket price
3. **Wait for Draw** - Owner draws lottery when round ends
4. **Check Results** - See if your numbers match sequentially
5. **Claim Winnings** - Winners claim their prizes

## 🔐 Security

- ✅ Chainlink VRF for secure randomness
- ✅ OpenZeppelin standards
- ✅ Auditable smart contracts
- ✅ No admin backdoors
- ⚠️ Get security audit before mainnet deployment

## 📊 Costs

### Testnet
- Deploy: FREE (testnet ETH from faucet)
- LINK: FREE (from faucet)
- Testing: FREE

### Mainnet
- Deploy: ~$200-400 (varies with gas)
- LINK per draw: ~0.25-2 LINK ($4-30)
- Maintenance: Ongoing LINK costs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

MIT License - See LICENSE file

## 🆘 Support

- **Documentation:** Check `docs/` folder
- **Issues:** Open GitHub issue
- **Chainlink:** https://discord.gg/chainlink

## 🎯 Roadmap

- [x] Smart contract with VRF
- [x] Next.js frontend
- [x] Wallet integration
- [x] Deployment scripts
- [ ] Admin dashboard
- [ ] Mobile app
- [ ] Multi-chain support
- [ ] NFT tickets

## ⚠️ Disclaimer

This is educational software. Always conduct thorough testing and security audits before deploying to mainnet with real funds. Gambling may be regulated in your jurisdiction.

---

**Built with ❤️ for the Web3 community**

🎰 **Play Responsibly** 🎰
