
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
