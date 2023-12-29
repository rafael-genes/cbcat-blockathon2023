export type Result = {
    success: boolean,
    error?: string,
}

export type UserTokenBalancesDTO = {
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

export type BusinessTokenBalancesDTO = {
    email: string,
    accountAddress: string,
    businessLegalName: string,
    isActive: boolean,
    tokenBalances: [
        {
            contractAddress: string,
            balance: number,
            tokenId: string
        }
    ]
}