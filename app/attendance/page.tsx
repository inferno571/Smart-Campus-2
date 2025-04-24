import { Layout } from "../components/layout"
import { AttendanceSystem } from "./components/attendance-system"
import { AttendanceRecords } from "./components/attendance-records"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { UserPlus } from "lucide-react"
import Link from "next/link"

export default function AttendancePage() {
  return (
    <Layout title="Attendance System" backLink="/" backLabel="Home">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">AI-Powered Attendance Tracking</h2>
            <p className="text-muted-foreground">
              Track attendance using facial recognition powered by Groq and Screenpipe
            </p>
          </div>

          <Button asChild>
            <Link href="/attendance/register">
              <UserPlus className="mr-2 h-4 w-4" />
              Register Student
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="capture">
          <TabsList>
            <TabsTrigger value="capture">Capture Attendance</TabsTrigger>
            <TabsTrigger value="records">Attendance Records</TabsTrigger>
          </TabsList>
          <TabsContent value="capture" className="space-y-4 pt-4">
            <AttendanceSystem />
          </TabsContent>
          <TabsContent value="records" className="space-y-4 pt-4">
            <AttendanceRecords />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
