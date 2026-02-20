// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TieredSequentialLotteryVRF_5MinRounds
 * @dev Lottery with 5-MINUTE CONTINUOUS ROUNDS
 * 
 * KEY FEATURES:
 * - 5 minute rounds (fixed duration)
 * - Continuous countdown (independent of ticket purchases)
 * - Automatic round end (time-based, not ticket-based)
 * - VRF numbers sorted in ascending order
 * - Player numbers stored as-is
 * 
 * ROUND MECHANICS:
 * - Each round is EXACTLY 5 minutes
 * - Round ends when time expires (not when tickets are bought)
 * - New round can start immediately after previous draw
 * - Empty rounds are allowed (no tickets = no winners)
 */
contract TieredSequentialLotteryVRF_5MinRounds is 
    VRFConsumerBaseV2, 
    ReentrancyGuard, 
    Pausable,
    Ownable 
{
    
    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 7;
    
    // Lottery structures
    struct Ticket {
        address player;
        uint8[7] numbers;
        uint256 purchaseTime;
        uint8 matchedBalls;
    }
    
    struct WinnerTier {
        uint8 matchCount;
        address[] winners;
        uint256 prizePerWinner;
    }
    
    struct LotteryRound {
        uint256 roundId;
        uint8[7] winningNumbers;
        uint256 prizePool;
        uint256 ticketPrice;
        uint256 startTime;
        uint256 endTime;
        bool isDrawn;
        uint256 vrfRequestId;
        mapping(uint8 => WinnerTier) winnerTiers;
    }
    
    struct PrizeTier {
        uint8 matchCount;
        uint16 percentage;
    }
    
    // Constants
    uint256 public constant MIN_NUMBERS = 1;
    uint256 public constant MAX_NUMBERS = 49;
    uint256 public constant NUMBERS_COUNT = 7;
    uint256 public constant OWNER_FEE_PERCENTAGE = 1000; // 10%
    
    // ROUND DURATION: 5 MINUTES (300 seconds)
    uint256 public constant ROUND_DURATION = 5 minutes;
    
    // Time restrictions
    uint256 public constant MIN_ROUND_DURATION = 1 minutes;  // Minimum 1 minute
    uint256 public constant MAX_ROUND_DURATION = 1 hours;    // Maximum 1 hour
    uint256 public constant MAX_VRF_WAIT_TIME = 2 hours;
    
    // Price boundaries
    uint256 public constant MIN_TICKET_PRICE = 0.001 ether;
    uint256 public constant MAX_TICKET_PRICE = 1 ether;
    
    // Purchase limits
    uint256 public maxTicketsPerAddress = 1000;
    uint256 public maxTicketsPerTransaction = 100;
    
    // Rate limiting
    uint256 public purchaseCooldown = 5 seconds;  // Reduced for 5-min rounds
    
    // State variables
    uint256 public currentRoundId;
    uint256 public ticketPrice = 0.01 ether;
    uint256 public ownerBalance;
    uint256 public carryOverBalance;
    
    // Prize tiers
    PrizeTier[7] public prizeTiers;
    
    // Mappings
    mapping(uint256 => LotteryRound) public lotteryRounds;
    mapping(uint256 => Ticket[]) public roundTickets;
    mapping(address => uint256) public playerWinnings;
    mapping(uint256 => uint256) public vrfRequestToRound;
    
    // Security mappings
    mapping(uint256 => bool) public vrfRequestPending;
    mapping(uint256 => uint256) public vrfRequestTime;
    mapping(uint256 => mapping(address => uint256)) public ticketCountPerAddress;
    mapping(address => uint256) public lastPurchaseTime;
    
    // Events
    event TicketPurchased(address indexed player, uint256 indexed roundId, uint8[7] numbers);
    event LotteryDrawRequested(uint256 indexed roundId, uint256 requestId);
    event LotteryDrawn(uint256 indexed roundId, uint8[7] winningNumbers);
    event WinnerDetermined(uint256 indexed roundId, address indexed player, uint8 matchCount, uint256 prize);
    event WinningsClaimed(address indexed player, uint256 amount);
    event NewRoundStarted(uint256 indexed roundId, uint256 ticketPrice, uint256 duration, uint256 endTime);
    event RoundEnded(uint256 indexed roundId, uint256 ticketCount);
    event TierSummary(uint256 indexed roundId, uint8 matchCount, uint256 winnersCount, uint256 totalPrize);
    event OwnerFeeCollected(uint256 indexed roundId, uint256 feeAmount);
    event CarryOverAdded(uint256 indexed roundId, uint256 carryOverAmount);
    event OwnerWithdrawal(address indexed owner, uint256 amount);
    event PrizePoolSummary(uint256 indexed roundId, uint256 totalPool, uint256 distributed, uint256 carryOver);
    event EmergencyPause(address indexed by, uint256 timestamp);
    event EmergencyUnpause(address indexed by, uint256 timestamp);
    event TicketPriceChanged(uint256 oldPrice, uint256 newPrice);
    event PurchaseLimitsUpdated(uint256 perAddress, uint256 perTransaction);
    
    // Modifiers
    modifier roundActive() {
        require(currentRoundId > 0, "No active round");
        require(!lotteryRounds[currentRoundId].isDrawn, "Current round already drawn");
        require(block.timestamp < lotteryRounds[currentRoundId].endTime, "Round has ended");
        _;
    }
    
    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        require(addr == tx.origin, "No contract calls allowed");
        _;
    }
    
    constructor(
        address vrfCoordinator,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinator) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        
        // Initialize prize tiers
        prizeTiers[0] = PrizeTier(1, 0);
        prizeTiers[1] = PrizeTier(2, 500);
        prizeTiers[2] = PrizeTier(3, 1000);
        prizeTiers[3] = PrizeTier(4, 1500);
        prizeTiers[4] = PrizeTier(5, 2000);
        prizeTiers[5] = PrizeTier(6, 2000);
        prizeTiers[6] = PrizeTier(7, 3000);
        
        // Start first 5-minute round
        startNewRound();
    }
    
    /**
     * @dev Start a new 5-minute round
     * Can be called by anyone if previous round is drawn
     * Allows automatic round progression
     */
    function startNewRound() public {
        require(
            currentRoundId == 0 || lotteryRounds[currentRoundId].isDrawn, 
            "Current round not drawn yet"
        );
        
        currentRoundId++;
        
        LotteryRound storage newRound = lotteryRounds[currentRoundId];
        newRound.roundId = currentRoundId;
        newRound.winningNumbers = [0, 0, 0, 0, 0, 0, 0];
        newRound.prizePool = carryOverBalance;
        newRound.ticketPrice = ticketPrice;
        newRound.startTime = block.timestamp;
        newRound.endTime = block.timestamp + ROUND_DURATION;  // 5 minutes from now
        newRound.isDrawn = false;
        newRound.vrfRequestId = 0;
        
        if (carryOverBalance > 0) {
            emit CarryOverAdded(currentRoundId, carryOverBalance);
            carryOverBalance = 0;
        }
        
        emit NewRoundStarted(currentRoundId, ticketPrice, ROUND_DURATION, newRound.endTime);
    }
    
    /**
     * @dev Purchase lottery ticket
     * Can only buy while round is active (before 5 minutes expire)
     */
    function buyTicket(uint8[7] memory numbers) 
        external 
        payable 
        roundActive 
        whenNotPaused 
        nonReentrant
        validAddress(msg.sender)
    {
        require(
            block.timestamp >= lastPurchaseTime[msg.sender] + purchaseCooldown,
            "Purchase cooldown active"
        );
        
        require(
            ticketCountPerAddress[currentRoundId][msg.sender] < maxTicketsPerAddress,
            "Max tickets per address reached"
        );
        
        require(msg.value == ticketPrice, "Incorrect ticket price");
        require(validateNumbers(numbers), "Invalid numbers: must be 1-49");
        require(roundTickets[currentRoundId].length < 1000000, "Max round tickets reached");
        
        lastPurchaseTime[msg.sender] = block.timestamp;
        ticketCountPerAddress[currentRoundId][msg.sender]++;
        
        uint256 ownerFee = (msg.value * OWNER_FEE_PERCENTAGE) / 10000;
        uint256 toPrizePool = msg.value - ownerFee;
        
        ownerBalance += ownerFee;
        
        // Store player numbers AS-IS (not sorted)
        Ticket memory newTicket = Ticket({
            player: msg.sender,
            numbers: numbers,
            purchaseTime: block.timestamp,
            matchedBalls: 0
        });
        
        roundTickets[currentRoundId].push(newTicket);
        lotteryRounds[currentRoundId].prizePool += toPrizePool;
        
        emit TicketPurchased(msg.sender, currentRoundId, numbers);
        emit OwnerFeeCollected(currentRoundId, ownerFee);
    }
    
    function buyTickets(uint8[7][] memory numberSets) 
        external 
        payable 
        roundActive 
        whenNotPaused 
        nonReentrant
    {
        require(numberSets.length > 0, "Empty ticket set");
        require(numberSets.length <= maxTicketsPerTransaction, "Too many tickets in transaction");
        require(msg.value == ticketPrice * numberSets.length, "Incorrect total payment");
        
        for (uint256 i = 0; i < numberSets.length; i++) {
            _buyTicketInternal(numberSets[i]);
        }
    }
    
    function _buyTicketInternal(uint8[7] memory numbers) private {
        require(validateNumbers(numbers), "Invalid numbers");
        require(
            ticketCountPerAddress[currentRoundId][msg.sender] < maxTicketsPerAddress,
            "Max tickets reached"
        );
        
        ticketCountPerAddress[currentRoundId][msg.sender]++;
        
        Ticket memory newTicket = Ticket({
            player: msg.sender,
            numbers: numbers,
            purchaseTime: block.timestamp,
            matchedBalls: 0
        });
        
        roundTickets[currentRoundId].push(newTicket);
        
        emit TicketPurchased(msg.sender, currentRoundId, numbers);
    }
    
    /**
     * @dev Sort VRF numbers in ascending order
     */
    function sortNumbers(uint8[7] memory arr) internal pure returns (uint8[7] memory) {
        uint8[7] memory sorted = arr;
        
        for (uint256 i = 1; i < NUMBERS_COUNT; i++) {
            uint8 key = sorted[i];
            uint256 j = i;
            
            while (j > 0 && sorted[j - 1] > key) {
                sorted[j] = sorted[j - 1];
                j--;
            }
            sorted[j] = key;
        }
        
        return sorted;
    }
    
    function validateNumbers(uint8[7] memory numbers) internal pure returns (bool) {
        for (uint256 i = 0; i < NUMBERS_COUNT; i++) {
            if (numbers[i] < MIN_NUMBERS || numbers[i] > MAX_NUMBERS) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * @dev Draw lottery - can be called by ANYONE after round ends
     * This allows automatic progression even if owner is offline
     */
    function drawLottery() external whenNotPaused {
        require(currentRoundId > 0, "No active round");
        require(!lotteryRounds[currentRoundId].isDrawn, "Round already drawn");
        require(!vrfRequestPending[currentRoundId], "Draw already requested");
        require(block.timestamp >= lotteryRounds[currentRoundId].endTime, "Round not ended yet");
        
        uint256 ticketCount = roundTickets[currentRoundId].length;
        emit RoundEnded(currentRoundId, ticketCount);
        
        // If no tickets, skip VRF and mark as drawn
        if (ticketCount == 0) {
            lotteryRounds[currentRoundId].isDrawn = true;
            lotteryRounds[currentRoundId].winningNumbers = [0, 0, 0, 0, 0, 0, 0];
            emit LotteryDrawn(currentRoundId, [0, 0, 0, 0, 0, 0, 0]);
            
            // Carry over prize pool to next round
            if (lotteryRounds[currentRoundId].prizePool > 0) {
                carryOverBalance = lotteryRounds[currentRoundId].prizePool;
            }
            return;
        }
        
        vrfRequestPending[currentRoundId] = true;
        vrfRequestTime[currentRoundId] = block.timestamp;
        
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        
        lotteryRounds[currentRoundId].vrfRequestId = requestId;
        vrfRequestToRound[requestId] = currentRoundId;
        
        emit LotteryDrawRequested(currentRoundId, requestId);
    }
    
    function emergencyRedraw() external onlyOwner {
        require(currentRoundId > 0, "No active round");
        require(vrfRequestPending[currentRoundId], "No pending request");
        require(
            block.timestamp > vrfRequestTime[currentRoundId] + MAX_VRF_WAIT_TIME,
            "VRF not timed out yet"
        );
        
        vrfRequestPending[currentRoundId] = false;
        this.drawLottery();
    }
    
    /**
     * @dev VRF callback - sorts VRF numbers in ascending order
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint256 roundId = vrfRequestToRound[requestId];
        require(roundId > 0, "Invalid request ID");
        require(!lotteryRounds[roundId].isDrawn, "Round already drawn");
        require(vrfRequestPending[roundId], "No pending request");
        
        vrfRequestPending[roundId] = false;
        
        LotteryRound storage round = lotteryRounds[roundId];
        
        // Generate random numbers
        uint8[7] memory tempNumbers;
        for (uint256 i = 0; i < NUMBERS_COUNT; i++) {
            tempNumbers[i] = uint8((randomWords[i] % MAX_NUMBERS) + 1);
        }
        
        // SORT VRF numbers in ascending order
        uint8[7] memory winningNumbers = sortNumbers(tempNumbers);
        
        round.winningNumbers = winningNumbers;
        round.isDrawn = true;
        
        emit LotteryDrawn(roundId, winningNumbers);
        
        // Process winners
        Ticket[] storage tickets = roundTickets[roundId];
        uint256[8] memory tierCounts;
        
        for (uint256 i = 0; i < tickets.length; i++) {
            uint8 matches = countSequentialMatches(tickets[i].numbers, winningNumbers);
            tickets[i].matchedBalls = matches;
            tierCounts[matches]++;
        }
        
        distributePrizes(roundId, tierCounts);
    }
    
    function distributePrizes(uint256 roundId, uint256[8] memory tierCounts) internal {
        LotteryRound storage round = lotteryRounds[roundId];
        uint256 totalPrizePool = round.prizePool;
        uint256 totalDistributed = 0;
        
        for (uint8 matchCount = 2; matchCount <= 7; matchCount++) {
            uint16 tierPercentage = prizeTiers[matchCount - 1].percentage;
            uint256 tierTotalPrize = (totalPrizePool * tierPercentage) / 10000;
            
            if (tierCounts[matchCount] == 0) {
                continue;
            }
            
            uint256 prizePerWinner = tierTotalPrize / tierCounts[matchCount];
            totalDistributed += tierTotalPrize;
            
            WinnerTier storage tier = round.winnerTiers[matchCount];
            tier.matchCount = matchCount;
            tier.prizePerWinner = prizePerWinner;
            
            Ticket[] storage tickets = roundTickets[roundId];
            for (uint256 i = 0; i < tickets.length; i++) {
                if (tickets[i].matchedBalls == matchCount) {
                    playerWinnings[tickets[i].player] += prizePerWinner;
                    tier.winners.push(tickets[i].player);
                    
                    emit WinnerDetermined(roundId, tickets[i].player, matchCount, prizePerWinner);
                }
            }
            
            emit TierSummary(roundId, matchCount, tierCounts[matchCount], tierTotalPrize);
        }
        
        uint256 unclaimedPrizes = totalPrizePool - totalDistributed;
        if (unclaimedPrizes > 0) {
            carryOverBalance += unclaimedPrizes;
        }
        
        emit PrizePoolSummary(roundId, totalPrizePool, totalDistributed, unclaimedPrizes);
    }
    
    /**
     * @dev Count sequential matches
     * Stops at first mismatch
     */
    function countSequentialMatches(uint8[7] memory playerNumbers, uint8[7] memory winningNumbers) 
        internal 
        pure 
        returns (uint8) 
    {
        uint8 matches = 0;
        for (uint256 i = 0; i < NUMBERS_COUNT; i++) {
            if (playerNumbers[i] == winningNumbers[i]) {
                matches++;
            } else {
                break;
            }
        }
        return matches;
    }
    
    function claimWinnings() external nonReentrant whenNotPaused {
        uint256 amount = playerWinnings[msg.sender];
        require(amount > 0, "No winnings to claim");
        
        playerWinnings[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit WinningsClaimed(msg.sender, amount);
    }
    
    function withdrawOwnerFees() external onlyOwner nonReentrant {
        uint256 amount = ownerBalance;
        require(amount > 0, "No fees to withdraw");
        
        ownerBalance = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit OwnerWithdrawal(owner(), amount);
    }
    
    function setTicketPrice(uint256 newPrice) external onlyOwner {
        require(newPrice >= MIN_TICKET_PRICE, "Price too low");
        require(newPrice <= MAX_TICKET_PRICE, "Price too high");
        
        uint256 oldPrice = ticketPrice;
        ticketPrice = newPrice;
        
        emit TicketPriceChanged(oldPrice, newPrice);
    }
    
    function setPurchaseLimits(uint256 perAddress, uint256 perTransaction) external onlyOwner {
        require(perAddress > 0 && perAddress <= 10000, "Invalid address limit");
        require(perTransaction > 0 && perTransaction <= 1000, "Invalid transaction limit");
        
        maxTicketsPerAddress = perAddress;
        maxTicketsPerTransaction = perTransaction;
        
        emit PurchaseLimitsUpdated(perAddress, perTransaction);
    }
    
    function setPurchaseCooldown(uint256 cooldown) external onlyOwner {
        require(cooldown <= 1 minutes, "Cooldown too long");
        purchaseCooldown = cooldown;
    }
    
    function pause() external onlyOwner {
        _pause();
        emit EmergencyPause(msg.sender, block.timestamp);
    }
    
    function unpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpause(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Check if current round has ended
     */
    function hasRoundEnded() external view returns (bool) {
        if (currentRoundId == 0) return false;
        return block.timestamp >= lotteryRounds[currentRoundId].endTime;
    }
    
    /**
     * @dev Get time remaining in current round
     */
    function getTimeRemaining() external view returns (uint256) {
        if (currentRoundId == 0) return 0;
        if (block.timestamp >= lotteryRounds[currentRoundId].endTime) return 0;
        return lotteryRounds[currentRoundId].endTime - block.timestamp;
    }
    
    // View functions
    function getRoundTickets(uint256 roundId) external view returns (Ticket[] memory) {
        return roundTickets[roundId];
    }
    
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
    
    function getWinningNumbers(uint256 roundId) external view returns (uint8[7] memory) {
        require(lotteryRounds[roundId].isDrawn, "Round not drawn yet");
        return lotteryRounds[roundId].winningNumbers;
    }
    
    function getTierWinners(uint256 roundId, uint8 matchCount) external view returns (
        address[] memory winners,
        uint256 prizePerWinner
    ) {
        require(matchCount >= 2 && matchCount <= 7, "Invalid match count");
        WinnerTier storage tier = lotteryRounds[roundId].winnerTiers[matchCount];
        return (tier.winners, tier.prizePerWinner);
    }
    
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
    
    function getPrizeTiers() external view returns (PrizeTier[7] memory) {
        return prizeTiers;
    }
    
    function getMyTickets(uint256 roundId) external view returns (Ticket[] memory) {
        Ticket[] storage allTickets = roundTickets[roundId];
        uint256 count = 0;
        
        for (uint256 i = 0; i < allTickets.length; i++) {
            if (allTickets[i].player == msg.sender) {
                count++;
            }
        }
        
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
    
    function getOwnerBalance() external view returns (uint256) {
        return ownerBalance;
    }
    
    function getCarryOverBalance() external view returns (uint256) {
        return carryOverBalance;
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function emergencyWithdraw() external onlyOwner whenPaused {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
        emit OwnerWithdrawal(owner(), balance);
    }
}
