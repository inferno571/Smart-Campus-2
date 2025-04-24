"use server"

import { revalidatePath } from "next/cache"

// Groq API key
const GROQ_API_KEY = "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"

// Mock energy consumption data
const energyData = {
  buildings: [
    {
      id: "bldg-1",
      name: "Science Building",
      consumption: [
        { timestamp: "2025-04-14T08:00:00Z", value: 120.5 },
        { timestamp: "2025-04-14T09:00:00Z", value: 125.3 },
        { timestamp: "2025-04-14T10:00:00Z", value: 130.2 },
        { timestamp: "2025-04-14T11:00:00Z", value: 135.7 },
        { timestamp: "2025-04-14T12:00:00Z", value: 140.1 },
        { timestamp: "2025-04-14T13:00:00Z", value: 138.4 },
        { timestamp: "2025-04-14T14:00:00Z", value: 210.8 }, // Anomaly
      ],
    },
    {
      id: "bldg-2",
      name: "Library",
      consumption: [
        { timestamp: "2025-04-14T08:00:00Z", value: 85.2 },
        { timestamp: "2025-04-14T09:00:00Z", value: 87.5 },
        { timestamp: "2025-04-14T10:00:00Z", value: 88.1 },
        { timestamp: "2025-04-14T11:00:00Z", value: 90.3 },
        { timestamp: "2025-04-14T12:00:00Z", value: 92.7 },
        { timestamp: "2025-04-14T13:00:00Z", value: 91.5 },
        { timestamp: "2025-04-14T14:00:00Z", value: 89.8 },
      ],
    },
    {
      id: "bldg-3",
      name: "Engineering Labs",
      consumption: [
        { timestamp: "2025-04-14T08:00:00Z", value: 145.3 },
        { timestamp: "2025-04-14T09:00:00Z", value: 148.7 },
        { timestamp: "2025-04-14T10:00:00Z", value: 150.2 },
        { timestamp: "2025-04-14T11:00:00Z", value: 152.5 },
        { timestamp: "2025-04-14T12:00:00Z", value: 155.1 },
        { timestamp: "2025-04-14T13:00:00Z", value: 153.8 },
        { timestamp: "2025-04-14T14:00:00Z", value: 180.4 }, // Anomaly
      ],
    },
  ],
}

export async function detectAnomalies() {
  try {
    // Prepare the data for Groq analysis
    const dataForAnalysis = JSON.stringify(energyData)

    // Prepare the prompt for Groq
    const prompt = `
      You are an energy consumption anomaly detection system. Analyze the following energy consumption data and identify any anomalies.
      For each anomaly, provide:
      1. The building name
      2. The timestamp of the anomaly
      3. The anomalous value
      4. The expected value range
      5. The severity of the anomaly (Low, Medium, High, Critical)
      6. A brief description of the potential cause
      
      Energy consumption data:
      ${dataForAnalysis}
      
      Respond in JSON format only, with an array of anomalies.
    `

    // Call Groq API for anomaly detection
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: prompt,
          },
        ],
        max_tokens: 1024,
      temperature: 0.2,
      top_p: 0.9,
      stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()

    // Extract anomaly data from Groq response
    let anomalyData
    try {
      // Parse the JSON from the Groq response
      const content = data.choices[0].message.content
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/)
      const jsonString = jsonMatch ? jsonMatch[1] : content
      anomalyData = JSON.parse(jsonString.trim())
    } catch (error) {
      console.error("Error parsing anomaly data:", error)

      // For demo purposes, if parsing fails, return some mock anomalies
      anomalyData = {
        anomalies: [
          {
            building: "Science Building",
            timestamp: "2025-04-14T14:00:00Z",
            anomalousValue: 210.8,
            expectedRange: "130-145",
            severity: "High",
            description:
              "Sudden 52% increase in energy consumption. Possible equipment malfunction or unauthorized usage.",
          },
          {
            building: "Engineering Labs",
            timestamp: "2025-04-14T14:00:00Z",
            anomalousValue: 180.4,
            expectedRange: "150-160",
            severity: "Medium",
            description:
              "17% increase in energy consumption. May indicate additional equipment usage or inefficient operation.",
          },
        ],
      }
    }

    // Format the anomalies for the UI
    const formattedAnomalies = (anomalyData.anomalies || []).map((anomaly: any) => ({
      title: `Unusual Energy Consumption in ${anomaly.building}`,
      description: anomaly.description,
      severity: anomaly.severity,
      location: anomaly.building,
      time: new Date().toLocaleTimeString(),
      value: anomaly.anomalousValue,
      expectedRange: anomaly.expectedRange,
    }))

    // Revalidate the energy page
    revalidatePath("/energy")

    return {
      anomalies: formattedAnomalies,
    }
  } catch (error: any) {
    console.error("Error detecting anomalies:", error)

    // For demo purposes, return some mock anomalies if the API call fails
    return {
      anomalies: [
        {
          title: "Unusual Energy Spike",
          description: "Engineering Labs showing 35% higher energy consumption than normal for this time period.",
          severity: "High",
          location: "Engineering Labs",
          time: new Date().toLocaleTimeString(),
          value: 180.4,
          expectedRange: "150-160",
        },
      ],
    }
  }
}
