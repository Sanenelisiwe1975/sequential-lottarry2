
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🎰 Deploying Sequential Lottery with Chainlink VRF...\n");

  // Choose which contract to deploy:
  
  const CONTRACT_OPTIONS = {
    "5min": "TieredSequentialLotteryVRF_5MinRounds",      // 5-minute continuous rounds
    "sorted": "TieredSequentialLotteryVRF_VRFSortedOnly", //VRF numbers sorted
    "secure": "TieredSequentialLotteryVRF_Secure",        // 24-hour rounds (standard)
    "upgradeable": "TieredSequentialLotteryVRF_Upgradeable" // UUPS upgradeable
  };

  // CHANGE THIS to deploy different versions:
  const DEPLOY_VERSION = "5min"; // Options: "5min", "sorted", "secure", "upgradeable"
  
  const contractName = CONTRACT_OPTIONS[DEPLOY_VERSION];
  
  console.log(`📝 Selected Contract: ${contractName}`);
  console.log(`📝 Version: ${DEPLOY_VERSION}\n`);

  // NETWORK CONFIGURATIONS
  
  const VRF_CONFIGS = {
    sepolia: {
      name: "Sepolia Testnet",
      vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
      gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
      callbackGasLimit: "2500000",
      subscriptionId: process.env.VRF_SUBSCRIPTION_ID || "0"
    },
    mumbai: {
      name: "Polygon Mumbai Testnet",
      vrfCoordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
      gasLane: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
      callbackGasLimit: "2500000",
      subscriptionId: process.env.VRF_SUBSCRIPTION_ID || "0"
    },
    mainnet: {
      name: "Ethereum Mainnet",
      vrfCoordinator: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909",
      gasLane: "0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef",
      callbackGasLimit: "2500000",
      subscriptionId: process.env.VRF_SUBSCRIPTION_ID || "0"
    },
    polygon: {
      name: "Polygon Mainnet",
      vrfCoordinator: "0xAE975071Be8F8eE67addBC1A82488F1C24858067",
      gasLane: "0x6e099d640cde6de9d40ac749b4b594126b0169747122711109c9985d47751f93",
      callbackGasLimit: "2500000",
      subscriptionId: process.env.VRF_SUBSCRIPTION_ID || "0"
    }
  };

  // Get current network
  const networkName = hre.network.name;
  const config = VRF_CONFIGS[networkName];

  if (!config) {
    console.error(`❌ Network ${networkName} not configured!`);
    console.log("Supported networks:", Object.keys(VRF_CONFIGS).join(", "));
    process.exit(1);
  }

  console.log(`🌐 Network: ${config.name}`);
  console.log(`📡 VRF Coordinator: ${config.vrfCoordinator}`);
  console.log(`🔑 Gas Lane: ${config.gasLane}`);
  console.log(`⛽ Callback Gas Limit: ${config.callbackGasLimit}`);
  console.log(`🎫 Subscription ID: ${config.subscriptionId}\n`);

  // Validate subscription ID
  if (config.subscriptionId === "0") {
    console.error("❌ ERROR: VRF_SUBSCRIPTION_ID not set!");
    console.log("\n📝 Please set VRF_SUBSCRIPTION_ID in your .env file");
    console.log("Example: VRF_SUBSCRIPTION_ID=12345\n");
    process.exit(1);
  }

  // DEPLOYMENT
  console.log("🚀 Deploying contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`📍 Deploying from: ${deployer.address}`);
  console.log(`💰 Balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH\n`);

  // Deploy contract
  const LotteryFactory = await hre.ethers.getContractFactory(contractName);
  
  const lottery = await LotteryFactory.deploy(
    config.vrfCoordinator,
    config.gasLane,
    config.subscriptionId,
    config.callbackGasLimit
  );

  await lottery.waitForDeployment();
  const address = await lottery.getAddress();

  console.log(`✅ ${contractName} deployed!`);
  console.log(`📍 Address: ${address}\n`);
  
  // POST-DEPLOYMENT INFO

  console.log("=" .repeat(60));
  console.log("🎉 DEPLOYMENT SUCCESSFUL!");
  console.log("=" .repeat(60));
  console.log();
  
  console.log("📋 CONTRACT DETAILS:");
  console.log(`   Contract: ${contractName}`);
  console.log(`   Version: ${DEPLOY_VERSION}`);
  console.log(`   Address: ${address}`);
  console.log(`   Network: ${config.name}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log();

  // Version-specific info
  if (DEPLOY_VERSION === "5min") {
    console.log("⏱️  5-MINUTE ROUNDS INFO:");
    console.log("   - Round Duration: 5 minutes (300 seconds)");
    console.log("   - Countdown: Continuous (independent of tickets)");
    console.log("   - Draws per day: 288 (if all have tickets)");
    console.log("   - Anyone can call drawLottery()");
    console.log("   - Empty rounds allowed (skip VRF)");
    console.log();
  } else if (DEPLOY_VERSION === "sorted") {
    console.log("🔢 VRF SORTING INFO:");
    console.log("   - VRF numbers: Sorted in ascending order");
    console.log("   - Player numbers: Kept as-is (not sorted)");
    console.log("   - Gas overhead: ~3-5k per draw");
    console.log();
  }

  console.log("🔔 NEXT STEPS:");
  console.log();
  console.log("1️⃣  Add contract as VRF consumer:");
  console.log("   → Go to: https://vrf.chain.link");
  console.log("   → Select your subscription");
  console.log("   → Click 'Add Consumer'");
  console.log(`   → Paste address: ${address}`);
  console.log();
  
  console.log("2️⃣  Verify contract:");
  console.log(`   → npx hardhat verify --network ${networkName} ${address} "${config.vrfCoordinator}" "${config.gasLane}" "${config.subscriptionId}" "${config.callbackGasLimit}"`);
  console.log();
  
  console.log("3️⃣  Update frontend:");
  console.log("   → Open: frontend/src/constants/index.ts");
  console.log(`   → Set LOTTERY_CONTRACT_ADDRESS = "${address}"`);
  console.log();

  if (DEPLOY_VERSION === "5min") {
    console.log("4️⃣  Frontend countdown timer:");
    console.log("   → Implement real-time countdown (updates every second)");
    console.log("   → Show 'Draw Lottery' button when round ends");
    console.log("   → See: docs/5_MINUTE_ROUNDS_GUIDE.md");
    console.log();
  }

  console.log("5️⃣  Test the contract:");
  console.log("   → Buy a ticket");
  if (DEPLOY_VERSION === "5min") {
    console.log("   → Wait 5 minutes for round to end");
  } else {
    console.log("   → Wait for round to end");
  }
  console.log("   → Call drawLottery()");
  console.log("   → Check results");
  console.log();

  console.log("=" .repeat(60));
  console.log();

  //
  const deploymentInfo = {
    network: networkName,
    networkName: config.name,
    contractName: contractName,
    version: DEPLOY_VERSION,
    address: address,
    vrfCoordinator: config.vrfCoordinator,
    gasLane: config.gasLane,
    callbackGasLimit: config.callbackGasLimit,
    subscriptionId: config.subscriptionId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentFile = path.join(
    deploymentsDir,
    `${networkName}-${DEPLOY_VERSION}-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  // Save as latest
  const latestFile = path.join(deploymentsDir, `${networkName}-${DEPLOY_VERSION}-latest.json`);
  fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));

  console.log(`💾 Deployment info saved to: ${deploymentFile}`);
  console.log();

  // WARNINGS
  if (DEPLOY_VERSION === "5min") {
    console.log("⚠️  IMPORTANT NOTES FOR 5-MINUTE ROUNDS:");
    console.log("   - LINK costs are HIGH (288 potential draws/day)");
    console.log("   - Setup automation to call drawLottery()");
    console.log("   - Empty rounds save LINK (no VRF call)");
    console.log("   - Consider higher ticket prices to cover costs");
    console.log();
  }

  if (networkName === "mainnet" || networkName === "polygon") {
    console.log("🚨 MAINNET DEPLOYMENT - IMPORTANT:");
    console.log("   - Double-check all parameters");
    console.log("   - Ensure sufficient LINK in subscription");
    console.log("   - Consider using multi-sig wallet");
    console.log("   - Get security audit before launch");
    console.log();
  }

  console.log("✨ Deployment complete! Good luck! 🍀");
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
