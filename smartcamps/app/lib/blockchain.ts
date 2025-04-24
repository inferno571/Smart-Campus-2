import { ethers } from "ethers"

export const MONAD_CONTRACT_ADDRESS = "0xE3D6cC3E5bA8c0D5c1b1A1fD5cE6A8bA9c1D3E3F"


export const MONAD_CONTRACT_ABI = [
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": true,
					"internalType": "address",
					"name": "student",
					"type": "address"
				}
			],
			"name": "AttendanceMarked",
			"type": "event"
		},
		{
			"inputs": [
				{
					"internalType": "address",
					"name": "",
					"type": "address"
				}
			],
			"name": "hasAttended",
			"outputs": [
				{
					"internalType": "bool",
					"name": "",
					"type": "bool"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "recordAttendance",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		}
	]

// ✅ MetaMask check
export function isMetaMaskInstalled(): boolean {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
}

// ✅ Connect wallet
export async function connectToMetaMask(): Promise<string | null> {
  if (!isMetaMaskInstalled()) {
    alert("Please install MetaMask")
    return null
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    return accounts[0]
  } catch (error) {
    console.error("MetaMask connection error:", error)
    return null
  }
}

// ✅ Get current wallet address
export async function getCurrentAccount(): Promise<string | null> {
  if (!isMetaMaskInstalled()) return null

  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" })
    return accounts.length > 0 ? accounts[0] : null
  } catch (error) {
    console.error("Get account error:", error)
    return null
  }
}

// ✅ Call recordAttendance() on Monad contract
export async function markAttendance(): Promise<{success: boolean; txHash?: string; error?: string}> {
  if (!isMetaMaskInstalled()) {
    return { success: false, error: "MetaMask not installed" }
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any)
    await provider.send("eth_requestAccounts", [])
    const signer = provider.getSigner()
    const contract = new ethers.Contract(MONAD_CONTRACT_ADDRESS, MONAD_CONTRACT_ABI, signer)

    const network = await provider.getNetwork()
    if (network.chainId !== 1) {
      await provider.send("wallet_switchEthereumChain", [{ chainId: "0x1" }])
    }

    const gasEstimate = await contract.estimateGas.recordAttendance()
    const tx = await contract.recordAttendance({
      gasLimit: Math.ceil(gasEstimate.toNumber() * 1.2)
    })
    
    console.log("Attendance TX sent:", tx.hash)
    const receipt = await tx.wait()
    
    return { 
      success: true, 
      txHash: receipt.transactionHash 
    }
  } catch (error: any) {
    console.error("Attendance error:", error)
    return { 
      success: false, 
      error: error.message || "Failed to mark attendance" 
    }
  }
}


export async function hasUserAttended(): Promise<boolean> {
  if (!isMetaMaskInstalled()) return false

  const provider = new ethers.providers.Web3Provider(window.ethereum as any)
  const signer = provider.getSigner()
  const user = await signer.getAddress()
  const contract = new ethers.Contract(MONAD_CONTRACT_ADDRESS, MONAD_CONTRACT_ABI, provider)

  try {
    const attended = await contract.hasAttended(user)
    return attended
  } catch (error) {
    console.error("Error checking attendance:", error)
    return false
  }
}
