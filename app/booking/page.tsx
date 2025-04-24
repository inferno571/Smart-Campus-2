import { Layout } from "../components/layout"
import { BookingCalendar } from "./components/booking-calendar"
import { RoomList } from "./components/room-list"

export default function BookingPage() {
  return (
    <Layout title="Room Booking System" backLink="/" backLabel="Home">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Blockchain-Secured Room Booking</h2>
          <p className="text-muted-foreground">Book rooms and facilities with immutable blockchain confirmations</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <RoomList />
          </div>
          <div className="lg:col-span-2">
            <BookingCalendar />
          </div>
        </div>
      </div>
    </Layout>
  )
}
