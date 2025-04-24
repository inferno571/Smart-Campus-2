"use client"

import { useState } from "react"
import { DataInputForm } from "./data-input-form"
import { ActivityChart } from "./activity-chart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { detectAnomalies, type AnomalyDetectionInput, type AnomalyDetectionResult } from "../actions/detect-anomalies"

export function AnomalyDetectionSystem() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<AnomalyDetectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const { toast } = useToast()

  // Update the handleSubmit function to be more robust
  const handleSubmit = async (data: AnomalyDetectionInput) => {
    setIsProcessing(true)
    setError(null)
    setWarning(null)

    try {
      // Validate input data
      if (!data.dataset || data.dataset.length === 0) {
        throw new Error("No data provided for analysis")
      }

      // Add a try-catch block to handle any errors from the detectAnomalies function
      try {
        const anomalyResult = await detectAnomalies(data)
        setResult(anomalyResult)

        // Check if we're using statistical analysis
        if (
          anomalyResult.anomalies.length > 0 &&
          anomalyResult.anomalies.every((a) => a.reason && a.reason.includes("standard deviations"))
        ) {
          setWarning(
            "Using statistical analysis for anomaly detection. The results are based on standard deviation from the mean.",
          )
        }

        // Show success toast
        toast({
          title: "Analysis Complete",
          description: `Analyzed ${anomalyResult.summary.totalPoints} data points and found ${anomalyResult.summary.anomalyCount} anomalies.`,
        })
      } catch (detectionError: any) {
        console.error("Error in anomaly detection:", detectionError)

        // Create a fallback result using statistical analysis
        const mockAnomalies = generateStatisticalAnomalies(data.dataset)
        const mockNormalData = data.dataset.filter(
          (item) => !mockAnomalies.some((anomaly) => anomaly.timestamp === item.timestamp),
        )

        const fallbackResult = {
          anomalies: mockAnomalies,
          normalData: mockNormalData.map((item) => ({
            timestamp: item.timestamp,
            value: item.value,
            category: item.category,
          })),
          summary: {
            totalPoints: data.dataset.length,
            anomalyCount: mockAnomalies.length,
            anomalyPercentage: (mockAnomalies.length / data.dataset.length) * 100,
          },
        }

        setResult(fallbackResult)
        setWarning("Using statistical analysis for anomaly detection due to an error with the AI service.")
        setError(`Error with AI analysis: ${detectionError.message}. Using statistical analysis instead.`)

        toast({
          title: "Fallback Analysis Complete",
          description: `Analyzed ${fallbackResult.summary.totalPoints} data points using statistical methods.`,
        })
      }
    } catch (err: any) {
      console.error("Error in form submission:", err)
      const errorMessage = err.message || "Failed to process data"
      setError(errorMessage)

      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <DataInputForm onSubmit={handleSubmit} isProcessing={isProcessing} />
        </div>
        <div className="md:col-span-2">
          <ActivityChart data={result} isLoading={isProcessing} />
        </div>
      </div>

      {warning && (
        <Alert variant="default" className="bg-yellow-50 text-yellow-800 border-yellow-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && result.summary && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Analysis Summary</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-muted/30 rounded-md p-4">
              <p className="text-sm text-muted-foreground">Total Data Points</p>
              <p className="text-2xl font-bold">{result.summary.totalPoints}</p>
            </div>
            <div className="bg-muted/30 rounded-md p-4">
              <p className="text-sm text-muted-foreground">Anomalies Detected</p>
              <p className="text-2xl font-bold">{result.summary.anomalyCount}</p>
            </div>
            <div className="bg-muted/30 rounded-md p-4">
              <p className="text-sm text-muted-foreground">Anomaly Percentage</p>
              <p className="text-2xl font-bold">{result.summary.anomalyPercentage.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Add this helper function to the component for client-side fallback
function generateStatisticalAnomalies(dataset: AnomalyDetectionInput["dataset"], threshold = 2) {
  // Find potential anomalies based on simple statistical analysis
  const values = dataset.map((item) => item.value)
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length)

  // Consider points that are more than threshold standard deviations from the mean as anomalies
  return dataset
    .filter((item) => Math.abs(item.value - mean) > threshold * stdDev)
    .map((item) => ({
      timestamp: item.timestamp,
      value: item.value,
      category: item.category,
      score: Math.min(100, Math.round((Math.abs(item.value - mean) / stdDev) * 25)),
      reason: `Value ${item.value} deviates significantly from the mean (${mean.toFixed(2)}) by ${Math.abs(item.value - mean).toFixed(2)} units, which is more than ${threshold} standard deviations (${stdDev.toFixed(2)}).`,
    }))
    .slice(0, Math.max(1, Math.floor(dataset.length * 0.1))) // Limit to at most 10% of the data
}
