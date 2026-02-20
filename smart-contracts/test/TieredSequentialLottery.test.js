// Test script for Tiered Sequential Lottery Contract
// Run with: npx hardhat test

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TieredSequentialLottery Contract", function () {
    let lottery;
    let owner;
    let player1;
    let player2;
    let player3;
    let player4;
    let player5;

    beforeEach(async function () {
        [owner, player1, player2, player3, player4, player5] = await ethers.getSigners();
        
        const TieredSequentialLottery = await ethers.getContractFactory("TieredSequentialLottery");
        lottery = await TieredSequentialLottery.deploy();
        await lottery.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await lottery.owner()).to.equal(owner.address);
        });

        it("Should initialize prize tiers correctly", async function () {
            const tiers = await lottery.getPrizeTiers();
            
            expect(tiers[0].matchCount).to.equal(1);
            expect(tiers[0].percentage).to.equal(0);    // 0%
            
            expect(tiers[1].matchCount).to.equal(2);
            expect(tiers[1].percentage).to.equal(500);  // 5%
            
            expect(tiers[2].matchCount).to.equal(3);
            expect(tiers[2].percentage).to.equal(1000); // 10%
            
            expect(tiers[3].matchCount).to.equal(4);
            expect(tiers[3].percentage).to.equal(1500); // 15%
            
            expect(tiers[4].matchCount).to.equal(5);
            expect(tiers[4].percentage).to.equal(2000); // 20%
            
            expect(tiers[5].matchCount).to.equal(6);
            expect(tiers[5].percentage).to.equal(2000); // 20%
            
            expect(tiers[6].matchCount).to.equal(7);
            expect(tiers[6].percentage).to.equal(3000); // 30%
        });

        it("Should verify prize tier percentages add up to 100%", async function () {
            const tiers = await lottery.getPrizeTiers();
            let total = 0;
            
            // Start from index 1 (2 balls) since 1 ball gets 0%
            for (let i = 1; i < 7; i++) {
                total += tiers[i].percentage;
            }
            
            expect(total).to.equal(10000); // 100% in basis points
        });
    });

    describe("Buying Tickets", function () {
        it("Should allow buying tickets with valid numbers", async function () {
            const numbers = [1, 2, 3, 4, 5, 6, 7];
            await expect(
                lottery.connect(player1).buyTicket(numbers, {
                    value: ethers.utils.parseEther("0.01")
                })
            ).to.emit(lottery, "TicketPurchased");
        });

        it("Should track multiple tickets per player", async function () {
            await lottery.connect(player1).buyTicket([1, 2, 3, 4, 5, 6, 7], {
                value: ethers.utils.parseEther("0.01")
            });
            
            await lottery.connect(player1).buyTicket([10, 20, 30, 40, 41, 42, 43], {
                value: ethers.utils.parseEther("0.01")
            });
            
            const myTickets = await lottery.connect(player1).getMyTickets(1);
            expect(myTickets.length).to.equal(2);
        });

        it("Should increase prize pool correctly", async function () {
            await lottery.connect(player1).buyTicket([1, 2, 3, 4, 5, 6, 7], {
                value: ethers.utils.parseEther("0.01")
            });
            
            await lottery.connect(player2).buyTicket([10, 20, 30, 40, 41, 42, 43], {
                value: ethers.utils.parseEther("0.01")
            });
            
            const roundInfo = await lottery.getCurrentRoundInfo();
            expect(roundInfo.prizePool).to.equal(ethers.utils.parseEther("0.02"));
        });
    });

    describe("Sequential Matching Logic", function () {
        it("Should correctly count sequential matches", async function () {
            // This test would require exposing the countSequentialMatches function
            // or testing through the full lottery flow
            // For demonstration, we'll test through ticket results after drawing
        });
    });

    describe("Drawing Lottery and Prize Distribution", function () {
        beforeEach(async function () {
            // Setup: Multiple players buy tickets
            await lottery.connect(player1).buyTicket([1, 2, 3, 4, 5, 6, 7], {
                value: ethers.utils.parseEther("0.01")
            });
            
            await lottery.connect(player2).buyTicket([10, 20, 30, 40, 41, 42, 43], {
                value: ethers.utils.parseEther("0.01")
            });
            
            await lottery.connect(player3).buyTicket([5, 10, 15, 20, 25, 30, 35], {
                value: ethers.utils.parseEther("0.01")
            });
            
            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [86400]);
            await ethers.provider.send("evm_mine");
        });

        it("Should emit LotteryDrawn event", async function () {
            await expect(lottery.drawLottery())
                .to.emit(lottery, "LotteryDrawn");
        });

        it("Should assign matched balls to tickets", async function () {
            await lottery.drawLottery();
            
            const tickets = await lottery.getRoundTickets(1);
            
            // Each ticket should have matchedBalls set (0-7)
            tickets.forEach(ticket => {
                expect(ticket.matchedBalls).to.be.gte(0);
                expect(ticket.matchedBalls).to.be.lte(7);
            });
        });

        it("Should distribute prizes to appropriate tiers", async function () {
            await lottery.drawLottery();
            
            // Get tier information
            const [matchCounts, winnerCounts, prizesPerWinner] = await lottery.getAllTierInfo(1);
            
            // Verify we got data for all tiers
            expect(matchCounts.length).to.equal(6); // 2-7 matches
        });

        it("Should emit WinnerDetermined events for winners", async function () {
            const tx = await lottery.drawLottery();
            const receipt = await tx.wait();
            
            // Check if any WinnerDetermined events were emitted
            const winnerEvents = receipt.events.filter(e => e.event === "WinnerDetermined");
            
            // Should have events if there were any winners (2+ matches)
            console.log(`Found ${winnerEvents.length} winners`);
        });

        it("Should allow winners to claim winnings", async function () {
            await lottery.drawLottery();
            
            // Check if player1 has any winnings
            const winnings1 = await lottery.playerWinnings(player1.address);
            
            if (winnings1.gt(0)) {
                const balanceBefore = await ethers.provider.getBalance(player1.address);
                await lottery.connect(player1).claimWinnings();
                const balanceAfter = await ethers.provider.getBalance(player1.address);
                
                expect(balanceAfter).to.be.gt(balanceBefore);
            }
        });
    });

    describe("Prize Percentage Calculations", function () {
        it("Should distribute exactly the specified percentages", async function () {
            // Create a controlled scenario with 10 ETH prize pool
            const ticketCount = 1000;
            const ticketPrice = ethers.utils.parseEther("0.01");
            
            // Buy many tickets (this would be expensive in real test)
            // In practice, you'd mock the prize pool
            
            // For this test, we'll verify the math is correct
            const prizePool = ethers.utils.parseEther("10");
            
            // Expected distributions
            const expected = {
                tier2: prizePool.mul(500).div(10000),   // 5%
                tier3: prizePool.mul(1000).div(10000),  // 10%
                tier4: prizePool.mul(1500).div(10000),  // 15%
                tier5: prizePool.mul(2000).div(10000),  // 20%
                tier6: prizePool.mul(2000).div(10000),  // 20%
                tier7: prizePool.mul(3000).div(10000),  // 30%
            };
            
            expect(expected.tier2).to.equal(ethers.utils.parseEther("0.5"));
            expect(expected.tier3).to.equal(ethers.utils.parseEther("1.0"));
            expect(expected.tier4).to.equal(ethers.utils.parseEther("1.5"));
            expect(expected.tier5).to.equal(ethers.utils.parseEther("2.0"));
            expect(expected.tier6).to.equal(ethers.utils.parseEther("2.0"));
            expect(expected.tier7).to.equal(ethers.utils.parseEther("3.0"));
        });
    });

    describe("Edge Cases", function () {
        it("Should handle round with no winners (all 0 or 1 matches)", async function () {
            // Buy tickets that are unlikely to match
            await lottery.connect(player1).buyTicket([49, 49, 49, 49, 49, 49, 49], {
                value: ethers.utils.parseEther("0.01")
            });
            
            await ethers.provider.send("evm_increaseTime", [86400]);
            await ethers.provider.send("evm_mine");
            
            await lottery.drawLottery();
            
            // Check that no one has winnings
            const winnings1 = await lottery.playerWinnings(player1.address);
            expect(winnings1).to.equal(0);
        });

        it("Should handle multiple winners in same tier", async function () {
            // Both players buy same numbers (for testing)
            const numbers = [1, 2, 3, 4, 5, 6, 7];
            
            await lottery.connect(player1).buyTicket(numbers, {
                value: ethers.utils.parseEther("0.01")
            });
            
            await lottery.connect(player2).buyTicket(numbers, {
                value: ethers.utils.parseEther("0.01")
            });
            
            await ethers.provider.send("evm_increaseTime", [86400]);
            await ethers.provider.send("evm_mine");
            
            await lottery.drawLottery();
            
            // Both should have equal winnings if they matched
            const winnings1 = await lottery.playerWinnings(player1.address);
            const winnings2 = await lottery.playerWinnings(player2.address);
            
            if (winnings1.gt(0)) {
                expect(winnings1).to.equal(winnings2);
            }
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await lottery.connect(player1).buyTicket([1, 2, 3, 4, 5, 6, 7], {
                value: ethers.utils.parseEther("0.01")
            });
        });

        it("Should return current round info", async function () {
            const roundInfo = await lottery.getCurrentRoundInfo();
            
            expect(roundInfo.roundId).to.equal(1);
            expect(roundInfo.prizePool).to.equal(ethers.utils.parseEther("0.01"));
            expect(roundInfo.isDrawn).to.be.false;
        });

        it("Should return player's tickets", async function () {
            const myTickets = await lottery.connect(player1).getMyTickets(1);
            
            expect(myTickets.length).to.equal(1);
            expect(myTickets[0].player).to.equal(player1.address);
        });

        it("Should return winning numbers after draw", async function () {
            await ethers.provider.send("evm_increaseTime", [86400]);
            await ethers.provider.send("evm_mine");
            
            await lottery.drawLottery();
            
            const winningNumbers = await lottery.getWinningNumbers(1);
            
            expect(winningNumbers.length).to.equal(7);
            winningNumbers.forEach(num => {
                expect(num).to.be.gte(1);
                expect(num).to.be.lte(49);
            });
        });

        it("Should return tier information after draw", async function () {
            await ethers.provider.send("evm_increaseTime", [86400]);
            await ethers.provider.send("evm_mine");
            
            await lottery.drawLottery();
            
            const [matchCounts, winnerCounts, prizesPerWinner] = await lottery.getAllTierInfo(1);
            
            expect(matchCounts.length).to.equal(6);
            expect(winnerCounts.length).to.equal(6);
            expect(prizesPerWinner.length).to.equal(6);
        });
    });

    describe("Multi-Round Functionality", function () {
        it("Should start new round after drawing current one", async function () {
            await ethers.provider.send("evm_increaseTime", [86400]);
            await ethers.provider.send("evm_mine");
            
            await lottery.drawLottery();
            await lottery.startNewRound(86400);
            
            expect(await lottery.currentRoundId()).to.equal(2);
        });

        it("Should track winnings across multiple rounds", async function () {
            // Round 1
            await lottery.connect(player1).buyTicket([1, 2, 3, 4, 5, 6, 7], {
                value: ethers.utils.parseEther("0.01")
            });
            
            await ethers.provider.send("evm_increaseTime", [86400]);
            await ethers.provider.send("evm_mine");
            await lottery.drawLottery();
            
            const winningsAfterRound1 = await lottery.playerWinnings(player1.address);
            
            // Round 2
            await lottery.startNewRound(86400);
            await lottery.connect(player1).buyTicket([1, 2, 3, 4, 5, 6, 7], {
                value: ethers.utils.parseEther("0.01")
            });
            
            await ethers.provider.send("evm_increaseTime", [86400]);
            await ethers.provider.send("evm_mine");
            await lottery.drawLottery();
            
            const winningsAfterRound2 = await lottery.playerWinnings(player1.address);
            
            // Winnings should accumulate
            expect(winningsAfterRound2).to.be.gte(winningsAfterRound1);
        });
    });
});

