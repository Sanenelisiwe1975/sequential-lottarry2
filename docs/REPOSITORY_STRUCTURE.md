# Complete Repository Structure

## 📁 Full Project Tree

```
sequential-lottery-project/
│
├── 📄 PROJECT_OVERVIEW.md              # Complete project guide and overview
├── 📄 TieredSequentialLottery.sol      # Main smart contract
├── 📄 README_Tiered.md                 # Smart contract documentation
├── 📄 REVENUE_FLOW.md                  # Revenue flow diagrams and examples
├── 📄 TieredSequentialLottery.test.js  # Contract test suite (Hardhat)
│
└── 📁 lottery-dapp/                     # Frontend Next.js application
    │
    ├── 📄 package.json                  # Dependencies and scripts
    ├── 📄 package-lock.json             # Locked dependency versions
    ├── 📄 next.config.js                # Next.js configuration
    ├── 📄 tsconfig.json                 # TypeScript configuration
    ├── 📄 tailwind.config.js            # Tailwind CSS configuration
    ├── 📄 postcss.config.js             # PostCSS configuration
    ├── 📄 .gitignore                    # Git ignore rules
    ├── 📄 .env.example                  # Environment variables template
    ├── 📄 README.md                     # Frontend documentation
    ├── 📄 QUICKSTART.md                 # Quick start guide
    ├── 📄 DEPLOYMENT_CHECKLIST.md       # Deployment checklist
    ├── 📄 setup.sh                      # Automated setup script
    │
    ├── 📁 public/                       # Static assets (empty for now)
    │   └── (your images, icons, etc.)
    │
    └── 📁 src/                          # Source code
        │
        ├── 📁 app/                      # Next.js App Router
        │   ├── 📄 globals.css           # Global CSS styles
        │   ├── 📄 layout.tsx            # Root layout with providers
        │   └── 📄 page.tsx              # Main home page component
        │
        ├── 📁 components/               # React components
        │   ├── 📄 NumberPicker.tsx      # Interactive number selector
        │   ├── 📄 RoundInfo.tsx         # Current round information
        │   ├── 📄 MyTickets.tsx         # User's purchased tickets
        │   └── 📄 PrizeTiers.tsx        # Prize tiers display
        │
        ├── 📁 hooks/                    # Custom React hooks
        │   └── 📄 useLotteryContract.ts # Contract interaction hooks
        │
        ├── 📁 utils/                    # Utility functions
        │   └── 📄 wagmi.ts              # Wagmi/Web3 configuration
        │
        └── 📁 constants/                # Constants and configuration
            ├── 📄 abi.ts                # Smart contract ABI
            └── 📄 index.ts              # Contract address & chain config
```

---

## 📄 File-by-File Breakdown

### Root Level Files

#### `PROJECT_OVERVIEW.md`
- **Purpose**: Master guide for the entire project
- **Contents**: 
  - Project summary
  - What you have
  - Getting started guide
  - Key concepts
  - Common tasks
  - Troubleshooting
- **Use**: Read this first to understand the project

#### `TieredSequentialLottery.sol`
- **Purpose**: Main smart contract (Solidity)
- **Contents**:
  - Lottery logic
  - Tiered prize system
  - Owner fee mechanism
  - Carry over system
  - All contract functions
- **Size**: ~350 lines
- **Use**: Deploy to blockchain

#### `README_Tiered.md`
- **Purpose**: Smart contract documentation
- **Contents**:
  - How the lottery works
  - Prize distribution
  - Sequential matching explanation
  - Deployment instructions
  - Security notes
  - Examples
- **Use**: Understand contract mechanics

#### `REVENUE_FLOW.md`
- **Purpose**: Visual revenue flow documentation
- **Contents**:
  - ASCII diagrams of money flow
  - Multi-round examples
  - Owner balance tracking
  - Carry over mechanism
- **Use**: Understand revenue distribution

