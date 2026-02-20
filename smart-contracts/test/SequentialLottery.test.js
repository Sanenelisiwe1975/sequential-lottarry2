// Test script for Sequential Lottery Contract
// This can be used with Hardhat or Remix

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SequentialLottery Contract", function () {
    let lottery;
    let owner;
    let player1;
    let player2;
    let player3;

    beforeEach(async function () {
        [owner, player1, player2, player3] = await ethers.getSigners();
        
        const SequentialLottery = await ethers.getContractFactory("SequentialLottery");
        lottery = await SequentialLottery.deploy();
        await lottery.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await lottery.owner()).to.equal(owner.address);
        });

        it("Should start the first round automatically", async function () {
            expect(await lottery.currentRoundId()).to.equal(1);
        });

        it("Should set default ticket price to 0.01 ETH", async function () {
            expect(await lottery.ticketPrice()).to.equal(ethers.utils.parseEther("0.01"));
        });
    });

    describe("Buying Tickets", function () {
        it("Should allow buying a ticket with correct payment", async function () {
            const numbers = [1, 2, 3, 4, 5, 6, 7];
            await expect(
                lottery.connect(player1).buyTicket(numbers, {
                    value: ethers.utils.parseEther("0.01")
                })
            ).to.emit(lottery, "TicketPurchased");
        });

        it("Should reject ticket with incorrect payment", async function () {
            const numbers = [1, 2, 3, 4, 5, 6, 7];
            await expect(
                lottery.connect(player1).buyTicket(numbers, {
                    value: ethers.utils.parseEther("0.005")
                })
            ).to.be.revertedWith("Incorrect ticket price");
        });

        it("Should reject ticket with invalid numbers (0)", async function () {
            const numbers = [0, 2, 3, 4, 5, 6, 7];
            await expect(
                lottery.connect(player1).buyTicket(numbers, {
                    value: ethers.utils.parseEther("0.01")
                })
            ).to.be.revertedWith("Invalid numbers: must be 1-49");
        });

        it("Should reject ticket with invalid numbers (>49)", async function () {
            const numbers = [1, 2, 3, 4, 5, 6, 50];
            await expect(
                lottery.connect(player1).buyTicket(numbers, {
                    value: ethers.utils.parseEther("0.01")
                })
            ).to.be.revertedWith("Invalid numbers: must be 1-49");
        });

        it("Should increase prize pool with each ticket", async function () {
            const numbers = [1, 2, 3, 4, 5, 6, 7];
            
            await lottery.connect(player1).buyTicket(numbers, {
                value: ethers.utils.parseEther("0.01")
            });
            
            const round = await lottery.getCurrentRound();
            expect(round.prizePool).to.equal(ethers.utils.parseEther("0.01"));
        });
    });

    describe("Drawing Lottery", function () {
        beforeEach(async function () {
            // Buy some tickets
            await lottery.connect(player1).buyTicket([1, 2, 3, 4, 5, 6, 7], {
                value: ethers.utils.parseEther("0.01")
            });
            await lottery.connect(player2).buyTicket([10, 20, 30, 40, 41, 42, 43], {
                value: ethers.utils.parseEther("0.01")
            });
            
            // Fast forward time to end the round
            await ethers.provider.send("evm_increaseTime", [86400]); // 1 day
            await ethers.provider.send("evm_mine");
        });

        it("Should only allow owner to draw", async function () {
            await expect(
                lottery.connect(player1).drawLottery()
            ).to.be.revertedWith("Only owner can call this function");
        });

        it("Should emit LotteryDrawn event", async function () {
            await expect(lottery.drawLottery())
                .to.emit(lottery, "LotteryDrawn");
        });

        it("Should not allow drawing before round ends", async function () {
            // Start a new round
            await lottery.startNewRound(86400);
            
            await expect(
                lottery.drawLottery()
            ).to.be.revertedWith("Round not ended yet");
        });

        it("Should generate winning numbers between 1 and 49", async function () {
            await lottery.drawLottery();
            const winningNumbers = await lottery.getWinningNumbers(1);
            
            for (let i = 0; i < 7; i++) {
                expect(winningNumbers[i]).to.be.gte(1);
                expect(winningNumbers[i]).to.be.lte(49);
            }
        });
    });

    describe("Claiming Winnings", function () {
        it("Should revert when claiming with no winnings", async function () {
            await expect(
                lottery.connect(player1).claimWinnings()
            ).to.be.revertedWith("No winnings to claim");
        });

        it("Should not allow claiming twice", async function () {
            // This would require a winning scenario
            // In a real test, you'd need to manipulate the random numbers
            // or use a modified contract for testing
        });
    });

    describe("Starting New Rounds", function () {
        it("Should only allow owner to start new round", async function () {
            await expect(
                lottery.connect(player1).startNewRound(86400)
            ).to.be.revertedWith("Only owner can call this function");
        });

        it("Should not start new round before drawing current one", async function () {
            await expect(
                lottery.startNewRound(86400)
            ).to.be.revertedWith("Current round not drawn yet");
        });

        it("Should increment round ID", async function () {
            // End and draw current round
            await ethers.provider.send("evm_increaseTime", [86400]);
            await ethers.provider.send("evm_mine");
            await lottery.drawLottery();
            
            // Start new round
            await lottery.startNewRound(86400);
            expect(await lottery.currentRoundId()).to.equal(2);
        });
    });

    describe("Sequential Matching Logic", function () {
        it("Should detect exact sequential match", async function () {
            // This test would require exposing the isSequentialMatch function
            // or testing through the full lottery flow
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to set ticket price", async function () {
            await lottery.setTicketPrice(ethers.utils.parseEther("0.05"));
            expect(await lottery.ticketPrice()).to.equal(ethers.utils.parseEther("0.05"));
        });

        it("Should allow owner to emergency withdraw", async function () {
            // Add some funds to the contract
            await lottery.connect(player1).buyTicket([1, 2, 3, 4, 5, 6, 7], {
                value: ethers.utils.parseEther("0.01")
            });
            
            const balanceBefore = await ethers.provider.getBalance(owner.address);
            await lottery.emergencyWithdraw();
            const balanceAfter = await ethers.provider.getBalance(owner.address);
            
            expect(balanceAfter).to.be.gt(balanceBefore);
        });
    });
});

