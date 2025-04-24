"use server"

import { revalidatePath } from "next/cache"
import { optimizeImageOnServer, truncateBase64ForGroq, estimateTokenCount } from "@/app/lib/image-processor"
import { getSchoolConfig } from "@/app/lib/school-config"
import { env } from "@/app/lib/env"

// Metamask wallet ID for blockchain transactions
const METAMASK_WALLET_ID = "0x7E6b71af430e09109D5C2eb3d6faB6Df77545d52"

// Maximum base64 length to prevent token limit errors - drastically reduced
const MAX_BASE64_LENGTH = 20000

// Maximum estimated tokens for the entire request
const MAX_ESTIMATED_TOKENS = 4000

export async function recognizeFaces(imageBlob: Blob) {
  try {
    // Convert blob to buffer
    const arrayBuffer = await imageBlob.arrayBuffer()
    let buffer = Buffer.from(arrayBuffer)

    // Optimize the image to prevent "Request too large" error
    buffer = await optimizeImageOnServer(buffer)

    // Convert optimized buffer to base64
    let base64Image = buffer.toString("base64")

    // Truncate base64 string if it's still too large
    base64Image = truncateBase64ForGroq(base64Image, MAX_BASE64_LENGTH)

    // Estimate token count for the base64 string
    const estimatedTokens = estimateTokenCount(base64Image)

    // If estimated tokens are still too high, use mock data
    if (estimatedTokens > MAX_ESTIMATED_TOKENS) {
      console.log(`Estimated tokens (${estimatedTokens}) exceed limit (${MAX_ESTIMATED_TOKENS}). Using mock data.`)
      return {
        success: true,
        recognizedStudents: await getMockRecognizedStudents(),
        timestamp: new Date().toISOString(),
        faceData: getMockFaceData(),
        note: "Used mock data due to image size constraints",
      }
    }

    // Get school configuration
    const schoolConfig = await getSchoolConfig()

    // Prepare a minimal prompt for Groq to reduce token usage
    const prompt = `Identify faces. Return JSON: {faces:[{id,age,gender,position}]}`

    // Check if facial recognition is enabled
    if (!env.ENABLE_FACIAL_RECOGNITION) {
      console.log("Facial recognition is disabled. Returning mock data.")
      return {
        success: true,
        recognizedStudents: await getMockRecognizedStudents(),
        timestamp: new Date().toISOString(),
        faceData: getMockFaceData(),
      }
    }

    try {
      // Call Groq API for face recognition - with optimized image
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content: prompt,
            },
            {
              role: "user",
              content: `Image: data:image/jpeg;base64,${base64Image}`,
            },
          ],
          max_tokens: 500, // Reduced from 1024
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()

      // Extract face data from Groq response
      let faceData
      try {
        // Parse the JSON from the Groq response
        const content = data.choices[0].message.content
        // Extract JSON from the response (it might be wrapped in markdown code blocks)
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/)
        const jsonString = jsonMatch ? jsonMatch[1] : content
        faceData = JSON.parse(jsonString.trim())
      } catch (error) {
        console.error("Error parsing face data:", error)
        faceData = { faces: [] }
      }

      // Match recognized faces with student database
      const recognizedStudents = await matchFacesWithStudents(faceData.faces || [])

      // Log attendance to Monad blockchain
      if (recognizedStudents.length > 0 && env.ENABLE_BLOCKCHAIN_VERIFICATION) {
        await logAttendanceToBlockchain(recognizedStudents)
      }

      // Revalidate the attendance page
      revalidatePath("/attendance")

      return {
        success: true,
        recognizedStudents,
        timestamp: new Date().toISOString(),
        faceData: faceData.faces || [],
      }
    } catch (error: any) {
      console.error("Error calling Groq API:", error)

      // Fallback to mock data if Groq API fails
      console.log("Falling back to mock data due to API error")
      return {
        success: true,
        recognizedStudents: await getMockRecognizedStudents(),
        timestamp: new Date().toISOString(),
        faceData: getMockFaceData(),
        note: "Used mock data due to API error: " + error.message,
      }
    }
  } catch (error: any) {
    console.error("Error in face recognition:", error)
    throw new Error(error.message || "Failed to process face recognition")
  }
}

