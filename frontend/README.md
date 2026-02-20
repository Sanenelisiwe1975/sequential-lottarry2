# Sequential Lottery DApp - Next.js Frontend

A modern, responsive decentralized application (DApp) for interacting with the Sequential Lottery smart contract. Built with Next.js 14, TypeScript, Tailwind CSS, and RainbowKit.

## Features

- 🎰 **Interactive Number Picker** - Select 7 numbers from 1-49 with visual feedback
- 💰 **Real-time Prize Pool** - Live updates of prize pool and carry over amounts
- 🎫 **My Tickets** - View all your purchased tickets and match results
- 🏆 **Prize Tiers Display** - Clear breakdown of all prize tiers
- 💳 **Wallet Connection** - Seamless wallet connection with RainbowKit
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- ⚡ **Live Updates** - Contract events automatically update the UI

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: 
  - ethers.js v6
  - wagmi v2
  - viem
  - RainbowKit
- **State Management**: TanStack Query (React Query)

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Web3 wallet (MetaMask, WalletConnect, etc.)
- The lottery smart contract deployed on a testnet
- Test ETH for gas fees

## Installation

### 1. Clone or Create the Project

```bash
# If you have the files
cd lottery-dapp

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# WalletConnect Project ID (Get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 3. Update Contract Configuration

Edit `src/constants/index.ts`:

```typescript
// Replace with your deployed contract address
export const LOTTERY_CONTRACT_ADDRESS = "0xYourContractAddressHere";

// Set your active chain
export const ACTIVE_CHAIN = SUPPORTED_CHAINS.SEPOLIA; // or MUMBAI, LOCALHOST
```

### 4. Update Chain Configuration (if needed)

Edit `src/utils/wagmi.ts` to add/remove chains:

```typescript
import { sepolia, polygonMumbai, localhost } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Lottery DApp',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [sepolia, polygonMumbai, localhost], // Add/remove chains
  ssr: true,
});
```

## Running the Application

### Development Mode

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Project Structure

```
lottery-dapp/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Main home page
│   ├── components/            # React components
│   │   ├── NumberPicker.tsx   # Number selection component
│   │   ├── RoundInfo.tsx      # Round information display
│   │   ├── MyTickets.tsx      # User tickets display
│   │   └── PrizeTiers.tsx     # Prize tiers breakdown
│   ├── hooks/                 # Custom React hooks
│   │   └── useLotteryContract.ts  # Contract interaction hooks
│   ├── utils/                 # Utility functions
│   │   └── wagmi.ts          # Wagmi configuration
│   └── constants/             # Constants and configs
│       ├── abi.ts            # Contract ABI
│       └── index.ts          # Contract address and chain config
├── public/                    # Static files
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Key Components

### NumberPicker
Interactive component for selecting lottery numbers with:
- Click to select/deselect numbers
- Quick Pick for random selection
- Visual feedback for selected numbers
- Sequential position indicators

### RoundInfo
Displays current round information:
- Prize pool (including carry over)
- Time remaining
- Ticket price
- Round status

### MyTickets
Shows user's purchased tickets:
- Visual number display
- Match highlighting after draw
- Win/lose indicators
- Comparison with winning numbers

### PrizeTiers
Displays all prize tiers with:
- Match requirements
- Percentage allocations
- Estimated prize amounts
- Visual tier differentiation

## Smart Contract Integration

### Reading Data

The app automatically reads:
- Current round information
- Prize tiers
- Ticket prices
- User tickets
- Winning numbers (after draw)
- Player winnings

### Writing Transactions

Users can:
- Buy tickets
- Claim winnings

Owners can:
- Draw lottery
- Start new rounds
- Withdraw fees

### Event Listening

The app listens for:
- `TicketPurchased` - Updates round info
- `LotteryDrawn` - Updates results and carry over
- `WinningsClaimed` - Updates user balance

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
4. Deploy!

### Deploy to Other Platforms

The app can be deployed to:
- Netlify
- AWS Amplify
- Cloudflare Pages
- Any platform supporting Next.js

### Environment Variables for Production

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Testing

### Manual Testing Checklist

- [ ] Connect wallet successfully
- [ ] View current round information
- [ ] Select 7 numbers
- [ ] Buy ticket (testnet)
- [ ] View purchased tickets
- [ ] See prize tiers
- [ ] Claim winnings (if applicable)
- [ ] View winning numbers after draw
- [ ] Check responsive design on mobile

### Testing on Testnets

1. **Sepolia Testnet**
   - Get ETH: https://sepoliafaucet.com/
   - Network: Sepolia

2. **Mumbai Testnet**
   - Get MATIC: https://mumbaifaucet.com/
   - Network: Polygon Mumbai

3. **Localhost**
   - Run Hardhat node: `npx hardhat node`
   - Deploy contract locally
   - Update contract address in config

## Common Issues & Solutions

### Issue: "Cannot connect wallet"
**Solution**: Make sure you have:
- A valid WalletConnect Project ID
- The correct network selected in your wallet
- The app running on HTTPS (or localhost)

### Issue: "Transaction fails"
**Solution**: 
- Ensure you have enough ETH for gas + ticket price
- Check if the round is still active
- Verify contract address is correct

### Issue: "Numbers not updating"
**Solution**:
- Check contract events are being emitted
- Verify WebSocket connection
- Try refreshing the page

### Issue: "Wrong network"
**Solution**:
- Switch to the correct network in your wallet
- Make sure contract is deployed on that network
- Update `ACTIVE_CHAIN` in constants

## Customization

### Change Theme Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    },
  },
},
```

### Add New Features

1. Create component in `src/components/`
2. Add contract interaction in `src/hooks/useLotteryContract.ts`
3. Import and use in `src/app/page.tsx`

### Support Additional Chains

Edit `src/utils/wagmi.ts`:

```typescript
import { mainnet, arbitrum } from 'wagmi/chains';

chains: [sepolia, mainnet, arbitrum],
```

## Security Considerations

- ⚠️ Never commit private keys or sensitive data
- ✅ Always test on testnet first
- ✅ Verify contract address before transactions
- ✅ Use official RPC endpoints
- ✅ Keep dependencies updated

## Performance Optimization

- Images are optimized with Next.js Image component
- Code splitting with dynamic imports
- React Query caching for blockchain reads
- Debounced contract calls

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Brave
- Mobile browsers with Web3 wallet

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [RainbowKit Documentation](https://www.rainbowkit.com/docs)
- [Wagmi Documentation](https://wagmi.sh/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [WalletConnect](https://cloud.walletconnect.com/)

## License

MIT License - Feel free to use for your own projects!

## Support

For issues or questions:
1. Check this README
2. Review contract documentation
3. Check browser console for errors
4. Verify wallet and network settings

---

**Built with ❤️ for the Web3 community**
