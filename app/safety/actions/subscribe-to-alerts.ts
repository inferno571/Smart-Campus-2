"use server"

import { revalidatePath } from "next/cache"

// In-memory cache for alerts in development/preview mode
let alertsCache: any[] = [
  {
    title: "System Notice",
    message: "Alert system is initializing. Real-time alerts will appear here.",
    severity: "info",
    location: "Campus-wide",
    timestamp: new Date().toISOString(),
    time: new Date().toLocaleTimeString(),
  },
]

// Server-side function to get alerts
export async function subscribeToAlerts() {
  try {
    // In a real implementation, this would use the Fluvio client
    // For the preview environment, we'll use the in-memory cache

    // Return the cached alerts
    return { alerts: alertsCache }
  } catch (error) {
    console.error("Error subscribing to alerts:", error)
    return {
      alerts: alertsCache,
      error: (error as Error).message,
    }
  }
}

// Server-side function to publish an alert
export async function publishAlert(alert: any) {
  try {
    // Add timestamp if not present
    if (!alert.timestamp) {
      alert.timestamp = new Date().toISOString()
    }

    // Add time if not present
    if (!alert.time) {
      alert.time = new Date().toLocaleTimeString()
    }

    // In a real implementation, this would publish to Fluvio
    // For the preview environment, we'll add to the in-memory cache
    alertsCache = [alert, ...alertsCache].slice(0, 10)

    // Revalidate the safety page
    revalidatePath("/safety")

    return { success: true }
  } catch (error) {
    console.error("Error publishing alert:", error)
    return {
      success: false,
      error: (error as Error).message,
    }
  }
}

// Generate a sample alert (for testing)
export async function generateSampleAlert(severity: "info" | "warning" | "critical" = "info") {
  const locations = ["Main Building", "Library", "Student Center", "Science Building", "Engineering Building"]
  const location = locations[Math.floor(Math.random() * locations.length)]

  let title, message

  switch (severity) {
    case "critical":
      title = "Emergency Alert"
      message = `Immediate evacuation required at ${location} due to security threat`
      break
    case "warning":
      title = "Weather Warning"
      message = `Strong winds expected near ${location}. Secure loose items.`
      break
    default:
      title = "Information Notice"
      message = `Scheduled maintenance in ${location} today`
  }

  const alert = {
    title,
    message,
    severity,
    location,
    timestamp: new Date().toISOString(),
    time: new Date().toLocaleTimeString(),
  }

  return publishAlert(alert)
}
