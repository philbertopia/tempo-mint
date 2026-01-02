'use client';

import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { mintTokens } from '@/lib/contract';
import { TEMPO_NETWORK } from '@/lib/tempo';
import StatusMessage from './StatusMessage';

interface MintInterfaceProps {
  address: string;
  onMintSuccess?: () => void;
}

export default function MintInterface({ address, onMintSuccess }: MintInterfaceProps) {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState(address);
  const [isMinting, setIsMinting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | 'loading'; message: string } | null>(null);

  const blockExplorerUrl = process.env.NEXT_PUBLIC_BLOCK_EXPLORER || 'https://explore.tempo.xyz';

  const switchToTempoNetwork = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:22',message:'switchToTempoNetwork entry',data:{hasEthereum:typeof window.ethereum !== 'undefined',tempoNetworkChainId:TEMPO_NETWORK.chainId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:51',message:'Current chainId from MetaMask',data:{chainIdRaw:chainId,chainIdType:typeof chainId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    let currentChainId = normalizeChainId(chainId);
    const tempoChainId = normalizeChainId(TEMPO_NETWORK.chainId);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:53',message:'ChainId normalization comparison',data:{currentChainId,tempoChainId,areEqual:currentChainId === tempoChainId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // If already on Tempo testnet, return
    if (currentChainId === tempoChainId) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:57',message:'Already on Tempo network, returning early',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return;
    }

      // Try to switch to Tempo network
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:61',message:'Attempting wallet_switchEthereumChain',data:{requestedChainId:TEMPO_NETWORK.chainId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: TEMPO_NETWORK.chainId }],
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:66',message:'wallet_switchEthereumChain succeeded, waiting 500ms',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // Wait a bit for MetaMask to update
      await new Promise(resolve => setTimeout(resolve, 500));
      // Verify we switched successfully (with retries)
      for (let i = 0; i < 3; i++) {
        chainId = await window.ethereum.request({ method: 'eth_chainId' });
        currentChainId = normalizeChainId(chainId);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:70',message:'Verification attempt after switch',data:{attempt:i+1,chainIdRaw:chainId,currentChainId,tempoChainId,matches:currentChainId === tempoChainId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        if (currentChainId === tempoChainId) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:73',message:'Successfully switched to Tempo network',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          return; // Successfully switched
        }
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:76',message:'All verification attempts failed after switch',data:{finalChainId:currentChainId,tempoChainId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    } catch (switchError: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:77',message:'wallet_switchEthereumChain error',data:{errorCode:switchError.code,errorMessage:switchError.message,errorData:switchError.data,fullError:JSON.stringify(switchError)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // If user rejected, don't throw - let them try again
      if (switchError.code === 4001) {
        throw new Error('Please approve the network switch in MetaMask');
      }
      
      // If network doesn't exist (error 4902), add it
      if (switchError.code === 4902) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:84',message:'Network not found (4902), attempting to add',data:{tempoNetwork:TEMPO_NETWORK},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [TEMPO_NETWORK],
          });
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:90',message:'wallet_addEthereumChain succeeded, waiting 500ms',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          // Wait for MetaMask to update
          await new Promise(resolve => setTimeout(resolve, 500));
          // Verify we're now on Tempo (with retries)
          for (let i = 0; i < 3; i++) {
            chainId = await window.ethereum.request({ method: 'eth_chainId' });
            currentChainId = normalizeChainId(chainId);
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:94',message:'Verification attempt after add',data:{attempt:i+1,chainIdRaw:chainId,currentChainId,tempoChainId,matches:currentChainId === tempoChainId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
            // #endregion
            if (currentChainId === tempoChainId) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:97',message:'Successfully added and switched to Tempo network',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
              // #endregion
              return; // Successfully added and switched
            }
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } catch (addError: any) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:101',message:'wallet_addEthereumChain error',data:{errorCode:addError.code,errorMessage:addError.message,errorData:addError.data,fullError:JSON.stringify(addError)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          // If adding fails, check if we're already on the right network
          chainId = await window.ethereum.request({ method: 'eth_chainId' });
          currentChainId = normalizeChainId(chainId);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:103',message:'Checking network after addError',data:{chainIdRaw:chainId,currentChainId,tempoChainId,matches:currentChainId === tempoChainId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          if (currentChainId === tempoChainId) {
            return; // We're already on the right network, proceed
          }
          
          // Handle error -32603: Network with same RPC but different chainId exists
          // This means MetaMask has a Tempo network but with a different chainId
          // Try to extract the existing chainId from the error and switch to it
          if (addError.code === -32603 || addError.message?.includes('same RPC endpoint')) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:110',message:'Network with same RPC exists (-32603), trying to switch to existing network',data:{errorMessage:addError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            // Try to switch to the existing network - MetaMask should have it configured
            // Since the RPC is the same, we can try switching to our target chainId
            // MetaMask might have it under a different chainId, so try both
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
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:110',message:'Duplicate network detected, retrying switch',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: TEMPO_NETWORK.chainId }],
              });
              // Verify
              chainId = await window.ethereum.request({ method: 'eth_chainId' });
              currentChainId = normalizeChainId(chainId);
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:118',message:'Final verification after duplicate retry',data:{chainIdRaw:chainId,currentChainId,tempoChainId,matches:currentChainId === tempoChainId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
              if (currentChainId === tempoChainId) {
                return; // Successfully switched
              }
            } catch (finalError: any) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:122',message:'Final error after duplicate retry',data:{errorCode:finalError.code,errorMessage:finalError.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
              // #endregion
              // Last check - maybe we're already on the right network
              chainId = await window.ethereum.request({ method: 'eth_chainId' });
              currentChainId = normalizeChainId(chainId);
              if (currentChainId === tempoChainId) {
                return; // We're on the right network, proceed
              }
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:128',message:'Throwing error: Please switch manually',data:{finalChainId:currentChainId,tempoChainId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
              // #endregion
              throw new Error('Please switch to Tempo testnet manually in MetaMask');
            }
          } else {
            // Check one more time if we're on the right network
            chainId = await window.ethereum.request({ method: 'eth_chainId' });
            currentChainId = normalizeChainId(chainId);
            if (currentChainId === tempoChainId) {
              return; // We're on the right network, proceed
            }
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:137',message:'Throwing error: Please switch manually (else branch)',data:{finalChainId:currentChainId,tempoChainId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
            // #endregion
            throw new Error('Please switch to Tempo testnet manually in MetaMask');
          }
        }
      } else {
        // Other errors - check one last time if we're on the right network
        chainId = await window.ethereum.request({ method: 'eth_chainId' });
        currentChainId = normalizeChainId(chainId);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:144',message:'Other error path - final network check',data:{chainIdRaw:chainId,currentChainId,tempoChainId,matches:currentChainId === tempoChainId,errorCode:switchError.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        if (currentChainId === tempoChainId) {
          return; // We're on the right network, proceed
        }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:148',message:'Throwing error: Please switch in MetaMask',data:{finalChainId:currentChainId,tempoChainId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        throw new Error('Please switch to Tempo testnet in MetaMask to continue');
      }
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:151',message:'switchToTempoNetwork exit (unexpected path)',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
  };

  const handleMint = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:261',message:'handleMint entry',data:{amount,recipient},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    if (!amount || parseFloat(amount) <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }

    if (!recipient || !recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      setStatus({ type: 'error', message: 'Please enter a valid recipient address' });
      return;
    }

    setIsMinting(true);
    setStatus({ type: 'loading', message: 'Switching to Tempo testnet...' });

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      // Switch to Tempo testnet before proceeding
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:280',message:'About to call switchToTempoNetwork',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      await switchToTempoNetwork();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:283',message:'switchToTempoNetwork completed successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      
      setStatus({ type: 'loading', message: 'Minting tokens...' });

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:287',message:'Creating provider and signer',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      // #region agent log
      const signerAddress = await signer.getAddress();
      const network = await provider.getNetwork();
      fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:290',message:'Provider and signer created',data:{signerAddress,chainId:network.chainId.toString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:293',message:'Calling mintTokens',data:{recipient,amount},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      const tx = await mintTokens(signer, recipient, amount);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:295',message:'mintTokens transaction submitted',data:{txHash:tx.hash},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      setStatus({ type: 'loading', message: 'Transaction submitted. Waiting for confirmation...' });

      const receipt = await tx.wait();
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:300',message:'Transaction confirmed',data:{receiptHash:receipt.hash,status:receipt.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      
      setStatus({
        type: 'success',
        message: `✅ Successfully minted ${amount} TMINT tokens to ${recipient.substring(0, 6)}...${recipient.substring(38)}! Transaction: ${receipt.hash.substring(0, 10)}...`
      });

      setAmount('');
      if (onMintSuccess) {
        onMintSuccess();
      }
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/656b5df5-2ca8-4c78-bd36-17d8c414636c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MintInterface.tsx:312',message:'handleMint error caught',data:{errorMessage:error.message,errorCode:error.code,errorName:error.name,fullError:JSON.stringify(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      let errorMessage = error.message || 'Failed to mint tokens. Please try again.';
      
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
      setIsMinting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Mint Tokens</h2>
      
      {status && (
        <StatusMessage type={status.type} message={status.message} />
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address
          </label>
          <input
            id="recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tempo-primary focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            Address to receive the minted tokens
          </p>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount to Mint
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100.0"
            min="0"
            step="0.000000000000000001"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-tempo-primary focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-500">
            Amount of TMINT tokens to mint
          </p>
        </div>

        <button
          onClick={handleMint}
          disabled={isMinting || !amount || !recipient}
          className="w-full px-6 py-3 bg-tempo-primary text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isMinting ? 'Minting...' : 'Mint Tokens'}
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Anyone can mint tokens. This is a public minting function for testing purposes.
        </p>
      </div>
    </div>
  );
}
