"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, Info, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { subscribeToAlerts } from "../actions/subscribe-to-alerts"

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

  // Subscribe to real-time alerts
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const subscribe = async () => {
      try {
        setIsSubscribed(true)

        // In a real implementation, we would use Fluvio to subscribe to alerts
        // For demo purposes, we'll simulate with polling
        intervalId = setInterval(async () => {
          const newAlerts = await subscribeToAlerts()
          if (newAlerts.alerts.length > 0) {
            setAlerts((prev) => [...newAlerts.alerts, ...prev].slice(0, 5))

            // Show browser notification for critical alerts
            if (newAlerts.alerts.some((a) => a.severity === "critical") && Notification.permission === "granted") {
              new Notification("CRITICAL CAMPUS ALERT", {
                body: newAlerts.alerts.find((a) => a.severity === "critical")?.message,
                icon: "/favicon.ico",
              })
            }
          }
        }, 10000) // Poll every 10 seconds
      } catch (error) {
        console.error("Error subscribing to alerts:", error)
        setIsSubscribed(false)
      }
    }

    // Request notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission()
    }

    subscribe()

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Active Alerts</CardTitle>
        <Badge variant={isSubscribed ? "success" : "outline"} className="flex items-center gap-1">
          <Bell className="h-3 w-3" />
          {isSubscribed ? "Connected" : "Disconnected"}
        </Badge>
      </CardHeader>
      <CardContent>
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
                      {alert.location} • {alert.time}
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
