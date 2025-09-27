# Cardano Atomic Swap Smart Contracts

## Theory & Architecture

This folder contains the core smart contract logic for atomic swaps on the Cardano blockchain, implemented using Plutus v3 and the `plu-ts` library. Atomic swaps allow two parties to exchange assets securely and trustlessly, without intermediaries, using Hash-Time-Locked Contracts (HTLCs).

### Architecture Overview

- **HTLC Smart Contract**: Locks ADA in a contract, requiring a secret (hashlock) and enforcing time-based conditions (timelocks).
- **Datum Structure (`MyDatum`)**: Defines the on-chain state, including hashlock, participant public key hashes, deadlines, and safety deposit.
- **Redeemer Structure (`MyRedeemer`)**: Defines the allowed actions (withdraw with secret, cancel after timeout).
- **Utilities**: Includes helpers for UTXO selection, validation, logging, and error handling.
- **Scripts**: Contains entry points for creating, withdrawing, and cancelling swaps.

#### Flow
1. **Create Swap**: Maker locks ADA in the contract, specifying hashlock and deadlines.
2. **Withdraw**: Resolver provides the secret to unlock funds before the exclusive deadline.
3. **Cancel/Public Withdraw**: If deadlines pass, funds can be recovered by the resolver or anyone.

### File Structure
```
cardano/
├── src/
│   ├── contract.ts           # Main Plutus contract logic
│   ├── MyDatum/              # Datum type definitions
│   ├── MyRedeemer/           # Redeemer type definitions
│   └── app/                  # Scripts for swap actions
│       ├── createSwapEscrow.ts
│       ├── withdrawFromSwap.ts
│       ├── cancelSwapRefactored.ts
│       └── blockfrost.ts     # Blockfrost API config
│       └── utils/            # Utilities (logger, errors, utxo, validation)
└── testnet/                  # Testnet keys, addresses, compiled contracts
```

## Quick Start Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Project**
   ```bash
   npm run build
   ```

3. **Compile the Smart Contract**
   ```bash
   node dist/index.js
   ```
   This generates the compiled Plutus script at `./testnet/atomic-swap.plutus.json`.

4. **Configure Blockfrost**
   - Edit `src/app/blockfrost.ts` and set your Blockfrost testnet project ID.

5. **Set Up Testnet Keys**
   - Place your payment keys and addresses in the `testnet/` folder.

6. **Create a Swap Escrow**
   ```bash
   node dist/app/createSwapEscrow.js
   ```

7. **Withdraw or Cancel**
   - Withdraw: `node dist/app/withdrawFromSwap.js`
   - Cancel: `node dist/app/cancelSwapRefactored.js`

---

For more details, see the code comments and scripts in the `src/app/` directory.
