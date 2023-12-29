import { ethers } from "hardhat";
import { Signer, Contract } from "ethers";

export async function getPermitSignature(
  signer: Signer,
  token: any,
  spender: any,
  value: any,
  deadline: any
) {
  const [nonce, name, version, chainId] = await Promise.all([
    token.nonces(await signer.getAddress()),
    token.name(),
    "1",
    "31337",
  ]);

  return ethers.Signature.from(
    await signer.signTypedData(
      {
        name,
        version,
        chainId,
        verifyingContract: token.target.toString(),
      },
      {
        Permit: [
          {
            name: "owner",
            type: "address",
          },
          {
            name: "spender",
            type: "address",
          },
          {
            name: "value",
            type: "uint256",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "deadline",
            type: "uint256",
          },
        ],
      },
      {
        owner: await signer.getAddress(),
        spender,
        value,
        nonce,
        deadline,
      }
    )
  );
}
