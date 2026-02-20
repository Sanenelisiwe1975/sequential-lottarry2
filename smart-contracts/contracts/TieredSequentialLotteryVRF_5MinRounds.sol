// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract TieredSequentialLotteryVRF_5MinRounds is
    VRFConsumerBaseV2Plus,
    ReentrancyGuard,
    Pausable
{
    // VRF v2.5 VARIABLES

    address private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint256 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;

    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 7;

    // LOTTERY STRUCTURES

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

    // CONSTANTS

    uint256 public constant MIN_NUMBERS = 1;
    uint256 public constant MAX_NUMBERS = 49;
    uint256 public constant NUMBERS_COUNT = 7;

    uint256 public constant OWNER_FEE_PERCENTAGE = 1000;
    uint256 public constant ROUND_DURATION = 5 minutes;

    uint256 public constant MIN_TICKET_PRICE = 0.001 ether;
    uint256 public constant MAX_TICKET_PRICE = 1 ether;

    // STATE VARIABLES

    address public owner;
    
    uint256 public currentRoundId;
    uint256 public ticketPrice = 0.01 ether;

    uint256 public ownerBalance;
    uint256 public carryOverBalance;

    PrizeTier[7] public prizeTiers;

    mapping(uint256 => LotteryRound) public lotteryRounds;
    mapping(uint256 => Ticket[]) public roundTickets;
    mapping(address => uint256) public playerWinnings;

    mapping(uint256 => uint256) public vrfRequestToRound;
    mapping(uint256 => bool) public vrfRequestPending;

    // MODIFIERS
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // EVENTS

    event TicketPurchased(address indexed player, uint256 indexed roundId, uint8[7] numbers);
    event LotteryDrawRequested(uint256 indexed roundId, uint256 requestId);
    event LotteryDrawn(uint256 indexed roundId, uint8[7] winningNumbers);
    event WinnerDetermined(uint256 indexed roundId, address indexed player, uint8 matchCount, uint256 prize);
    event WinningsClaimed(address indexed player, uint256 amount);
    event NewRoundStarted(uint256 indexed roundId, uint256 endTime);
    event OwnerWithdrawal(address indexed owner, uint256 amount);

    // CONSTRUCTOR

    constructor(
        address vrfCoordinator,
        bytes32 gasLane,
        uint256 subscriptionId,
        uint32 callbackGasLimit
    )
        VRFConsumerBaseV2Plus(vrfCoordinator)
    {
        owner = msg.sender;
        
        i_vrfCoordinator = vrfCoordinator;
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;

        prizeTiers[0] = PrizeTier(1, 0);
        prizeTiers[1] = PrizeTier(2, 500);
        prizeTiers[2] = PrizeTier(3, 1000);
        prizeTiers[3] = PrizeTier(4, 1500);
        prizeTiers[4] = PrizeTier(5, 2000);
        prizeTiers[5] = PrizeTier(6, 2000);
        prizeTiers[6] = PrizeTier(7, 3000);

        startNewRound();
    }

    // START ROUND

    function startNewRound() public {
        require(
            currentRoundId == 0 || lotteryRounds[currentRoundId].isDrawn,
            "Round not finished"
        );

        currentRoundId++;

        LotteryRound storage round = lotteryRounds[currentRoundId];

        round.roundId = currentRoundId;
        round.startTime = block.timestamp;
        round.endTime = block.timestamp + ROUND_DURATION;
        round.ticketPrice = ticketPrice;
        round.prizePool = carryOverBalance;

        carryOverBalance = 0;

        emit NewRoundStarted(currentRoundId, round.endTime);
    }

    // BUY TICKET

    function buyTicket(uint8[7] memory numbers)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        require(msg.value == ticketPrice, "Wrong price");
        require(validateNumbers(numbers), "Invalid numbers");

        LotteryRound storage round = lotteryRounds[currentRoundId];

        require(block.timestamp < round.endTime, "Round ended");
        require(!round.isDrawn, "Round already drawn");

        uint256 ownerFee = (msg.value * OWNER_FEE_PERCENTAGE) / 10000;
        uint256 prizePart = msg.value - ownerFee;

        ownerBalance += ownerFee;
        round.prizePool += prizePart;

        // Sort numbers in ascending order
        uint8[7] memory sortedNumbers = sortNumbers(numbers);

        roundTickets[currentRoundId].push(
            Ticket(msg.sender, sortedNumbers, block.timestamp, 0)
        );

        emit TicketPurchased(msg.sender, currentRoundId, sortedNumbers);
    }

    // VALIDATE NUMBERS
    
    function validateNumbers(uint8[7] memory numbers) internal pure returns (bool) {
        for (uint256 i = 0; i < NUMBERS_COUNT; i++) {
            if (numbers[i] < MIN_NUMBERS || numbers[i] > MAX_NUMBERS) {
                return false;
            }
        }
        return true;
    }

    // SORT NUMBERS IN ASCENDING ORDER
    
    function sortNumbers(uint8[7] memory arr) internal pure returns (uint8[7] memory) {
        uint8[7] memory sorted = arr;
        
        // Insertion sort
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

    // DRAW LOTTERY

    function drawLottery() external whenNotPaused {
        LotteryRound storage round = lotteryRounds[currentRoundId];

        require(block.timestamp >= round.endTime, "Not ended");
        require(!round.isDrawn, "Already drawn");
        require(!vrfRequestPending[currentRoundId], "Draw already requested");

        // If no tickets, skip VRF and mark as drawn
        if (roundTickets[currentRoundId].length == 0) {
            round.isDrawn = true;
            emit LotteryDrawn(currentRoundId, [0,0,0,0,0,0,0]);
            return;
        }

        VRFV2PlusClient.RandomWordsRequest memory request = VRFV2PlusClient.RandomWordsRequest({
            keyHash: i_gasLane,
            subId: i_subscriptionId,
            requestConfirmations: REQUEST_CONFIRMATIONS,
            callbackGasLimit: i_callbackGasLimit,
            numWords: NUM_WORDS,
            extraArgs: VRFV2PlusClient._argsToBytes(
                VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
            )
        });

        uint256 requestId = s_vrfCoordinator.requestRandomWords(request);

        vrfRequestToRound[requestId] = currentRoundId;
        vrfRequestPending[currentRoundId] = true;
        round.vrfRequestId = requestId;

        emit LotteryDrawRequested(currentRoundId, requestId);
    }

    // VRF CALLBACK

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        uint256 roundId = vrfRequestToRound[requestId];

        LotteryRound storage round = lotteryRounds[roundId];

        // Generate random numbers
        uint8[7] memory tempNumbers;
        for (uint256 i = 0; i < NUMBERS_COUNT; i++) {
            tempNumbers[i] = uint8((randomWords[i] % MAX_NUMBERS) + 1);
        }

        // Sort VRF numbers in ascending order
        uint8[7] memory winningNumbers = sortNumbers(tempNumbers);

        round.winningNumbers = winningNumbers;
        round.isDrawn = true;
        vrfRequestPending[roundId] = false;

        emit LotteryDrawn(roundId, winningNumbers);

        // Process winners
        distributePrizes(roundId);
    }

    // DISTRIBUTE PRIZES
    
    function distributePrizes(uint256 roundId) internal {
        LotteryRound storage round = lotteryRounds[roundId];
        Ticket[] storage tickets = roundTickets[roundId];
        
        uint256[8] memory tierCounts;
        
        // Count matches for each ticket
        for (uint256 i = 0; i < tickets.length; i++) {
            uint8 matches = countSequentialMatches(tickets[i].numbers, round.winningNumbers);
            tickets[i].matchedBalls = matches;
            tierCounts[matches]++;
        }
        
        uint256 totalPrizePool = round.prizePool;
        uint256 totalDistributed = 0;
        
        // Distribute prizes by tier
        for (uint8 matchCount = 2; matchCount <= 7; matchCount++) {
            if (tierCounts[matchCount] == 0) continue;
            
            uint16 tierPercentage = prizeTiers[matchCount - 1].percentage;
            uint256 tierTotalPrize = (totalPrizePool * tierPercentage) / 10000;
            uint256 prizePerWinner = tierTotalPrize / tierCounts[matchCount];
            
            totalDistributed += tierTotalPrize;
            
            WinnerTier storage tier = round.winnerTiers[matchCount];
            tier.matchCount = matchCount;
            tier.prizePerWinner = prizePerWinner;
            
            // Award prizes
            for (uint256 i = 0; i < tickets.length; i++) {
                if (tickets[i].matchedBalls == matchCount) {
                    playerWinnings[tickets[i].player] += prizePerWinner;
                    tier.winners.push(tickets[i].player);
                    
                    emit WinnerDetermined(roundId, tickets[i].player, matchCount, prizePerWinner);
                }
            }
        }
        
        // Carry over unclaimed prizes
        uint256 unclaimedPrizes = totalPrizePool - totalDistributed;
        if (unclaimedPrizes > 0) {
            carryOverBalance += unclaimedPrizes;
        }
    }

    // COUNT SEQUENTIAL MATCHES
    
    function countSequentialMatches(
        uint8[7] memory playerNumbers,
        uint8[7] memory winningNumbers
    ) internal pure returns (uint8) {
        uint8 matches = 0;
        for (uint256 i = 0; i < NUMBERS_COUNT; i++) {
            if (playerNumbers[i] == winningNumbers[i]) {
                matches++;
            } else {
                break; // Stop at first mismatch
            }
        }
        return matches;
    }

    // CLAIM WINNINGS

    function claimWinnings() external nonReentrant {
        uint256 amount = playerWinnings[msg.sender];
        require(amount > 0, "No winnings");

        playerWinnings[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit WinningsClaimed(msg.sender, amount);
    }

    // OWNER WITHDRAW FEES
    
    function withdrawOwnerFees() external onlyOwner nonReentrant {
        uint256 amount = ownerBalance;
        require(amount > 0, "No fees to withdraw");
        
        ownerBalance = 0;
        
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit OwnerWithdrawal(owner, amount);
    }

    // SET TICKET PRICE
    
    function setTicketPrice(uint256 newPrice) external onlyOwner {
        require(newPrice >= MIN_TICKET_PRICE, "Price too low");
        require(newPrice <= MAX_TICKET_PRICE, "Price too high");
        ticketPrice = newPrice;
    }

    // PAUSE/UNPAUSE
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }

    // VIEW FUNCTIONS

    function getTimeRemaining() external view returns (uint256) {
        if (currentRoundId == 0) return 0;
        if (block.timestamp >= lotteryRounds[currentRoundId].endTime) return 0;
        return lotteryRounds[currentRoundId].endTime - block.timestamp;
    }

    function getRoundTickets(uint256 roundId) external view returns (Ticket[] memory) {
        return roundTickets[roundId];
    }

    function getWinningNumbers(uint256 roundId) external view returns (uint8[7] memory) {
        require(lotteryRounds[roundId].isDrawn, "Round not drawn yet");
        return lotteryRounds[roundId].winningNumbers;
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
}