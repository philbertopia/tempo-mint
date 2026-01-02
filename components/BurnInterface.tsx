'use client';

import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { burnTokens, getBalance } from '@/lib/contract';
import { TEMPO_NETWORK } from '@/lib/tempo';
import StatusMessage from './StatusMessage';

interface BurnInterfaceProps {
  address: string;
  onBurnSuccess?: () => void;
}

export default function BurnInterface({ address, onBurnSuccess }: BurnInterfaceProps) {
  const [amount, setAmount] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | 'loading'; message: string } | null>(null);
  const [balance, setBalance] = useState<string>('0');

  const blockExplorerUrl = process.env.NEXT_PUBLIC_BLOCK_EXPLORER || 'https://explore.tempo.xyz';

  const loadBalance = async () => {
    if (address) {
      const bal = await getBalance(address);
      setBalance(bal);
    }
  };

  useEffect(() => {
    if (address) {
      loadBalance();
    }
  }, [address]);

  const switchToTempoNetwork = async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    // Normalize chainId for comparison (handles hex strings, decimal numbers, etc.)
    const normalizeChainId = (id: string | number) => {
      let normalized: string;
      if (typeof id === 'number') {
        normalized = `0x${id.toString(16)}`;
      } else {
        // Handle hex strings (with or without 0x)
        const cleaned = id.toString().toLowerCase().trim();
        if (cleaned.startsWith('0x')) {
          normalized = cleaned;
        } else {
          // Try to parse as decimal and convert to hex
          const num = parseInt(cleaned, 10);
          if (!isNaN(num)) {
            normalized = `0x${num.toString(16)}`;
          } else {
            normalized = `0x${cleaned}`;
          }
        }
      }
      return normalized.toLowerCase();
    };

    // Check current chain ID
    let chainId = await window.ethereum.request({ method: 'eth_chainId' });
    let currentChainId = normalizeChainId(chainId);
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
      // Wait a bit for MetaMask to update
      await new Promise(resolve => setTimeout(resolve, 500));
      // Verify we switched successfully (with retries)
      for (let i = 0; i < 3; i++) {
        chainId = await window.ethereum.request({ method: 'eth_chainId' });
        currentChainId = normalizeChainId(chainId);
        if (currentChainId === tempoChainId) {
          return; // Successfully switched
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    } catch (switchError: any) {
      // If user rejected, don't throw - let them try again
      if (switchError.code === 4001) {
        throw new Error('Please approve the network switch in MetaMask');
      }
      
      // If network doesn't exist (error 4902), add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [TEMPO_NETWORK],
          });
          // Wait for MetaMask to update
          await new Promise(resolve => setTimeout(resolve, 500));
          // Verify we're now on Tempo (with retries)
          for (let i = 0; i < 3; i++) {
            chainId = await window.ethereum.request({ method: 'eth_chainId' });
            currentChainId = normalizeChainId(chainId);
            if (currentChainId === tempoChainId) {
              return; // Successfully added and switched
            }
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } catch (addError: any) {
          // If adding fails, check if we're already on the right network
          chainId = await window.ethereum.request({ method: 'eth_chainId' });
          currentChainId = normalizeChainId(chainId);
          if (currentChainId === tempoChainId) {
            return; // We're already on the right network, proceed
          }
          
          // Handle error -32603: Network with same RPC but different chainId exists
          // This means MetaMask has a Tempo network but with a different chainId
          // Try to extract the existing chainId from the error and switch to it
          if (addError.code === -32603 || addError.message?.includes('same RPC endpoint')) {
            // Try to switch to the existing network - MetaMask should have it configured
            // Since the RPC is the same, we can try switching to our target chainId
            try {
              // First try switching to our target chainId (it might work if MetaMask recognizes it)
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: TEMPO_NETWORK.chainId }],
              });
              // Wait and verify
              await new Promise(resolve => setTimeout(resolve, 500));
              for (let i = 0; i < 3; i++) {
                chainId = await window.ethereum.request({ method: 'eth_chainId' });
                currentChainId = normalizeChainId(chainId);
                if (currentChainId === tempoChainId) {
                  return; // Successfully switched
                }
                await new Promise(resolve => setTimeout(resolve, 300));
              }
            } catch (switchRetryError: any) {
              // If that fails, check if we're on the right network anyway
              chainId = await window.ethereum.request({ method: 'eth_chainId' });
              currentChainId = normalizeChainId(chainId);
              if (currentChainId === tempoChainId) {
                return; // We're on the right network
              }
            }
          }
          
          // If it's a duplicate network error, try switching one more time
          if (addError.code === -32602 || addError.message?.includes('already exists') || addError.message?.includes('duplicate')) {
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: TEMPO_NETWORK.chainId }],
              });
              // Verify
              chainId = await window.ethereum.request({ method: 'eth_chainId' });
              currentChainId = normalizeChainId(chainId);
              if (currentChainId === tempoChainId) {
                return; // Successfully switched
              }
            } catch (finalError: any) {
              // Last check - maybe we're already on the right network
              chainId = await window.ethereum.request({ method: 'eth_chainId' });
              currentChainId = normalizeChainId(chainId);
              if (currentChainId === tempoChainId) {
                return; // We're on the right network, proceed
              }
              throw new Error('Please switch to Tempo testnet manually in MetaMask');
            }
          } else {
            // Check one more time if we're on the right network
            chainId = await window.ethereum.request({ method: 'eth_chainId' });
            currentChainId = normalizeChainId(chainId);
            if (currentChainId === tempoChainId) {
              return; // We're on the right network, proceed
            }
            throw new Error('Please switch to Tempo testnet manually in MetaMask');
          }
        }
      } else {
        // Other errors - check one last time if we're on the right network
        chainId = await window.ethereum.request({ method: 'eth_chainId' });
        currentChainId = normalizeChainId(chainId);
        if (currentChainId === tempoChainId) {
          return; // We're on the right network, proceed
        }
        throw new Error('Please switch to Tempo testnet in MetaMask to continue');
      }
    }
  };

  const handleBurn = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }

    const balanceNum = parseFloat(balance);
    const amountNum = parseFloat(amount);

    if (amountNum > balanceNum) {
      setStatus({ type: 'error', message: `Insufficient balance. You have ${balance} TMINT tokens.` });
      return;
    }

    setIsBurning(true);
    setStatus({ type: 'loading', message: 'Switching to Tempo testnet...' });

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      // Switch to Tempo testnet before proceeding
      await switchToTempoNetwork();
      
      setStatus({ type: 'loading', message: 'Burning tokens...' });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const tx = await burnTokens(signer, amount);
      setStatus({ type: 'loading', message: 'Transaction submitted. Waiting for confirmation...' });

      const receipt = await tx.wait();
      
      setStatus({
        type: 'success',
        message: `✅ Successfully burned ${amount} TMINT tokens! Transaction: ${receipt.hash.substring(0, 10)}...`
      });

      setAmount('');
      await loadBalance();
      if (onBurnSuccess) {
        onBurnSuccess();
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Failed to burn tokens. Please try again.';
      
      // Provide more helpful error messages
      if (errorMessage.includes('Tempo testnet') || errorMessage.includes('network')) {
        errorMessage = `⚠️ ${errorMessage}\n\nPlease:\n1. Open MetaMask\n2. Click the network dropdown\n3. Select "Tempo Testnet (Andantino)" or add it manually\n4. Try again`;
      } else if (error.code === 4001) {
        errorMessage = 'Transaction was rejected. Please try again and approve the transaction in MetaMask.';
      }
      
      setStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsBurning(false);
    }
  };

  const handleMax = async () => {
    await loadBalance();
    setAmount(balance);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Burn Tokens</h2>
      
      {status && (
        <StatusMessage type={status.type} message={status.message} />
      )}

      <div className="space-y-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Your Balance</p>
          <p className="text-2xl font-bold text-gray-900">{balance} TMINT</p>
          <button
            onClick={loadBalance}
            className="mt-2 text-sm text-tempo-primary hover:underline"
          >
            Refresh Balance
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="burn-amount" className="block text-sm font-medium text-gray-700">
              Amount to Burn
            </label>
            <button
              onClick={handleMax}
              className="text-sm text-tempo-primary hover:underline"
            >
              Max
            </button>
          </div>
          <input
            id="burn-amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100.0"
            min="0"
            max={balance}
            step="0.000000000000000001"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tempo-primary focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            Amount of TMINT tokens to burn from your wallet
          </p>
        </div>

        <button
          onClick={handleBurn}
          disabled={isBurning || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(balance)}
          className="w-full px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isBurning ? 'Burning...' : 'Burn Tokens'}
        </button>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Warning:</strong> Burning tokens permanently removes them from circulation. This action cannot be undone.
        </p>
      </div>
    </div>
  );
}
