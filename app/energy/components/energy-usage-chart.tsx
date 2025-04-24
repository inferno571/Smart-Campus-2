"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

// Mock data for energy usage
const dailyData = [
  { time: "00:00", electricity: 240, heating: 120, cooling: 80 },
  { time: "03:00", electricity: 180, heating: 100, cooling: 60 },
  { time: "06:00", electricity: 220, heating: 110, cooling: 70 },
  { time: "09:00", electricity: 380, heating: 160, cooling: 120 },
  { time: "12:00", electricity: 460, heating: 200, cooling: 180 },
  { time: "15:00", electricity: 420, heating: 190, cooling: 160 },
  { time: "18:00", electricity: 380, heating: 170, cooling: 140 },
  { time: "21:00", electricity: 300, heating: 150, cooling: 100 },
]

const weeklyData = [
  { time: "Mon", electricity: 2800, heating: 1200, cooling: 900 },
  { time: "Tue", electricity: 2950, heating: 1300, cooling: 950 },
  { time: "Wed", electricity: 3100, heating: 1400, cooling: 1000 },
  { time: "Thu", electricity: 2900, heating: 1350, cooling: 980 },
  { time: "Fri", electricity: 2700, heating: 1250, cooling: 920 },
  { time: "Sat", electricity: 1800, heating: 800, cooling: 600 },
  { time: "Sun", electricity: 1600, heating: 700, cooling: 500 },
]

const monthlyData = [
  { time: "Jan", electricity: 85000, heating: 45000, cooling: 5000 },
  { time: "Feb", electricity: 82000, heating: 42000, cooling: 6000 },
  { time: "Mar", electricity: 78000, heating: 38000, cooling: 12000 },
  { time: "Apr", electricity: 75000, heating: 30000, cooling: 18000 },
  { time: "May", electricity: 72000, heating: 20000, cooling: 25000 },
  { time: "Jun", electricity: 70000, heating: 10000, cooling: 35000 },
  { time: "Jul", electricity: 68000, heating: 5000, cooling: 40000 },
  { time: "Aug", electricity: 69000, heating: 6000, cooling: 38000 },
  { time: "Sep", electricity: 71000, heating: 15000, cooling: 30000 },
  { time: "Oct", electricity: 74000, heating: 25000, cooling: 20000 },
  { time: "Nov", electricity: 79000, heating: 35000, cooling: 10000 },
  { time: "Dec", electricity: 83000, heating: 40000, cooling: 7000 },
]

export function EnergyUsageChart() {
  const [timeRange, setTimeRange] = useState("daily")
  const [building, setBuilding] = useState("all")

  // Select data based on time range
  const data = timeRange === "daily" ? dailyData : timeRange === "weekly" ? weeklyData : monthlyData

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Energy Usage</CardTitle>
        <div className="flex items-center gap-2">
          <Tabs defaultValue="daily" value={timeRange} onValueChange={setTimeRange} className="h-8">
            <TabsList className="h-8">
              <TabsTrigger value="daily" className="text-xs h-7">
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs h-7">
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs h-7">
                Monthly
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={building} onValueChange={setBuilding}>
            <SelectTrigger className="h-8 w-[130px]">
              <SelectValue placeholder="All Buildings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buildings</SelectItem>
              <SelectItem value="science">Science Building</SelectItem>
              <SelectItem value="library">Library</SelectItem>
              <SelectItem value="admin">Admin Building</SelectItem>
              <SelectItem value="dorms">Dormitories</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#e0e0e0" }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e0e0e0" }}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${value / 1000}k`
                  }
                  return value
                }}
              />
              <Tooltip
                formatter={(value) => [`${value} kWh`, undefined]}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="electricity"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="heating"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="cooling"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
