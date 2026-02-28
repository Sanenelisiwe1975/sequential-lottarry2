# 🎰 Sequential Lottery Backend API

Backend server for the Sequential Lottery DApp. Provides REST API endpoints, blockchain event synchronization, and data persistence.

## 🚀 Features

- ✅ **RESTful API** - Complete CRUD operations for lottery data
- ✅ **MongoDB Database** - Persistent storage for rounds, tickets, and users
- ✅ **Blockchain Sync** - Real-time event listener syncs blockchain data
- ✅ **Historical Data** - Track lottery history and statistics
- ✅ **User Analytics** - Player statistics and leaderboards
- ✅ **Rate Limiting** - API protection and rate limiting
- ✅ **TypeScript** - Type-safe codebase
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Logging** - Winston logger for debugging

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Blockchain RPC endpoint (Infura, Alchemy, etc.)

## 🔧 Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/lottery-dapp

# Blockchain
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
LOTTERY_CONTRACT_ADDRESS=0xYourContractAddress
CHAIN_ID=11155111

# Event Listener
ENABLE_EVENT_LISTENER=true
SYNC_FROM_BLOCK=latest
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB: https://www.mongodb.com/docs/manual/installation/
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster and get connection string
3. Update `MONGODB_URI` in `.env`

### 4. Run the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

## 📡 API Endpoints

Base URL: `http://localhost:5000/api/v1`

### Health Check
```http
GET /health
```

### Rounds

```http
GET /rounds/current              # Get active round
GET /rounds/all?page=1&limit=10  # Get all rounds (paginated)
GET /rounds/:roundId             # Get specific round
GET /rounds/:roundId/stats       # Get round statistics
GET /rounds/:roundId/winners     # Get round winners
```

### Tickets

```http
GET /tickets/:ticketId                        # Get ticket by ID
GET /tickets/player/:address                  # Get player's tickets
GET /tickets/round/:roundId                   # Get round's tickets
GET /tickets/player/:address/round/:roundId   # Get player's tickets for round
```

### Users

```http
GET /users/top?limit=10                # Get top players
GET /users/:address/profile            # Get user profile
GET /users/:address/stats              # Get user statistics
GET /users/:address/winnings?claimed=false  # Get user winnings
```

### Statistics

```http
GET /stats/global              # Get global statistics
GET /stats/activity?limit=10   # Get recent activity
GET /stats/numbers/frequency   # Get number frequency
```

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## 🗄️ Database Schema

### Round
- `roundId` - Unique round identifier
- `startTime` - Round start timestamp
- `endTime` - Round end timestamp
- `isActive` - Whether round is active
- `prizePool` - Total prize pool amount
- `ticketCount` - Number of tickets sold
- `winningNumbers` - Array of winning numbers [1-49]
- `status` - active | drawn | completed

### Ticket
- `ticketId` - Unique ticket identifier
- `roundId` - Associated round
- `player` - Player address
- `numbers` - Chosen numbers [7]
- `purchasePrice` - Ticket cost
- `purchasedAt` - Purchase timestamp
- `matches` - Number of sequential matches
- `prizeAmount` - Prize won

### User
- `address` - User wallet address
- `ticketsPurchased` - Total tickets bought
- `totalSpent` - Total amount spent
- `totalWon` - Total amount won
- `roundsParticipated` - Array of round IDs

### Winner
- `roundId` - Round identifier
- `ticketId` - Winning ticket
- `player` - Winner address
- `tier` - Prize tier (1-6)
- `matches` - Number of matches (2-7)
- `prizeAmount` - Prize amount
- `claimed` - Whether prize is claimed

## 🔄 Blockchain Event Listener

The backend automatically syncs blockchain events to the database.

### Synced Events:
- `TicketPurchased` - New ticket purchases
- `LotteryDrawn` - Round results
- `WinnerDetermined` - Winner calculations
- `WinningsClaimed` - Prize claims
- `NewRoundStarted` - New round creation

### Configuration:

```env
ENABLE_EVENT_LISTENER=true     # Enable/disable listener
SYNC_FROM_BLOCK=latest         # Start block (latest or number)
SYNC_INTERVAL_MS=12000         # Polling interval
```

## 🧪 Testing

```bash
# Run tests (coming soon)
npm test
```

## 📝 Example Usage

### Get Current Round

```javascript
const response = await fetch('http://localhost:5000/api/v1/rounds/current');
const { data } = await response.json();
console.log(data); // Current round info
```

### Get User Statistics

```javascript
const address = '0x1234...';
const response = await fetch(`http://localhost:5000/api/v1/users/${address}/stats`);
const { data } = await response.json();
console.log(data.statistics); // User stats
```

### Get Recent Winners

```javascript
const roundId = 5;
const response = await fetch(`http://localhost:5000/api/v1/rounds/${roundId}/winners`);
const { data } = await response.json();
console.log(data); // Array of winners
```

## 🔐 Security

- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation
- ✅ Error sanitization

## 📦 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── abi.ts       # Contract ABI
│   │   ├── blockchain.ts # Blockchain setup
│   │   ├── database.ts  # MongoDB connection
│   │   └── logger.ts    # Winston logger
│   ├── controllers/     # Route controllers
│   │   ├── roundController.ts
│   │   ├── ticketController.ts
│   │   ├── userController.ts
│   │   └── statsController.ts
│   ├── middleware/      # Express middleware
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── models/          # MongoDB models
│   │   ├── Round.ts
│   │   ├── Ticket.ts
│   │   ├── User.ts
│   │   └── Winner.ts
│   ├── routes/          # API routes
│   │   ├── roundRoutes.ts
│   │   ├── ticketRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── statsRoutes.ts
│   │   └── index.ts
│   ├── services/        # Business logic
│   │   └── blockchainListener.ts
│   ├── app.ts           # Express app
│   └── server.ts        # Server entry point
├── .env.example         # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Deployment

### Option 1: VPS (DigitalOcean, AWS, etc.)

```bash
# Build
npm run build

# Start with PM2
npm install -g pm2
pm2 start dist/server.js --name lottery-api

# Monitor
pm2 logs lottery-api
pm2 monit
```

### Option 2: Docker

```dockerfile
# Coming soon
```

### Option 3: Serverless

Deploy to platforms like:
- Vercel
- Railway
- Render
- Heroku

## 🔧 Troubleshooting

### MongoDB Connection Failed
```bash
# Check MongoDB is running
mongod --version

# Start MongoDB
mongod
```

### Event Listener Not Working
- Verify RPC_URL is correct
- Check LOTTERY_CONTRACT_ADDRESS matches deployed contract
- Ensure ENABLE_EVENT_LISTENER=true

### Port Already in Use
```bash
# Change PORT in .env
PORT=5001
```

## 📚 Additional Resources

- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Ethers.js Docs](https://docs.ethers.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

Contributions welcome! Please read the main project README for guidelines.

## 📄 License

MIT License

---

**Built with ❤️ for the Web3 community**
