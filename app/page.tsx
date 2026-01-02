'use client';

import { useState } from 'react';
import WalletConnect from '@/components/WalletConnect';
import MintInterface from '@/components/MintInterface';
import BurnInterface from '@/components/BurnInterface';
import TokenInfo from '@/components/TokenInfo';

export default function Home() {
  const [connectedAddress, setConnectedAddress] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleConnect = (address: string) => {
    setConnectedAddress(address);
  };

  const handleDisconnect = () => {
    setConnectedAddress('');
  };

  const handleRefresh = () => {
    // Trigger a refresh by updating the key, which will cause TokenInfo to reload
    setRefreshKey(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🪙 Tempo Token Minter
          </h1>
          <p className="text-lg text-gray-600">
            Mint and burn TempoMint (TMINT) tokens on Tempo testnet
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Wallet Connection */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Connect Your Wallet
            </h2>
            <WalletConnect 
              onConnect={handleConnect} 
              onDisconnect={handleDisconnect}
            />
          </div>

          {/* Token Info */}
          <div>
            <TokenInfo key={refreshKey} address={connectedAddress} />
          </div>

          {/* Mint and Burn in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mint Interface */}
            <div>
              <MintInterface 
                address={connectedAddress}
                onMintSuccess={handleRefresh}
              />
            </div>

            {/* Burn Interface */}
            <div>
              {connectedAddress ? (
                <BurnInterface 
                  address={connectedAddress}
                  onBurnSuccess={handleRefresh}
                />
              ) : (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="text-2xl font-bold mb-4">Burn Tokens</h2>
                  <p className="text-gray-600">Please connect your wallet to burn tokens.</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              About Tempo Testnet
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Network: Tempo Testnet (Andantino)</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Chain ID: 42429</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>RPC URL: https://rpc.testnet.tempo.xyz</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Block Explorer: <a href="https://explore.tempo.xyz" target="_blank" rel="noopener noreferrer" className="text-tempo-primary hover:underline">explore.tempo.xyz</a></span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 pt-4">
            <p>
              Built for the Tempo ecosystem •{' '}
              <a 
                href="https://docs.tempo.xyz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-tempo-primary hover:underline"
              >
                Documentation
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
