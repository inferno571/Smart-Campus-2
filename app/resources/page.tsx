import Link from "next/link"
import { ArrowLeft, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function Resources() {
  // Sample resource data
  const resources = [
    { id: 1, name: "Lecture Hall A", type: "Classroom", capacity: 120, status: "Available" },
    { id: 2, name: "Computer Lab 101", type: "Lab", capacity: 30, status: "In Use" },
    { id: 3, name: "Conference Room B", type: "Meeting Room", capacity: 15, status: "Maintenance" },
    { id: 4, name: "Library Study Room", type: "Study Space", capacity: 8, status: "Available" },
    { id: 5, name: "Auditorium", type: "Event Space", capacity: 500, status: "Reserved" },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">Resource Management</h1>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search resources..." className="pl-8" />
          </div>
          <Button className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campus Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.name}</TableCell>
                    <TableCell>{resource.type}</TableCell>
                    <TableCell>{resource.capacity}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          resource.status === "Available"
                            ? "success"
                            : resource.status === "In Use"
                              ? "default"
                              : resource.status === "Maintenance"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {resource.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © 2025 Smart Campus Toolkit. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