#### `TieredSequentialLottery.test.js`
- **Purpose**: Hardhat test suite
- **Contents**:
  - Unit tests for all functions
  - Integration tests
  - Example usage code
  - Test scenarios
- **Size**: ~300 lines
- **Use**: Test contract before deployment

---

### Frontend Application (`lottery-dapp/`)

#### Configuration Files

##### `package.json`
```json
{
  "name": "lottery-dapp",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",      // Start development server
    "build": "next build",  // Build for production
    "start": "next start",  // Start production server
    "lint": "next lint"     // Run linter
  },
  "dependencies": {
    "next": "14.1.0",       // React framework
    "ethers": "^6.10.0",    // Ethereum library
    "wagmi": "^2.5.7",      // React hooks for Ethereum
    "@rainbow-me/rainbowkit": "^2.0.2"  // Wallet connection
  }
}
```

##### `next.config.js`
- **Purpose**: Configure Next.js build
- **Key Settings**:
  - Webpack fallbacks for crypto modules
  - External dependencies
  - React strict mode

##### `tsconfig.json`
- **Purpose**: TypeScript compiler settings
- **Key Settings**:
  - Path aliases (`@/*`)
  - JSX support
  - Module resolution

##### `tailwind.config.js`
- **Purpose**: Tailwind CSS customization
- **Custom Settings**:
  - Color schemes (primary, secondary)
  - Custom animations
  - Content paths

##### `postcss.config.js`
- **Purpose**: PostCSS configuration
- **Plugins**:
  - Tailwind CSS
  - Autoprefixer

##### `.gitignore`
- **Purpose**: Files to exclude from Git
- **Excludes**:
  - node_modules
  - .next build folder
  - .env files
  - System files

##### `.env.example`
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```
- **Purpose**: Template for environment variables
- **Use**: Copy to `.env.local` and fill in

---

#### Documentation Files

##### `README.md`
- **Purpose**: Frontend technical documentation
- **Sections**:
  - Features overview
  - Tech stack details
  - Installation steps
  - Configuration guide
  - Project structure
  - Deployment instructions
  - Troubleshooting
- **Size**: ~400 lines
- **Audience**: Developers

##### `QUICKSTART.md`
- **Purpose**: Fast setup guide
- **Steps**:
  1. Deploy contract
  2. Get WalletConnect ID
  3. Setup frontend
  4. Run development
  5. Test
  6. Deploy production
- **Size**: ~200 lines
- **Audience**: Everyone

##### `DEPLOYMENT_CHECKLIST.md`
- **Purpose**: Pre-deployment checklist
- **Categories**:
  - Smart contract checks
  - Frontend setup
  - Design & UX
  - Testing
  - Security
  - Performance
  - Legal compliance
- **Size**: ~300 lines
- **Use**: Before going live

##### `setup.sh`
- **Purpose**: Automated setup script
- **Actions**:
  - Check Node.js/npm
  - Install dependencies
  - Create .env.local
  - Display next steps
- **Usage**: `./setup.sh`

---

### Source Code (`src/`)

#### App Directory (`src/app/`)

##### `layout.tsx`
```tsx
Root Layout Component
├── WagmiProvider        // Web3 connection
├── QueryClientProvider  // Data caching
└── RainbowKitProvider  // Wallet UI
    └── {children}      // Page content
```
- **Purpose**: Wrap entire app with providers
- **Key Features**:
  - Wallet connection setup
  - React Query setup
  - Global providers
- **Size**: ~40 lines

##### `page.tsx`
```tsx
Main Home Page
├── Header (wallet connection)
├── Winnings Banner (if user has winnings)
├── Transaction Status (pending/success/error)
└── Main Grid
    ├── Left Column
    │   ├── Round Info
    │   ├── Buy Ticket (if active)
    │   └── My Tickets
    └── Right Column
        ├── Prize Tiers
        ├── How to Play
        └── Revenue Split
