# Compute Veil – Encrypted Workflow Dashboard

Compute Veil is an end-to-end example dApp built on top of Zama's FHEVM (Fully Homomorphic Encryption for Ethereum Virtual Machine). It demonstrates privacy-preserving smart contracts where computations occur on encrypted data without ever revealing sensitive information on-chain.

## Key Features

- **Encrypted On-Chain Computation**: Submit encrypted workloads using the `FHECounter` contract that performs arithmetic operations on encrypted values.
- **Privacy-First Architecture**: All counter operations (increment/decrement) happen on encrypted data—raw values never appear on the blockchain.
- **Dataset Scenarios**: Predefined scenarios for credit risk assessment, IoT telemetry monitoring, clinical data analysis, and more.
- **Local Decryption**: Users decrypt results locally in their browser after computation completes, maintaining end-to-end privacy.
- **Web3 Integration**: Full wallet connection, transaction signing, and contract interaction via MetaMask or compatible EIP-6963 providers.
- **Modern Frontend**: Next.js + React dashboard with Tailwind CSS for a responsive, intuitive user experience.

The frontend orchestrates wallet connection, FHEVM encryption/decryption, and contract calls in a guided workflow, making encrypted computation accessible to end users.

## Live Demo & Video

- **Live demo**: https://compute-veil.vercel.app/
- **Local demo video**: `video.mp4` (located at the project root)

You can open the deployed demo directly in your browser, or play `video.mp4` locally to see the full interaction flow without setting up the environment.

## Quick Start (Local)

This repository combines the Hardhat FHEVM backend and a Next.js frontend.

### Prerequisites

- **Node.js**: v20 or higher
- **pnpm** (recommended) or npm/yarn

### Install dependencies

```bash
pnpm install
```

### Configure environment

- Copy any provided `.env` example files under `frontend/` if needed.
- Set up your FHEVM-compatible RPC endpoint and wallet mnemonic according to the official docs.

Backend (Hardhat) secrets are typically managed via `npx hardhat vars`:

```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
# Optional: Etherscan API key for contract verification
npx hardhat vars set ETHERSCAN_API_KEY
```

### Compile and test contracts

```bash
pnpm run compile
pnpm run test
```

### Deploy FHECounter

Local FHEVM node:

```bash
npx hardhat node
npx hardhat deploy --network localhost --tags FHECounter
```

Public testnet (example: Sepolia FHEVM, ensure config is correct first):

```bash
npx hardhat deploy --network sepolia --tags FHECounter
```

The deploy script in `deploy/deploy.ts` logs the `FHECounter` address; copy this into your frontend configuration if required.

### Run the frontend

From the `frontend/` directory:

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000` in your browser.

On the homepage you will see the **Compute Veil Dashboard**, where you can:

- Connect your wallet to an FHEVM-enabled chain.
- Deploy or point to an existing `FHECounter` contract.
- Select dataset presets to increment/decrement the encrypted counter.
- Refresh and decrypt the latest encrypted handle to reveal the clear counter value locally.

## 📁 Project Structure

```text
compute-veil/
├── contracts/           # Solidity contracts
│   └── FHECounter.sol   # Main encrypted counter contract
├── deploy/              # Hardhat deployment scripts
│   ├── deploy.ts        # Main deployment orchestrator
│   └── 01_deploy_FHECounter.ts  # FHECounter deployment
├── tasks/               # Hardhat custom tasks
├── test/                # Contract unit tests
├── frontend/            # Next.js dashboard application
│   ├── app/             # Next.js app directory
│   ├── components/      # React UI components
│   ├── hooks/           # Custom React hooks (FHEVM, MetaMask)
│   ├── fhevm/           # FHEVM integration library
│   ├── public/          # Static assets
│   └── package.json     # Frontend dependencies
├── fhevmTemp/           # Local FHEVM temp data (git-ignored)
├── video.mp4            # Local walkthrough demo video
├── hardhat.config.ts    # Hardhat + FHEVM configuration
├── package.json         # Root scripts and dependencies
└── README.md            # This file
```

### Smart Contract Architecture

**`contracts/FHECounter.sol`**
- Stores an encrypted `euint32` counter value
- Exposes `increment(externalEuint32, bytes)` and `decrement(externalEuint32, bytes)` functions
- Uses FHEVM's `FHE.add()` and `FHE.sub()` for encrypted arithmetic
- Implements permission controls via `FHE.allow()` for decryption access

### Frontend Architecture

**Key Components:**
- **FHEVM Hooks** (`frontend/fhevm/`): Reusable hooks for encryption, decryption, and contract interaction
- **MetaMask Integration** (`frontend/hooks/metamask/`): Wallet provider management following EIP-6963
- **Dashboard UI** (`frontend/components/`): Interactive components for dataset selection, transaction submission, and result display
- **Custom Hooks** (`frontend/hooks/useFHECounter.tsx`): High-level hook demonstrating FHEVM integration patterns

## 📜 Useful Scripts

At the root level:

| Script                | Description                           |
| --------------------- | ------------------------------------- |
| `pnpm run compile`    | Compile all contracts                 |
| `pnpm run test`       | Run contract tests                    |
| `pnpm run lint`       | Run linting checks (if configured)    |
| `pnpm run clean`      | Clean build artifacts                 |

Inside `frontend/`:

| Script             | Description                       |
| ------------------ | --------------------------------- |
| `pnpm dev`         | Start the Next.js dev server      |
| `pnpm build`       | Build the production bundle       |
| `pnpm start`       | Run the production server         |

## 🔐 How It Works

### Encryption Flow
1. User selects a dataset scenario and amount to increment/decrement
2. Frontend encrypts the value using FHEVM's encryption library
3. Encrypted value is sent to the smart contract
4. Contract performs arithmetic on encrypted data (no decryption needed)
5. Result remains encrypted on-chain

### Decryption Flow
1. User requests to view the current counter value
2. Frontend retrieves the encrypted handle from the contract
3. User's browser decrypts the value locally using their private key
4. Decrypted result is displayed in the UI

This architecture ensures that:
- **On-Chain Privacy**: The blockchain never sees plaintext values
- **End-to-End Encryption**: Only the user can decrypt results
- **Verifiable Computation**: All operations are auditable on-chain

## 🎯 Use Cases

Compute Veil demonstrates how FHEVM enables:

- **Confidential Finance**: Encrypted loan amounts, interest rates, and risk scores
- **Healthcare**: Privacy-preserving patient data analysis
- **IoT & Telemetry**: Encrypted sensor data aggregation without exposing individual readings
- **Voting Systems**: Encrypted vote tallying without revealing individual votes
- **Supply Chain**: Confidential inventory and pricing information

## 🚀 Deployment

### Testnet Deployment (Sepolia FHEVM)

1. Set up your environment variables:
```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
```

2. Deploy to Sepolia:
```bash
npx hardhat deploy --network sepolia --tags FHECounter
```

3. Update frontend configuration with the deployed contract address

### Vercel Deployment

The frontend is pre-configured for Vercel deployment:

```bash
cd frontend
pnpm build
# Deploy to Vercel via CLI or GitHub integration
```

## 🧪 Testing

Run the contract test suite:

```bash
pnpm run test
```

For network-specific tests:

```bash
pnpm run test:sepolia
```

## 📚 FHEVM Documentation

For details on how FHEVM works under the hood and how to extend this project, refer to the official docs:

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)
- [FHEVM Discord Community](https://discord.com/invite/zama)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions and support:
- Check the [FHEVM Discord Community](https://discord.com/invite/zama)
- Review the [official FHEVM documentation](https://docs.zama.ai/fhevm)
- Open an issue on this repository

