# QieLend Local Setup Guide

Follow these steps to run the QieLend P2P Lending application on your local machine. This setup allows the application to interact with browser-based crypto wallets like MetaMask, Coinbase Wallet, and Trust Wallet.

## Prerequisites

- **Node.js**: Ensure you have Node.js (v18 or higher) installed. [Download here](https://nodejs.org/).
- **Wallet Extension**: Install [MetaMask](https://metamask.io/) or your preferred wallet in your browser.

## Step-by-Step Installation

1. **Extract the Files**:
   Ensure all the project files (App.tsx, index.html, package.json, etc.) are in a single directory.

2. **Install Dependencies**:
   Open your terminal in the project folder and run:

   ```bash
   npm install
   ```

3. **Start the Development Server**:
   Run the following command to start the app:

   ```bash
   npm run dev
   ```

4. **Access the Application**:
   - The terminal will provide a link, usually `http://localhost:5173`.
   - Open this URL in your browser.
   - Click **"Connect Wallet"** to invoke your browser extension.

## Why this is necessary

Modern browsers block ES6 modules and TypeScript files when opened directly via `file://`. Using **Vite** provides a secure `localhost` environment which is a requirement for the **EIP-1193** standard that wallets use to communicate with web applications.

## Troubleshooting Wallet Connection

- **Extension not detected**: Ensure your wallet extension is unlocked.
- **Wrong Network**: The app is configured for QIE Mainnet. You may need to add the QIE network to your wallet manually if it's not automatically prompted.
- **Multiple Wallets**: If you have multiple extensions, they may conflict. Check the console (F12) if the connection button doesn't trigger a popup.

## Development Workflow (Stopping & Restarting)

If you need to close your terminal and continue later, follow these steps.

### 🛑 How to Stop

In each terminal window where a process is running (`npx hardhat node` or `npm run dev`), simply press **`Ctrl + C`** to stop the process.

### 🔄 How to Restart (Next Day)

Since we are using a **local blockchain**, stopping the node will **erase all local data** (wallets, loans, trust scores). You must restart the chain and redeploy the contracts each time.

**Step 1: Start the Local Blockchain**
Open a terminal and run:

```bash
cd smart-contracts
npx hardhat node
```

_Keep this terminal open._

**Step 2: Deploy Contracts**
Open a **new** terminal window (split or tab) and run:

```bash
cd smart-contracts
npx hardhat run scripts/deploy.ts --network localhost
```

_Good News: Hardhat usually generates the **exact same addresses** every time you restart. You likely won't need to update your `.env` file!_

**Step 3: Start the Frontend**
In the same or new terminal, go back to the project root and start the app:

```bash
cd ..
npm run dev
```

**Step 4: Reset MetaMask (Crucial!)**

1. Your account addresses and keys **stay the same**.
2. However, your **Transaction History** (Nonce) must be reset because the chain is fresh.
3. Go to **MetaMask > Settings > Advanced > Clear Activity Tab Data**.
4. _If you don't do this, transactions will get stuck._

**Step 5: "Ghost" Data Warning**

- **The Problem**: Your local database (Firebase) persists, but the blockchain resets to zero.
- **The Result**: You might see old "Active" loans on your Dashboard that don't exist on the blockchain anymore.
- **The Fix**: Ignore old loans or manually delete them from Firebase Console if they get confusing. Start fresh with "New Loan Request".
