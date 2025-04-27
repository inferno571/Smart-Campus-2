"use server"

import { revalidatePath } from "next/cache"
import { publishAlert } from "./subscribe-to-alerts"

export async function triggerAlert(alertData: any) {
  try {
    // Prepare the alert data
    const alert = {
      title: alertData.title,
      message: alertData.message,
      severity: alertData.severity,
      location: alertData.location,
      timestamp: new Date().toISOString(),
      time: new Date().toLocaleTimeString(),
      triggeredBy: "System Admin", // In a real app, this would be the current user
    }

    // Publish the alert using our server action
    const result = await publishAlert(alert)

    if (!result.success) {
      throw new Error(result.error || "Failed to publish alert")
    }

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
