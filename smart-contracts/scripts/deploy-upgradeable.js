
const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("🎰 Deploying Upgradeable Sequential Lottery with Chainlink VRF...\n");

  // Network configurations for Chainlink VRF
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

  // Validate subscription ID
  if (config.subscriptionId === "0") {
    console.error("❌ ERROR: VRF_SUBSCRIPTION_ID not set!");
    console.log("\nPlease set your Chainlink VRF subscription ID:");
    console.log("export VRF_SUBSCRIPTION_ID=your_subscription_id");
    console.log("\nOr update the script directly with your subscription ID.");
    process.exit(1);
  }

  console.log("Network:", config.name);
  console.log("VRF Coordinator:", config.vrfCoordinator);
  console.log("Gas Lane:", config.gasLane);
  console.log("Subscription ID:", config.subscriptionId);
  console.log("Callback Gas Limit:", config.callbackGasLimit);
  console.log("");

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("");

  // Deploy upgradeable contract using UUPS proxy
  console.log("📦 Deploying upgradeable contract (UUPS Proxy Pattern)...");
  console.log("This will deploy both:");
  console.log("  1. Proxy contract (users interact with this)");
  console.log("  2. Implementation contract (contains the logic)");
  console.log("");

  const LotteryUpgradeable = await hre.ethers.getContractFactory("TieredSequentialLotteryVRF_Upgradeable");
  
  const lottery = await upgrades.deployProxy(
    LotteryUpgradeable,
    [
      config.vrfCoordinator,
      config.gasLane,
      config.subscriptionId,
      config.callbackGasLimit
    ],
    { 
      initializer: 'initialize',
      kind: 'uups'
    }
  );

  await lottery.waitForDeployment();
  
  const proxyAddress = await lottery.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("✅ Deployment successful!");
  console.log("");
  console.log("📍 PROXY ADDRESS:", proxyAddress);
  console.log("   ⚠️  USE THIS ADDRESS FOR EVERYTHING!");
  console.log("");
  console.log("🔧 Implementation Address:", implementationAddress);
  console.log("   (Internal use only - don't interact with this)");
  console.log("");

  // Get version
  const version = await lottery.version();
  console.log("📊 Contract Version:", version.toString());
  console.log("");

  // Display important next steps
  console.log("=" .repeat(70));
  console.log("🎯 IMPORTANT NEXT STEPS:");
  console.log("=" .repeat(70));
  console.log("");
  console.log("1. ⚠️  CRITICAL: Add PROXY address to VRF subscription:");
  console.log("   👉 Visit: https://vrf.chain.link");
  console.log("   👉 Select your subscription");
  console.log("   👉 Click 'Add Consumer'");
  console.log("   👉 Paste PROXY address:", proxyAddress);
  console.log("   👉 NOT the implementation address!");
  console.log("");
  console.log("2. Verify contracts on block explorer:");
  console.log("   👉 Proxy verification:");
  if (networkName === "sepolia") {
    console.log("      npx hardhat verify --network sepolia", proxyAddress);
  } else if (networkName === "mumbai") {
    console.log("      npx hardhat verify --network mumbai", proxyAddress);
  }
  console.log("");
  console.log("3. Update frontend with PROXY address:");
  console.log("   File: frontend/src/constants/index.ts");
  console.log("   LOTTERY_CONTRACT_ADDRESS =", `"${proxyAddress}"`);
  console.log("");
  console.log("4. Start the first round:");
  console.log("   const lottery = await ethers.getContractAt('TieredSequentialLotteryVRF_Upgradeable',", `'${proxyAddress}');`);
  console.log("   await lottery.startNewRound(86400); // 24 hours");
  console.log("");
  console.log("5. To upgrade in the future:");
  console.log("   - Create V2 contract");
  console.log("   - Run: npx hardhat run scripts/upgrade.js --network", networkName);
  console.log("");
  console.log("=" .repeat(70));
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: config.name,
    networkId: networkName,
    proxyAddress: proxyAddress,
    implementationAddress: implementationAddress,
    vrfCoordinator: config.vrfCoordinator,
    gasLane: config.gasLane,
    subscriptionId: config.subscriptionId,
    callbackGasLimit: config.callbackGasLimit,
    deployer: deployer.address,
    version: version.toString(),
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    isUpgradeable: true,
    proxyType: "UUPS"
  };

  console.log("📄 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("");

  // Save to file
  const fs = require('fs');
  const deploymentDir = 'deployments';
  
  try {
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir);
    }
    
    const deploymentFile = `${deploymentDir}/${networkName}-upgradeable-${Date.now()}.json`;
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to:", deploymentFile);
    
    // Also save latest deployment
    const latestFile = `${deploymentDir}/${networkName}-latest.json`;
    fs.writeFileSync(latestFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Latest deployment saved to:", latestFile);
  } catch (error) {
    console.log("⚠️  Could not save deployment file:", error.message);
  }

  console.log("");
  console.log("🎉 Upgradeable Lottery Deployment Complete!");
  console.log("");
  console.log("⚠️  REMEMBER:");
  console.log("   - Use PROXY address:", proxyAddress);
  console.log("   - Add to VRF subscription");
  console.log("   - Can upgrade later without losing data");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
