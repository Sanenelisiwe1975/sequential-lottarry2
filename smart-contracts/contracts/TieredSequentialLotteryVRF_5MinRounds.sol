// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Chainlink VRF v2.5 imports
import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TieredSequentialLotteryVRF_5MinRounds is
    VRFConsumerBaseV2Plus,
    ReentrancyGuard,
    Pausable,
    Ownable
{
    // =============================================================
    // VRF v2.5 VARIABLES
    // =============================================================

    address private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint256 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;

    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 7;

    // =============================================================
    // LOTTERY STRUCTURES
    // =============================================================

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

    // =============================================================
    // CONSTANTS
    // =============================================================

    uint256 public constant MIN_NUMBERS = 1;
    uint256 public constant MAX_NUMBERS = 49;
    uint256 public constant NUMBERS_COUNT = 7;

    uint256 public constant OWNER_FEE_PERCENTAGE = 1000;
    uint256 public constant ROUND_DURATION = 5 minutes;

    uint256 public constant MIN_TICKET_PRICE = 0.001 ether;
    uint256 public constant MAX_TICKET_PRICE = 1 ether;


    // STATE VARIABLES

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


    // EVENTS

    event TicketPurchased(address player, uint256 roundId);
    event LotteryDrawRequested(uint256 roundId, uint256 requestId);
    event LotteryDrawn(uint256 roundId, uint8[7] numbers);
    event WinningsClaimed(address player, uint256 amount);
    event NewRoundStarted(uint256 roundId, uint256 endTime);

    // CONSTRUCTOR

    constructor(
        address vrfCoordinator,
        bytes32 gasLane,
        uint256 subscriptionId,
        uint32 callbackGasLimit
    )
        VRFConsumerBaseV2Plus(vrfCoordinator)
        Ownable(msg.sender)
    {
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
            currentRoundId == 0 ||
            lotteryRounds[currentRoundId].isDrawn,
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

        LotteryRound storage round = lotteryRounds[currentRoundId];

        require(block.timestamp < round.endTime, "Round ended");

        uint256 ownerFee = msg.value * OWNER_FEE_PERCENTAGE / 10000;
        uint256 prizePart = msg.value - ownerFee;

        ownerBalance += ownerFee;
        round.prizePool += prizePart;

        roundTickets[currentRoundId].push(
            Ticket(msg.sender, numbers, block.timestamp, 0)
        );

        emit TicketPurchased(msg.sender, currentRoundId);
    }

    // DRAW LOTTERY

    function drawLottery() external {

        LotteryRound storage round = lotteryRounds[currentRoundId];

        require(block.timestamp >= round.endTime, "Not ended");
        require(!round.isDrawn, "Already drawn");

        VRFV2PlusClient.RandomWordsRequest memory request =
            VRFV2PlusClient.RandomWordsRequest({

                keyHash: i_gasLane,
                subId: i_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: i_callbackGasLimit,
                numWords: NUM_WORDS,

                extraArgs:
                    VRFV2PlusClient._argsToBytes(
                        VRFV2PlusClient.ExtraArgsV1({
                            nativePayment: false
                        })
                    )
            });

        uint256 requestId =
            s_vrfCoordinator.requestRandomWords(request);

        vrfRequestToRound[requestId] = currentRoundId;
        vrfRequestPending[currentRoundId] = true;

        round.vrfRequestId = requestId;

        emit LotteryDrawRequested(currentRoundId, requestId);
    }

    // VRF CALLBACK

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {

        uint256 roundId = vrfRequestToRound[requestId];

        LotteryRound storage round = lotteryRounds[roundId];

        uint8[7] memory numbers;

        for(uint i = 0; i < 7; i++)
        {
            numbers[i] =
                uint8((randomWords[i] % 49) + 1);
        }

        round.winningNumbers = numbers;
        round.isDrawn = true;

        emit LotteryDrawn(roundId, numbers);
    }

    // CLAIM WINNINGS
    

    function claimWinnings()
        external
        nonReentrant
    {

        uint256 amount =
            playerWinnings[msg.sender];

        require(amount > 0);

        playerWinnings[msg.sender] = 0;

        payable(msg.sender).transfer(amount);

        emit WinningsClaimed(msg.sender, amount);
    }

}