// Example usage script (for manual testing in Remix or Hardhat console)
async function exampleUsage() {
    console.log("=== Sequential Lottery Example Usage ===\n");
    
    const [owner, player1, player2] = await ethers.getSigners();
    
    // Deploy contract
    const SequentialLottery = await ethers.getContractFactory("SequentialLottery");
    const lottery = await SequentialLottery.deploy();
    await lottery.deployed();
    console.log("Contract deployed to:", lottery.address);
    
    // Check current round
    const round = await lottery.getCurrentRound();
    console.log("\nCurrent Round:", round.roundId.toString());
    console.log("Ticket Price:", ethers.utils.formatEther(round.ticketPrice), "ETH");
    
    // Player 1 buys a ticket
    console.log("\n--- Player 1 buying ticket ---");
    const player1Numbers = [7, 14, 21, 28, 35, 42, 49];
    const tx1 = await lottery.connect(player1).buyTicket(player1Numbers, {
        value: ethers.utils.parseEther("0.01")
    });
    await tx1.wait();
    console.log("Player 1 numbers:", player1Numbers);
    
    // Player 2 buys a ticket
    console.log("\n--- Player 2 buying ticket ---");
    const player2Numbers = [1, 2, 3, 4, 5, 6, 7];
    const tx2 = await lottery.connect(player2).buyTicket(player2Numbers, {
        value: ethers.utils.parseEther("0.01")
    });
    await tx2.wait();
    console.log("Player 2 numbers:", player2Numbers);
    
    // Check prize pool
    const updatedRound = await lottery.getCurrentRound();
    console.log("\nPrize Pool:", ethers.utils.formatEther(updatedRound.prizePool), "ETH");
    
    // Fast forward time
    console.log("\n--- Fast forwarding time to end round ---");
    await ethers.provider.send("evm_increaseTime", [86400]);
    await ethers.provider.send("evm_mine");
    
    // Draw lottery
    console.log("\n--- Drawing lottery ---");
    const drawTx = await lottery.drawLottery();
    await drawTx.wait();
    
    // Get winning numbers
    const winningNumbers = await lottery.getWinningNumbers(1);
    console.log("Winning Numbers:", winningNumbers.map(n => n.toString()));
    
    // Check winners
    const winners = await lottery.getRoundWinners(1);
    console.log("\nNumber of Winners:", winners.length);
    if (winners.length > 0) {
        console.log("Winners:", winners);
        
        // Check winnings for players
        const player1Winnings = await lottery.playerWinnings(player1.address);
        const player2Winnings = await lottery.playerWinnings(player2.address);
        
        if (player1Winnings.gt(0)) {
            console.log("\nPlayer 1 won:", ethers.utils.formatEther(player1Winnings), "ETH");
        }
        if (player2Winnings.gt(0)) {
            console.log("Player 2 won:", ethers.utils.formatEther(player2Winnings), "ETH");
        }
    } else {
        console.log("No winners this round!");
    }
    
    console.log("\n=== Example Complete ===");
}

// Uncomment to run example
// exampleUsage().catch(console.error);

module.exports = { exampleUsage };
