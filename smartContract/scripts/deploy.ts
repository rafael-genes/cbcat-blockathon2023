import { ethers } from "hardhat";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const tokenName = "ACT Coin";
  const tokenSymbol = "ACT";
  const ownerAddress = "0x6f9a3091Eb6A6149B30dD4658dfC984277C79705";

  const rewardToken = await ethers.deployContract("RewardToken", [
    tokenName,
    tokenSymbol,
    ownerAddress,
  ]);

  await rewardToken.waitForDeployment();

  console.log(
    `RewardToken has been deployed to ${rewardToken.target} under the name "${tokenName}" & symbol "${tokenSymbol}"`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
