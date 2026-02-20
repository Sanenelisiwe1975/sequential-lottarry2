# 🚀 COMPLETE DEPLOYMENT GUIDE - From Zero to Live DApp

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup Environment](#setup-environment)
3. [Deploy Smart Contract](#deploy-smart-contract)
4. [Verify Contract on Etherscan](#verify-contract)
5. [Setup Frontend](#setup-frontend)
6. [Run the DApp](#run-the-dapp)
7. [How to Play (Pick Numbers)](#how-to-play)
8. [Troubleshooting](#troubleshooting)

---

## 1️⃣ PREREQUISITES

### What You Need:

#### A. Software
- [ ] **Node.js 18+** - [Download](https://nodejs.org)
- [ ] **npm or yarn** - Comes with Node.js
- [ ] **Git** (optional) - [Download](https://git-scm.com)
- [ ] **Code Editor** - VS Code recommended

Check versions:
```bash
node --version  # Should show v18 or higher
npm --version   # Should show 8 or higher
```

#### B. Web3 Wallet
- [ ] **MetaMask** - [Install](https://metamask.io)
- [ ] Create/Import wallet
- [ ] Save your seed phrase safely!

#### C. Testnet Tokens (FREE)
- [ ] **Sepolia ETH** - Get from faucets
- [ ] **Sepolia LINK** - Get from Chainlink faucet

#### D. API Keys (FREE)
- [ ] **Alchemy/Infura RPC URL** - [Get here](https://alchemy.com)
- [ ] **Etherscan API Key** - [Get here](https://etherscan.io/apis)
- [ ] **WalletConnect Project ID** - [Get here](https://cloud.walletconnect.com)

---

## 2️⃣ SETUP ENVIRONMENT

### Step 1: Extract Project

```bash
# Extract the archive
unzip lottery-complete-final.zip
# or
tar -xzf lottery-complete-final.tar.gz

# Navigate to project
cd sequential-lottery
```

### Step 2: Get Testnet Tokens

#### Get Sepolia ETH (for gas fees)

**Option 1: Alchemy Faucet**
1. Visit: https://sepoliafaucet.com
2. Sign in with Alchemy account (free)
3. Enter your wallet address
4. Click "Send Me ETH"
5. Wait 1-2 minutes
6. Check MetaMask - should have 0.5 ETH

**Option 2: Other Faucets**
- https://faucet.quicknode.com/ethereum/sepolia
- https://www.infura.io/faucet/sepolia

#### Get Sepolia LINK (for Chainlink VRF)

1. Visit: https://faucets.chain.link/sepolia
2. Connect MetaMask (Sepolia network)
3. Enter wallet address
4. Click "Send request"
5. Wait 1-2 minutes
6. Check MetaMask - should have 20 LINK

### Step 3: Create Chainlink VRF Subscription

**This is REQUIRED for the lottery to work!**

1. **Visit VRF Dashboard**
   - Go to: https://vrf.chain.link
   - Connect MetaMask
   - Switch to Sepolia network

2. **Create Subscription**
   - Click "Create Subscription"
   - Confirm transaction in MetaMask
   - Wait for confirmation
   - **SAVE YOUR SUBSCRIPTION ID** (you'll need this!)
   - Example: Subscription ID: `12345`

3. **Fund Subscription**
   - Click "Add Funds"
   - Enter amount: `2` LINK (minimum)
   - Confirm transaction
   - Wait for confirmation

4. **Keep Dashboard Open**
   - You'll add the contract address here after deployment

### Step 4: Get API Keys

#### Alchemy RPC URL
1. Visit: https://alchemy.com
2. Sign up (free)
3. Create new app
   - Name: "Sequential Lottery"
   - Network: Ethereum → Sepolia
4. Click "View Key"
5. Copy "HTTPS" URL
   - Example: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`

#### Etherscan API Key
1. Visit: https://etherscan.io/myapikey
2. Sign up (free)
3. Click "Add" to create new API key
4. Name it: "Lottery Verification"
5. Copy the API key

#### WalletConnect Project ID
1. Visit: https://cloud.walletconnect.com
2. Sign up (free)
3. Create new project
   - Name: "Sequential Lottery"
4. Copy "Project ID"

---

## 3️⃣ DEPLOY SMART CONTRACT

### Step 1: Setup Smart Contract Environment

```bash
# Navigate to smart contracts
cd smart-contracts

# Install dependencies (this may take 2-3 minutes)
npm install
```

### Step 2: Configure Environment

```bash
# Create .env file from template
cp .env.example .env

# Edit the file
nano .env
# or use any text editor
```

**Add these values to .env:**

```env
# Your wallet private key (WITHOUT 0x prefix)
PRIVATE_KEY=your_private_key_here

# Chainlink VRF Subscription ID (from Step 3 above)
VRF_SUBSCRIPTION_ID=12345

# Alchemy RPC URL (from Step 4)
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Etherscan API Key (from Step 4)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```

**⚠️ IMPORTANT - Get Your Private Key:**

1. Open MetaMask
2. Click three dots (⋮)
3. Click "Account Details"
4. Click "Show Private Key"
5. Enter password
6. Copy private key
7. Paste in .env (WITHOUT 0x prefix)

**🔒 SECURITY WARNING:**
- NEVER share your private key
- NEVER commit .env file to Git
- Use a separate wallet for testing

### Step 3: Deploy Contract

```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia
```

**What You'll See:**

```
🎰 Deploying Tiered Sequential Lottery with Chainlink VRF...

Network: Sepolia Testnet
VRF Coordinator: 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
Gas Lane: 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c
Subscription ID: 12345
Callback Gas Limit: 2500000

Deployer address: 0xYourAddress...
Deployer balance: 0.5 ETH

Deploying contract...
✅ Contract deployed successfully!
Contract address: 0xAbc123Def456...

=========================================================================
🎯 IMPORTANT NEXT STEPS:
=========================================================================

1. Add this contract as a consumer to your VRF subscription:
   👉 Visit: https://vrf.chain.link
   👉 Select your subscription
   👉 Click 'Add Consumer'
   👉 Paste contract address: 0xAbc123Def456...

2. Verify contract on block explorer:
   npx hardhat verify --network sepolia 0xAbc123Def456... [args]

3. Update frontend with contract address:
   File: frontend/src/constants/index.ts
   LOTTERY_CONTRACT_ADDRESS = "0xAbc123Def456..."

=========================================================================
```

**📝 SAVE THIS INFORMATION:**
- ✅ Contract Address: `0xAbc123Def456...`
- ✅ Transaction Hash: Copy from terminal
- ✅ Deployment successful ✓

### Step 4: Add Contract to VRF Subscription

**This is CRITICAL - contract won't work without this!**

1. **Go back to VRF Dashboard**
   - https://vrf.chain.link
   - Make sure you're on Sepolia network

2. **Select Your Subscription**
   - Click on your subscription ID

3. **Add Consumer**
   - Click "Add Consumer" button
   - Paste your contract address: `0xAbc123Def456...`
   - Click "Add Consumer"
   - Confirm transaction in MetaMask
   - Wait for confirmation

4. **Verify**
   - You should see your contract in the "Consumers" list
   - Status should show "Active"

---

## 4️⃣ VERIFY CONTRACT ON ETHERSCAN

**Why verify?**
- Users can read your contract code
- Builds trust
- Easier to interact with
- Required for production

### Method 1: Automatic Verification (Easiest)

```bash
# Still in smart-contracts/ directory

# Run verification command
npx hardhat verify --network sepolia \
  0xYourContractAddress \
  "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625" \
  "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c" \
  "12345" \
  "2500000"
```

**Replace:**
- `0xYourContractAddress` - Your deployed contract address
- `12345` - Your VRF subscription ID

**What You'll See:**

```
Nothing to compile
Successfully submitted source code for contract
contracts/TieredSequentialLotteryVRF_Secure.sol:TieredSequentialLotteryVRF_Secure at 0xAbc...
for verification on the block explorer. Waiting for verification result...

Successfully verified contract TieredSequentialLotteryVRF_Secure on Etherscan.
https://sepolia.etherscan.io/address/0xAbc...#code
```

### Method 2: Manual Verification (If Automatic Fails)

1. **Visit Etherscan**
   - Go to: https://sepolia.etherscan.io
   - Search for your contract address

2. **Start Verification**
   - Click "Contract" tab
   - Click "Verify and Publish"

3. **Fill Form**
   - Compiler Type: Solidity (Single file)
   - Compiler Version: v0.8.20+commit...
   - License: MIT

4. **Upload Code**
   - Copy contract code from `contracts/TieredSequentialLotteryVRF_Secure.sol`
   - Paste in "Enter the Solidity Contract Code below"

5. **Constructor Arguments**
   - This is the tricky part
   - You need the ABI-encoded constructor arguments
   - Run this command:

```bash
npx hardhat flatten contracts/TieredSequentialLotteryVRF_Secure.sol > flattened.sol
```

6. **Submit**
   - Click "Verify and Publish"
   - Wait 30-60 seconds
   - Should see "Success!"

### Verify Verification ✓

1. Visit: `https://sepolia.etherscan.io/address/0xYourAddress#code`
2. Should see green checkmark: ✓
3. Can now read contract code
4. Can interact via "Write Contract" tab

---

## 5️⃣ SETUP FRONTEND

### Step 1: Navigate to Frontend

```bash
# From project root
cd frontend

# Or if you're in smart-contracts/
cd ../frontend
```

### Step 2: Install Dependencies

```bash
# Install all packages (takes 2-3 minutes)
npm install
```

**What's installing:**
- Next.js 14
- React 18
- RainbowKit (wallet connection)
- Wagmi (Web3 hooks)
- Viem (Ethereum library)
- Tailwind CSS
- TypeScript

### Step 3: Configure Environment

```bash
# Create environment file
cp .env.example .env.local

# Edit it
nano .env.local
```

**Add to .env.local:**

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

**Get WalletConnect ID (if you haven't already):**
1. Go to: https://cloud.walletconnect.com
2. Sign up (free)
3. Create new project
4. Copy Project ID
5. Paste in .env.local

### Step 4: Update Contract Address

**This is CRITICAL - connect frontend to your contract!**

```bash
# Edit the constants file
nano src/constants/index.ts
```

**Find this line:**
```typescript
export const LOTTERY_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";
```

**Change to your deployed contract address:**
```typescript
export const LOTTERY_CONTRACT_ADDRESS = "0xYourActualContractAddress";
```

**Example:**
```typescript
export const LOTTERY_CONTRACT_ADDRESS = "0xAbc123Def456789...";
```

Save the file!

### Step 5: Verify Configuration

Check that everything is set:

```bash
# Check environment file exists
ls -la .env.local

# Check contract address is updated
grep "LOTTERY_CONTRACT_ADDRESS" src/constants/index.ts
```

Should show your contract address, not the placeholder!

---

## 6️⃣ RUN THE DAPP

### Step 1: Start Development Server

```bash
# Make sure you're in frontend/ directory
npm run dev
```

**What You'll See:**

```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.x:3000

 ✓ Ready in 2.3s
```

### Step 2: Open in Browser

1. **Open browser**
   - Chrome, Firefox, or Brave recommended
   - Go to: http://localhost:3000

2. **What You Should See:**
   ```
   🎰 Sequential Lottery
   
   [Connect Wallet Button]
   
   Current Round: #1
   Prize Pool: 0.000 ETH
   Time Remaining: 23:59:45
   Ticket Price: 0.01 ETH
   ```

### Step 3: Connect Wallet

1. **Click "Connect Wallet"**
   - Rainbow/MetaMask popup appears

2. **Select MetaMask**
   - Click MetaMask icon

3. **Approve Connection**
   - MetaMask popup: "Connect to Sequential Lottery?"
   - Click "Next"
   - Click "Connect"

4. **Switch to Sepolia**
   - If on wrong network, MetaMask will prompt
   - Click "Switch Network"
   - Select "Sepolia"

5. **Connected!**
   - Should see your address in top right
   - Example: `0xAbc1...23De`
   - Should see your ETH balance

---

## 7️⃣ HOW TO PLAY (PICK NUMBERS)

### Step 1: View Current Round

Once connected, you'll see:

```
┌─────────────────────────────────────┐
│  Current Round #1                   │
│  Prize Pool: 0.000 ETH              │
│  Time Remaining: 23:59:45           │
│  Ticket Price: 0.01 ETH             │
│  Status: Active ✓                   │
└─────────────────────────────────────┘
```

### Step 2: Pick Your Numbers

**You'll see a number grid:**

```
┌─────────────────────────────────────────────────┐
│  Pick 7 Numbers (1-49)                          │
│                                                 │
│  [1]  [2]  [3]  [4]  [5]  [6]  [7]  [8]  [9]  │
│  [10] [11] [12] [13] [14] [15] [16] [17] [18] │
│  [19] [20] [21] [22] [23] [24] [25] [26] [27] │
│  [28] [29] [30] [31] [32] [33] [34] [35] [36] │
│  [37] [38] [39] [40] [41] [42] [43] [44] [45] │
│  [46] [47] [48] [49]                           │
│                                                 │
│  Selected: [  ] [  ] [  ] [  ] [  ] [  ] [  ] │
│                                                 │
│  [Quick Pick]  [Clear]                          │
└─────────────────────────────────────────────────┘
```

**Option A: Pick Manually**

1. Click number `7` - turns blue, appears in position 1
2. Click number `14` - turns blue, appears in position 2
3. Click number `21` - turns blue, appears in position 3
4. Click number `28` - turns blue, appears in position 4
5. Click number `35` - turns blue, appears in position 5
6. Click number `42` - turns blue, appears in position 6
7. Click number `49` - turns blue, appears in position 7

**Now shows:**
```
Selected: [7] [14] [21] [28] [35] [42] [49]
```

**Option B: Quick Pick (Random)**

1. Click "Quick Pick" button
2. 7 random numbers automatically selected
3. Example result: `[3] [12] [23] [31] [38] [45] [47]`

**To Change:**
- Click any selected number to deselect it
- Click "Clear" to start over
- Pick different numbers

### Step 3: Buy Ticket

1. **After selecting 7 numbers, click "Buy Ticket"**

2. **MetaMask Popup Appears:**
   ```
   Sequential Lottery wants to:
   
   Buy Ticket
   
   Gas (estimated): 0.0003 ETH
   Total: 0.0103 ETH
   
   [Reject] [Confirm]
   ```

3. **Review Transaction:**
   - Amount: 0.01 ETH (ticket price)
   - Gas: ~0.0003 ETH
   - Total: ~0.0103 ETH

4. **Click "Confirm"**

5. **Wait for Confirmation:**
   - Should take 10-30 seconds
   - Status shows: "Transaction pending..."
   - Then: "✓ Ticket purchased!"

### Step 4: View Your Ticket

After purchase, scroll down to see:

```
┌─────────────────────────────────────┐
│  My Tickets (1)                     │
│                                     │
│  Ticket #1                          │
│  Numbers: [7][14][21][28][35][42][49]│
│  Status: Waiting for draw...        │
│  Purchased: 2 minutes ago           │
└─────────────────────────────────────┘
```

### Step 5: Wait for Draw

The round must end before drawing. You'll see:

```
Time Remaining: 23:47:23

OR (if ended):

Round Ended - Waiting for draw
```

**As owner, you can draw the lottery:**

1. Click "Owner Panel" (if you're the owner)
2. Click "Draw Lottery"
3. Confirm transaction
4. Wait 1-3 minutes for Chainlink VRF

### Step 6: Check Results

After draw:

```
┌─────────────────────────────────────┐
│  My Tickets (1)                     │
│                                     │
│  Ticket #1                          │
│  Your Numbers: [7][14][21][28][35][42][49]│
│  Winning:      [7][14][23][30][35][41][49]│
│  Matches: 2 (sequential) ✓          │
│  Prize: 0.0005 ETH (5%)             │
│  [Claim Winnings]                   │
└─────────────────────────────────────┘
```

**What the colors mean:**
- 🟢 Green = Matched
- 🔴 Red = Not matched
- ⚪ Gray = Not checked (after first mismatch)

### Step 7: Claim Winnings

If you won:

1. **Click "Claim Winnings" button**

2. **MetaMask Popup:**
   ```
   Sequential Lottery wants to:
   
   Claim Winnings
   
   You will receive: 0.0005 ETH
   Gas (estimated): 0.0002 ETH
   
   [Reject] [Confirm]
   ```

3. **Click "Confirm"**

4. **Wait for Confirmation**
   - Should take 10-30 seconds
   - Status: "Claiming..."
   - Then: "✓ Claimed 0.0005 ETH!"

5. **Check Your Balance**
   - MetaMask balance updated
   - Can see in transaction history

---

## 8️⃣ COMPLETE GAME FLOW EXAMPLE

### Scenario: Playing a Complete Round

**Step 1: Owner Starts Round (You if deploying)**

```bash
# Using Hardhat console
cd smart-contracts
npx hardhat console --network sepolia

# In console:
const lottery = await ethers.getContractAt("TieredSequentialLotteryVRF_Secure", "0xYourAddress");
await lottery.startNewRound(3600); // 1 hour round
// Wait for transaction...
```

**Step 2: Player Buys Ticket**

On the DApp:
1. Pick numbers: [5, 12, 23, 34, 40, 45, 49]
2. Click "Buy Ticket"
3. Confirm in MetaMask
4. See ticket in "My Tickets"

**Step 3: More Players Join**

Multiple players can buy tickets during the round.

**Step 4: Round Ends**

After 1 hour, the round ends automatically.

**Step 5: Owner Draws Lottery**

```bash
# In Hardhat console:
await lottery.drawLottery();
// This requests random numbers from Chainlink VRF
```

**Step 6: Chainlink Provides Random Numbers**

Wait 1-3 minutes for VRF callback.

**Step 7: Winners Determined**

Contract automatically:
1. Receives 7 random numbers from Chainlink
2. Converts them to numbers 1-49
3. Checks all tickets for sequential matches
4. Calculates prizes per tier
5. Updates winner balances

**Step 8: Players Claim**

Winners see "Claim Winnings" button and can claim their prizes.

**Step 9: Owner Starts New Round**

```bash
await lottery.startNewRound(3600);
```

Unclaimed prizes automatically carry over!

---

## 🎯 TESTING CHECKLIST

### Before Going Live:

- [ ] Contract deployed successfully
- [ ] Contract verified on Etherscan
- [ ] Contract added to VRF subscription
- [ ] VRF subscription has LINK (2+)
- [ ] Frontend running on localhost
- [ ] Can connect MetaMask
- [ ] Can pick numbers
- [ ] Can buy ticket
- [ ] Can see ticket in "My Tickets"
- [ ] Owner can draw lottery
- [ ] Winners can claim prizes
- [ ] Can start new round

### Full Test Flow:

```bash
# Test 1: Buy ticket
- Connect wallet
- Pick 7 numbers
- Buy ticket
- Verify transaction on Etherscan

# Test 2: Draw lottery
- Wait for round to end (or use short duration)
- Call drawLottery()
- Wait for VRF callback
- Check winning numbers displayed

# Test 3: Check results
- See if your ticket won
- Check prize amount
- Claim winnings
- Verify ETH received

# Test 4: New round
- Start new round
- Verify carry over amount
- Buy new ticket
- Repeat
```

---

## 🐛 TROUBLESHOOTING

### Contract Deployment Issues

**Error: "insufficient funds"**
```
Solution: Get more Sepolia ETH from faucet
Check balance: MetaMask should have > 0.1 ETH
```

**Error: "nonce too high"**
```
Solution: Reset MetaMask account
Settings → Advanced → Reset Account
```

**Error: "Invalid subscription ID"**
```
Solution: Check VRF subscription ID in .env
Make sure it's a number, not in quotes
Example: VRF_SUBSCRIPTION_ID=12345
```

### Frontend Issues

**Error: "Module not found"**
```
Solution: Delete node_modules and reinstall
rm -rf node_modules
npm install
```

**Error: "Cannot connect wallet"**
```
Solution 1: Check MetaMask is installed
Solution 2: Check you're on Sepolia network
Solution 3: Clear browser cache
Solution 4: Check WalletConnect Project ID in .env.local
```

**Error: "Contract not found"**
```
Solution: Check contract address in src/constants/index.ts
Should match deployed contract address
Must start with 0x
```

**Page shows but no data**
```
Solution 1: Check contract address is correct
Solution 2: Check you're on Sepolia network
Solution 3: Open browser console (F12) for errors
Solution 4: Make sure contract is deployed
```

### Transaction Issues

**"Transaction failed"**
```
Possible causes:
1. Insufficient gas
2. Round not active
3. Invalid numbers
4. Not enough ETH for ticket

Solution: Check error message in MetaMask
```

**"VRF request failed"**
```
Possible causes:
1. Contract not added to VRF subscription
2. Subscription has no LINK
3. Wrong VRF coordinator address

Solution: 
1. Check vrf.chain.link
2. Verify contract in consumers list
3. Check LINK balance (need 2+)
```

**"Cannot claim winnings"**
```
Possible causes:
1. Already claimed
2. Didn't win
3. Round not drawn yet

Solution: Check "My Tickets" for win status
```

### Common Mistakes

❌ **Forgetting to add contract to VRF subscription**
✅ Must do this after deployment!

❌ **Using wrong network in MetaMask**
✅ Switch to Sepolia

❌ **Not updating contract address in frontend**
✅ Edit src/constants/index.ts

❌ **VRF subscription has no LINK**
✅ Add 2+ LINK to subscription

❌ **Private key has 0x prefix in .env**
✅ Remove 0x prefix

---

## 📱 MOBILE TESTING

### Test on Mobile Device

1. **Get Local IP Address**
```bash
# On Mac/Linux
ifconfig | grep "inet "

# On Windows
ipconfig
```

2. **Start Frontend**
```bash
npm run dev -- -H 0.0.0.0
```

3. **Access from Phone**
- Make sure phone is on same WiFi
- Open browser
- Go to: `http://192.168.1.x:3000`
- Replace x with your IP

4. **Use MetaMask Mobile**
- Install MetaMask app
- Import same wallet
- Switch to Sepolia
- Test buying tickets

---

## 🚀 PRODUCTION DEPLOYMENT

### Before Mainnet:

1. **Security Audit** ($15k-50k)
   - REQUIRED for mainnet
   - Use OpenZeppelin, Trail of Bits, etc.

2. **Setup Multi-Sig**
   - Use Gnosis Safe
   - Require 2-3 signatures

3. **Deploy to Mainnet**
   - Get mainnet ETH
   - Get mainnet LINK
   - Create mainnet VRF subscription
   - Deploy contract
   - Verify contract
   - Test thoroughly

4. **Deploy Frontend**
   - Deploy to Vercel/Netlify
   - Setup custom domain
   - Enable HTTPS
   - Monitor with Sentry

5. **Launch!**
   - Announce to community
   - Monitor closely
   - Have emergency plan ready

---

## 🎉 SUCCESS!

You now know how to:
- ✅ Deploy smart contract to testnet
- ✅ Verify contract on Etherscan
- ✅ Setup Chainlink VRF
- ✅ Run frontend locally
- ✅ Connect wallet
- ✅ Pick numbers and buy tickets
- ✅ Check results and claim winnings

**Your lottery is LIVE! 🎰**

---

## 📚 Additional Resources

### Video Tutorials (Recommended)
- Hardhat Tutorial: https://hardhat.org/tutorial
- Next.js Tutorial: https://nextjs.org/learn
- RainbowKit Setup: https://rainbowkit.com/docs

### Documentation
- Chainlink VRF: https://docs.chain.link/vrf
- Wagmi Hooks: https://wagmi.sh
- Etherscan API: https://docs.etherscan.io

### Community
- Chainlink Discord: https://discord.gg/chainlink
- Ethereum Stack Exchange: https://ethereum.stackexchange.com

---

**Need more help? Check the other documentation files in the `docs/` folder!**

**Good luck with your lottery! 🍀**
