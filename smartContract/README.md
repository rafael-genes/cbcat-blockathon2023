# ACT Coin (Agencia-Catalana-Turismo)

## Motivation

The `ACT Coin` was created to revolutionize the tourism industry by providing a seamless and efficient way to incentivize and reward participants. Through the use of blockchain technology, the `Catalan tourism agency` aims to enhance the overall experience and engagement of its users by offering innovative financial incentives.

---

## Overview

The `ACT Coin` smart contract is an ERC20 token designed to facilitate rewards by allowing minting and burning tokens. This contract is based on the OpenZeppelin ERC20 & ERC20 Permit implementations and is augmented with ownership functionality through the Ownable contract implementation.

- Smart contract deployed to:
  - Polygon (Chain ID: 137): []()
  - Mumbai (Chain ID: 80001): [0x1EC2096Fe6694E4d352C0eCaAA6F97453e61898E](https://mumbai.polygonscan.com/address/0x1EC2096Fe6694E4d352C0eCaAA6F97453e61898E#code)

---

## Usage

> [!IMPORTANT] > `Before running any script`, follow the .env.example requirements & fill up your wallet with some MATIC for deploying and interacting with the smart contract. When using Mumbai You can get some MATICs from the [Mumbai Faucet](https://faucet.polygon.technology)

Install dependencies:

```bash
npm install
```

Test the smart contracts:

```bash
npm test
```

Deploy to Mumbai (Testnet):

```bash
npm run "deploy-testnet"
```

Deploy to Polygon (Mainnet):

```bash
npm run "deploy-mainnet"
```

Verify Smart contract:

```bash
npx hardhat verify <CONTRACT_ADDRESS> "<CONTRACT_NAME>" "<CONTRACT_SYMBOL>" "<OWNER ADDRESS>" --network "<Mumbai or Polygon>"
```

---

## Roles

- Owner: the "owner" represents the address that initially deployed the contract and holds special administrative rights and privileges within the contract, enabling control over critical functionalities and access to restricted operations through the onlyOwner modifier.

- Minter: the "minter" is a designated address granted permission by the contract owner to create and add new tokens to the token supply. It's a mechanism for controlled token creation, ensuring that minting is performed by authorized addresses only.

---

## Standard ERC20 Functionalities

### `totalSupply()`

Returns the total token supply.

### `balanceOf(address _owner)`

Returns the token balance of a specified address (`_owner`).

### `transfer(address _to, uint256 _value)`

Transfers a specified amount of tokens from the sender's account to the designated address (`_to`).

### `transferFrom(address _from, address _to, uint256 _value)`

Allows spending tokens on behalf of another address (`_from`) if approved by that address. Transfers a specified amount of tokens to the designated address (`_to`).

### `approve(address _spender, uint256 _value)`

Allows a designated address (`_spender`) to spend a specified amount of tokens on behalf of the sender.

### `allowance(address _owner, address _spender)`

Returns the remaining number of tokens that a designated address (`_spender`) can spend on behalf of the token owner (`_owner`).

---

## Standard ERC20 Functionalities

### `permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`

Allows a third party to approve the spend of a specified amount of tokens on his behalf.

---

## Additional Functionalities

### `constructor(string memory _name, string memory _symbol)`

The constructor initializes the token with a provided name and symbol upon deployment.

### `mint(address _to, uint256 _amount) external onlyAllowed`

This function allows the contract owner & minters to mint a specified amount of tokens and assigns them to a designated address (`_to`). Emits a `Minted` event.

### `burn(uint256 _amount) external onlyAllowed`

This function enables the contract owner & minter to burn a specified amount of tokens from their own balance. Emits a `Burned` event.

### `minters(address _minterAddress) public view`

This function is a view function to return if the address is a valid Minter.

### ` updateMinters(address _minter, bool _isAllowed) external onlyOwner`

This function will update the Minter status. False will remove privileges, and True will grant privileges to that address.

---

## Flow

1. **Deployment**: Deploy the `ACT Coin` smart contract, specifying the desired token name and symbol.

2. **Token Transfer**: Utilize the `transfer`, `transferFrom`, `approve`, and `allowance` functions for token transfer and allowance management.

3. **Mint Tokens**: The contract owner (account that deploys the contract) & minters can mint tokens and allocate them to specific addresses using the `mint` function.

4. **Burn Tokens**: The contract owner & minters can also burn tokens from their own balance using the `burn` function, reducing the total token supply.

5. **Permit**: The token owner possesses the capability to sign a transaction off-chain, granting permission for a third party to conduct token transfers on their behalf. This feature serves to alleviate gas fees for users within the protocol, facilitated by the owner's authorization.

6. **Events**: Minting, burning and updating minters operations emit respective events (`Minted`, `Burned` & `MintersUpdated` ) to track these actions on the blockchain.

---

## Tests

<img width="448" alt="Screenshot 2023-12-27 184127" src="https://github.com/daniel-explorins/actSmartContract/assets/102038261/6229a8d8-666f-4104-90e4-3646d651b6d9">

