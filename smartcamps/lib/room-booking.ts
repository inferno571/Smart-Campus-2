// Interface for room availability check
interface CheckRoomAvailabilityParams {
  roomId: string
  date: Date
  startTime: string
  endTime: string
}

// Interface for availability result
interface AvailabilityResult {
  available: boolean
  message: string
}

// Interface for booking creation
interface CreateBookingParams {
  roomId: string
  date: Date
  startTime: string
  endTime: string
  purpose: string
  attendees: string
}

// Interface for booking result
interface BookingResult {
  success: boolean
  message: string
  bookingId?: string
}

// Sample bookings data for simulation
const existingBookings = [
  {
    id: "1",
    roomId: "101",
    date: new Date("2023-04-12"),
    startTime: "09:00",
    endTime: "11:00",
  },
  {
    id: "2",
    roomId: "102",
    date: new Date("2023-04-12"),
    startTime: "13:00",
    endTime: "15:00",
  },
  {
    id: "3",
    roomId: "103",
    date: new Date("2023-04-13"),
    startTime: "10:00",
    endTime: "12:00",
  },
]

// Function to check if a room is available
export async function checkRoomAvailability(params: CheckRoomAvailabilityParams): Promise<AvailabilityResult> {
  try {
    // Simulate a delay for API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if the room is already booked for the given time slot
    const { roomId, date, startTime, endTime } = params

    // Format the date for comparison
    const bookingDate = new Date(date)
    bookingDate.setHours(0, 0, 0, 0)

    // Find conflicting bookings
    const conflictingBookings = existingBookings.filter((booking) => {
      const existingDate = new Date(booking.date)
      existingDate.setHours(0, 0, 0, 0)

      // Check if dates match
      const datesMatch = existingDate.getTime() === bookingDate.getTime()

      // Check if room matches
      const roomMatches = booking.roomId === roomId

      // Check if time slots overlap
      const timeOverlaps =
        (startTime < booking.endTime && endTime > booking.startTime) ||
        startTime === booking.startTime ||
        endTime === booking.endTime

      return datesMatch && roomMatches && timeOverlaps
    })

    if (conflictingBookings.length > 0) {
      return {
        available: false,
        message: "This room is already booked for the selected time slot.",
      }
    }

    // Check if the room is under maintenance (simulation)
    if (roomId === "105" && bookingDate.getDay() === 1) {
      // Monday
      return {
        available: false,
        message: "This room is under maintenance on Mondays.",
      }
    }

    return {
      available: true,
      message: "Room is available for booking.",
    }
  } catch (error) {
    console.error("Error checking room availability:", error)
    return {
      available: false,
      message: "An error occurred while checking availability. Please try again.",
    }
  }
}

// Function to create a booking
export async function createBooking(params: CreateBookingParams): Promise<BookingResult> {
  try {
    // First, check if the room is available
    const availabilityCheck = await checkRoomAvailability({
      roomId: params.roomId,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
    })

    if (!availabilityCheck.available) {
      return {
        success: false,
        message: availabilityCheck.message,
      }
    }

    // Simulate a delay for API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate a random booking ID
    const bookingId = Math.random().toString(36).substring(2, 10)

    // In a real application, we would store the booking in a database
    // For simulation, we'll just log it
    console.log("Booking created:", {
      id: bookingId,
      ...params,
    })

    // Simulate storing data on Monad Testnet
    console.log("Storing booking data on Monad Testnet")
    console.log("Contract address: 0xE3D6cC3E5bA8c0D5c1b1A1fD5cE6A8bA9c1D3E3F")

    return {
      success: true,
      message: "Booking created successfully!",
      bookingId,
    }
  } catch (error) {
    console.error("Error creating booking:", error)
    return {
      success: false,
      message: "An error occurred while creating the booking. Please try again.",
    }
  }
}
