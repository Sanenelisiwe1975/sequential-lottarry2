// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TieredSequentialLottery
 * @dev A lottery contract with tiered prizes based on sequential number matches
 * Prize Distribution:
 * - 1 ball: 0%
 * - 2 balls: 5%
 * - 3 balls: 10%
 * - 4 balls: 15%
 * - 5 balls: 20%
 * - 6 balls: 20%
 * - 7 balls: 30%
 * Total: 100%
 */
contract TieredSequentialLottery {
    
    // Lottery ticket structure
    struct Ticket {
        address player;
        uint8[7] numbers;
        uint256 purchaseTime;
        uint8 matchedBalls; // Number of sequential matches (set after draw)
    }
    
    // Winner tier structure
    struct WinnerTier {
        uint8 matchCount;
        address[] winners;
        uint256 prizePerWinner;
    }
    
    // Lottery round structure
    struct LotteryRound {
        uint256 roundId;
        uint8[7] winningNumbers;
        uint256 prizePool;
        uint256 ticketPrice;
        uint256 startTime;
        uint256 endTime;
        bool isDrawn;
        mapping(uint8 => WinnerTier) winnerTiers; // matchCount => WinnerTier
    }
    
    // Prize percentages for each tier (in basis points: 100 = 1%)
    struct PrizeTier {
        uint8 matchCount;
        uint16 percentage; // basis points (e.g., 500 = 5%)
    }
    
    // State variables
    address public owner;
    uint256 public currentRoundId;
    uint256 public ticketPrice = 0.01 ether;
    uint256 public constant MIN_NUMBERS = 1;
    uint256 public constant MAX_NUMBERS = 49;
    uint256 public constant NUMBERS_COUNT = 7;
    uint256 public constant OWNER_FEE_PERCENTAGE = 1000; // 10% in basis points
    
    uint256 public ownerBalance; // Owner's accumulated fees
    uint256 public carryOverBalance; // Unclaimed prizes from previous rounds
    
    // Prize tiers (in basis points where 10000 = 100%)
    PrizeTier[7] public prizeTiers;
    
    // Mappings
    mapping(uint256 => LotteryRound) public lotteryRounds;
    mapping(uint256 => Ticket[]) public roundTickets;
    mapping(address => uint256) public playerWinnings;
    
    // Events
    event TicketPurchased(address indexed player, uint256 indexed roundId, uint8[7] numbers);
    event LotteryDrawn(uint256 indexed roundId, uint8[7] winningNumbers);
    event WinnerDetermined(uint256 indexed roundId, address indexed player, uint8 matchCount, uint256 prize);
    event WinningsClaimed(address indexed player, uint256 amount);
    event NewRoundStarted(uint256 indexed roundId, uint256 ticketPrice);
    event TierSummary(uint256 indexed roundId, uint8 matchCount, uint256 winnersCount, uint256 totalPrize);
    event OwnerFeeCollected(uint256 indexed roundId, uint256 feeAmount);
    event CarryOverAdded(uint256 indexed roundId, uint256 carryOverAmount);
    event OwnerWithdrawal(address indexed owner, uint256 amount);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier roundActive() {
        require(currentRoundId > 0, "No active round");
        require(!lotteryRounds[currentRoundId].isDrawn, "Current round already drawn");
        require(block.timestamp < lotteryRounds[currentRoundId].endTime, "Round has ended");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        
        // Initialize prize tiers
        prizeTiers[0] = PrizeTier(1, 0);      // 1 ball: 0%
        prizeTiers[1] = PrizeTier(2, 500);    // 2 balls: 5%
        prizeTiers[2] = PrizeTier(3, 1000);   // 3 balls: 10%
        prizeTiers[3] = PrizeTier(4, 1500);   // 4 balls: 15%
        prizeTiers[4] = PrizeTier(5, 2000);   // 5 balls: 20%
        prizeTiers[5] = PrizeTier(6, 2000);   // 6 balls: 20%
        prizeTiers[6] = PrizeTier(7, 3000);   // 7 balls: 30%
        
        startNewRound(1 days); // Start first round with 1 day duration
    }
    
    /**
     * @dev Start a new lottery round
     * @param duration Duration of the round in seconds
     */
    function startNewRound(uint256 duration) public onlyOwner {
        require(currentRoundId == 0 || lotteryRounds[currentRoundId].isDrawn, "Current round not drawn yet");
        
        currentRoundId++;
        
        LotteryRound storage newRound = lotteryRounds[currentRoundId];
        newRound.roundId = currentRoundId;
        newRound.winningNumbers = [0, 0, 0, 0, 0, 0, 0];
        newRound.prizePool = carryOverBalance; // Start with carry over from previous round
        newRound.ticketPrice = ticketPrice;
        newRound.startTime = block.timestamp;
        newRound.endTime = block.timestamp + duration;
        newRound.isDrawn = false;
        
        if (carryOverBalance > 0) {
            emit CarryOverAdded(currentRoundId, carryOverBalance);
            carryOverBalance = 0; // Reset carry over after adding to new round
        }
        
        emit NewRoundStarted(currentRoundId, ticketPrice);
    }
    
    /**
     * @dev Purchase a lottery ticket
     * @param numbers Array of 7 numbers between 1 and 49
     */
    function buyTicket(uint8[7] memory numbers) external payable roundActive {
        require(msg.value == ticketPrice, "Incorrect ticket price");
        require(validateNumbers(numbers), "Invalid numbers: must be 1-49");
        
        // Calculate owner fee (10%)
        uint256 ownerFee = (msg.value * OWNER_FEE_PERCENTAGE) / 10000;
        uint256 toPrizePool = msg.value - ownerFee;
        
        // Add owner fee to owner's balance
        ownerBalance += ownerFee;
        
        // Create and store the ticket
        Ticket memory newTicket = Ticket({
            player: msg.sender,
            numbers: numbers,
            purchaseTime: block.timestamp,
            matchedBalls: 0
        });
        
        roundTickets[currentRoundId].push(newTicket);
        
        // Add remaining amount to prize pool
        lotteryRounds[currentRoundId].prizePool += toPrizePool;
        
        emit TicketPurchased(msg.sender, currentRoundId, numbers);
    }
    
    /**
     * @dev Validate that all numbers are within range (1-49)
     * @param numbers Array of 7 numbers to validate
     */
    function validateNumbers(uint8[7] memory numbers) internal pure returns (bool) {
        for (uint256 i = 0; i < NUMBERS_COUNT; i++) {
            if (numbers[i] < MIN_NUMBERS || numbers[i] > MAX_NUMBERS) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * @dev Draw the lottery - generate random winning numbers and determine winners
     */
    function drawLottery() external onlyOwner {
        require(currentRoundId > 0, "No active round");
        require(!lotteryRounds[currentRoundId].isDrawn, "Round already drawn");
        require(block.timestamp >= lotteryRounds[currentRoundId].endTime, "Round not ended yet");
        
        LotteryRound storage round = lotteryRounds[currentRoundId];
        
        // Generate random winning numbers
        uint8[7] memory winningNumbers = generateRandomNumbers();
        round.winningNumbers = winningNumbers;
        round.isDrawn = true;
        
        emit LotteryDrawn(currentRoundId, winningNumbers);
        
        // Analyze all tickets and categorize by match count
        Ticket[] storage tickets = roundTickets[currentRoundId];
        
        // Count winners per tier
        uint256[8] memory tierCounts; // Index 0-7 represents 0-7 matches
        
        for (uint256 i = 0; i < tickets.length; i++) {
            uint8 matches = countSequentialMatches(tickets[i].numbers, winningNumbers);
            tickets[i].matchedBalls = matches;
            tierCounts[matches]++;
        }
        
        // Distribute prizes based on tiers
        distributePrizes(tierCounts);
    }
    
    /**
     * @dev Distribute prizes to winners based on their tier
     */
    function distributePrizes(uint256[8] memory tierCounts) internal {
        LotteryRound storage round = lotteryRounds[currentRoundId];
        uint256 totalPrizePool = round.prizePool;
        uint256 totalDistributed = 0;
        
        // Process each prize tier (starting from 2 balls since 1 ball gets 0%)
        for (uint8 matchCount = 2; matchCount <= 7; matchCount++) {
            uint16 tierPercentage = prizeTiers[matchCount - 1].percentage;
            uint256 tierTotalPrize = (totalPrizePool * tierPercentage) / 10000;
            
            if (tierCounts[matchCount] == 0) {
                // No winners in this tier - prize will carry over
                continue;
            }
            
            uint256 prizePerWinner = tierTotalPrize / tierCounts[matchCount];
            totalDistributed += tierTotalPrize;
            
            // Initialize tier
            WinnerTier storage tier = round.winnerTiers[matchCount];
            tier.matchCount = matchCount;
            tier.prizePerWinner = prizePerWinner;
            
            // Distribute to winners
            Ticket[] storage tickets = roundTickets[currentRoundId];
            for (uint256 i = 0; i < tickets.length; i++) {
                if (tickets[i].matchedBalls == matchCount) {
                    playerWinnings[tickets[i].player] += prizePerWinner;
                    tier.winners.push(tickets[i].player);
                    
                    emit WinnerDetermined(currentRoundId, tickets[i].player, matchCount, prizePerWinner);
                }
            }
            
            emit TierSummary(currentRoundId, matchCount, tierCounts[matchCount], tierTotalPrize);
        }
        
        // Calculate unclaimed prizes to carry over to next round
        uint256 unclaimedPrizes = totalPrizePool - totalDistributed;
        if (unclaimedPrizes > 0) {
            carryOverBalance += unclaimedPrizes;
        }
    }
    
    /**
     * @dev Generate 7 random numbers between 1 and 49
     * WARNING: This is not truly random and should not be used in production
     * Consider using Chainlink VRF for production-ready randomness
     */
    function generateRandomNumbers() internal view returns (uint8[7] memory) {
        uint8[7] memory numbers;
        
        for (uint256 i = 0; i < NUMBERS_COUNT; i++) {
            // Simple pseudo-random generation (NOT secure for production)
            uint256 random = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                block.prevrandao,
                msg.sender,
                i,
                currentRoundId
            )));
            
            numbers[i] = uint8((random % MAX_NUMBERS) + 1);
        }
        
        return numbers;
    }
    
    /**
     * @dev Count how many numbers match sequentially from the start
     * @param playerNumbers The numbers chosen by the player
     * @param winningNumbers The randomly generated winning numbers
     * @return Number of sequential matches from position 0
     */
    function countSequentialMatches(uint8[7] memory playerNumbers, uint8[7] memory winningNumbers) 
        internal 
        pure 
        returns (uint8) 
    {
        uint8 matches = 0;
        
        // Count sequential matches from the beginning
        for (uint256 i = 0; i < NUMBERS_COUNT; i++) {
            if (playerNumbers[i] == winningNumbers[i]) {
                matches++;
            } else {
                // Stop at first mismatch (sequential requirement)
                break;
            }
        }
        
        return matches;
    }
    
    /**
     * @dev Claim winnings
     */
    function claimWinnings() external {
        uint256 amount = playerWinnings[msg.sender];
        require(amount > 0, "No winnings to claim");
        
        playerWinnings[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit WinningsClaimed(msg.sender, amount);
    }
    
    /**
     * @dev Set ticket price for future rounds
     */
    function setTicketPrice(uint256 newPrice) external onlyOwner {
        ticketPrice = newPrice;
    }
    
    /**
     * @dev Get tickets for a specific round
     */
    function getRoundTickets(uint256 roundId) external view returns (Ticket[] memory) {
        return roundTickets[roundId];
    }
    
    /**
     * @dev Get current round basic info
     */
    function getCurrentRoundInfo() external view returns (
        uint256 roundId,
        uint256 prizePool,
        uint256 ticketPrice_,
        uint256 startTime,
        uint256 endTime,
        bool isDrawn
    ) {
        LotteryRound storage round = lotteryRounds[currentRoundId];
        return (
            round.roundId,
            round.prizePool,
            round.ticketPrice,
            round.startTime,
            round.endTime,
            round.isDrawn
        );
    }
    
    /**
     * @dev Get winning numbers for a round
     */
    function getWinningNumbers(uint256 roundId) external view returns (uint8[7] memory) {
        require(lotteryRounds[roundId].isDrawn, "Round not drawn yet");
        return lotteryRounds[roundId].winningNumbers;
    }
    
    /**
     * @dev Get winners for a specific tier in a round
     */
    function getTierWinners(uint256 roundId, uint8 matchCount) external view returns (
        address[] memory winners,
        uint256 prizePerWinner
    ) {
        require(matchCount >= 2 && matchCount <= 7, "Invalid match count");
        WinnerTier storage tier = lotteryRounds[roundId].winnerTiers[matchCount];
        return (tier.winners, tier.prizePerWinner);
    }
    
    /**
     * @dev Get all tier information for a round
     */
    function getAllTierInfo(uint256 roundId) external view returns (
        uint8[] memory matchCounts,
        uint256[] memory winnerCounts,
        uint256[] memory prizesPerWinner
    ) {
        require(lotteryRounds[roundId].isDrawn, "Round not drawn yet");
        
        matchCounts = new uint8[](6);
        winnerCounts = new uint256[](6);
        prizesPerWinner = new uint256[](6);
        
        for (uint8 i = 2; i <= 7; i++) {
            WinnerTier storage tier = lotteryRounds[roundId].winnerTiers[i];
            matchCounts[i - 2] = i;
            winnerCounts[i - 2] = tier.winners.length;
            prizesPerWinner[i - 2] = tier.prizePerWinner;
        }
        
        return (matchCounts, winnerCounts, prizesPerWinner);
    }
    
    /**
     * @dev Get prize tier percentages
     */
    function getPrizeTiers() external view returns (PrizeTier[7] memory) {
        return prizeTiers;
    }
    
    /**
     * @dev Get player's ticket for current round
     */
    function getMyTickets(uint256 roundId) external view returns (Ticket[] memory) {
        Ticket[] storage allTickets = roundTickets[roundId];
        uint256 count = 0;
        
        // Count player's tickets
        for (uint256 i = 0; i < allTickets.length; i++) {
            if (allTickets[i].player == msg.sender) {
                count++;
            }
        }
        
        // Create array of player's tickets
        Ticket[] memory myTickets = new Ticket[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allTickets.length; i++) {
            if (allTickets[i].player == msg.sender) {
                myTickets[index] = allTickets[i];
                index++;
            }
        }
        
        return myTickets;
    }
    
    /**
     * @dev Owner can withdraw accumulated fees
     */
    function withdrawOwnerFees() external onlyOwner {
        uint256 amount = ownerBalance;
        require(amount > 0, "No fees to withdraw");
        
        ownerBalance = 0;
        
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit OwnerWithdrawal(owner, amount);
    }
    
    /**
     * @dev Get owner's accumulated fee balance
     */
    function getOwnerBalance() external view returns (uint256) {
        return ownerBalance;
    }
    
    /**
     * @dev Get carry over balance for next round
     */
    function getCarryOverBalance() external view returns (uint256) {
        return carryOverBalance;
    }
    
    /**
     * @dev Emergency withdrawal by owner (only in emergencies)
     * This should only be used in case of critical issues
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner).transfer(balance);
        emit OwnerWithdrawal(owner, balance);
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
