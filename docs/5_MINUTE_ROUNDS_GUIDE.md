# ⏱️ 5-MINUTE CONTINUOUS ROUNDS GUIDE

## 🎯 **NEW ROUND MECHANICS**

### **Key Changes:**
1. ✅ **5 minute rounds** (fixed duration)
2. ✅ **Continuous countdown** (independent of tickets)
3. ✅ **Automatic progression** (rounds continue even without tickets)
4. ✅ **Anyone can draw** (not just owner)

---

## ⏰ **HOW IT WORKS**

### **Round Lifecycle:**

```
┌─────────────────────────────────────────────────┐
│  Round #1 Start                                 │
│  Time: 00:00 (5 minutes countdown begins)      │
├─────────────────────────────────────────────────┤
│  Players buy tickets...                         │
│  Time: 00:30 - Player A buys ticket            │
│  Time: 01:45 - Player B buys ticket            │
│  Time: 03:20 - Player C buys ticket            │
├─────────────────────────────────────────────────┤
│  Round #1 End                                   │
│  Time: 05:00 (automatically ends)               │
├─────────────────────────────────────────────────┤
│  Draw Phase                                     │
│  - Anyone calls drawLottery()                   │
│  - Chainlink VRF generates numbers             │
│  - Numbers sorted ascending                     │
│  - Winners determined                           │
├─────────────────────────────────────────────────┤
│  Round #2 Start                                 │
│  Time: 00:00 (immediately after draw)          │
│  (5 minutes countdown begins again)             │
└─────────────────────────────────────────────────┘
```

---

## 🕐 **ROUND DURATION**

### **Fixed at 5 Minutes:**

```solidity
uint256 public constant ROUND_DURATION = 5 minutes; // 300 seconds
```

### **Timeline:**

| Time | Event |
|------|-------|
| 0:00 | Round starts |
| 0:01 - 4:59 | Players can buy tickets |
| 5:00 | Round ends (automatic) |
| 5:00+ | Draw phase (VRF + matching) |
| After draw | Next round starts |

---

## 🎮 **PLAYER EXPERIENCE**

### **Buying Tickets:**

```
Round Active: 3:45 remaining

You can buy tickets until the round ends!

[Pick Numbers] [Buy Ticket]

Time updates every second:
4:59... 4:58... 4:57... 4:56...
```

### **After Round Ends:**

```
Round #42 Ended!

Waiting for draw...
(Anyone can trigger the draw)

[Draw Lottery Button]
```

### **During Draw:**

```
Drawing in progress...

Requesting random numbers from Chainlink...
Please wait 1-2 minutes.
```

### **New Round Starts:**

```
Round #43 Started!

Time Remaining: 5:00

[Pick Numbers] [Buy Ticket]
```

---

## 🔄 **CONTINUOUS ROUNDS**

### **Round Progression:**

```
Round #1: Start → 5 min → End → Draw → Complete
         ↓
Round #2: Start → 5 min → End → Draw → Complete
         ↓
Round #3: Start → 5 min → End → Draw → Complete
         ↓
Round #4: Start → 5 min → End → Draw → Complete
         ↓
... (continues forever)
```

### **No Gaps:**
- ✅ Rounds run back-to-back
- ✅ No waiting periods
- ✅ Automatic progression
- ✅ Continuous gameplay

---

## 🎫 **TICKET PURCHASES**

### **Time-Based Window:**

```
Round starts at: 10:00:00
Round ends at:   10:05:00

Valid purchase window:
✅ 10:00:01 - Can buy
✅ 10:02:30 - Can buy
✅ 10:04:59 - Can buy (last second!)
❌ 10:05:00 - Too late! Round ended
```

### **No Ticket Minimum:**

```
Scenario 1: 100 tickets bought
→ Normal draw, winners determined

Scenario 2: 5 tickets bought
→ Normal draw, winners determined

Scenario 3: 1 ticket bought
→ Normal draw, winners determined

Scenario 4: 0 tickets bought
→ Skip VRF, carry over prize pool
```

---

## 🏆 **EMPTY ROUNDS**

