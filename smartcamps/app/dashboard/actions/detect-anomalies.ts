"use server"

import { revalidatePath } from "next/cache"
import { env } from "@/app/lib/env"

export interface AnomalyDetectionInput {
  dataset: Array<{
    timestamp: string
    value: number
    category: string
  }>
}

export interface AnomalyDetectionResult {
  anomalies: Array<{
    timestamp: string
    value: number
    category: string
    score: number
    reason: string
  }>
  summary: {
    totalPoints: number
    anomalyCount: number
    anomalyPercentage: number
  }
}

export async function detectAnomalies(input: AnomalyDetectionInput): Promise<AnomalyDetectionResult> {
  const prompt = `Analyze this time series data for anomalies:
${JSON.stringify(input.dataset, null, 2)}

Return a JSON object with this exact structure:
{
  "anomalies": [
    {
      "timestamp": "the timestamp of the anomaly",
      "value": numeric value,
      "category": "the category",
      "score": number between 0-100,
      "reason": "brief explanation of why this is anomalous"
    }
  ]
}

Only include data points that are truly anomalous based on:
1. Statistical significance (z-score > 2)
2. Sudden changes in value
3. Category-specific patterns
4. Historical context

Keep response focused and concise. Return valid JSON only.`

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: "You are an AI anomaly detection system. Respond with valid JSON only."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    })
  })

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const result = JSON.parse(data.choices[0].message.content.trim())

  // Ensure anomalies array exists
  if (!Array.isArray(result.anomalies)) {
    throw new Error("Invalid response format from Groq API")
  }

  // Calculate summary stats
  const summary = {
    totalPoints: input.dataset.length,
    anomalyCount: result.anomalies.length,
    anomalyPercentage: (result.anomalies.length / input.dataset.length) * 100
  }

  revalidatePath("/dashboard")

  return {
    anomalies: result.anomalies,
    summary
  }
}