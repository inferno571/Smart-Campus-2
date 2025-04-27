"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, Info, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { subscribeToAlerts, generateSampleAlert } from "../actions/subscribe-to-alerts"

// Alert severity levels
const severityColors = {
  critical: "bg-red-100 text-red-800 border-red-800/20 dark:bg-red-900/30 dark:text-red-300",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-800/20 dark:bg-yellow-900/30 dark:text-yellow-300",
  info: "bg-blue-100 text-blue-800 border-blue-800/20 dark:bg-blue-900/30 dark:text-blue-300",
}

// Alert icons
const severityIcons = {
  critical: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
}

export function SafetyAlerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Subscribe to real-time alerts
  useEffect(() => {
    let intervalId: NodeJS.Timeout
    let mounted = true

    const subscribe = async () => {
      try {
        if (!mounted) return

        setIsSubscribed(true)

        // Initial fetch
        const initialAlerts = await subscribeToAlerts()
        if (initialAlerts.alerts && initialAlerts.alerts.length > 0 && mounted) {
          setAlerts(initialAlerts.alerts)
          setLastUpdate(new Date())
        }

        // Poll for updates
        intervalId = setInterval(async () => {
          if (!mounted) return

          try {
            const newAlerts = await subscribeToAlerts()
            if (newAlerts.alerts && newAlerts.alerts.length > 0 && mounted) {
              // Check if we have new alerts
              if (JSON.stringify(newAlerts.alerts) !== JSON.stringify(alerts)) {
                setAlerts(newAlerts.alerts)
                setLastUpdate(new Date())
              }
            }
          } catch (error) {
            console.error("Error polling alerts:", error)
          }
        }, 3000) // Poll every 3 seconds
      } catch (error) {
        console.error("Error subscribing to alerts:", error)
        if (mounted) {
          setIsSubscribed(false)
        }
      }
    }

    // Request notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission()
    }

    subscribe()

    // Generate a sample info alert after 5 seconds if no alerts
    const sampleAlertTimeout = setTimeout(() => {
      if (mounted && alerts.length <= 1) {
        generateSampleAlert("info")
      }
    }, 5000)

    return () => {
      mounted = false
      if (intervalId) clearInterval(intervalId)
      clearTimeout(sampleAlertTimeout)
    }
  }, [alerts.length])

  // Function to manually trigger a test alert
  const triggerTestAlert = async (severity: "info" | "warning" | "critical") => {
    try {
      await generateSampleAlert(severity)
      // Force immediate refresh
      const newAlerts = await subscribeToAlerts()
      if (newAlerts.alerts && newAlerts.alerts.length > 0) {
        setAlerts(newAlerts.alerts)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error("Error generating test alert:", error)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Active Alerts</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={isSubscribed ? "success" : "outline"} className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            {isSubscribed ? "Connected" : "Disconnected"}
          </Badge>
          <span className="text-xs text-muted-foreground">Last update: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </CardHeader>
      <CardContent className="max-h-[500px] overflow-y-auto">
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert, index) => {
              const AlertIcon = severityIcons[alert.severity as keyof typeof severityIcons] || Info

              return (
                <Alert
                  key={index}
                  className={cn("border", severityColors[alert.severity as keyof typeof severityColors])}
                >
                  <AlertIcon className="h-4 w-4" />
                  <AlertTitle className="flex items-center gap-2">
                    {alert.title}
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-2 capitalize",
                        alert.severity === "critical" && "bg-red-100 text-red-800 border-red-300",
                        alert.severity === "warning" && "bg-yellow-100 text-yellow-800 border-yellow-300",
                        alert.severity === "info" && "bg-blue-100 text-blue-800 border-blue-300",
                      )}
                    >
                      {alert.severity}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>
                    <div className="mt-1">{alert.message}</div>
                    <div className="mt-2 text-xs opacity-70">
                      {alert.location} • {alert.time || new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </AlertDescription>
                </Alert>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground opacity-20 mb-2" />
            <p className="text-muted-foreground">No active alerts at this time</p>
            <p className="text-xs text-muted-foreground mt-1">The system is monitoring campus safety in real-time</p>

            {/* Test buttons - only visible in development */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => triggerTestAlert("info")}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
              >
                Test Info Alert
              </button>
              <button
                onClick={() => triggerTestAlert("warning")}
                className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
              >
                Test Warning Alert
              </button>
              <button
                onClick={() => triggerTestAlert("critical")}
                className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
              >
                Test Critical Alert
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
