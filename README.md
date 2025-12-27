# 💎 QieLend - Decentralized P2P Lending Protocol

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg?style=flat&logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-9.x-FFCA28.svg?style=flat&logo=firebase)
![Blockchain](https://img.shields.io/badge/QIE-Blockchain-8A2BE2.svg)

**QieLend** is a next-generation Peer-to-Peer (P2P) lending platform built on the **QIE Blockchain**. It empowers users to borrow and lend crypto assets directly without intermediaries, leveraging smart contracts for security and a unique on-chain **Trust Score** system to evaluate borrower reliability.

---

## 🚀 Key Features

### 🏦 Decentralized Lending & Borrowing

- **Create Loan Requests**: Borrowers can set their own terms (Amount, Interest Rate, Duration).
- **Collateralized Loans**: Security logic ensures all loans are backed by crypto assets (ERC20 tokens).
- **Direct Funding**: Lenders can browse and fund loans directly via smart contracts.

### 🛡️ Trust Score System

- **On-Chain Reputation**: Proprietary scoring algorithm stored on the blockchain.
- **Dynamic Updates**: Score increases with repayment and decreases with default.
- **Identity Verification**: Integrated KYC status for enhanced platform trust.

### 💼 Comprehensive Dashboard

- **Real-Time Portfolio**: Track Borrowing, Lending, and Wallet activity in one view.
- **Interactive Graphs**: Visual breakdown of assets and loan performance.
- **Transaction History**: Unified log of all blockchain and platform interactions.

### 💰 Integrated Crypto Wallet

- **Multi-Asset Support**: Manage Native QIE, USDT, and WBTC balances.
- **Send & Receive**: Built-in transfer functionality with address validation.
- **Faucet Access**: Easy access to testnet tokens for development.

---

## �️ Tech Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS, Framer Motion
- **Build Tool**: Vite
- **Backend / Database**: Firebase Firestore (User Profiles, Off-chain Metadata)
- **Blockchain**: QIE Chain (EVM Compatible), Hardhat
- **Smart Contracts**: Solidity (LendingPool, TrustToken, MockERC20)
- **Interaction**: Ethers.js v6

---

## 📦 Installation & Setup

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18+)
- Metamask (or any Web3 Wallet) configured for QIE Testnet.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/qielend.git
cd qielend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
# Add other Firebase config keys...
```

### 4. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔗 Smart Contract Deployment

To explore or modify the smart contracts, navigate to the `smart-contracts` folder.

```bash
cd smart-contracts
npm install
npx hardhat compile
```

**Deploy to QIE Testnet:**

```bash
npx hardhat run scripts/deploy.ts --network qie_testnet
```

Update `src/config/blockchain.ts` with your new contract addresses after deployment.

---

## 🤝 Contribution

We welcome contributions! Please follow these steps:

1.  **Fork** the repository.
2.  Create a new **Feature Branch** (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4.  **Push** to the branch (`git push origin feature/AmazingFeature`).
5.  Open a **Pull Request**.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<center>
  <p>Built with ❤️ on the QIE Blockchain</p>
</center>
