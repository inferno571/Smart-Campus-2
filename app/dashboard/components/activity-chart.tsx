"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts"
import { AlertCircle, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import type { AnomalyDetectionResult } from "../actions/detect-anomalies"

interface ActivityChartProps {
  data: AnomalyDetectionResult | null
  isLoading: boolean
}

export function ActivityChart({ data, isLoading }: ActivityChartProps) {
  const [activeTab, setActiveTab] = useState("line")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [zoomLevel, setZoomLevel] = useState(100)

  // Extract unique categories from the data
  const categories = useMemo(() => {
    if (!data) return []

    const allData = [...(data.normalData || []), ...(data.anomalies || [])]
    const uniqueCategories = new Set(allData.map((item) => item.category))
    return Array.from(uniqueCategories)
  }, [data])

  // Filter and prepare data for charts
  const chartData = useMemo(() => {
    if (!data) return []

    // Combine normal and anomaly data
    const allData = [
      ...(data.normalData || []).map((item) => ({ ...item, isAnomaly: false })),
      ...(data.anomalies || []).map((item) => ({ ...item, isAnomaly: true })),
    ]

    // Filter by selected category if not "all"
    const filteredData =
      selectedCategory === "all" ? allData : allData.filter((item) => item.category === selectedCategory)

    // Sort by timestamp
    return filteredData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [data, selectedCategory])

  // Prepare data specifically for scatter plot
  const scatterData = useMemo(() => {
    if (!chartData.length) return { normal: [], anomalies: [] }

    return {
      normal: chartData.filter((item) => !item.isAnomaly),
      anomalies: chartData.filter((item) => item.isAnomaly),
    }
  }, [chartData])

  // Calculate statistics for the selected data
  const stats = useMemo(() => {
    if (!chartData.length) return { min: 0, max: 0, avg: 0, anomalyCount: 0 }

    const values = chartData.map((item) => item.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const sum = values.reduce((acc, val) => acc + val, 0)
    const avg = sum / values.length
    const anomalyCount = chartData.filter((item) => item.isAnomaly).length

    return { min, max, avg, anomalyCount }
  }, [chartData])

  // Handle zoom controls
  const handleZoomIn = () => {
    if (zoomLevel < 200) setZoomLevel(zoomLevel + 25)
  }

  const handleZoomOut = () => {
    if (zoomLevel > 50) setZoomLevel(zoomLevel - 25)
  }

  const handleResetZoom = () => {
    setZoomLevel(100)
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString()
    } catch (e) {
      return timestamp
    }
  }

  // Custom tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length && payload[0].payload) {
      const data = payload[0].payload
      return (
        <div className="bg-background border rounded-md p-3 shadow-md">
          <p className="font-medium">{formatTimestamp(data.timestamp || "")}</p>
          <p className="text-sm">
            Value: <span className="font-medium">{data.value !== undefined ? data.value : "N/A"}</span>
          </p>
          <p className="text-sm">
            Category: <span className="font-medium">{data.category || "N/A"}</span>
          </p>
          {data.isAnomaly && (
            <>
              <p className="text-sm mt-1">
                Anomaly Score: <span className="font-medium">{data.score !== undefined ? data.score : "N/A"}</span>
              </p>
              {data.reason && <p className="text-sm mt-1 text-destructive">{data.reason}</p>}
            </>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Campus Activity Overview</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-8">
              <TabsTrigger value="line" className="text-xs h-7">
                Line
              </TabsTrigger>
              <TabsTrigger value="scatter" className="text-xs h-7">
                Scatter
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent>
        {data ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-muted/50">
                  Total Points: {chartData.length}
                </Badge>
                <Badge variant="outline" className="bg-muted/50">
                  Min: {stats.min.toFixed(2)}
                </Badge>
                <Badge variant="outline" className="bg-muted/50">
                  Max: {stats.max.toFixed(2)}
                </Badge>
                <Badge variant="outline" className="bg-muted/50">
                  Avg: {stats.avg.toFixed(2)}
                </Badge>
                <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                  Anomalies: {stats.anomalyCount}
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoomLevel <= 50}>
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom Out</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Badge variant="outline">{zoomLevel}%</Badge>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoomLevel >= 200}>
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Zoom In</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleResetZoom}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reset Zoom</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="h-[400px]" style={{ width: `${zoomLevel}%`, minWidth: "100%", overflow: "auto" }}>
              <div className="h-full" style={{ minWidth: "100%" }}>
                <Tabs value={activeTab} className="h-full">
                  <TabsContent value="line" className="h-full mt-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="timestamp"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: "#e0e0e0" }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tickFormatter={formatTimestamp}
                        />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#e0e0e0" }} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />

                        {/* Normal data line */}
                        <Line
                          key="activity-line"
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={(props) => {
                            const isAnomaly = props.payload.isAnomaly
                            if (isAnomaly) return null

                            return <circle cx={props.cx} cy={props.cy} r={4} fill="#3b82f6" stroke="none" />
                          }}
                          activeDot={{ r: 6, fill: "#3b82f6" }}
                          name="Normal Activity"
                        />

                        {/* Anomaly points */}
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="none"
                          dot={(props) => {
                            const isAnomaly = props.payload.isAnomaly
                            if (!isAnomaly) return null

                            return (
                              <circle cx={props.cx} cy={props.cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                            )
                          }}
                          name="Anomaly"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabsContent>

                  <TabsContent value="scatter" className="h-full mt-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="timestamp"
                          type="category"
                          name="Time"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: "#e0e0e0" }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tickFormatter={formatTimestamp}
                        />
                        <YAxis
                          dataKey="value"
                          name="Value"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                          axisLine={{ stroke: "#e0e0e0" }}
                        />
                        <ZAxis range={[60, 400]} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend />

                        {/* Normal data points */}
                        <Scatter name="Normal Activity" data={scatterData.normal} fill="#3b82f6" />

                        {/* Anomaly points */}
                        <Scatter name="Anomaly" data={scatterData.anomalies} fill="#ef4444" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {data.anomalies.length > 0 && (
              <div className="space-y-2 mt-4">
                <h3 className="text-sm font-medium">Detected Anomalies</h3>
                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {data.anomalies.map((anomaly, index) => (
                    <div key={index} className="p-3 border rounded-md bg-red-50 text-red-800">
                      <div className="flex justify-between">
                        <span className="font-medium">{formatTimestamp(anomaly.timestamp)}</span>
                        <Badge variant="outline" className="bg-red-100 border-red-300">
                          Score: {anomaly.score}
                        </Badge>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm">
                          <span className="font-medium">Value:</span> {anomaly.value} ({anomaly.category})
                        </p>
                        <p className="text-sm mt-1">{anomaly.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center text-center">
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Analyzing data with Groq AI...</p>
                <p className="text-xs text-muted-foreground mt-2">This may take a few moments</p>
              </div>
            ) : (
              <>
                <AlertCircle className="h-12 w-12 text-muted-foreground opacity-20 mb-2" />
                <p className="text-muted-foreground">No data available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use the data input form to analyze campus activity data
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}