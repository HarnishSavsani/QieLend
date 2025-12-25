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

  // 2. Deploy Mock Tokens
  const MockToken = await ethers.getContractFactory("MockToken");
  
  const mockUsdt = await MockToken.deploy("Mock Tether", "USDT");
  await mockUsdt.waitForDeployment();
  const usdtAddress = await mockUsdt.getAddress();
  console.log(`MockUSDT deployed to:   ${usdtAddress}`);

  const mockWbtc = await MockToken.deploy("Mock WBTC", "WBTC");
  await mockWbtc.waitForDeployment();
  const wbtcAddress = await mockWbtc.getAddress();
  console.log(`MockWBTC deployed to:   ${wbtcAddress}`);

  const mockQie = await MockToken.deploy("Mock QIE Coin", "QIE");
  await mockQie.waitForDeployment();
  const qieAddress = await mockQie.getAddress();
  console.log(`MockQIE allocated to:   ${qieAddress}`);

  // 3. Deploy LendingPool
  const LendingPool = await ethers.getContractFactory("LendingPool");
  const lendingPool = await LendingPool.deploy(trustScoreAddress);
  await lendingPool.waitForDeployment();
  const lendingPoolAddress = await lendingPool.getAddress();

  console.log(`LendingPool deployed to: ${lendingPoolAddress}`);

  // 4. Authorize LendingPool to update TrustScore
  console.log("Authorizing LendingPool to update scores...");
  const tx = await trustScore.setAuthorizedCaller(lendingPoolAddress, true);
  await tx.wait();
  
  console.log("Authorization complete!");
  console.log("----------------------------------------------------");
  console.log("Deployment Summary (Update .env.local):");
  console.log(`VITE_CONTRACT_TRUST_SCORE=${trustScoreAddress}`);
  console.log(`VITE_CONTRACT_LENDING_POOL=${lendingPoolAddress}`);
  console.log(`VITE_CONTRACT_USDT=${usdtAddress}`);
  console.log(`VITE_CONTRACT_WBTC=${wbtcAddress}`);
  console.log(`VITE_CONTRACT_QIE=${qieAddress}`);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
