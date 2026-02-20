require("dotenv").config();
const { ethers, network } = require("hardhat");

// Chainlink VRF v2.5 configs
const VRF_CONFIGS = {
  sepolia: {
    name: "Sepolia Testnet",
    vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    gasLane:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    callbackGasLimit: 2500000,
    subscriptionId: process.env.VRF_SUBSCRIPTION_ID
      ? BigInt(process.env.VRF_SUBSCRIPTION_ID)
      : 0n,
  },

  mumbai: {
    name: "Polygon Mumbai",
    vrfCoordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
    gasLane:
      "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f",
    callbackGasLimit: 2500000,
    subscriptionId: process.env.VRF_SUBSCRIPTION_ID
      ? BigInt(process.env.VRF_SUBSCRIPTION_ID)
      : 0n,
  },

  mainnet: {
    name: "Ethereum Mainnet",
    vrfCoordinator: "0x271682DEB8C4E0901D1a1550aD2e64D568E69909",
    gasLane:
      "0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef",
    callbackGasLimit: 2500000,
    subscriptionId: process.env.VRF_SUBSCRIPTION_ID
      ? BigInt(process.env.VRF_SUBSCRIPTION_ID)
      : 0n,
  },

  polygon: {
    name: "Polygon Mainnet",
    vrfCoordinator: "0xAE975071Be8F8eE67addBC1A82488F1C24858067",
    gasLane:
      "0x6e099d640cde6de9d40ac749b4b594126b0169747122711109c9985d47751f93",
    callbackGasLimit: 2500000,
    subscriptionId: process.env.VRF_SUBSCRIPTION_ID
      ? BigInt(process.env.VRF_SUBSCRIPTION_ID)
      : 0n,
  },
};

async function main() {
  console.log("\n🎰 Deploying Sequential Lottery with Chainlink VRF v2.5...\n");

  const [deployer] = await ethers.getSigners();

  console.log("Deploying from:", deployer.address);

  const networkName = network.name;
  const config = VRF_CONFIGS[networkName];

  if (!config) {
    throw new Error(`❌ Unsupported network: ${networkName}`);
  }

  if (config.subscriptionId === 0n) {
    throw new Error(
      "❌ VRF_SUBSCRIPTION_ID missing. Add it to your .env file."
    );
  }

  console.log("Network:", config.name);
  console.log("Subscription ID:", config.subscriptionId.toString());

  const Lottery = await ethers.getContractFactory("SequentialLottery");

  console.log("\nDeploying contract...\n");

  const lottery = await Lottery.deploy(
    config.vrfCoordinator,
    config.gasLane,
    config.subscriptionId,
    config.callbackGasLimit
  );

  await lottery.waitForDeployment();

  const contractAddress = await lottery.getAddress();

  console.log("\n✅ Contract deployed successfully!");
  console.log("Contract Address:", contractAddress);

  console.log("\n📋 Next Steps:");
  console.log("1. Go to https://vrf.chain.link/");
  console.log("2. Open your Subscription");
  console.log("3. Click 'Add Consumer'");
  console.log("4. Paste this address:", contractAddress);

  console.log("\nDone.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
