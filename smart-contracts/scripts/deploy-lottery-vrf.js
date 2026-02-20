const hre = require("hardhat");

async function main() {
  console.log("🎰 Deploying Sequential Lottery with Chainlink VRF v2.5...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  // Sepolia VRF v2.5 Configuration
  const VRF_COORDINATOR = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B"; // VRF v2.5 Sepolia
  const GAS_LANE = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae"; // 500 gwei
  const SUBSCRIPTION_ID = process.env.VRF_SUBSCRIPTION_ID || "0";
  const CALLBACK_GAS_LIMIT = "2500000";

  console.log("Network: Sepolia Testnet");
  console.log("Subscription ID:", SUBSCRIPTION_ID);

  if (SUBSCRIPTION_ID === "0") {
    console.error("❌ ERROR: VRF_SUBSCRIPTION_ID not set in .env file!");
    process.exit(1);
  }

  console.log("\nDeploying contract...");

  const LotteryFactory = await hre.ethers.getContractFactory(
    "TieredSequentialLotteryVRF_5MinRounds"
  );

  const lottery = await LotteryFactory.deploy(
    VRF_COORDINATOR,
    GAS_LANE,
    SUBSCRIPTION_ID,  // Passed as string, contract will convert to uint256
    CALLBACK_GAS_LIMIT
  );

  await lottery.waitForDeployment();
  const address = await lottery.getAddress();

  console.log("\n✅ Contract deployed successfully!");
  console.log("📍 Address:", address);
  console.log("\n" + "=".repeat(60));
  console.log("🔔 NEXT STEPS:");
  console.log("=".repeat(60));
  console.log("\n1️⃣  Add contract as VRF consumer:");
  console.log("   → Go to: https://vrf.chain.link");
  console.log("   → Select your subscription:", SUBSCRIPTION_ID);
  console.log("   → Click 'Add Consumer'");
  console.log("   → Paste address:", address);
  console.log("\n2️⃣  Verify contract:");
  console.log(`   npx hardhat verify --network sepolia ${address} "${VRF_COORDINATOR}" "${GAS_LANE}" "${SUBSCRIPTION_ID}" "${CALLBACK_GAS_LIMIT}"`);
  console.log("\n3️⃣  Update frontend:");
  console.log("   → Open: frontend/src/constants/index.ts");
  console.log(`   → Set: LOTTERY_CONTRACT_ADDRESS = "${address}"`);
  console.log("\n4️⃣  Test:");
  console.log("   → Buy a ticket");
  console.log("   → Wait 5 minutes");
  console.log("   → Call drawLottery()");
  console.log("\n" + "=".repeat(60));
  console.log("\n✨ Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });