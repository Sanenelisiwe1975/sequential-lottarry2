// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SequentialLottery
 * @dev A lottery contract where players must match 7 numbers (1-49) in sequential order
 */
contract SequentialLottery {
    
    // Lottery ticket structure
    struct Ticket {
        address player;
        uint8[7] numbers;
        uint256 purchaseTime;
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
        address[] winners;
    }
    
    // State variables
    address public owner;
    uint256 public currentRoundId;
    uint256 public ticketPrice = 0.01 ether;
    uint256 public constant MIN_NUMBERS = 1;
    uint256 public constant MAX_NUMBERS = 49;
    uint256 public constant NUMBERS_COUNT = 7;
    
    // Mappings
    mapping(uint256 => LotteryRound) public lotteryRounds;
    mapping(uint256 => Ticket[]) public roundTickets;
    mapping(address => uint256) public playerWinnings;
    
    // Events
    event TicketPurchased(address indexed player, uint256 indexed roundId, uint8[7] numbers);
    event LotteryDrawn(uint256 indexed roundId, uint8[7] winningNumbers, uint256 winnersCount);
    event WinningsClaimed(address indexed player, uint256 amount);
    event NewRoundStarted(uint256 indexed roundId, uint256 ticketPrice);
    
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
        startNewRound(1 days); // Start first round with 1 day duration
    }
    
    /**
     * @dev Start a new lottery round
     * @param duration Duration of the round in seconds
     */
    function startNewRound(uint256 duration) public onlyOwner {
        require(currentRoundId == 0 || lotteryRounds[currentRoundId].isDrawn, "Current round not drawn yet");
        
        currentRoundId++;
        
        lotteryRounds[currentRoundId] = LotteryRound({
            roundId: currentRoundId,
            winningNumbers: [0, 0, 0, 0, 0, 0, 0],
            prizePool: 0,
            ticketPrice: ticketPrice,
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            isDrawn: false,
            winners: new address[](0)
        });
        
        emit NewRoundStarted(currentRoundId, ticketPrice);
    }
    
    /**
     * @dev Purchase a lottery ticket
     * @param numbers Array of 7 numbers between 1 and 49
     */
    function buyTicket(uint8[7] memory numbers) external payable roundActive {
        require(msg.value == ticketPrice, "Incorrect ticket price");
        require(validateNumbers(numbers), "Invalid numbers: must be 1-49");
        
        // Create and store the ticket
        Ticket memory newTicket = Ticket({
            player: msg.sender,
            numbers: numbers,
            purchaseTime: block.timestamp
        });
        
        roundTickets[currentRoundId].push(newTicket);
        
        // Add to prize pool
        lotteryRounds[currentRoundId].prizePool += msg.value;
        
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
        
        // Generate random winning numbers
        uint8[7] memory winningNumbers = generateRandomNumbers();
        lotteryRounds[currentRoundId].winningNumbers = winningNumbers;
        lotteryRounds[currentRoundId].isDrawn = true;
        
        // Find winners (sequential match required)
        Ticket[] memory tickets = roundTickets[currentRoundId];
        address[] memory winners = new address[](tickets.length);
        uint256 winnerCount = 0;
        
        for (uint256 i = 0; i < tickets.length; i++) {
            if (isSequentialMatch(tickets[i].numbers, winningNumbers)) {
                winners[winnerCount] = tickets[i].player;
                winnerCount++;
            }
        }
        
        // Distribute prizes
        if (winnerCount > 0) {
            uint256 prizePerWinner = lotteryRounds[currentRoundId].prizePool / winnerCount;
            
            for (uint256 i = 0; i < winnerCount; i++) {
                playerWinnings[winners[i]] += prizePerWinner;
                lotteryRounds[currentRoundId].winners.push(winners[i]);
            }
        } else {
            // If no winners, roll over prize to next round (owner can claim or roll over)
            // For now, keeping it in the contract
        }
        
        emit LotteryDrawn(currentRoundId, winningNumbers, winnerCount);
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
     * @dev Check if player numbers match winning numbers sequentially
     * @param playerNumbers The numbers chosen by the player
     * @param winningNumbers The randomly generated winning numbers
     */
    function isSequentialMatch(uint8[7] memory playerNumbers, uint8[7] memory winningNumbers) 
        internal 
        pure 
        returns (bool) 
    {
        for (uint256 i = 0; i < NUMBERS_COUNT; i++) {
            if (playerNumbers[i] != winningNumbers[i]) {
                return false;
            }
        }
        return true;
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
     * @dev Get current round info
     */
    function getCurrentRound() external view returns (LotteryRound memory) {
        return lotteryRounds[currentRoundId];
    }
    
    /**
     * @dev Get winning numbers for a round
     */
    function getWinningNumbers(uint256 roundId) external view returns (uint8[7] memory) {
        require(lotteryRounds[roundId].isDrawn, "Round not drawn yet");
        return lotteryRounds[roundId].winningNumbers;
    }
    
    /**
     * @dev Get winners for a round
     */
    function getRoundWinners(uint256 roundId) external view returns (address[] memory) {
        return lotteryRounds[roundId].winners;
    }
    
    /**
     * @dev Emergency withdrawal by owner (if needed)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
