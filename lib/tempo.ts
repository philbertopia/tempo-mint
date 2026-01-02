import { JsonRpcProvider } from 'ethers';

const RPC_URL = process.env.NEXT_PUBLIC_TEMPO_RPC_URL || 'https://rpc.testnet.tempo.xyz';
export const provider = new JsonRpcProvider(RPC_URL);

export const TEMPO_NETWORK = {
  chainId: '0xa5bd', // 42429 in hex (corrected from 0xa5ed)
  chainName: 'Tempo Testnet (Andantino)',
  nativeCurrency: {
    name: 'USD',
    symbol: 'USD',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnet.tempo.xyz'],
  blockExplorerUrls: ['https://explore.tempo.xyz'],
};
