"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertTriangle, Bell, Megaphone, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { triggerAlert } from "../actions/trigger-alert"

// Form schema
const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
  severity: z.enum(["info", "warning", "critical"], {
    required_error: "Please select a severity level.",
  }),
  location: z.string().min(3, {
    message: "Location must be at least 3 characters.",
  }),
})

export function AlertControls() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
      severity: "info",
      location: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      // Call the server action to trigger the alert
      const result = await triggerAlert(values)

      if (result.success) {
        toast({
          title: "Alert triggered successfully",
          description: `The alert has been broadcast to all connected devices.`,
        })
        form.reset()
      } else {
        toast({
          variant: "destructive",
          title: "Failed to trigger alert",
          description: result.error,
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to trigger alert",
        description: error.message || "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Trigger Alert</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Fire Alarm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Provide details about the alert..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="info">
                          <div className="flex items-center">
                            <Bell className="mr-2 h-4 w-4 text-blue-500" />
                            Information
                          </div>
                        </SelectItem>
                        <SelectItem value="warning">
                          <div className="flex items-center">
                            <Megaphone className="mr-2 h-4 w-4 text-yellow-500" />
                            Warning
                          </div>
                        </SelectItem>
                        <SelectItem value="critical">
                          <div className="flex items-center">
                            <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                            Critical
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Science Building" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Broadcasting...
                </>
              ) : (
                <>
                  <Megaphone className="mr-2 h-4 w-4" />
                  Broadcast Alert
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 text-xs text-muted-foreground">
        <p>Alerts are broadcast via Fluvio</p>
        <p>All alerts are logged for audit purposes</p>
      </CardFooter>
    </Card>
  )
}
