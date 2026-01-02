'use client';

import { useState, useEffect } from 'react';
import { getTokenInfo, getBalance, getTotalSupply } from '@/lib/contract';

interface TokenInfoProps {
  address: string;
}

export default function TokenInfo({ address }: TokenInfoProps) {
  const [tokenInfo, setTokenInfo] = useState<{
    name: string;
    symbol: string;
    decimals: number;
    address: string;
  } | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [totalSupply, setTotalSupply] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);

  const blockExplorerUrl = process.env.NEXT_PUBLIC_BLOCK_EXPLORER || 'https://explore.tempo.xyz';

  useEffect(() => {
    loadInfo();
  }, [address]);

  const loadInfo = async () => {
    setIsLoading(true);
    try {
      const [info, bal, supply] = await Promise.all([
        getTokenInfo(),
        address ? getBalance(address) : Promise.resolve('0'),
        getTotalSupply()
      ]);
      setTokenInfo(info);
      setBalance(bal);
      setTotalSupply(supply);
    } catch (error) {
      console.error('Error loading token info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!tokenInfo) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-red-600">Contract not deployed. Please deploy the contract first.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Token Information</h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Token Name</p>
          <p className="text-lg font-semibold">{tokenInfo.name}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Symbol</p>
          <p className="text-lg font-semibold">{tokenInfo.symbol}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Decimals</p>
          <p className="text-lg font-semibold">{tokenInfo.decimals}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Total Supply</p>
          <p className="text-lg font-semibold">{totalSupply} {tokenInfo.symbol}</p>
        </div>

        {address && (
          <div>
            <p className="text-sm text-gray-600">Your Balance</p>
            <p className="text-lg font-semibold">{balance} {tokenInfo.symbol}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-600">Contract Address</p>
          <p className="font-mono text-sm break-all">{tokenInfo.address}</p>
          {tokenInfo.address && (
            <a
              href={`${blockExplorerUrl}/address/${tokenInfo.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-tempo-primary hover:underline flex items-center mt-1"
            >
              View on Block Explorer
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        {tokenInfo.address && typeof window !== 'undefined' && window.ethereum && (
          <div>
            <button
              onClick={async () => {
                if (typeof window === 'undefined' || !window.ethereum) {
                  alert('MetaMask is not installed');
                  return;
                }
                const ethereum = window.ethereum;
                if (!ethereum) {
                  return;
                }
                try {
                  await ethereum.request({
                    method: 'wallet_watchAsset',
                    params: [{
                      type: 'ERC20',
                      options: {
                        address: tokenInfo.address,
                        symbol: tokenInfo.symbol,
                        decimals: tokenInfo.decimals,
                        image: '', // Optional: token image URL
                      },
                    }],
                  });
                  alert(`✅ ${tokenInfo.symbol} token added to MetaMask! You should now see your balance.`);
                } catch (error: any) {
                  console.error('Error adding token to MetaMask:', error);
                  if (error.code !== 4001) { // User rejection
                    alert(`Failed to add token: ${error.message || 'Unknown error'}`);
                  }
                }
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              📥 Add {tokenInfo.symbol} to MetaMask
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Don't see your tokens? Click this button to import them into MetaMask.
            </p>
          </div>
        )}

        <button
          onClick={loadInfo}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          Refresh Info
        </button>
      </div>
    </div>
  );
}
