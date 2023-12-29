"use server"

import { z } from "zod";
import { hash } from 'bcrypt';
import { createUserDb } from "./db";
import { ethers } from "ethers";
import { BusinessTokenBalancesDTO, Result, UserTokenBalancesDTO } from "../types";

const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(10).max(100),
})

export async function createUser(formData: FormData) {
    console.log("[lib/actions.ts] Creating user...")

    // Validate
    const parsed = createUserSchema.safeParse({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    })

    if (!parsed.success) {
        console.log("[lib/actions.ts] Error validating user: ", parsed.error)
        return {
            success: false,
            error: 'Validation error.',
        }
    }

    // Create or update remote user.
    let addressAccount: string
    try {
        const response = await fetch(process.env.API_URL + "/user/account", {
            method: "POST",
            cache: "no-store",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json",
                "X-API-KEY": process.env.API_KEY!
            },
            referrerPolicy: "no-referrer",
            body: JSON.stringify({ email: parsed.data.email }),
        })

        if (!response.ok) {
            const error = await response.json();
            console.log(`[lib/actions.ts] Error earning tokens, statusCode: ${error.statusCode}, message: ${error.message}`)
            return {
                success: false,
                error: error.message ?? "Something went wrong."
            }
        }

        const responseJson = await response.json() as {
            email: string,
            accountAddress: string,
            tokenBalances: [
                {
                    contractAddress: string,
                    balance: number,
                    tokenId: string
                }
            ]
        }

        addressAccount = responseJson.accountAddress

    } catch (error) {
        console.log("[lib/actions.ts] Error creating remote user: ", error)
        return {
            success: false,
            error: 'Something went wrong.',
        }
    }

    const hashedPassword = await hash(parsed.data.password, 10)
    try {
        const user = await createUserDb({
            email: parsed.data.email,
            password: hashedPassword,
            address: addressAccount
        })
    } catch (error) {
        console.log("[lib/actions.ts] Error creating user: ", error)
        return {
            success: false,
            error: 'Something went wrong.',
        }
    }

    return {
        success: true,
    }

}

export async function getUserRemote(email: string) {
    console.log("[lib/actions.ts] Getting remote user...")

    try {
        const response = await fetch(process.env.API_URL + "/user/check", {
            method: "POST",
            cache: "no-store",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json"
            },
            referrerPolicy: "no-referrer",
            body: JSON.stringify({ email }),
        })

        if (!response.ok) {
            const error = await response.json();
            console.log(`[lib/actions.ts] Error earning tokens, statusCode: ${error.statusCode}, message: ${error.message}`)
            return {
                success: false,
                error: error.message ?? "Something went wrong."
            }
        }

        const data: UserTokenBalancesDTO = await response.json();

        return {
            success: true,
            data: data
        }
    } catch (error) {
        console.log("[lib/actions.ts] Error getting remote user: ", error)
        return {
            success: false,
            error: 'Something went wrong.',
        }
    }
}

export async function getBusinessRemote() {
    console.log("[lib/actions.ts] Getting remote business...")

    try {
        const response = await fetch(process.env.API_URL + "/business/me", {
            method: "GET",
            cache: "no-store",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json",
                "X-API-KEY": process.env.API_KEY!
            },
            referrerPolicy: "no-referrer",
        })

        if (!response.ok) {
            const error = await response.json();
            console.log(`[lib/actions.ts] Error earning tokens, statusCode: ${error.statusCode}, message: ${error.message}`)
            return {
                success: false,
                error: error.message ?? "Something went wrong."
            }
        }

        const data: BusinessTokenBalancesDTO = await response.json();

        return {
            success: true,
            data: data
        }
    } catch (error) {
        console.log("[lib/actions.ts] Error getting remote business: ", error)
        return {
            success: false,
            error: 'Something went wrong.',
        }
    }
}

export async function getTokenBalanceBlockchain(address: string): Promise<number> {
    console.log(`[lib/actions.ts] Getting blockchain balance for ${address}`)
    if (!process.env.API_CONTRACT) return 0;

    const abi = [{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"address","name":"_owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Burned","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Minted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":false,"internalType":"bool","name":"isAllowed","type":"bool"}],"name":"MintersUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"minters","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_minter","type":"address"},{"internalType":"bool","name":"_isAllowed","type":"bool"}],"name":"updateMinters","outputs":[],"stateMutability":"nonpayable","type":"function"}];
    const provider = new ethers.JsonRpcProvider(process.env.RPC_PROVIDER, Number(process.env.CHAIN_ID));
    const contract = new ethers.Contract(process.env.API_CONTRACT, abi, provider);
    const balance = Number(await contract.balanceOf(address));
        
    return balance;
}

// TODO: Test.
export async function earnAPI({ email, amount }: { email: string, amount: number }): Promise<Result> {
    console.log(`[lib/actions.ts] Earning tokens... ${email} ${amount}`)

    try {
        const response = await fetch(process.env.API_URL + "/transaction/earn", {
            method: "POST",
            cache: "no-store",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json",
                "X-API-KEY": process.env.API_KEY!
            },
            referrerPolicy: "no-referrer",
            body: JSON.stringify({
                userEmail: email,
                amount
            }),
        })

        if (!response.ok) {
            const error = await response.json();
            console.log(`[lib/actions.ts] Error earning tokens, statusCode: ${error.statusCode}, message: ${error.message}`)
            return {
                success: false,
                error: error.message ?? "Something went wrong."
            }
        }

        return {
            success: true,
        }
    } catch (error) {
        console.log("[lib/actions.ts] Error earning tokens: ", error)
        return {
            success: false,
            error: 'Something went wrong.',
        }
    }
}

// TODO: Test.
export async function spendAPI({ email, amount }: { email: string, amount: number }): Promise<Result> {
    console.log(`[lib/actions.ts] Spending tokens... ${email} ${amount}`)

    try {
        const response = await fetch(process.env.API_URL + "/transaction/spend", {
            method: "POST",
            cache: "no-store",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json",
                "X-API-KEY": process.env.API_KEY!
            },
            referrerPolicy: "no-referrer",
            body: JSON.stringify({
                userEmail: email,
                amount
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.log(`[lib/actions.ts] Error spending tokens, statusCode: ${error.statusCode}, message: ${error.message}`)
            return {
                success: false,
                error: error.message ?? "Something went wrong."
            }
        }

        return {
            success: true,
        }
    } catch (error) {
        console.log("[lib/actions.ts] Error spending tokens: ", error)
        return {
            success: false,
            error: 'Something went wrong.',
        }
    }
}