### **What Happens if No Tickets?**

```solidity
function drawLottery() external {
    // ... checks ...
    
    uint256 ticketCount = roundTickets[currentRoundId].length;
    
    // If no tickets, skip VRF
    if (ticketCount == 0) {
        lotteryRounds[currentRoundId].isDrawn = true;
        lotteryRounds[currentRoundId].winningNumbers = [0,0,0,0,0,0,0];
        
        // Carry over prize pool
        if (lotteryRounds[currentRoundId].prizePool > 0) {
            carryOverBalance = lotteryRounds[currentRoundId].prizePool;
        }
        return;
    }
    
    // Otherwise, normal VRF draw
    // ...
}
```

**Result:**
- No VRF call (saves gas + LINK)
- Prize pool carries to next round
- New round starts immediately
- No delay

---

## 👥 **ANYONE CAN DRAW**

### **Public Draw Function:**

```solidity
function drawLottery() external whenNotPaused {
    require(currentRoundId > 0, "No active round");
    require(!lotteryRounds[currentRoundId].isDrawn, "Round already drawn");
    require(!vrfRequestPending[currentRoundId], "Draw already requested");
    require(
        block.timestamp >= lotteryRounds[currentRoundId].endTime, 
        "Round not ended yet"
    );
    
    // ... draw logic ...
}
```

**Benefits:**
- ✅ Owner doesn't need to be online
- ✅ Players can trigger draw
- ✅ Bots can automate
- ✅ Decentralized operation

**Who Pays Gas?**
- Whoever calls `drawLottery()` pays gas
- Consider adding incentive (small ETH reward)

---

## 📊 **FRONTEND UPDATES**

### **Countdown Timer:**

```typescript
const [timeRemaining, setTimeRemaining] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    const now = Math.floor(Date.now() / 1000);
    const endTime = roundInfo?.endTime || 0;
    const remaining = endTime - now;
    
    setTimeRemaining(remaining > 0 ? remaining : 0);
  }, 1000); // Update every second
  
  return () => clearInterval(interval);
}, [roundInfo]);

// Display
{timeRemaining > 0 ? (
  <div>Time Remaining: {formatTime(timeRemaining)}</div>
) : (
  <div>Round Ended - Draw Available!</div>
)}
```

### **Format Time:**

```typescript
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Examples:
300 → "5:00"
180 → "3:00"
45  → "0:45"
5   → "0:05"
0   → "0:00"
```

---

## 🔔 **UI STATES**

### **State 1: Round Active**

```
┌─────────────────────────────────────┐
│  Round #42                    ACTIVE│
│  Time Remaining: 3:45               │
│                                     │
│  [Pick Numbers]                     │
│  [Buy Ticket - 0.01 ETH]           │
└─────────────────────────────────────┘
```

### **State 2: Round Ended (Waiting for Draw)**

```
┌─────────────────────────────────────┐
│  Round #42                    ENDED │
│  Time Remaining: 0:00               │
│                                     │
│  Waiting for draw...                │
│  [Draw Lottery] ← Anyone can click │
└─────────────────────────────────────┘
```

### **State 3: Drawing**

```
┌─────────────────────────────────────┐
│  Round #42                  DRAWING │
│                                     │
│  Requesting random numbers...       │
│  Please wait 1-2 minutes            │
└─────────────────────────────────────┘
```

### **State 4: Complete**

```
┌─────────────────────────────────────┐
│  Round #42                 COMPLETE │
│                                     │
│  Winning Numbers:                   │
│  [5] [12] [23] [34] [40] [45] [49] │
│                                     │
│  [View Results] [Claim Winnings]   │
└─────────────────────────────────────┘
```

---

## ⚡ **ADVANTAGES**

### **1. Fast Gameplay:**
```
Traditional: 24 hour rounds
→ 1 draw per day
→ 7 draws per week

5-Minute: 5 minute rounds
→ 12 draws per hour
→ 288 draws per day!
```

### **2. More Engagement:**
```
Players can:
- Buy tickets frequently
- See results quickly
- Win multiple times per hour
- Stay engaged
```

