"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, RefreshCw, Zap, TrendingUp } from "lucide-react"
import { detectAnomalies } from "../actions/detect-anomalies"

export function AnomalyDetection() {
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadAnomalies = async () => {
    try {
      setIsLoading(true)
      const result = await detectAnomalies()
      setAnomalies(result.anomalies)
    } catch (error) {
      console.error("Error detecting anomalies:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Load anomalies on component mount
  useEffect(() => {
    loadAnomalies()
  }, [])

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Anomaly Detection</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAnomalies} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {anomalies.length > 0 ? (
          <div className="space-y-3">
            {anomalies.map((anomaly, index) => (
              <Alert key={index} variant="destructive" className="bg-red-50 text-red-800 border-red-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center gap-2 text-red-800">
                  {anomaly.title}
                  <Badge variant="outline" className="ml-2 bg-red-100 text-red-800 border-red-300">
                    {anomaly.severity}
                  </Badge>
                </AlertTitle>
                <AlertDescription className="text-red-700">
                  <div className="mt-1">{anomaly.description}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Current: {anomaly.value} kWh</span>
                    <span>Expected: {anomaly.expectedRange} kWh</span>
                  </div>
                  <div className="mt-2 text-xs">
                    {anomaly.location} • Detected at {anomaly.time}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center h-[300px]">
            {isLoading ? (
              <>
                <RefreshCw className="h-12 w-12 text-muted-foreground opacity-20 mb-2 animate-spin" />
                <p className="text-muted-foreground">Analyzing energy patterns with Groq...</p>
              </>
            ) : (
              <>
                <Zap className="h-12 w-12 text-muted-foreground opacity-20 mb-2" />
                <p className="text-muted-foreground">No anomalies detected</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Energy consumption patterns are within normal ranges
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
