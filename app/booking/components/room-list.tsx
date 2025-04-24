"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Mock room data
const rooms = [
  {
    id: "room-1",
    name: "Lecture Hall A",
    capacity: 120,
    features: ["Projector", "Audio System", "Whiteboard"],
    building: "Science Building",
    floor: 2,
    availability: "Available",
  },
  {
    id: "room-2",
    name: "Conference Room B",
    capacity: 20,
    features: ["TV Screen", "Whiteboard", "Video Conferencing"],
    building: "Admin Building",
    floor: 1,
    availability: "Available",
  },
  {
    id: "room-3",
    name: "Computer Lab 101",
    capacity: 30,
    features: ["Computers", "Projector", "Printer"],
    building: "Technology Building",
    floor: 1,
    availability: "Booked",
  },
  {
    id: "room-4",
    name: "Study Room 3",
    capacity: 8,
    features: ["Whiteboard", "Power Outlets"],
    building: "Library",
    floor: 3,
    availability: "Available",
  },
  {
    id: "room-5",
    name: "Auditorium",
    capacity: 300,
    features: ["Stage", "Audio System", "Lighting System"],
    building: "Arts Building",
    floor: 1,
    availability: "Maintenance",
  },
]

export function RoomList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Available Rooms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search rooms..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{filteredRooms.length} rooms found</div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className={cn(
                "p-3 border rounded-md cursor-pointer transition-colors",
                selectedRoom === room.id ? "border-primary bg-primary/5" : "hover:bg-muted/50",
              )}
              onClick={() => setSelectedRoom(room.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{room.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {room.building}, Floor {room.floor}
                  </p>
                </div>
                <Badge
                  variant={
                    room.availability === "Available"
                      ? "success"
                      : room.availability === "Booked"
                        ? "default"
                        : "outline"
                  }
                >
                  {room.availability}
                </Badge>
              </div>

              <div className="mt-2">
                <p className="text-sm">
                  <span className="font-medium">Capacity:</span> {room.capacity} people
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {room.features.map((feature) => (
                    <span key={feature} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
