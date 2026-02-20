// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TieredSequentialLotteryVRF_Secure
 * @dev Enhanced secure lottery contract with multiple security layers
 * 
 * Security Features:
 * - ReentrancyGuard: Prevents reentrancy attacks
 * - Pausable: Emergency pause mechanism
 * - Chainlink VRF: Provably fair randomness
 * - Rate Limiting: Prevents spam attacks
 * - Purchase Limits: Fair play enforcement
 * - VRF Request Validation: Prevents duplicate draws
 * - Time-based Restrictions: Minimum/maximum round durations
 * - Price Boundaries: Prevents extreme pricing
 * - Comprehensive Event Logging: Full audit trail
 */
contract TieredSequentialLotteryVRF_Secure is 
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
    
    // Constants - Security Parameters
    uint256 public constant MIN_NUMBERS = 1;
    uint256 public constant MAX_NUMBERS = 49;
    uint256 public constant NUMBERS_COUNT = 7;
    uint256 public constant OWNER_FEE_PERCENTAGE = 1000; // 10%
    
    // Time restrictions
    uint256 public constant MIN_ROUND_DURATION = 1 hours;
    uint256 public constant MAX_ROUND_DURATION = 30 days;
    uint256 public constant MAX_VRF_WAIT_TIME = 2 hours;
    
    // Price boundaries
    uint256 public constant MIN_TICKET_PRICE = 0.001 ether;
    uint256 public constant MAX_TICKET_PRICE = 1 ether;
    
    // Purchase limits
    uint256 public maxTicketsPerAddress = 1000;
    uint256 public maxTicketsPerTransaction = 100;
    
    // Rate limiting
    uint256 public purchaseCooldown = 10 seconds;
    
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
    event NewRoundStarted(uint256 indexed roundId, uint256 ticketPrice, uint256 duration);
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
        
        startNewRound(1 days);
    }
    
    /**
     * @dev Start a new lottery round with time-based restrictions
     */
    function startNewRound(uint256 duration) public onlyOwner {
        require(currentRoundId == 0 || lotteryRounds[currentRoundId].isDrawn, "Current round not drawn yet");
        require(duration >= MIN_ROUND_DURATION, "Round duration too short");
        require(duration <= MAX_ROUND_DURATION, "Round duration too long");
        
        currentRoundId++;
        
        LotteryRound storage newRound = lotteryRounds[currentRoundId];
        newRound.roundId = currentRoundId;
        newRound.winningNumbers = [0, 0, 0, 0, 0, 0, 0];
        newRound.prizePool = carryOverBalance;
        newRound.ticketPrice = ticketPrice;
        newRound.startTime = block.timestamp;
        newRound.endTime = block.timestamp + duration;
        newRound.isDrawn = false;
        newRound.vrfRequestId = 0;
        
        if (carryOverBalance > 0) {
            emit CarryOverAdded(currentRoundId, carryOverBalance);
            carryOverBalance = 0;
        }
        
        emit NewRoundStarted(currentRoundId, ticketPrice, duration);
    }
    
    /**
     * @dev Purchase lottery ticket with security checks
     */
    function buyTicket(uint8[7] memory numbers) 
        external 
        payable 
        roundActive 
        whenNotPaused 
        nonReentrant
        validAddress(msg.sender)
    {
        // Rate limiting
        require(
            block.timestamp >= lastPurchaseTime[msg.sender] + purchaseCooldown,
            "Purchase cooldown active"
        );
        
        // Purchase limits
        require(
            ticketCountPerAddress[currentRoundId][msg.sender] < maxTicketsPerAddress,
            "Max tickets per address reached"
        );
        
        // Basic validation
        require(msg.value == ticketPrice, "Incorrect ticket price");
        require(validateNumbers(numbers), "Invalid numbers: must be 1-49");
        require(roundTickets[currentRoundId].length < 1000000, "Max round tickets reached");
        
        // Update rate limiting
        lastPurchaseTime[msg.sender] = block.timestamp;
        ticketCountPerAddress[currentRoundId][msg.sender]++;
        
        // Calculate fees
        uint256 ownerFee = (msg.value * OWNER_FEE_PERCENTAGE) / 10000;
        uint256 toPrizePool = msg.value - ownerFee;
        
        ownerBalance += ownerFee;
        
        // Create ticket
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
    
    /**
     * @dev Batch ticket purchase with transaction limit
     */
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
            // Call internal buy logic for each ticket
            _buyTicketInternal(numberSets[i]);
        }
    }
    
    /**
     * @dev Internal ticket purchase logic
     */
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
     * @dev Validate numbers are within valid range
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
     * @dev Draw lottery with enhanced VRF request validation
     */
    function drawLottery() external onlyOwner whenNotPaused {
        require(currentRoundId > 0, "No active round");
        require(!lotteryRounds[currentRoundId].isDrawn, "Round already drawn");
        require(!vrfRequestPending[currentRoundId], "Draw already requested");
        require(block.timestamp >= lotteryRounds[currentRoundId].endTime, "Round not ended yet");
        
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
    
    /**
     * @dev Emergency redraw if VRF times out
     * Resets the pending flag so drawLottery() can be called again
     */
    function emergencyRedraw() external onlyOwner {
        require(currentRoundId > 0, "No active round");
        require(vrfRequestPending[currentRoundId], "No pending request");
        require(
            block.timestamp > vrfRequestTime[currentRoundId] + MAX_VRF_WAIT_TIME,
            "VRF not timed out yet"
        );
        
        // Reset the pending flag so owner can call drawLottery() again
        vrfRequestPending[currentRoundId] = false;
        
        emit LotteryDrawRequested(currentRoundId, 0); // 0 = redraw needed
    }
    
    /**
     * @dev Chainlink VRF callback with validation
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
        
        // Generate winning numbers
        uint8[7] memory winningNumbers;
        for (uint256 i = 0; i < NUMBERS_COUNT; i++) {
            winningNumbers[i] = uint8((randomWords[i] % MAX_NUMBERS) + 1);
        }
        
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
    
    /**
     * @dev Distribute prizes with detailed logging
     */
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
    
    /**
     * @dev Claim winnings with reentrancy protection
     */
    function claimWinnings() external nonReentrant whenNotPaused {
        uint256 amount = playerWinnings[msg.sender];
        require(amount > 0, "No winnings to claim");
        
        // CEI pattern: Update state before external call
        playerWinnings[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit WinningsClaimed(msg.sender, amount);
    }
    
    /**
     * @dev Owner withdraw fees with reentrancy protection
     */
    function withdrawOwnerFees() external onlyOwner nonReentrant {
        uint256 amount = ownerBalance;
        require(amount > 0, "No fees to withdraw");
        
        ownerBalance = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit OwnerWithdrawal(owner(), amount);
    }
    
    /**
     * @dev Set ticket price with boundaries
     */
    function setTicketPrice(uint256 newPrice) external onlyOwner {
        require(newPrice >= MIN_TICKET_PRICE, "Price too low");
        require(newPrice <= MAX_TICKET_PRICE, "Price too high");
        require(
            currentRoundId == 0 || lotteryRounds[currentRoundId].isDrawn,
            "Cannot change price during active round"
        );
        
        uint256 oldPrice = ticketPrice;
        ticketPrice = newPrice;
        
        emit TicketPriceChanged(oldPrice, newPrice);
    }
    
    /**
     * @dev Update purchase limits
     */
    function setPurchaseLimits(uint256 perAddress, uint256 perTransaction) external onlyOwner {
        require(perAddress > 0 && perAddress <= 10000, "Invalid address limit");
        require(perTransaction > 0 && perTransaction <= 1000, "Invalid transaction limit");
        
        maxTicketsPerAddress = perAddress;
        maxTicketsPerTransaction = perTransaction;
        
        emit PurchaseLimitsUpdated(perAddress, perTransaction);
    }
    
    /**
     * @dev Update purchase cooldown
     */
    function setPurchaseCooldown(uint256 cooldown) external onlyOwner {
        require(cooldown <= 1 minutes, "Cooldown too long");
        purchaseCooldown = cooldown;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
        emit EmergencyPause(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
        emit EmergencyUnpause(msg.sender, block.timestamp);
    }
    
    // View functions (same as original)
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
    
    /**
     * @dev Emergency withdrawal (use with extreme caution)
     */
    function emergencyWithdraw() external onlyOwner whenPaused {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
        emit OwnerWithdrawal(owner(), balance);
    }
}