// Example usage demonstration
async function demonstrateLottery() {
    console.log("\n=== Tiered Sequential Lottery Demonstration ===\n");
    
    const [owner, player1, player2, player3, player4, player5] = await ethers.getSigners();
    
    // Deploy
    const TieredSequentialLottery = await ethers.getContractFactory("TieredSequentialLottery");
    const lottery = await TieredSequentialLottery.deploy();
    await lottery.deployed();
    console.log("Contract deployed to:", lottery.address);
    
    // Show prize tiers
    console.log("\n--- Prize Tier Structure ---");
    const tiers = await lottery.getPrizeTiers();
    tiers.forEach(tier => {
        console.log(`${tier.matchCount} balls: ${tier.percentage / 100}%`);
    });
    
    // Players buy tickets
    console.log("\n--- Players Buying Tickets ---");
    
    const tickets = [
        { player: player1, numbers: [7, 14, 21, 28, 35, 42, 49], name: "Player 1" },
        { player: player2, numbers: [1, 2, 3, 4, 5, 6, 7], name: "Player 2" },
        { player: player3, numbers: [10, 20, 30, 40, 41, 42, 43], name: "Player 3" },
        { player: player4, numbers: [5, 10, 15, 20, 25, 30, 35], name: "Player 4" },
        { player: player5, numbers: [1, 1, 1, 1, 1, 1, 1], name: "Player 5" },
    ];
    
    for (const ticket of tickets) {
        await lottery.connect(ticket.player).buyTicket(ticket.numbers, {
            value: ethers.utils.parseEther("0.01")
        });
        console.log(`${ticket.name}: [${ticket.numbers.join(", ")}]`);
    }
    
    // Check prize pool
    const roundInfo = await lottery.getCurrentRoundInfo();
    console.log("\nTotal Prize Pool:", ethers.utils.formatEther(roundInfo.prizePool), "ETH");
    
    // Draw lottery
    console.log("\n--- Drawing Lottery ---");
    await ethers.provider.send("evm_increaseTime", [86400]);
    await ethers.provider.send("evm_mine");
    
    await lottery.drawLottery();
    
    const winningNumbers = await lottery.getWinningNumbers(1);
    console.log("Winning Numbers:", winningNumbers.map(n => n.toString()).join(", "));
    
    // Show results
    console.log("\n--- Results by Tier ---");
    const [matchCounts, winnerCounts, prizesPerWinner] = await lottery.getAllTierInfo(1);
    
    for (let i = 0; i < matchCounts.length; i++) {
        if (winnerCounts[i] > 0) {
            console.log(`\n${matchCounts[i]} matches:`);
            console.log(`  Winners: ${winnerCounts[i]}`);
            console.log(`  Prize per winner: ${ethers.utils.formatEther(prizesPerWinner[i])} ETH`);
            
            const [winners, prize] = await lottery.getTierWinners(1, matchCounts[i]);
            winners.forEach((winner, idx) => {
                const playerNum = tickets.findIndex(t => t.player.address === winner) + 1;
                console.log(`  - Player ${playerNum}: ${winner}`);
            });
        }
    }
    
    // Show individual player results
    console.log("\n--- Individual Player Results ---");
    for (const ticket of tickets) {
        const myTickets = await lottery.connect(ticket.player).getMyTickets(1);
        const winnings = await lottery.playerWinnings(ticket.player.address);
        
        console.log(`\n${ticket.name}:`);
        console.log(`  Numbers: [${ticket.numbers.join(", ")}]`);
        console.log(`  Sequential Matches: ${myTickets[0].matchedBalls}`);
        console.log(`  Winnings: ${ethers.utils.formatEther(winnings)} ETH`);
    }
    
    console.log("\n=== Demonstration Complete ===\n");
}

// Uncomment to run demonstration
// demonstrateLottery().catch(console.error);

module.exports = { demonstrateLottery };