// Function to match faces with students in the database
async function matchFacesWithStudents(faces: any[]) {
  // In a real implementation, this would query a database and use face embeddings
  // For demo purposes, we'll simulate with a delay and return random students
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // If no faces detected, return empty array
  if (!faces || faces.length === 0) return []

  // Get students from our database (simulated)
  const students = await getStudentsFromDatabase()

  // For demo purposes, randomly select students based on number of faces detected
  const shuffled = [...students].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(faces.length, 3))
}

// Function to get students from database (simulated)
async function getStudentsFromDatabase() {
  // Get school configuration for student ID format
  const schoolConfig = await getSchoolConfig()
  const idPrefix = schoolConfig.studentIdPrefix

  // In a real implementation, this would query a database
  // For demo purposes, we'll return a static list with the school's ID format
  return [
    {
      id: `${idPrefix}/CSE/2022/001`,
      name: "Aarav Sharma",
      enrollmentStatus: "Active",
      department: "Computer Science",
      year: "3rd Year",
      course: "B.Tech",
    },
    {
      id: `${idPrefix}/CSE/2022/015`,
      name: "Diya Patel",
      enrollmentStatus: "Active",
      department: "Computer Science",
      year: "3rd Year",
      course: "B.Tech",
    },
    {
      id: `${idPrefix}/CSE/2022/032`,
      name: "Arjun Singh",
      enrollmentStatus: "Active",
      department: "Computer Science",
      year: "3rd Year",
      course: "B.Tech",
    },
    {
      id: `${idPrefix}/CSE/2022/047`,
      name: "Ananya Gupta",
      enrollmentStatus: "Active",
      department: "Computer Science",
      year: "3rd Year",
      course: "B.Tech",
    },
    {
      id: `${idPrefix}/CSE/2022/053`,
      name: "Vihaan Reddy",
      enrollmentStatus: "Active",
      department: "Computer Science",
      year: "3rd Year",
      course: "B.Tech",
    },
    {
      id: `${idPrefix}/CSE/2022/068`,
      name: "Ishaan Malhotra",
      enrollmentStatus: "Active",
      department: "Computer Science",
      year: "3rd Year",
      course: "B.Tech",
    },
    {
      id: `${idPrefix}/CSE/2022/074`,
      name: "Anika Verma",
      enrollmentStatus: "Active",
      department: "Computer Science",
      year: "3rd Year",
      course: "B.Tech",
    },
    {
      id: `${idPrefix}/CSE/2022/089`,
      name: "Rohan Kapoor",
      enrollmentStatus: "Active",
      department: "Computer Science",
      year: "3rd Year",
      course: "B.Tech",
    },
    {
      id: `${idPrefix}/CSE/2022/092`,
      name: "Saanvi Mehta",
      enrollmentStatus: "Active",
      department: "Computer Science",
      year: "3rd Year",
      course: "B.Tech",
    },
    {
      id: `${idPrefix}/CSE/2022/108`,
      name: "Advait Choudhary",
      enrollmentStatus: "Active",
      department: "Computer Science",
      year: "3rd Year",
      course: "B.Tech",
    },
  ]
}

// Function to log attendance to Monad blockchain
async function logAttendanceToBlockchain(students: any[]) {
  try {
    // In a real implementation, this would connect to the Monad blockchain
    // and log the attendance records using a smart contract

    // For now, we'll simulate the blockchain interaction
    console.log(`Logging attendance to blockchain from wallet ${METAMASK_WALLET_ID}`)
    console.log("Students:", students.map((s) => s.id).join(", "))

    // Simulate blockchain transaction
    const transactionHash = "0x" + Math.random().toString(16).substring(2, 42)

    return {
      success: true,
      transactionHash,
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error("Error logging to blockchain:", error)
    throw new Error(error.message || "Failed to log attendance to blockchain")
  }
}

// Mock data for testing when facial recognition is disabled
function getMockFaceData() {
  return [
    {
      id: "face_1",
      age: "20-25",
      gender: "Male",
      features: "Glasses, short hair",
      position: "center", // String value instead of object
    },
    {
      id: "face_2",
      age: "19-22",
      gender: "Female",
      features: "Long hair",
      position: "right", // String value instead of object
    },
  ]
}

// Mock recognized students for testing
async function getMockRecognizedStudents() {
  const students = await getStudentsFromDatabase()
  return students.slice(0, 2)
}
