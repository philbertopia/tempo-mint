# Tempo Token Minter

A Next.js-based web application for minting and burning TempoMint (TMINT) tokens on the Tempo testnet. Users can connect their MetaMask wallet to mint tokens to any address or burn their own tokens.

## Features

- 🔗 **MetaMask Integration** - Connect wallet and automatically switch to Tempo testnet
- 🪙 **Public Minting** - Anyone can mint tokens to any address
- 🔥 **Token Burning** - Users can burn their own tokens
- 📊 **Token Information** - View balance, total supply, and contract details
- 📱 **Responsive Design** - Works on desktop and mobile devices
- ✨ **Modern UI** - Clean, professional interface with Tailwind CSS
- 🔍 **Block Explorer Links** - Quick access to view transactions

## Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension (for wallet connection)
- Access to Tempo testnet
- Deployed TempoMint contract (see Deployment section)

## Installation

1. **Navigate to the project directory:**
   ```bash
   cd token-minter
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_TEMPO_RPC_URL=https://rpc.testnet.tempo.xyz
   NEXT_PUBLIC_BLOCK_EXPLORER=https://explore.tempo.xyz
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x... (set after deploying contract)
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Contract Deployment

Before using the frontend, you need to deploy the TempoMint contract to Tempo testnet.

### Option 1: Using Remix IDE (Easiest)

1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create a new file `TempoMint.sol` and paste the contract code from `contracts/TempoMint.sol`
3. Compile the contract (Solidity version 0.8.20)
4. Deploy using Injected Provider (MetaMask)
5. Make sure MetaMask is connected to Tempo testnet (Chain ID: 42429)
6. Copy the deployed contract address
7. Add it to `.env.local` as `NEXT_PUBLIC_CONTRACT_ADDRESS`

### Option 2: Using Hardhat

1. Install Hardhat:
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```

2. Initialize Hardhat:
   ```bash
   npx hardhat init
   ```

3. Configure `hardhat.config.js` for Tempo testnet
4. Compile and deploy:
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network tempo
   ```

## Usage

### For Users

1. **Connect MetaMask:**
   - Click "Connect MetaMask" button
   - Approve the connection request
   - The app will automatically add Tempo testnet if not already added

2. **Mint Tokens:**
   - Enter recipient address (defaults to your connected wallet)
   - Enter amount to mint
   - Click "Mint Tokens"
   - Confirm transaction in MetaMask

3. **Burn Tokens:**
   - Enter amount to burn (must be less than your balance)
   - Click "Burn Tokens"
   - Confirm transaction in MetaMask

4. **View Token Info:**
   - See your balance, total supply, and contract details
   - Click "Refresh Info" to update

## Project Structure

```
token-minter/
├── app/
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Main minter page
│   └── globals.css                  # Global styles
├── components/
│   ├── WalletConnect.tsx            # MetaMask connection component
│   ├── MintInterface.tsx            # Mint tokens interface
│   ├── BurnInterface.tsx             # Burn tokens interface
│   ├── TokenInfo.tsx                # Token information display
│   └── StatusMessage.tsx             # Status/error messages
├── lib/
│   ├── tempo.ts                     # Tempo RPC utilities
│   └── contract.ts                  # Contract ABI and functions
├── contracts/
│   └── TempoMint.sol                # ERC20 token contract
├── scripts/
│   └── deploy.ts                    # Deployment script
└── package.json
```

## Smart Contract

The `TempoMint.sol` contract is a simple ERC20 token with:
- Public `mint(address to, uint256 amount)` function
- Public `burn(uint256 amount)` function
- Standard ERC20 transfer, approve, and transferFrom functions
- Events for minting and burning

## Tempo Testnet Details

- **Network Name:** Tempo Testnet (Andantino)
- **Chain ID:** 42429
- **RPC URL:** https://rpc.testnet.tempo.xyz
- **Block Explorer:** https://explore.tempo.xyz
- **Currency Symbol:** USD

## Development

### Build for Production

```bash
npm run build
npm start
```

### Run Linter

```bash
npm run lint
```

## Troubleshooting

### Contract Not Deployed

If you see "Contract not deployed" error:
- Make sure you've deployed the contract to Tempo testnet
- Check that `NEXT_PUBLIC_CONTRACT_ADDRESS` is set in `.env.local`
- Verify the contract address is correct

### MetaMask Not Connecting

- Ensure MetaMask is installed and unlocked
- Check that you're allowing the site to connect
- Try refreshing the page

### Network Not Switching

- The app will automatically add Tempo testnet if it's not in your MetaMask
- If it fails, manually add the network using the details above

### Transaction Fails

- Make sure you have enough native tokens (USD) for gas
- Check that you're on Tempo testnet
- Verify the contract address is correct

## License

MIT

## Links

- [Tempo Documentation](https://docs.tempo.xyz)
- [Tempo Block Explorer](https://explore.tempo.xyz)
- [Tempo Website](https://tempo.xyz)
