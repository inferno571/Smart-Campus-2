// Monad contract address
export const MONAD_CONTRACT_ADDRESS = "0xE3D6cC3E5bA8c0D5c1b1A1fD5cE6A8bA9c1D3E3F"

// Default wallet ID (used when user hasn't connected their wallet)
export const DEFAULT_WALLET_ID = "0x7E6b71af430e09109D5C2eb3d6faB6Df77545d52"

// Interface for blockchain transaction
export interface BlockchainTransaction {
  transactionHash: string
  blockNumber: number
  timestamp: string
}

// Function to check if MetaMask is installed
export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && window.ethereum !== undefined
}

// Function to connect to MetaMask
export async function connectToMetaMask(): Promise<string | null> {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed")
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    return accounts[0]
  } catch (error) {
    console.error("Error connecting to MetaMask:", error)
    return null
  }
}

// Function to get current connected account
export async function getCurrentAccount(): Promise<string | null> {
  if (!isMetaMaskInstalled()) {
    return null
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" })
    return accounts.length > 0 ? accounts[0] : null
  } catch (error) {
    console.error("Error getting current account:", error)
    return null
  }
}

// Function to sign a message with MetaMask
export async function signMessage(message: string): Promise<string | null> {
  if (!isMetaMaskInstalled()) {
    return null
  }

  try {
    const account = await getCurrentAccount()
    if (!account) return null

    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [message, account],
    })

    return signature
  } catch (error) {
    console.error("Error signing message:", error)
    return null
  }
}

// Function to simulate a blockchain transaction
export async function simulateBlockchainTransaction(): Promise<BlockchainTransaction> {
  // In a real implementation, this would interact with the Monad blockchain
  // For demo purposes, we'll simulate a transaction

  return {
    transactionHash: "0x" + Math.random().toString(16).substring(2, 42),
    blockNumber: Math.floor(Math.random() * 1000000) + 12000000,
    timestamp: new Date().toISOString(),
  }
}