### **3. Predictable:**
```
No surprises:
- Every round is exactly 5 minutes
- Timer always counts down
- No dependency on tickets
- Consistent experience
```

### **4. Fair:**
```
Everyone has:
- Same 5-minute window
- Same countdown
- Same opportunity
- Same rules
```

---

## 💰 **GAS CONSIDERATIONS**

### **Frequent Draws:**

```
Traditional (24h):
- 1 draw per day
- 1 VRF call per day
- ~$4-30 LINK per day

5-Minute:
- 288 draws per day
- 288 VRF calls per day (if all have tickets)
- ~$1,152-8,640 LINK per day
```

**Solutions:**
1. **Skip empty rounds** (no VRF if no tickets) ✅
2. **Increase ticket price** (cover costs)
3. **Batch multiple rounds** (draw every 15-30 min)
4. **Alternative RNG** (Commit-reveal for small rounds)

---

## 🔧 **CONTRACT FEATURES**

### **New Functions:**

```solidity
// Check if round ended
function hasRoundEnded() external view returns (bool)

// Get time remaining
function getTimeRemaining() external view returns (uint256)

// Anyone can draw (not just owner)
function drawLottery() external

// Auto-start new round
function startNewRound() public
```

### **Changed Behavior:**

```
Before:
- Owner starts round with duration
- startNewRound(86400) → 24 hours

After:
- Anyone starts round (fixed 5 min)
- startNewRound() → 5 minutes (automatic)
```

---

## 📝 **DEPLOYMENT**

### **Deploy Script:**

```javascript
const lottery = await ethers.deployContract(
  "TieredSequentialLotteryVRF_5MinRounds",
  [
    vrfCoordinator,
    gasLane,
    subscriptionId,
    callbackGasLimit
  ]
);

// Round #1 starts automatically in constructor
// Countdown begins immediately!
```

---

## ⚠️ **IMPORTANT NOTES**

### **1. Round Timing:**
```
Rounds are EXACTLY 5 minutes:
- Start: block.timestamp
- End: block.timestamp + 300 seconds

Not dependent on:
❌ Ticket purchases
❌ Number of players
❌ Prize pool size
```

### **2. Continuous Operation:**
```
Rounds continue non-stop:
Round 1 → Round 2 → Round 3 → Round 4...

No breaks between rounds:
✅ Immediate transition
✅ No waiting
✅ Constant gameplay
```

### **3. Empty Rounds OK:**
```
If no tickets:
✅ Round still ends at 5 minutes
✅ Prize pool carries over
✅ No VRF call (saves LINK)
✅ Next round starts immediately
```

### **4. Draw Timing:**
```
After round ends:
- Anyone can call drawLottery()
- No time limit for draw
- But new tickets go to next round
- So draw promptly for best UX
```

---

## 🎯 **BEST PRACTICES**

### **For Operators:**

1. **Monitor LINK Balance:**
   ```
   With 5-min rounds, LINK usage is HIGH
   Keep minimum 100 LINK in subscription
   Set up alerts for low balance
   ```

2. **Automate Draws:**
   ```
   Use Chainlink Automation or bot
   To call drawLottery() automatically
   Don't rely on manual draws
   ```

3. **Adjust Ticket Price:**
   ```
   Higher frequency = higher costs
   Price tickets to cover:
   - VRF costs
   - Gas costs
   - Prize pool
   - Profit margin
   ```

---

## 🚀 **SUMMARY**

### **5-Minute Rounds:**
- ✅ Fixed 5-minute duration
- ✅ Continuous countdown
- ✅ Independent of tickets
- ✅ Automatic progression
- ✅ Anyone can draw
- ✅ Empty rounds allowed
- ✅ Fast-paced gameplay

### **Perfect For:**
- ✅ High-engagement lottery
- ✅ Quick results
- ✅ Frequent winners
- ✅ Active communities

### **Watch Out For:**
- ⚠️ LINK costs (288 draws/day)
- ⚠️ Need automation for draws
- ⚠️ Higher operational costs

---

**Deploy the 5-minute version for fast-paced, exciting lottery gameplay!** ⏱️
