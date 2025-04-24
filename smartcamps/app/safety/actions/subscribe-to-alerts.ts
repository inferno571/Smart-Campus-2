"use server"

// In a real implementation, we would import the Fluvio client
// import { Fluvio } from '@fluvio/client';

// Simulate Fluvio connection
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

// Function to subscribe to Fluvio alerts
export async function subscribeToAlerts() {
  try {
    const fluvio = FluvioSimulator.getInstance()

    // Connect to Fluvio if not already connected
    if (!fluvio.connected) {
      await fluvio.connect()
    }

    // Subscribe to the campus-alerts topic
    await fluvio.subscribe("campus-alerts")

    // Get the latest messages
    const messages = await fluvio.getMessages("campus-alerts")

    // If there are no messages, randomly generate one for demo purposes
    if (messages.length === 0 && Math.random() < 0.3) {
      // Generate a random alert
      const alertTypes = [
        {
          title: "Fire Alarm Activated",
          message:
            "A fire alarm has been activated in the Science Building. Please evacuate immediately and follow emergency procedures.",
          severity: "critical",
          location: "Science Building",
        },
        {
          title: "Weather Alert",
          message: "Severe weather warning in effect. Seek shelter indoors and stay away from windows.",
          severity: "warning",
          location: "All Campus",
        },
        {
          title: "Power Outage",
          message:
            "Power outage reported in the Library and surrounding buildings. Maintenance teams have been dispatched.",
          severity: "info",
          location: "Library",
        },
        {
          title: "Suspicious Activity",
          message:
            "Suspicious activity reported near the North Parking Lot. Campus security has been notified and is investigating.",
          severity: "warning",
          location: "North Parking Lot",
        },
        {
          title: "Chemical Spill",
          message:
            "Chemical spill reported in Chemistry Lab 101. Hazmat team responding. Please avoid the area until further notice.",
          severity: "critical",
          location: "Chemistry Building",
        },
      ]

      const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)]

      // Publish the alert to Fluvio
      await fluvio.publish("campus-alerts", {
        ...randomAlert,
        time: new Date().toLocaleTimeString(),
      })

      // Get the updated messages
      const updatedMessages = await fluvio.getMessages("campus-alerts")
      return { alerts: updatedMessages }
    }

    return { alerts: messages }
  } catch (error) {
    console.error("Error subscribing to alerts:", error)
    return { alerts: [] }
  }
}
