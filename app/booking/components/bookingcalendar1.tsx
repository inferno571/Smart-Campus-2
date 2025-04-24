"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CalendarIcon, Clock, CheckCircle, ExternalLink } from "lucide-react"
import { format, addDays } from "date-fns"
import { bookRoom } from "../actions/book-room"
import { useToast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { MONAD_CONTRACT_ADDRESS } from "@/lib/blockchain"
import { env } from "@/app/lib/env"
import { Label } from "@/components/ui/label"



const timeSlots = [
  "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM",
]

const formSchema = z.object({
  roomId: z.string({ required_error: "Please select a room." }),
  date: z.date({ required_error: "Please select a date." }),
  timeSlot: z.string({ required_error: "Please select a time slot." }),
  purpose: z.string().min(5, { message: "Purpose must be at least 5 characters." }),
  attendees: z.string().min(1, { message: "Please enter the number of attendees." }),
})

export function BookingCalendar() {
  const [date, setDate] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [bookingResult, setBookingResult] = useState<any>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomId: "",
      date: new Date(),
      timeSlot: "",
      purpose: "",
      attendees: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      const result = await bookRoom({
        ...values,
        date: format(values.date ?? new Date(), "yyyy-MM-dd"),
      })

      if (result.success) {
        setBookingResult(result)
        setShowConfirmation(true)
        form.reset()
      } else {
        toast({
          variant: "destructive",
          title: "Failed to book room",
          description: result.error,
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to book room",
        description: error.message || "An unexpected error occurred",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Book a Room</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            disabled={(d) => d < new Date() || d > addDays(new Date(), 30)}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {date ? (
            <>
              Selected: <span className="font-medium">{format(date, "PPP")}</span>
            </>
          ) : (
            "Please select a date"
          )}
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!date}>Book Room</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            {showConfirmation ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Booking Confirmed
                  </DialogTitle>
                  <DialogDescription>
                    Your room booking has been confirmed and secured on the Monad blockchain.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <AlertTitle>Blockchain Transaction Successful</AlertTitle>
                    <AlertDescription>
                      Your booking has been recorded on the Monad blockchain and cannot be altered.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Transaction Hash:</p>
                    <p className="text-xs bg-muted p-2 rounded-md break-all font-mono">
                      {bookingResult?.transactionHash}
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm font-medium">Block Number:</p>
                        <p className="text-sm">{bookingResult?.blockNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Booking ID:</p>
                        <p className="text-sm">{bookingResult?.bookingId}</p>
                      </div>
                    </div>

                    <p className="text-sm font-medium mt-2">Contract Address:</p>
                    <p className="text-xs bg-muted p-2 rounded-md break-all font-mono">
                      {MONAD_CONTRACT_ADDRESS}
                    </p>
                  </div>

                  <Button className="w-full" variant="outline" asChild>
                    <a
                      href={`${env.MONAD_EXPLORER_URL}/tx/${bookingResult?.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Monad Explorer
                    </a>
                  </Button>
                </div>

                <DialogFooter>
                  <Button
                    onClick={() => {
                      setShowConfirmation(false)
                      setIsDialogOpen(false)
                    }}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Book a Room</DialogTitle>
                  <DialogDescription>
                    Fill out the details to book a room. All bookings are secured on the Monad blockchain.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomId">Room</Label>
                    <Select
                      onValueChange={(value) => form.setValue("roomId", value)}
                      defaultValue={form.getValues("roomId")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a room" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="room-1">Lecture Hall A</SelectItem>
                        <SelectItem value="room-2">Conference Room B</SelectItem>
                        <SelectItem value="room-4">Study Room 3</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.roomId && (
                      <p className="text-sm text-red-500">{form.formState.errors.roomId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      type="button"
                      onClick={() => form.setValue("date", date || new Date())}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                    {form.formState.errors.date && (
                      <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeSlot">Time Slot</Label>
                    <Select
                      onValueChange={(value) => form.setValue("timeSlot", value)}
                      defaultValue={form.getValues("timeSlot")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4" />
                              {slot}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.timeSlot && (
                      <p className="text-sm text-red-500">{form.formState.errors.timeSlot.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Textarea
                      id="purpose"
                      placeholder="Brief description of the meeting or event"
                      className="resize-none"
                      {...form.register("purpose")}
                    />
                    {form.formState.errors.purpose && (
                      <p className="text-sm text-red-500">{form.formState.errors.purpose.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="attendees">Number of Attendees</Label>
                    <Input id="attendees" type="number" min="1" {...form.register("attendees")} />
                    {form.formState.errors.attendees && (
                      <p className="text-sm text-red-500">{form.formState.errors.attendees.message}</p>
                    )}
                  </div>

                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Confirming on Blockchain...
                        </>
                      ) : (
                        "Confirm Booking"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
