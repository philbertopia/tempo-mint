const hre = require("hardhat");

async function main() {
  console.log("Deploying TempoMint contract to Tempo testnet...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "USD\n");

  if (balance === 0n) {
    throw new Error("Insufficient balance. Please get testnet tokens from the faucet.");
  }

  // Deploy the contract
  const TempoMint = await hre.ethers.getContractFactory("TempoMint");
  console.log("Deploying TempoMint...");
  const tempoMint = await TempoMint.deploy();

  await tempoMint.waitForDeployment();

  const address = await tempoMint.getAddress();
  console.log("\n✅ TempoMint deployed successfully!");
  console.log("Contract address:", address);
  console.log("\n📝 Add this to your .env.local file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log("\n🔍 View on block explorer:");
  console.log(`https://explore.tempo.xyz/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
