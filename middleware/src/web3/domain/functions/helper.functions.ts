import BigNumber from "bignumber.js";
import { BN } from "ethereumjs-util";

export function convertBigNumberToNumber(value: BigNumber): number {
    return Number(value)
  }


/**
 * According to EIP-2, allowing transactions with any s value (from 0 to the max number on the secp256k1n curve),
 * opens a transaction malleability concern. This is why a signature with a value of s > secp256k1n / 2 (greater than half of the curve) is invalid,
 * i.e. it is a valid ECDSA signature but from an Ethereum perspective the signature is on the dark side of the curve.
 * The code above solves this by checking if the value of s is greater than secp256k1n / 2 (line 38). If that’s the case,
 * we’re on the dark side of the curve. We need to invert s (line 41) in order to get a valid Ethereum signature.
 * This works because the value of s does not define a distinct point on the curve. The value can be +s or -s,
 * either signature is valid from an ECDSA perspective.
 */
export const adjusSignatureS = (s: bigint) => {
  let secp256k1N = new BN("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 16); // max value on the curve
  let secp256k1halfN = BigInt(secp256k1N.div(new BN(2)).toString()); // half of the curve
  if (s > (secp256k1halfN)) {
      // if s is great than half of the curve, we need to invert it.
      // According to EIP2 https://github.com/ethereum/EIPs/blob/master/EIPS/eip-2.md
      s = BigInt(secp256k1N.sub(new BN(s.toString())).toString());
      console.log('invert s')
  }
  return s
}