import * as ethUtil from 'ethereumjs-util';


export const convertPrivateKeyToAddress = (privateKey: any): string => {
    
    const privateKeyBuffer = Buffer.from(privateKey, 'hex');

    // Generate the Ethereum address from the private key
    const ethereumAddress = ethUtil.privateToAddress(privateKeyBuffer);

    // Convert the address to a hex string
    const ethereumAddressHex = ethUtil.bufferToHex(ethereumAddress);

    return ethereumAddressHex;
}


export const convertPublicKeyToAddress = (publicKey: string): string => {
    // Remove the "04" prefix from the public key if it exists
    const publicKeyWithoutPrefix = publicKey.slice(2);

    // Convert the public key to a Buffer
    const publicKeyBuffer = Buffer.from(publicKeyWithoutPrefix, 'hex');

    // Generate the Ethereum address from the public key
    const addressBuffer = ethUtil.pubToAddress(publicKeyBuffer, true);

    // Convert the address to a hex string
    const ethereumAddress = ethUtil.bufferToHex(addressBuffer);
    return ethereumAddress;
}