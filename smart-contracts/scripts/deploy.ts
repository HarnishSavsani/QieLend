import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("Starting deployment...");

  // 1. Deploy TrustScore
  const TrustScore = await ethers.getContractFactory("TrustScore");
  const trustScore = await TrustScore.deploy();
  await trustScore.waitForDeployment();
  const trustScoreAddress = await trustScore.getAddress();
  
  console.log(`TrustScore deployed to: ${trustScoreAddress}`);

  // 2. Deploy LendingPool
  const LendingPool = await ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy(trustScoreAddress);
  await lendingPool.waitForDeployment();
  const lendingPoolAddress = await lendingPool.getAddress();

  console.log(`LendingPool deployed to: ${lendingPoolAddress}`);

  // 3. Authorize LendingPool to update TrustScore
  console.log("Authorizing LendingPool to update scores...");
  const tx = await trustScore.setAuthorizedCaller(lendingPoolAddress, true);
  await tx.wait();
  
  console.log("Authorization complete!");
  console.log("----------------------------------------------------");
  console.log("Deployment Summary:");
  console.log(`TrustScore:  ${trustScoreAddress}`);
  console.log(`LendingPool: ${lendingPoolAddress}`);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
