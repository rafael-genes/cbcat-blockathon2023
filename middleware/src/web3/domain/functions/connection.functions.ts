import { ChainConfig, Common, CustomChain } from "@ethereumjs/common";
import Web3 from "web3";

export const getChainCommon = () => {
  const chainConfig = process.env.CHAIN_CONFIG
  let chainParamsOrName: CustomChain | Partial<ChainConfig>
  switch (chainConfig) {
    case 'polygon':
      chainParamsOrName = CustomChain.PolygonMainnet
    break;
    case 'polygon-mumbai':
      chainParamsOrName = CustomChain.PolygonMumbai
    break;
    default:
      throw new Error('Invalid chain config')
  }
  return Common.custom(chainParamsOrName)
}

export const getWeb3ConnectionsFromProvider = (provider: any) => {
    const web3Connections = new Web3(provider);
    return web3Connections
}

export const getChainId = async (web3: Web3): Promise<string> => {
    try {
        // Get the connected Chain's ID
        const chainId = await web3.eth.getChainId();

        return chainId.toString();
    } catch (error) {
        return error as string;
    }
}

export const getPrivateKey = async (provider: any) => {
    try {
        const privateKey = await provider.request({
          method: "eth_private_key",
        });
  
        return privateKey;
      } catch (error) {
        return error as string;
      }
}