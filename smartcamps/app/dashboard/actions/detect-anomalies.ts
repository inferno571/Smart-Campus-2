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
    const prompt = `As an AI anomaly detection system, analyze this time series data:
    ${JSON.stringify(input.dataset, null, 2)}

    For each data point, determine if it is an anomaly by considering:
    1. Deviation from moving average
    2. Rate of change
    3. Contextual patterns based on category
    4. Historical trends

    Return JSON only with this structure:
    {
      "anomalies": [{
        "timestamp": string,
        "value": number,
        "category": string,
        "score": number (0-100),
        "reason": string
      }],
      "analysis": {
        "mean": number,
        "stdDev": number,
        "trendDescription": string
      }
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
            content: "You are an expert anomaly detection system specializing in time series analysis."
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
      throw new Error(`Groq API error: ${response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = JSON.parse(data.choices[0].message.content)

    // Process anomalies
    const normalData = input.dataset.filter(
      (point) => !aiResponse.anomalies.some((a: any) => a.timestamp === point.timestamp)
    )

    const result: AnomalyDetectionResult = {
      anomalies: aiResponse.anomalies,
      normalData: normalData,
      summary: {
        totalPoints: input.dataset.length,
        anomalyCount: aiResponse.anomalies.length,
        anomalyPercentage: (aiResponse.anomalies.length / input.dataset.length) * 100
      }
    }

    revalidatePath("/dashboard")
    return result
  } catch (error: any) {
    console.error("Error in anomaly detection:", error)
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
      reason: `Value deviates from mean by ${Math.abs(point.value - mean).toFixed(2)} units (${(Math.abs(point.value - mean) / stdDev).toFixed(1)} standard deviations)`
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