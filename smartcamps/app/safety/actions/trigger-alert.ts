"use server"

import { revalidatePath } from "next/cache"

// Import the FluvioSimulator from the subscribe-to-alerts file
// In a real implementation, we would import the Fluvio client directly
// import { Fluvio } from '@fluvio/client';

// Reuse the FluvioSimulator class from subscribe-to-alerts.ts
// This is a simplified version for demo purposes
class FluvioSimulator {
  private static instance: FluvioSimulator
  private connected = false
  private topics: Map<string, any[]> = new Map()

  private constructor() {
    // Initialize topics
    this.topics.set("campus-alerts", [])
    console.log("Fluvio simulator initialized")
  }

  public static getInstance(): FluvioSimulator {
    if (!FluvioSimulator.instance) {
      FluvioSimulator.instance = new FluvioSimulator()
    }
    return FluvioSimulator.instance
  }

  public async connect(): Promise<boolean> {
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    this.connected = true
    console.log("Connected to Fluvio")
    return true
  }

  public async subscribe(topic: string): Promise<any[]> {
    if (!this.connected) {
      throw new Error("Not connected to Fluvio")
    }

    if (!this.topics.has(topic)) {
      this.topics.set(topic, [])
    }

    console.log(`Subscribed to topic: ${topic}`)
    return this.topics.get(topic) || []
  }

  public async publish(topic: string, message: any): Promise<void> {
    if (!this.connected) {
      throw new Error("Not connected to Fluvio")
    }

    if (!this.topics.has(topic)) {
      this.topics.set(topic, [])
    }

    const topicMessages = this.topics.get(topic) || []
    topicMessages.unshift({
      ...message,
      timestamp: new Date().toISOString(),
    })

    // Keep only the last 10 messages
    if (topicMessages.length > 10) {
      topicMessages.pop()
    }

    this.topics.set(topic, topicMessages)
    console.log(`Published to topic ${topic}:`, message)
  }

  public async getMessages(topic: string): Promise<any[]> {
    if (!this.connected) {
      throw new Error("Not connected to Fluvio")
    }

    return this.topics.get(topic) || []
  }
}

export async function triggerAlert(alertData: any) {
  try {
    const fluvio = FluvioSimulator.getInstance()

    // Connect to Fluvio if not already connected
    if (!fluvio.connected) {
      await fluvio.connect()
    }

    // Prepare the alert data
    const alert = {
      title: alertData.title,
      message: alertData.message,
      severity: alertData.severity,
      location: alertData.location,
      time: new Date().toLocaleTimeString(),
      triggeredBy: "System Admin", // In a real app, this would be the current user
    }

    // Publish the alert to Fluvio
    await fluvio.publish("campus-alerts", alert)

    // Simulate broadcasting delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Revalidate the safety page
    revalidatePath("/safety")

    return {
      success: true,
      alertId: Math.floor(Math.random() * 1000000),
      message: "Alert successfully broadcast to all connected devices",
    }
  } catch (error: any) {
    console.error("Error triggering alert:", error)
    return {
      success: false,
      error: error.message || "Failed to trigger alert",
    }
  }
}
