"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, User, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react"
import { recognizeFaces } from "../actions/recognize-faces"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { optimizeImageForGroq } from "@/app/lib/image-processor"

// Import Screenpipe's Terminator for video processing
// Note: In a real implementation, you would install and import from the actual package
// For this demo, we'll simulate the integration
const simulateScreenpipe = {
  initCamera: async (videoElement: HTMLVideoElement) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })
      videoElement.srcObject = stream
      return stream
    } catch (error) {
      throw new Error("Failed to initialize camera")
    }
  },
  processFrame: async (videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) => {
    const context = canvasElement.getContext("2d")
    if (!context) return null

    // Set canvas dimensions to match video
    canvasElement.width = videoElement.videoWidth
    canvasElement.height = videoElement.videoHeight

    // Draw current video frame to canvas
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height)

    // In a real implementation, Screenpipe would process the frame here
    // For demo purposes, we'll just return the canvas blob
    return new Promise<Blob>((resolve) => {
      canvasElement.toBlob((blob) => {
        if (blob) resolve(blob)
        else throw new Error("Failed to capture image")
      }, "image/jpeg")
    })
  },
}

// Helper function to format position object to string
function formatPosition(position: any): string {
  if (!position) return "Unknown"

  // If position is already a string, return it
  if (typeof position === "string") return position

  // If position is an object with x, y, width, height properties
  if (typeof position === "object") {
    if ("x" in position && "y" in position) {
      return `(${position.x}, ${position.y})`
    }
    // If it has other properties, convert to JSON string
    return JSON.stringify(position)
  }

  // Fallback
  return String(position)
}

export function AttendanceSystem() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recognizedStudents, setRecognizedStudents] = useState<any[]>([])
  const [faceData, setFaceData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("live")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Start video capture
  const startCapture = async () => {
    setError(null)
    setWarning(null)
    try {
      if (!videoRef.current) return

      // Initialize camera using Screenpipe's Terminator
      const stream = await simulateScreenpipe.initCamera(videoRef.current)
      streamRef.current = stream
      setIsCapturing(true)
    } catch (err) {
      setError("Camera access denied. Please enable camera permissions.")
      console.error("Error accessing camera:", err)
    }
  }

  // Stop video capture
  const stopCapture = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsCapturing(false)
  }

  // Capture frame and process for attendance
  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isCapturing) return

    setIsProcessing(true)
    setError(null)
    setWarning(null)

    try {
      // Process frame using Screenpipe
      const blob = await simulateScreenpipe.processFrame(videoRef.current, canvasRef.current)

      if (!blob) {
        throw new Error("Failed to capture image")
      }

      // Optimize the image to prevent "Request too large" error
      const optimizedBlob = await optimizeImageForGroq(blob)

      // Process with Groq for face recognition
      const result = await recognizeFaces(optimizedBlob)

      // Update recognized students and face data
      setRecognizedStudents(result.recognizedStudents)
      setFaceData(result.faceData || [])

      // Check if we used mock data due to API constraints
      if (result.note && result.note.includes("mock data")) {
        setWarning(
          "Using simulated recognition data due to image size constraints. In a production environment, consider using a dedicated face recognition service.",
        )
      }
    } catch (err: any) {
      setError(err.message || "Failed to process attendance")
      console.error("Error processing attendance:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCapture()
    }
  }, [])

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="live">Live Camera</TabsTrigger>
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          {warning && (
            <Alert variant="default" className="bg-yellow-50 text-yellow-800 border-yellow-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
                  {!isCapturing && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Camera className="h-12 w-12 text-muted-foreground opacity-50" />
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${!isCapturing ? "hidden" : ""}`}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                <div className="flex gap-2">
                  {!isCapturing ? (
                    <Button onClick={startCapture} className="flex-1">
                      <Camera className="mr-2 h-4 w-4" />
                      Start Camera
                    </Button>
                  ) : (
                    <>
                      <Button onClick={stopCapture} variant="outline" className="flex-1">
                        <XCircle className="mr-2 h-4 w-4" />
                        Stop Camera
                      </Button>
                      <Button onClick={captureFrame} disabled={isProcessing} className="flex-1">
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Take Attendance
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Recognized Students</h3>
                {recognizedStudents.length > 0 ? (
                  <div className="space-y-3">
                    {recognizedStudents.map((student) => (
                      <div key={student.id} className="flex items-center gap-3 p-3 rounded-md border">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {student.id}</p>
                        </div>
                        <div className="ml-auto">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Present</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <User className="h-12 w-12 text-muted-foreground opacity-30 mb-2" />
                    <p className="text-muted-foreground">
                      {isProcessing
                        ? "Processing attendance..."
                        : "No students recognized yet. Start the camera and take attendance."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {faceData.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">Face Detection Data</h3>
                <div className="space-y-3">
                  {faceData.map((face, index) => (
                    <div key={index} className="p-3 rounded-md border">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm font-medium">Face ID:</p>
                          <p className="text-sm text-muted-foreground">{face.id || `Face ${index + 1}`}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Estimated Age:</p>
                          <p className="text-sm text-muted-foreground">{face.age || "Unknown"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Gender:</p>
                          <p className="text-sm text-muted-foreground">{face.gender || "Unknown"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Position:</p>
                          <p className="text-sm text-muted-foreground">{formatPosition(face.position)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-md">
                <Camera className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground mb-2">Upload an image for attendance</p>
                <Button>Upload Image</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
