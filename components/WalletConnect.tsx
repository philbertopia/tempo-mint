'use client';

import { useState, useEffect } from 'react';
import { TEMPO_NETWORK } from '@/lib/tempo';

interface WalletConnectProps {
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

export default function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [address, setAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasMetaMask, setHasMetaMask] = useState<boolean>(false);

  useEffect(() => {
    // Check if MetaMask is available (client-side only)
    if (typeof window !== 'undefined') {
      setHasMetaMask(typeof window.ethereum !== 'undefined');
      // Check if already connected
      checkConnection();

      // Set up event listeners for account and chain changes
      if (typeof window.ethereum !== 'undefined') {
        const handleAccountsChanged = (accounts: string[]) => {
          if (accounts.length === 0) {
            // User disconnected
            setAddress('');
            onDisconnect();
          } else {
            // Account changed - update if different
            setAddress(prevAddress => {
              if (prevAddress !== accounts[0]) {
                onConnect(accounts[0]);
                return accounts[0];
              }
              return prevAddress;
            });
          }
        };

        const handleChainChanged = () => {
          // Chain changed - just silently update the connection state
          // Don't call onConnect/onDisconnect to avoid UI flicker
          checkConnection();
        };

        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        // Cleanup listeners on unmount
        return () => {
          if (typeof window.ethereum !== 'undefined') {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            window.ethereum.removeListener('chainChanged', handleChainChanged);
          }
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          onConnect(accounts[0]);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    }
  };

  const switchToTempoNetwork = async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not installed');
    }

    try {
      // Check current chain ID first
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // Normalize chainId for comparison
      const normalizeChainId = (id: string) => {
        const normalized = id.toLowerCase().startsWith('0x') ? id.toLowerCase() : `0x${id.toLowerCase()}`;
        return normalized;
      };
      
      const currentChainId = normalizeChainId(chainId);
      const tempoChainId = normalizeChainId(TEMPO_NETWORK.chainId);
      
      // If already on Tempo testnet, return
      if (currentChainId === tempoChainId) {
        return;
      }

      // Try to switch to Tempo network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: TEMPO_NETWORK.chainId }],
        });
      } catch (switchError: any) {
        // If network doesn't exist (error 4902), add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [TEMPO_NETWORK],
            });
          } catch (addError: any) {
            // If adding fails, it might already exist - try switching again
            if (addError.code === -32602 || addError.message?.includes('already exists')) {
              // Network might already exist, try switching one more time
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: TEMPO_NETWORK.chainId }],
              });
            } else {
              throw new Error('Failed to add Tempo network to MetaMask');
            }
          }
        } else {
          throw switchError;
        }
      }
    } catch (error: any) {
      throw error;
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      
      // Switch to Tempo network
      await switchToTempoNetwork();

      setAddress(account);
      onConnect(account);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Error connecting wallet:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress('');
    onDisconnect();
  };

  if (address) {
    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Connected Wallet</p>
            <p className="font-mono text-sm mt-1 break-all">{address}</p>
          </div>
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="w-full px-6 py-3 bg-tempo-primary text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {isConnecting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </>
        ) : (
          'Connect MetaMask'
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      {!hasMetaMask && (
        <p className="mt-2 text-sm text-gray-600">
          Don't have MetaMask?{' '}
          <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="text-tempo-primary hover:underline">
            Install it here
          </a>
        </p>
      )}
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
