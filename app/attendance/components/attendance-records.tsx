"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CalendarIcon, Download, Filter, ExternalLink } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { env } from "@/app/lib/env"
import { getSchoolConfig } from "@/app/lib/school-config"
import { useEffect } from "react"

// Mock data for attendance records with blockchain verification - Indian educational institution
const mockAttendanceData = [
  {
    id: "1",
    studentId: "IITD/CSE/2022/001",
    name: "Aarav Sharma",
    course: "Data Structures and Algorithms",
    date: "2025-04-12",
    time: "09:15 AM",
    status: "Present",
    verificationMethod: "Facial Recognition",
    blockchainVerified: true,
    transactionHash: "0x3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
    blockNumber: 12345678,
  },
  {
    id: "2",
    studentId: "IITD/CSE/2022/015",
    name: "Diya Patel",
    course: "Data Structures and Algorithms",
    date: "2025-04-12",
    time: "09:17 AM",
    status: "Present",
    verificationMethod: "Facial Recognition",
    blockchainVerified: true,
    transactionHash: "0x4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c",
    blockNumber: 12345679,
  },
  {
    id: "3",
    studentId: "IITD/CSE/2022/032",
    name: "Arjun Singh",
    course: "Data Structures and Algorithms",
    date: "2025-04-12",
    time: "09:20 AM",
    status: "Present",
    verificationMethod: "Facial Recognition",
    blockchainVerified: true,
    transactionHash: "0x5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e",
    blockNumber: 12345680,
  },
  {
    id: "4",
    studentId: "IITD/CSE/2022/047",
    name: "Ananya Gupta",
    course: "Data Structures and Algorithms",
    date: "2025-04-12",
    time: "09:22 AM",
    status: "Present",
    verificationMethod: "Facial Recognition",
    blockchainVerified: true,
    transactionHash: "0x6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f",
    blockNumber: 12345681,
  },
  {
    id: "5",
    studentId: "IITD/CSE/2022/053",
    name: "Vihaan Reddy",
    course: "Data Structures and Algorithms",
    date: "2025-04-12",
    time: "09:25 AM",
    status: "Absent",
    verificationMethod: "Manual Entry",
    blockchainVerified: false,
    transactionHash: "",
    blockNumber: 0,
  },
]

export function AttendanceRecords() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null)
  const [showBlockchainDetails, setShowBlockchainDetails] = useState(false)
  const [attendanceData, setAttendanceData] = useState(mockAttendanceData)
  const [schoolPrefix, setSchoolPrefix] = useState("IITD")

  // Load school configuration
  useEffect(() => {
    const loadSchoolConfig = async () => {
      const config = await getSchoolConfig()
      setSchoolPrefix(config.studentIdPrefix)

      // Update student IDs with the school prefix
      const updatedData = mockAttendanceData.map((record) => ({
        ...record,
        studentId: record.studentId.replace("IITD", config.studentIdPrefix),
      }))

      setAttendanceData(updatedData)
    }

    loadSchoolConfig()
  }, [])

  const handleViewBlockchain = (record: any) => {
    setSelectedRecord(record)
    setShowBlockchainDetails(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h3 className="text-lg font-medium">Attendance Records</h3>
          <p className="text-sm text-muted-foreground">
            View and manage attendance records with blockchain verification
          </p>
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
  <CalendarIcon className="h-4 w-4" />
  {date instanceof Date && !isNaN(date.getTime()) ? format(date, "PPP") : "Pick a date"}
</Button>

            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>

          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Blockchain Record</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceData.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.studentId}</TableCell>
                <TableCell>{record.name}</TableCell>
                <TableCell>{record.course}</TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>{record.time}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      record.status === "Present" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                    )}
                  >
                    {record.status}
                  </span>
                </TableCell>
                <TableCell>{record.verificationMethod}</TableCell>
                <TableCell>
                  {record.blockchainVerified ? (
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs flex items-center"
                      onClick={() => handleViewBlockchain(record)}
                    >
                      Verified on Monad
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not verified</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showBlockchainDetails} onOpenChange={setShowBlockchainDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Blockchain Verification</DialogTitle>
            <DialogDescription>
              This attendance record has been verified and stored on the Monad blockchain.
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm font-medium">Student:</p>
                  <p className="text-sm">{selectedRecord.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Student ID:</p>
                  <p className="text-sm">{selectedRecord.studentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date & Time:</p>
                  <p className="text-sm">
                    {selectedRecord.date} {selectedRecord.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status:</p>
                  <p className="text-sm">{selectedRecord.status}</p>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <p className="text-sm font-medium">Transaction Hash:</p>
                <p className="text-xs bg-muted p-2 rounded-md break-all font-mono">{selectedRecord.transactionHash}</p>

                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium">Block Number:</p>
                    <p className="text-sm">{selectedRecord.blockNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Wallet ID:</p>
                    <p className="text-sm font-mono">0x7E6b...5d52</p>
                  </div>
                </div>

                <Button className="w-full mt-4" variant="outline" asChild>
                  <a
                    href={`${env.MONAD_EXPLORER_URL}/tx/${selectedRecord.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Monad Explorer
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