```
- **Purpose**: Main application page
- **Key Features**:
  - Orchestrates all components
  - Handles user interactions
  - Manages transaction states
- **Size**: ~200 lines

##### `globals.css`
- **Purpose**: Global CSS styles
- **Contents**:
  - Tailwind directives
  - Custom scrollbar
  - Animation keyframes
  - Reset styles
- **Size**: ~60 lines

---

#### Components (`src/components/`)

##### `NumberPicker.tsx`
```tsx
Number Picker Component
├── Selected Numbers Display (top)
├── Quick Pick & Clear Buttons
├── Number Grid (1-49)
│   └── Each number button
│       ├── Selected state
│       ├── Position indicator
│       └── Click handler
└── Helper Text
```
- **Purpose**: Let users select 7 numbers
- **Features**:
  - Click to select/deselect
  - Quick pick (random)
  - Clear all
  - Visual position indicators
  - Disabled state support
- **Props**:
  - `onNumbersChange`: Callback with selected numbers
  - `disabled`: Whether picker is active
- **Size**: ~120 lines

##### `RoundInfo.tsx`
```tsx
Round Info Component
├── Round Number & Status Badge
├── Prize Pool (large display)
│   └── Carry over info
└── Details Grid
    ├── Ticket Price
    └── Time Remaining (countdown)
```
- **Purpose**: Display current round information
- **Features**:
  - Live countdown timer
  - Prize pool with carry over
  - Active/ended status
  - Gradient design
- **Props**:
  - `roundInfo`: Round data from contract
  - `carryOverBalance`: Carry over amount
  - `ticketPrice`: Cost per ticket
- **Size**: ~100 lines

##### `MyTickets.tsx`
```tsx
My Tickets Component
├── Ticket Count Header
└── For each ticket:
    ├── Ticket Number
    ├── Win Badge (if drawn)
    ├── User's Numbers
    │   └── Match highlighting
    └── Winning Numbers (if drawn)
```
- **Purpose**: Show user's purchased tickets
- **Features**:
  - Match highlighting (green/red)
  - Win/loss indicators
  - Winning number comparison
  - Multiple tickets support
- **Props**:
  - `roundId`: Current round ID
  - `isDrawn`: Whether round is drawn
- **Size**: ~120 lines

##### `PrizeTiers.tsx`
```tsx
Prize Tiers Component
└── For each tier (7 to 2):
    ├── Tier emoji
    ├── Match count
    ├── Percentage
    └── Prize amount
        └── (calculated from prize pool)
```
- **Purpose**: Display all prize tiers
- **Features**:
  - Color-coded tiers
  - Prize calculations
  - Split indication
  - Responsive design
- **Props**:
  - `prizeTiers`: Tier data from contract
  - `prizePool`: Current prize pool
- **Size**: ~100 lines

---

#### Hooks (`src/hooks/`)

##### `useLotteryContract.ts`
```typescript
Custom Hooks for Contract Interaction

Main Hook: useLotteryContract()
├── Read Functions
│   ├── roundInfo
│   ├── ticketPrice
│   ├── carryOverBalance
│   ├── ownerBalance
│   └── prizeTiers
│
├── Write Functions
│   ├── buyTicket(numbers)
│   ├── claimWinnings()
│   ├── drawLottery()
│   ├── startNewRound(duration)
│   └── withdrawOwnerFees()
│
├── Transaction States
│   ├── isPending
│   ├── isSuccess
│   ├── isError
│   └── error
│
└── Event Listeners
    ├── TicketPurchased
    └── LotteryDrawn

Additional Hooks:
├── useMyTickets(roundId, address)
├── usePlayerWinnings(address)
├── useWinningNumbers(roundId, isDrawn)
└── useTierInfo(roundId, isDrawn)
```
- **Purpose**: Interact with smart contract
- **Key Features**:
  - Read contract state
  - Write transactions
  - Event listening
  - Auto-refresh on events
- **Size**: ~180 lines

---

#### Utils (`src/utils/`)

##### `wagmi.ts`
```typescript
Wagmi Configuration
├── Supported Chains
│   ├── Sepolia (testnet)
│   ├── Mumbai (testnet)
│   └── Localhost (development)
│
└── Wallet Connectors
    ├── MetaMask
    ├── WalletConnect
    ├── Coinbase Wallet
    └── Rainbow Wallet
