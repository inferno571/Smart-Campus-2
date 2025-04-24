"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock alert history data
const alertHistoryData = [
  {
    id: "alert-1",
    title: "Fire Alarm Test",
    severity: "info",
    location: "Science Building",
    date: "2025-04-13",
    time: "10:15 AM",
    triggeredBy: "System Admin",
    status: "Resolved",
  },
  {
    id: "alert-2",
    title: "Power Outage",
    severity: "warning",
    location: "North Campus",
    date: "2025-04-12",
    time: "03:45 PM",
    triggeredBy: "Facilities Manager",
    status: "Resolved",
  },
  {
    id: "alert-3",
    title: "Suspicious Activity",
    severity: "warning",
    location: "Parking Lot B",
    date: "2025-04-11",
    time: "08:30 PM",
    triggeredBy: "Security Officer",
    status: "Resolved",
  },
  {
    id: "alert-4",
    title: "Chemical Spill",
    severity: "critical",
    location: "Chemistry Lab",
    date: "2025-04-10",
    time: "02:20 PM",
    triggeredBy: "Lab Technician",
    status: "Resolved",
  },
  {
    id: "alert-5",
    title: "Weather Warning",
    severity: "warning",
    location: "All Campus",
    date: "2025-04-09",
    time: "11:00 AM",
    triggeredBy: "System Admin",
    status: "Resolved",
  },
]

export function AlertHistory() {
  const [filter, setFilter] = useState<string | null>(null)

  const filteredAlerts = filter ? alertHistoryData.filter((alert) => alert.severity === filter) : alertHistoryData

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Alert History</CardTitle>
        <div className="flex gap-2">
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className={cn(filter === null && "bg-muted")}
              onClick={() => setFilter(null)}
            >
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(filter === "info" && "bg-blue-100 text-blue-800 border-blue-300")}
              onClick={() => setFilter("info")}
            >
              Info
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(filter === "warning" && "bg-yellow-100 text-yellow-800 border-yellow-300")}
              onClick={() => setFilter("warning")}
            >
              Warning
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(filter === "critical" && "bg-red-100 text-red-800 border-red-300")}
              onClick={() => setFilter("critical")}
            >
              Critical
            </Button>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alert</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Triggered By</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAlerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell className="font-medium">{alert.title}</TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>{alert.location}</TableCell>
                <TableCell>
                  {alert.date} {alert.time}
                </TableCell>
                <TableCell>{alert.triggeredBy}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    {alert.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
