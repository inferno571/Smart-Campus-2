"use server"

import { revalidatePath } from "next/cache"

// Monad contract address from the requirements
const MONAD_CONTRACT_ADDRESS = "0xE3D6cC3E5bA8c0D5c1b1A1fD5cE6A8bA9c1D3E3F"
// Metamask wallet ID
const METAMASK_WALLET_ID = "0x7E6b71af430e09109D5C2eb3d6faB6Df77545d52"

// Mock function to simulate Monad blockchain interaction
async function interactWithMonadContract(method: string, params: any) {
  // In a real implementation, this would use ethers.js or web3.js to interact with the blockchain
  console.log(`Calling Monad contract ${MONAD_CONTRACT_ADDRESS}.${method}`)
  console.log(`From wallet: ${METAMASK_WALLET_ID}`)
  console.log(`Params:`, params)

  // Simulate blockchain delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // For demo purposes, check for double booking
  if (method === "checkAvailability") {
    // Simulate 10% chance of room being already booked
    return Math.random() < 0.1 ? false : true
  }

  // For booking, return a transaction hash
  if (method === "bookRoom") {
    return {
      transactionHash: "0x" + Math.random().toString(16).substring(2, 42),
      blockNumber: Math.floor(Math.random() * 1000000) + 12000000,
    }
  }

  return null
}

export async function bookRoom(bookingData: any) {
  try {
    console.log("Booking data:", bookingData)

    // Step 1: Check if the room is available (on-chain)
    const isAvailable = await interactWithMonadContract("checkAvailability", {
      roomId: bookingData.roomId,
      date: bookingData.date,
      timeSlot: bookingData.timeSlot,
    })

    if (!isAvailable) {
      return {
        success: false,
        error: "This room is already booked for the selected time slot.",
      }
    }

    // Step 2: Book the room on the blockchain
    const result = await interactWithMonadContract("bookRoom", bookingData)

    if (!result) {
      return {
        success: false,
        error: "Failed to book room on the blockchain.",
      }
    }

    // Revalidate the booking page
    revalidatePath("/booking")

    return {
      success: true,
      transactionHash: result.transactionHash,
      blockNumber: result.blockNumber,
      bookingId: Math.floor(Math.random() * 1000000),
    }
  } catch (error: any) {
    console.error("Error booking room:", error)
    return {
      success: false,
      error: error.message || "Failed to book room",
    }
  }
}
