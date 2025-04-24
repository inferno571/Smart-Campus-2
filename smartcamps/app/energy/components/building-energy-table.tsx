"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Download, Search, SortAsc, SortDesc } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock building energy data
const buildingEnergyData = [
  {
    id: "bldg-1",
    name: "Science Building",
    consumption: 12450,
    peakDemand: 1.2,
    efficiency: 92,
    status: "Normal",
  },
  {
    id: "bldg-2",
    name: "Library",
    consumption: 8750,
    peakDemand: 0.9,
    efficiency: 88,
    status: "Normal",
  },
  {
    id: "bldg-3",
    name: "Admin Building",
    consumption: 6320,
    peakDemand: 0.7,
    efficiency: 90,
    status: "Normal",
  },
  {
    id: "bldg-4",
    name: "Student Center",
    consumption: 9840,
    peakDemand: 1.0,
    efficiency: 85,
    status: "Warning",
  },
  {
    id: "bldg-5",
    name: "Dormitory A",
    consumption: 7650,
    peakDemand: 0.8,
    efficiency: 87,
    status: "Normal",
  },
  {
    id: "bldg-6",
    name: "Dormitory B",
    consumption: 7820,
    peakDemand: 0.8,
    efficiency: 86,
    status: "Normal",
  },
  {
    id: "bldg-7",
    name: "Sports Complex",
    consumption: 11250,
    peakDemand: 1.1,
    efficiency: 82,
    status: "Warning",
  },
  {
    id: "bldg-8",
    name: "Engineering Labs",
    consumption: 14320,
    peakDemand: 1.4,
    efficiency: 79,
    status: "Critical",
  },
]

export function BuildingEnergyTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<string | null>("consumption")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  // Filter buildings based on search query
  const filteredBuildings = buildingEnergyData.filter((building) =>
    building.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Sort buildings based on sort field and direction
  const sortedBuildings = [...filteredBuildings].sort((a, b) => {
    if (!sortField) return 0

    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return 0
  })

  // Toggle sort direction or set new sort field
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Building Energy Consumption</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search buildings..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("name")}>
                <div className="flex items-center gap-1">
                  Building
                  {sortField === "name" &&
                    (sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("consumption")}>
                <div className="flex items-center gap-1">
                  Consumption (kWh)
                  {sortField === "consumption" &&
                    (sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("peakDemand")}>
                <div className="flex items-center gap-1">
                  Peak Demand (MW)
                  {sortField === "peakDemand" &&
                    (sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("efficiency")}>
                <div className="flex items-center gap-1">
                  Efficiency (%)
                  {sortField === "efficiency" &&
                    (sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("status")}>
                <div className="flex items-center gap-1">
                  Status
                  {sortField === "status" &&
                    (sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBuildings.map((building) => (
              <TableRow key={building.id}>
                <TableCell className="font-medium">{building.name}</TableCell>
                <TableCell>{building.consumption.toLocaleString()}</TableCell>
                <TableCell>{building.peakDemand}</TableCell>
                <TableCell>{building.efficiency}%</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      building.status === "Normal" && "bg-green-100 text-green-800 border-green-300",
                      building.status === "Warning" && "bg-yellow-100 text-yellow-800 border-yellow-300",
                      building.status === "Critical" && "bg-red-100 text-red-800 border-red-300",
                    )}
                  >
                    {building.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
