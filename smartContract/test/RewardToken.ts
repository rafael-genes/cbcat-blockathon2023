import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { getPermitSignature } from "../scripts/getPermitSignature";

describe("RewardToken", function () {
  async function deployments() {
    const Signers: Signer[] = await ethers.getSigners();
    const Owner: Signer = Signers[0];
    const Business: Signer = Signers[1];
    const User: Signer = Signers[2];
    const Business2: Signer = Signers[3];

    const INITIAL_AMOUNT_TO_MINT = "0";

    const rewardToken = await ethers.deployContract("RewardToken", [
      "RewardToken",
      "RT",
      Owner.getAddress(),
    ]);
    await rewardToken.waitForDeployment();

    await rewardToken.updateMinters(await Business.getAddress(), true);

    const INITIAL_BALANCE = await rewardToken.totalSupply();

    return {
      rewardToken,
      Owner,
      Business,
      Business2,
      User,
      INITIAL_AMOUNT_TO_MINT,
      INITIAL_BALANCE,
    };
  }

  describe("Deployment", function () {
    it("Should set the right Owner", async function () {
      const { rewardToken, Owner } = await loadFixture(deployments);

      expect(await Owner.getAddress()).to.equal(await rewardToken.owner());
    });

    it("Initial balance should be 0", async function () {
      const { INITIAL_BALANCE, INITIAL_AMOUNT_TO_MINT } = await loadFixture(
        deployments
      );

      expect(INITIAL_AMOUNT_TO_MINT).to.equal(INITIAL_BALANCE);
    });
  });

  describe("Minters whitelist", function () {
    it("Should add a new whitelisted Minter", async function () {
      const { rewardToken, Business, Business2, Owner } = await loadFixture(
        deployments
      );
      await rewardToken.updateMinters(await Business2.getAddress(), true);
      expect(await rewardToken.minters(await Business2.getAddress())).to.equal(
        true
      );
    });

    it("Should remove a whitelisted Minter", async function () {
      const { rewardToken, Business } = await loadFixture(deployments);
      expect(await rewardToken.minters(await Business.getAddress())).to.equal(
        true
      );

      await rewardToken.updateMinters(await Business.getAddress(), false);

      expect(await rewardToken.minters(await Business.getAddress())).to.equal(
        false
      );
    });

    it("Should reject if Minters mints for himself", async function () {
      const { rewardToken, Business, User } = await loadFixture(deployments);

      const amountToMint = ethers.parseEther("100");
      await expect(
        rewardToken.connect(Business).mint(Business.getAddress(), amountToMint)
      ).to.be.rejected;
    });
  });

  describe("Minting & Burning flow", function () {
    it("Should mint tokens", async function () {
      const { rewardToken, Business, User } = await loadFixture(deployments);

      const amountToMint = ethers.parseEther("100");
      await expect(
        await rewardToken.mint(await User.getAddress(), amountToMint)
      )
        .to.emit(rewardToken, "Minted")
        .withArgs(ethers.ZeroAddress, await User.getAddress(), amountToMint);

      await expect(
        await rewardToken
          .connect(Business)
          .mint(await User.getAddress(), amountToMint)
      )
        .to.emit(rewardToken, "Minted")
        .withArgs(ethers.ZeroAddress, await User.getAddress(), amountToMint);

      expect(await rewardToken.balanceOf(await User.getAddress())).to.equal(
        amountToMint + amountToMint
      );
    });

    it("Should burn tokens and emit burned event", async function () {
      const { rewardToken, Owner, Business } = await loadFixture(deployments);

      const amountToMint = ethers.parseEther("1000");
      await rewardToken.mint(await Owner.getAddress(), amountToMint);
      await rewardToken.mint(await Business.getAddress(), amountToMint);

      const amountToBurn = ethers.parseEther("50");
      await expect(rewardToken.burn(amountToBurn))
        .to.emit(rewardToken, "Burned")
        .withArgs(await Owner.getAddress(), ethers.ZeroAddress, amountToBurn);
      expect(await rewardToken.balanceOf(Owner.getAddress())).to.equal(
        amountToMint - amountToBurn
      );

      await expect(rewardToken.connect(Business).burn(amountToBurn))
        .to.emit(rewardToken, "Burned")
        .withArgs(
          await Business.getAddress(),
          ethers.ZeroAddress,
          amountToBurn
        );
      expect(await rewardToken.balanceOf(Business.getAddress())).to.equal(
        amountToMint - amountToBurn
      );
    });
  });

  describe("Restriction if not Whitelisted or Owner", async function () {
    it("User tries to mint for himself", async function () {
      const { rewardToken, User } = await loadFixture(deployments);
      const amountToMint = ethers.parseEther("1000");

      await expect(
        rewardToken.connect(User).mint(await User.getAddress(), amountToMint)
      ).to.be.rejected;
    });

    it("User Tries to burn his own tokens", async function () {
      const { rewardToken, User } = await loadFixture(deployments);
      const amountToMint = ethers.parseEther("1000");
      await rewardToken.mint(await User.getAddress(), amountToMint);

      const amountToBurn = ethers.parseEther("1000");
      await expect(rewardToken.connect(User).burn(amountToBurn)).to.be.rejected;
    });
  });

  describe("Permit extension", async function () {
    it("Permit to Owner for moving Tokens", async function () {
      const { rewardToken, Owner, Business, User, INITIAL_BALANCE } =
        await loadFixture(deployments);

      const amount = ethers.parseEther("10");
      await rewardToken.mint(await User.getAddress(), amount);
      const deadline = ethers.MaxUint256;

      const { v, r, s } = await getPermitSignature(
        User,
        rewardToken,
        await Owner.getAddress(),
        amount,
        deadline
      );

      await rewardToken.permit(
        await User.getAddress(),
        await Owner.getAddress(),
        amount,
        deadline,
        v,
        r,
        s
      );

      await rewardToken
        .connect(Owner)
        .transferFrom(User.getAddress(), Owner.getAddress(), amount);

      expect(await rewardToken.balanceOf(User.getAddress())).to.equal(0);
    });
  });

  describe("Complete flow", async function () {
    it("Mint + Transfer + Burn", async function () {
      const { rewardToken, Owner, Business, User, INITIAL_BALANCE } =
        await loadFixture(deployments);
      const amountToMint = ethers.parseEther("1000");
      const amountToBurn = ethers.parseEther("500");
      await rewardToken
        .connect(Business)
        .mint(await User.getAddress(), amountToMint);

      await rewardToken
        .connect(User)
        .transfer(await Business.getAddress(), amountToBurn);

      await rewardToken.connect(Business).burn(amountToBurn);

      expect(await rewardToken.totalSupply()).to.be.equal(
        INITIAL_BALANCE + amountToMint - amountToBurn
      );

      expect(
        await rewardToken.balanceOf(await Business.getAddress())
      ).to.be.equal(0);
      expect(await rewardToken.balanceOf(await Owner.getAddress())).to.be.equal(
        0
      );
      expect(await rewardToken.balanceOf(await User.getAddress())).to.be.equal(
        amountToMint - amountToBurn
      );
    });
  });
});
