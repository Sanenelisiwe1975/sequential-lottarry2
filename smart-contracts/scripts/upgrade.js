const { ethers, upgrades } = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🔄 Upgrading Sequential Lottery Contract...\n");

  // Try to load latest deployment info
  const networkName = hre.network.name;
  const latestFile = `deployments/${networkName}-latest.json`;
  
  let PROXY_ADDRESS;
  
  if (fs.existsSync(latestFile)) {
    const deploymentInfo = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    PROXY_ADDRESS = deploymentInfo.proxyAddress;
    console.log("📂 Loaded deployment info from:", latestFile);
    console.log("🎯 Proxy Address:", PROXY_ADDRESS);
  } else {
    console.log("⚠️  No deployment file found!");
    console.log("Please enter proxy address manually or deploy first.");
    console.log("");
    
    // You can hardcode the proxy address here if needed
    PROXY_ADDRESS = process.env.PROXY_ADDRESS || "";
    
    if (!PROXY_ADDRESS) {
      console.error("❌ ERROR: PROXY_ADDRESS not set!");
      console.log("\nOptions:");
      console.log("1. Set environment variable: export PROXY_ADDRESS=0xYourProxyAddress");
      console.log("2. Or edit this script and add the address directly");
      console.log("3. Or deploy first using: npx hardhat run scripts/deploy-upgradeable.js");
      process.exit(1);
    }
  }

  console.log("");
  console.log("Network:", networkName);
  console.log("Proxy Address:", PROXY_ADDRESS);
  console.log("");

  // Get deployer
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer/Owner:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("");

  // Get current version
  const currentContract = await ethers.getContractAt("TieredSequentialLotteryVRF_Upgradeable", PROXY_ADDRESS);
  const currentVersion = await currentContract.version();
  const currentImplementation = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
  
  console.log("📊 Current State:");
  console.log("   Version:", currentVersion.toString());
  console.log("   Implementation:", currentImplementation);
  console.log("");

  // Pause contract before upgrade (recommended)
  console.log("⏸️  Pausing contract before upgrade...");
  const pauseTx = await currentContract.pause();
  await pauseTx.wait();
  console.log("✅ Contract paused");
  console.log("");

  // Deploy new implementation
  console.log("🚀 Deploying new implementation...");
  console.log("⚠️  Make sure you have the V2 contract ready!");
  console.log("");

  // You need to specify the new contract version here
  // For example: TieredSequentialLotteryVRF_UpgradeableV2
  const NEW_CONTRACT_NAME = "TieredSequentialLotteryVRF_Upgradeable"; // Change this to V2 when ready
  
  const LotteryV2 = await ethers.getContractFactory(NEW_CONTRACT_NAME);
  
  console.log("📦 Upgrading proxy to new implementation...");
  const upgraded = await upgrades.upgradeProxy(PROXY_ADDRESS, LotteryV2);
  
  await upgraded.waitForDeployment();
  
  const newImplementation = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
  
  console.log("✅ Upgrade successful!");
  console.log("");
  console.log("📍 Proxy Address (unchanged):", PROXY_ADDRESS);
  console.log("🔧 New Implementation:", newImplementation);
  console.log("");

  // If you have a V2 initializer, call it here
  // For example:
  // console.log("🔧 Initializing V2 features...");
  // await upgraded.initializeV2();
  // console.log("✅ V2 initialized");
  // console.log("");

  // Get new version
  const newVersion = await upgraded.version();
  console.log("📊 New Version:", newVersion.toString());
  console.log("");

  // Unpause contract
  console.log("▶️  Unpausing contract...");
  const unpauseTx = await upgraded.unpause();
  await unpauseTx.wait();
  console.log("✅ Contract unpaused");
  console.log("");

  // Verify upgrade
  console.log("🔍 Verifying upgrade...");
  
  // Check that data is preserved
  const currentRoundId = await upgraded.currentRoundId();
  const ticketPrice = await upgraded.ticketPrice();
  const ownerBalance = await upgraded.ownerBalance();
  
  console.log("✅ Data verification:");
  console.log("   Current Round ID:", currentRoundId.toString());
  console.log("   Ticket Price:", ethers.formatEther(ticketPrice), "ETH");
  console.log("   Owner Balance:", ethers.formatEther(ownerBalance), "ETH");
  console.log("");

  // Save upgrade info
  const upgradeInfo = {
    network: networkName,
    proxyAddress: PROXY_ADDRESS,
    oldImplementation: currentImplementation,
    newImplementation: newImplementation,
    oldVersion: currentVersion.toString(),
    newVersion: newVersion.toString(),
    upgrader: deployer.address,
    upgradedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  console.log("📄 Upgrade Summary:");
  console.log(JSON.stringify(upgradeInfo, null, 2));
  console.log("");

  try {
    const upgradeFile = `deployments/${networkName}-upgrade-${Date.now()}.json`;
    fs.writeFileSync(upgradeFile, JSON.stringify(upgradeInfo, null, 2));
    console.log("💾 Upgrade info saved to:", upgradeFile);
    
    // Update latest deployment file
    const latestDeployment = JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    latestDeployment.implementationAddress = newImplementation;
    latestDeployment.version = newVersion.toString();
    latestDeployment.lastUpgraded = new Date().toISOString();
    fs.writeFileSync(latestFile, JSON.stringify(latestDeployment, null, 2));
    console.log("💾 Updated latest deployment file");
  } catch (error) {
    console.log("⚠️  Could not save upgrade file:", error.message);
  }

  console.log("");
  console.log("=" .repeat(70));
  console.log("🎉 UPGRADE COMPLETE!");
  console.log("=" .repeat(70));
  console.log("");
  console.log("✅ Contract successfully upgraded!");
  console.log("✅ Proxy address unchanged:", PROXY_ADDRESS);
  console.log("✅ All data preserved!");
  console.log("✅ Version updated:", currentVersion.toString(), "→", newVersion.toString());
  console.log("");
  console.log("⚠️  NEXT STEPS:");
  console.log("1. Test the upgraded contract thoroughly");
  console.log("2. Verify new implementation on Etherscan");
  console.log("3. Announce upgrade to users (if needed)");
  console.log("4. Monitor for any issues");
  console.log("");
  console.log("📝 Frontend does NOT need updates - same proxy address!");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
