
"use server"

import { revalidatePath } from "next/cache"
import { env } from "@/app/lib/env"

export interface AnomalyDetectionInput {
  dataset: Array<{
    timestamp: string
    value: number
    category: string
  }>
  threshold?: number
  sensitivity?: number
}

export interface AnomalyDetectionResult {
  anomalies: Array<{
    timestamp: string
    value: number
    category: string
    score: number
    reason: string
  }>
  normalData: Array<{
    timestamp: string
    value: number
    category: string
  }>
  summary: {
    totalPoints: number
    anomalyCount: number
    anomalyPercentage: number
  }
}

export async function detectAnomalies(input: AnomalyDetectionInput): Promise<AnomalyDetectionResult> {
  try {
    const prompt = `Analyze this time series data for anomalies. For each data point, determine if it's anomalous based on statistical patterns and domain context.
Input data: ${JSON.stringify(input.dataset)}

Detect anomalies and explain why they are anomalous. Focus on:
1. Statistical deviation from mean/median
2. Sudden changes or spikes
3. Contextual patterns for each category
4. Historical trends and seasonality

Format response as valid JSON only:
{
  "anomalies": [
    {
      "timestamp": "...",
      "value": number,
      "category": "...",
      "score": number between 0-100,
      "reason": "brief explanation"
    }
  ]
}`

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
            content: "You are an AI anomaly detection system focused on analyzing time series data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error("Invalid Groq API response format")
    }

    const aiResponse = JSON.parse(data.choices[0].message.content.trim())
    
    if (!Array.isArray(aiResponse?.anomalies)) {
      throw new Error("Invalid anomaly detection response format")
    }

    // Filter normal data points
    const normalData = input.dataset.filter(
      point => !aiResponse.anomalies.some(a => a.timestamp === point.timestamp)
    )

    const result: AnomalyDetectionResult = {
      anomalies: aiResponse.anomalies,
      normalData,
      summary: {
        totalPoints: input.dataset.length,
        anomalyCount: aiResponse.anomalies.length,
        anomalyPercentage: (aiResponse.anomalies.length / input.dataset.length) * 100
      }
    }

    revalidatePath("/dashboard")
    return result
  } catch (error: any) {
    console.error("Error in AI anomaly detection:", error)
    return generateStatisticalAnomalies(input)
  }
}

function generateStatisticalAnomalies(input: AnomalyDetectionInput): AnomalyDetectionResult {
  const values = input.dataset.map(d => d.value)
  const mean = values.reduce((a, b) => a + b) / values.length
  const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length)
  const threshold = 2 * stdDev

  const anomalies = input.dataset
    .filter(point => Math.abs(point.value - mean) > threshold)
    .map(point => ({
      timestamp: point.timestamp,
      value: point.value,
      category: point.category,
      score: Math.min(100, Math.round(Math.abs(point.value - mean) / stdDev * 25)),
      reason: `Value deviates significantly from mean (${point.value.toFixed(2)} vs ${mean.toFixed(2)})`
    }))

  return {
    anomalies,
    normalData: input.dataset.filter(point => !anomalies.some(a => a.timestamp === point.timestamp)),
    summary: {
      totalPoints: input.dataset.length,
      anomalyCount: anomalies.length,
      anomalyPercentage: (anomalies.length / input.dataset.length) * 100
    }
  }
}
