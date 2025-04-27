"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, Info, ShieldAlert, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { subscribeToAlerts } from "../actions/subscribe-to-alerts"

// Alert severity levels
const severityColors = {
  critical: "bg-red-100 text-red-800 border-red-300",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  info: "bg-blue-100 text-blue-800 border-blue-300",
}

// Alert icons
const severityIcons = {
  critical: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
}

export function AlertHistory() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true)
        const response = await subscribeToAlerts()
        if (response.alerts && response.alerts.length > 0) {
          // Sort by timestamp (newest first)
          const sortedAlerts = [...response.alerts].sort((a, b) => {
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
            return timeB - timeA
          })
          setAlerts(sortedAlerts)
        }
      } catch (error) {
        console.error("Error fetching alert history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  // Format the timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString()
    } catch (e) {
      return timestamp
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Alert History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Bell className="h-6 w-6 animate-pulse text-muted-foreground" />
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert, index) => {
              const AlertIcon = severityIcons[alert.severity as keyof typeof severityIcons] || Info

              return (
                <div
                  key={index}
                  className={cn(
                    "rounded-md border p-3",
                    severityColors[alert.severity as keyof typeof severityColors] || "bg-gray-100",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <AlertIcon className="h-4 w-4" />
                      <span className="font-medium">{alert.title}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          alert.severity === "critical" && "bg-red-100 text-red-800 border-red-300",
                          alert.severity === "warning" && "bg-yellow-100 text-yellow-800 border-yellow-300",
                          alert.severity === "info" && "bg-blue-100 text-blue-800 border-blue-300",
                        )}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {alert.time || formatTime(alert.timestamp)}
                    </div>
                  </div>
                  <div className="mt-2 text-sm">{alert.message}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{alert.location}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground opacity-20 mb-2" />
            <p className="text-muted-foreground">No alert history available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Alert history will be displayed here once alerts are triggered
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
