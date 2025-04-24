"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Zap, TrendingDown, TrendingUp, Droplets, Thermometer } from "lucide-react"

export function EnergyOverview() {
  // Mock data for energy metrics
  const energyMetrics = [
    {
      title: "Total Energy",
      value: "42,891",
      unit: "kWh",
      change: "-3.2%",
      trend: "down",
      icon: Zap,
    },
    {
      title: "Peak Demand",
      value: "3.8",
      unit: "MW",
      change: "+1.5%",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "Water Usage",
      value: "128,450",
      unit: "Gallons",
      change: "-5.1%",
      trend: "down",
      icon: Droplets,
    },
    {
      title: "Avg. Temperature",
      value: "72.4",
      unit: "°F",
      change: "+0.8%",
      trend: "up",
      icon: Thermometer,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {energyMetrics.map((metric, index) => {
        const Icon = metric.icon

        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  </div>
                </div>
                <div className="rounded-full bg-primary/10 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {metric.trend === "down" ? (
                  <TrendingDown className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <TrendingUp className="mr-1 h-4 w-4 text-red-500" />
                )}
                <span className={metric.trend === "down" ? "text-green-500" : "text-red-500"}>{metric.change}</span>
                <span className="ml-1 text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
