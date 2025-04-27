"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Bell, CheckCircle2, Loader2 } from "lucide-react"
import { triggerAlert } from "../actions/trigger-alert"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AlertControls() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [severity, setSeverity] = useState("info")
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await triggerAlert({
        title,
        message,
        severity,
        location,
      })

      if (response.success) {
        setResult({
          success: true,
          message: response.message || "Alert successfully broadcast",
        })
        // Reset form on success
        setTitle("")
        setMessage("")
        setSeverity("info")
        setLocation("")
      } else {
        setResult({
          success: false,
          error: response.error || "Failed to broadcast alert",
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Broadcast Alert</CardTitle>
        <CardDescription>Send emergency alerts to all connected campus devices</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Alert Title</Label>
            <Input
              id="title"
              placeholder="Fire Alarm, Weather Warning, etc."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Alert Message</Label>
            <Input
              id="message"
              placeholder="Detailed information about the alert"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level</Label>
              <Select value={severity} onValueChange={setSeverity} required>
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Information</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Building or area affected"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          {result && (
            <Alert
              className={
                result.success
                  ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300"
              }
            >
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              <AlertDescription>{result.success ? result.message : result.error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting || !title || !message || !location}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Broadcasting...
            </>
          ) : (
            <>
              <Bell className="mr-2 h-4 w-4" /> Broadcast Alert
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
