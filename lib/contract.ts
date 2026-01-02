import { Contract, formatUnits, parseUnits } from 'ethers';
import { provider } from './tempo';

// Contract ABI - matches TempoMint.sol
export const TEMPO_MINT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function mint(address,uint256)",
  "function burn(uint256)",
  "function transfer(address,uint256) returns (bool)",
  "function approve(address,uint256) returns (bool)",
  "function transferFrom(address,address,uint256) returns (bool)",
  "event Transfer(address indexed, address indexed, uint256)",
  "event Mint(address indexed, uint256)",
  "event Burn(address indexed, uint256)"
];

// Contract address - will be set after deployment
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

/**
 * Get contract instance
 */
export function getContract(signer?: any) {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not set. Please deploy the contract first.');
  }
  return new Contract(CONTRACT_ADDRESS, TEMPO_MINT_ABI, signer || provider);
}

/**
 * Get token balance for an address
 */
export async function getBalance(address: string): Promise<string> {
  try {
    const contract = getContract();
    const balance = await contract.balanceOf(address);
    // Use 18 decimals as default (known from contract)
    let decimals = 18;
    try {
      decimals = Number(await contract.decimals());
    } catch (e) {
      console.warn('Could not fetch decimals, using default 18');
    }
    return formatUnits(balance, decimals);
  } catch (error: any) {
    console.error('Error getting balance:', error);
    return '0';
  }
}

/**
 * Get total supply
 */
export async function getTotalSupply(): Promise<string> {
  try {
    const contract = getContract();
    const supply = await contract.totalSupply();
    // Use 18 decimals as default (known from contract)
    let decimals = 18;
    try {
      decimals = Number(await contract.decimals());
    } catch (e) {
      console.warn('Could not fetch decimals, using default 18');
    }
    return formatUnits(supply, decimals);
  } catch (error: any) {
    console.error('Error getting total supply:', error);
    return '0';
  }
}

/**
 * Get token info (name, symbol, decimals)
 */
export async function getTokenInfo(): Promise<{
  name: string;
  symbol: string;
  decimals: number;
  address: string;
}> {
  try {
    const contract = getContract();
    // Try to get decimals, fallback to 18 if it fails
    let decimals = 18;
    try {
      decimals = Number(await contract.decimals());
    } catch (e) {
      console.warn('Could not fetch decimals, using default 18');
    }
    
    // Try to get name and symbol, with fallbacks
    let name = 'TempoMint';
    let symbol = 'TMINT';
    try {
      name = await contract.name();
      symbol = await contract.symbol();
    } catch (e) {
      console.warn('Could not fetch name/symbol, using defaults');
    }
    
    return {
      name,
      symbol,
      decimals,
      address: CONTRACT_ADDRESS
    };
  } catch (error: any) {
    console.error('Error getting token info:', error);
    return {
      name: 'TempoMint',
      symbol: 'TMINT',
      decimals: 18,
      address: CONTRACT_ADDRESS
    };
  }
}

/**
 * Mint tokens
 */
export async function mintTokens(signer: any, to: string, amount: string): Promise<any> {
  try {
    const contract = getContract(signer);
    // Use 18 decimals as default (known from contract)
    let decimals = 18;
    try {
      decimals = Number(await contract.decimals());
    } catch (e) {
      console.warn('Could not fetch decimals, using default 18');
    }
    const amountWei = parseUnits(amount, decimals);
    const tx = await contract.mint(to, amountWei);
    return tx;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to mint tokens');
  }
}

/**
 * Burn tokens
 */
export async function burnTokens(signer: any, amount: string): Promise<any> {
  try {
    const contract = getContract(signer);
    // Use 18 decimals as default (known from contract)
    let decimals = 18;
    try {
      decimals = Number(await contract.decimals());
    } catch (e) {
      console.warn('Could not fetch decimals, using default 18');
    }
    const amountWei = parseUnits(amount, decimals);
    const tx = await contract.burn(amountWei);
    return tx;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to burn tokens');
  }
}
