"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Upload, Info, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { AnomalyDetectionInput } from "../actions/detect-anomalies"

interface DataInputFormProps {
  onSubmit: (data: AnomalyDetectionInput) => Promise<void>
  isProcessing: boolean
}

export function DataInputForm({ onSubmit, isProcessing }: DataInputFormProps) {
  const [activeTab, setActiveTab] = useState("manual")
  const [manualData, setManualData] = useState("")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [threshold, setThreshold] = useState(2.0)
  const [sensitivity, setSensitivity] = useState(75)
  const { toast } = useToast()

  // Load sample data
  const loadSampleData = () => {
    const sampleData = `2023-01-01T08:00:00, 45, student_logins
2023-01-01T09:00:00, 78, student_logins
2023-01-01T10:00:00, 120, student_logins
2023-01-01T11:00:00, 142, student_logins
2023-01-01T12:00:00, 89, student_logins
2023-01-01T13:00:00, 65, student_logins
2023-01-01T14:00:00, 72, student_logins
2023-01-01T15:00:00, 250, student_logins
2023-01-01T16:00:00, 85, student_logins
2023-01-01T17:00:00, 62, student_logins
2023-01-02T08:00:00, 48, student_logins
2023-01-02T09:00:00, 82, student_logins
2023-01-02T10:00:00, 125, student_logins
2023-01-02T11:00:00, 138, student_logins
2023-01-02T12:00:00, 90, student_logins
2023-01-02T13:00:00, 67, student_logins
2023-01-02T14:00:00, 76, student_logins
2023-01-02T15:00:00, 81, student_logins
2023-01-02T16:00:00, 79, student_logins
2023-01-02T17:00:00, 58, student_logins`

    setManualData(sampleData)
  }

  // Handle manual data submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Parse the manual data
      const parsedData = parseManualData(manualData)

      if (parsedData.length === 0) {
        toast({
          title: "Invalid data format",
          description: "Please enter data in the correct format: timestamp, value, category (one per line)",
          variant: "destructive",
        })
        return
      }

      // Format the data for the API
      const inputData: AnomalyDetectionInput = {
        dataset: parsedData,
        threshold,
        sensitivity: sensitivity / 100,
      }

      // Submit the data
      await onSubmit(inputData)
    } catch (error: any) {
      toast({
        title: "Error processing data",
        description: error.message || "Failed to process the input data",
        variant: "destructive",
      })
    }
  }

  // Handle CSV file submission
  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!csvFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      })
      return
    }

    try {
      // Parse the CSV file
      const parsedData = await parseCSVFile(csvFile)

      if (parsedData.length === 0) {
        toast({
          title: "Invalid CSV format",
          description: "Please ensure your CSV has columns for timestamp, value, and category",
          variant: "destructive",
        })
        return
      }

      // Format the data for the API
      const inputData: AnomalyDetectionInput = {
        dataset: parsedData,
        threshold,
        sensitivity: sensitivity / 100,
      }

      // Submit the data
      await onSubmit(inputData)
    } catch (error: any) {
      toast({
        title: "Error processing CSV",
        description: error.message || "Failed to process the CSV file",
        variant: "destructive",
      })
    }
  }

  // Parse manual data input
  const parseManualData = (data: string) => {
    const lines = data.trim().split("\n")
    return lines.map((line) => {
      const [timestamp, valueStr, category] = line.split(",").map((item) => item.trim())
      const value = Number.parseFloat(valueStr)

      if (!timestamp || isNaN(value) || !category) {
        throw new Error("Invalid data format")
      }

      return { timestamp, value, category }
    })
  }

  // Parse CSV file
  const parseCSVFile = async (file: File) => {
    return new Promise<Array<{ timestamp: string; value: number; category: string }>>((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string
          const lines = csv.split("\n")
          const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

          // Find the column indices
          const timestampIndex = headers.findIndex((h) => h === "timestamp" || h === "date" || h === "time")
          const valueIndex = headers.findIndex((h) => h === "value" || h === "amount" || h === "count")
          const categoryIndex = headers.findIndex((h) => h === "category" || h === "type" || h === "class")

          if (timestampIndex === -1 || valueIndex === -1 || categoryIndex === -1) {
            reject(new Error("CSV must contain columns for timestamp, value, and category"))
            return
          }

          const data = lines
            .slice(1)
            .filter((line) => line.trim())
            .map((line) => {
              const columns = line.split(",").map((col) => col.trim())
              return {
                timestamp: columns[timestampIndex],
                value: Number.parseFloat(columns[valueIndex]),
                category: columns[categoryIndex],
              }
            })

          resolve(data)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error("Failed to read the file"))
      }

      reader.readAsText(file)
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Input</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Input</TabsTrigger>
            <TabsTrigger value="file">File Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <form onSubmit={handleManualSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="manualData">Enter Data (one entry per line)</Label>
                    <Button type="button" variant="outline" size="sm" onClick={loadSampleData} className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      Load Sample Data
                    </Button>
                  </div>
                  <Textarea
                    id="manualData"
                    placeholder="timestamp, value, category
2023-01-01T08:00:00, 45, student_logins
2023-01-01T09:00:00, 78, student_logins
2023-01-01T10:00:00, 120, student_logins"
                    className="min-h-[200px] font-mono text-sm"
                    value={manualData}
                    onChange={(e) => setManualData(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: timestamp, value, category (one entry per line)
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="threshold">Anomaly Threshold</Label>
                      <span className="text-sm text-muted-foreground">{threshold.toFixed(1)}</span>
                    </div>
                    <Slider
                      id="threshold"
                      min={0.5}
                      max={5}
                      step={0.1}
                      value={[threshold]}
                      onValueChange={(value) => setThreshold(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Standard deviations from mean (higher = less sensitive)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="sensitivity">Detection Sensitivity</Label>
                      <span className="text-sm text-muted-foreground">{sensitivity}%</span>
                    </div>
                    <Slider
                      id="sensitivity"
                      min={25}
                      max={100}
                      step={5}
                      value={[sensitivity]}
                      onValueChange={(value) => setSensitivity(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">Higher sensitivity may detect more subtle anomalies</p>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Sample Data Format</AlertTitle>
                  <AlertDescription>
                    <code className="text-xs">
                      2023-01-01T08:00:00, 45, student_logins
                      <br />
                      2023-01-01T09:00:00, 78, student_logins
                      <br />
                      2023-01-01T10:00:00, 120, student_logins
                    </code>
                  </AlertDescription>
                </Alert>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Detect Anomalies"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="file" className="space-y-4 mt-4">
            <form onSubmit={handleFileSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csvFile">Upload CSV File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="csvFile"
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    CSV must include columns for timestamp, value, and category
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="threshold-file">Anomaly Threshold</Label>
                      <span className="text-sm text-muted-foreground">{threshold.toFixed(1)}</span>
                    </div>
                    <Slider
                      id="threshold-file"
                      min={0.5}
                      max={5}
                      step={0.1}
                      value={[threshold]}
                      onValueChange={(value) => setThreshold(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Standard deviations from mean (higher = less sensitive)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="sensitivity-file">Detection Sensitivity</Label>
                      <span className="text-sm text-muted-foreground">{sensitivity}%</span>
                    </div>
                    <Slider
                      id="sensitivity-file"
                      min={25}
                      max={100}
                      step={5}
                      value={[sensitivity]}
                      onValueChange={(value) => setSensitivity(value[0])}
                    />
                    <p className="text-xs text-muted-foreground">Higher sensitivity may detect more subtle anomalies</p>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>CSV Format</AlertTitle>
                  <AlertDescription>
                    <p className="text-xs">
                      Your CSV should have headers and include columns for timestamp, value, and category.
                    </p>
                    <code className="text-xs block mt-2">
                      timestamp,value,category
                      <br />
                      2023-01-01T08:00:00,45,student_logins
                      <br />
                      2023-01-01T09:00:00,78,student_logins
                    </code>
                  </AlertDescription>
                </Alert>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={isProcessing || !csvFile}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload and Detect
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 text-xs text-muted-foreground">
        <p>Powered by Groq AI</p>
        <p>Data is processed securely</p>
      </CardFooter>
    </Card>
  )
}