```
- **Purpose**: Configure Web3 connection
- **Key Settings**:
  - Chain configuration
  - WalletConnect setup
  - App metadata
- **Size**: ~15 lines

---

#### Constants (`src/constants/`)

##### `abi.ts`
- **Purpose**: Contract ABI (Application Binary Interface)
- **Contents**:
  - Function signatures
  - Event definitions
  - Input/output types
- **Size**: ~500 lines (auto-generated)
- **Use**: Enable contract interaction

##### `index.ts`
```typescript
Contract Configuration

export const LOTTERY_CONTRACT_ADDRESS = "0x...";

export const SUPPORTED_CHAINS = {
  SEPOLIA: 11155111,
  MUMBAI: 80001,
  LOCALHOST: 31337,
};

export const ACTIVE_CHAIN = SUPPORTED_CHAINS.SEPOLIA;
```
- **Purpose**: Contract address and chain config
- **Important**: Update `LOTTERY_CONTRACT_ADDRESS` after deployment
- **Size**: ~10 lines

---

## 📊 File Size Summary

| Category | Files | Total Lines |
|----------|-------|-------------|
| Smart Contract | 1 | ~350 |
| Tests | 1 | ~300 |
| Documentation | 6 | ~1,500 |
| Frontend Config | 6 | ~100 |
| Frontend Code | 10 | ~1,000 |
| **Total** | **24** | **~3,250** |

---

## 🔄 Data Flow

```
User Browser
    ↓
Next.js App (page.tsx)
    ↓
Components (NumberPicker, RoundInfo, etc.)
    ↓
Custom Hooks (useLotteryContract)
    ↓
Wagmi/Viem (Web3 library)
    ↓
RPC Provider (Alchemy, Infura, etc.)
    ↓
Blockchain (Ethereum, Polygon, etc.)
    ↓
Smart Contract (TieredSequentialLottery)
```

---

## 🎯 Key Integration Points

### 1. Contract ↔ Frontend
- **ABI**: Defines contract interface
- **Address**: Points to deployed contract
- **Hooks**: Bridge between React and Web3

### 2. Wallet ↔ App
- **RainbowKit**: Wallet connection UI
- **Wagmi**: React hooks for Web3
- **Providers**: Wrap app with Web3 context

### 3. State Management
- **React Query**: Cache blockchain data
- **Wagmi**: Manage contract state
- **React State**: Local UI state

---

## 📝 Configuration Checklist

Before running, you must configure:

1. ✅ **Contract Address** (`src/constants/index.ts`)
2. ✅ **WalletConnect ID** (`.env.local`)
3. ✅ **Active Chain** (`src/constants/index.ts`)
4. ✅ **Contract ABI** (should match deployed contract)

---

## 🚀 Startup Sequence

```bash
1. npm install           # Install dependencies
2. cp .env.example .env.local  # Create environment file
3. # Edit .env.local     # Add WalletConnect ID
4. # Edit src/constants/index.ts  # Add contract address
5. npm run dev          # Start development server
6. # Open http://localhost:3000
```

---

## 📦 Dependencies Explained

### Production Dependencies
- **next**: React framework with SSR
- **react**: UI library
- **react-dom**: React renderer
- **ethers**: Ethereum interaction
- **wagmi**: React hooks for Ethereum
- **viem**: TypeScript Ethereum library
- **@rainbow-me/rainbowkit**: Wallet connection UI
- **@tanstack/react-query**: Data fetching/caching

### Dev Dependencies
- **typescript**: Type checking
- **tailwindcss**: Utility-first CSS
- **autoprefixer**: CSS compatibility
- **postcss**: CSS processing
- **@types/***: TypeScript type definitions

---

This structure gives you a complete, production-ready lottery DApp! 🎰
