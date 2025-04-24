import { BrowserProvider } from "ethers"
import { Contract } from "ethers"


export const MONAD_CONTRACT_ADDRESS = "0x4e26818fec4a0Dff696145d7c3D6B6429cb0592F"

export const MONAD_CONTRACT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "roomId", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "date", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timeSlot", "type": "uint256" }
    ],
    "name": "BookingCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "roomId", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "date", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timeSlot", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "booker", "type": "address" }
    ],
    "name": "RoomBooked",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "roomId", "type": "string" },
      { "internalType": "uint256", "name": "date", "type": "uint256" },
      { "internalType": "uint256", "name": "timeSlot", "type": "uint256" },
      { "internalType": "string", "name": "purpose", "type": "string" }
    ],
    "name": "bookRoom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "roomId", "type": "string" },
      { "internalType": "uint256", "name": "date", "type": "uint256" },
      { "internalType": "uint256", "name": "timeSlot", "type": "uint256" }
    ],
    "name": "cancelBooking",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "roomId", "type": "string" },
      { "internalType": "uint256", "name": "date", "type": "uint256" },
      { "internalType": "uint256", "name": "timeSlot", "type": "uint256" }
    ],
    "name": "checkAvailability",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
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

export async function bookRoom(
  roomId: string,
  date: number,
  timeSlot: number,
  purpose: string
): Promise<string | null> {
  if (!isMetaMaskInstalled()) {
    alert("MetaMask not installed");
    return null;
  }

  // Log the date to check its value
  console.log("Received date:", date);

  // Validate the inputs
  if (typeof date !== 'number' || isNaN(date) || date <= 0) {
    alert("Invalid date value");
    return null;
  }

  if (typeof timeSlot !== 'number' || isNaN(timeSlot) || timeSlot <= 0) {
    alert("Invalid timeSlot value");
    return null;
  }

  if (!purpose || typeof purpose !== 'string') {
    alert("Invalid purpose value");
    return null;
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new Contract(MONAD_CONTRACT_ADDRESS, MONAD_CONTRACT_ABI, signer);

  try {
    const tx = await contract.bookRoom(
      roomId,
      BigInt(date),        // Ensure `date` is a valid number
      BigInt(timeSlot),    // Ensure `timeSlot` is a valid number
      purpose
    );

    console.log("Booking TX sent:", tx.hash);
    await tx.wait();
    return tx.hash;
  } catch (error: any) {
    console.error("Booking error:", error);
    alert("Failed to book room. See console for details.");
    return null;
  }
}



export async function isRoomAvailable(roomId: string, date: number, timeSlot: number): Promise<boolean> {
  const provider = new BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contract = new Contract(MONAD_CONTRACT_ADDRESS, MONAD_CONTRACT_ABI, signer)

  try {
    return await contract.checkAvailability(roomId, date, timeSlot)
  } catch (error) {
    console.error("Availability check error:", error)
    return false
  }
}
