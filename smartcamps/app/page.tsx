"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Users, CalendarDays, Bell, Zap, BarChart2, Building, ExternalLink, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { env } from "@/app/lib/env"
import { useEffect, useState } from "react"
import { getSchoolConfig, type SchoolConfig } from "@/app/lib/school-config"
import { ThemeToggle } from "./components/theme-toggle"

export default function Home() {
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getSchoolConfig()
        setSchoolConfig(config)
      } catch (error) {
        console.error("Error loading school config:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadConfig()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 fade-in">
            {!isLoading && schoolConfig && (
              <>
                <div className="relative h-10 w-10 overflow-hidden rounded-md scale-in">
                  {schoolConfig.logo ? (
                    <Image
                      src={schoolConfig.logo || "/placeholder.svg"}
                      alt={`${schoolConfig.name} Logo`}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-primary/10">
                      <span className="text-lg font-bold text-primary">{schoolConfig.shortName.substring(0, 2)}</span>
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold fade-in">{schoolConfig.name}</h1>
              </>
            )}
            {isLoading && <h1 className="text-2xl font-bold">Smart Campus Toolkit</h1>}
          </div>
          <div className="flex items-center gap-2 fade-in">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild className="button-hover">
              <Link href="/settings" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto space-y-8 slide-up">
          <div className="space-y-2">
            {!isLoading && schoolConfig && (
              <h2 className="text-3xl font-bold">Welcome to {schoolConfig.name} Smart Campus</h2>
            )}
            {isLoading && <h2 className="text-3xl font-bold">Welcome to Smart Campus</h2>}
            <p className="text-muted-foreground">Your comprehensive toolkit for campus management and analytics</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Integrated Technologies</CardTitle>
              <CardDescription>
                Smart Campus Toolkit leverages cutting-edge technologies for enhanced functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-4 border rounded-md hover-card">
                  <div className="h-16 w-16 relative mb-2">
                    <Image src="/logos/groq-logo.jpg" alt="Groq Logo" fill className="object-contain" />
                  </div>
                  <h3 className="font-medium text-sm">Groq</h3>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    High-performance AI inference for facial recognition and energy anomaly detection
                  </p>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-md hover-card">
                  <div className="h-16 w-16 relative mb-2">
                    <Image src="/logos/monad-logo.jpg" alt="Monad Logo" fill className="object-contain" />
                  </div>
                  <h3 className="font-medium text-sm">Monad</h3>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    Blockchain technology for immutable attendance records and secure room bookings
                  </p>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-md hover-card">
                  <div className="h-16 w-16 relative mb-2">
                    <Image src="/logos/fluvio-logo.jpg" alt="Fluvio Logo" fill className="object-contain" />
                  </div>
                  <h3 className="font-medium text-sm">Fluvio</h3>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    Real-time streaming platform for campus-wide safety alerts and notifications
                  </p>
                </div>
                <div className="flex flex-col items-center p-4 border rounded-md hover-card">
                  <div className="h-16 w-16 relative mb-2">
                    <Image src="/logos/screenpipe-logo.jpg" alt="Screenpipe Logo" fill className="object-contain" />
                  </div>
                  <h3 className="font-medium text-sm">Screenpipe</h3>
                  <p className="text-xs text-center text-muted-foreground mt-1">
                    Advanced video processing for real-time facial recognition and attendance tracking
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button variant="outline" size="sm" className="text-xs button-hover" asChild>
                <a href="https://github.com/mediar-ai/terminator" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Screenpipe GitHub
                </a>
              </Button>
              <Button variant="outline" size="sm" className="text-xs button-hover" asChild>
                <a href={env.MONAD_EXPLORER_URL} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Monad Explorer
                </a>
              </Button>
            </CardFooter>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Users className="h-5 w-5 text-primary" />,
                title: "Attendance System",
                description: "Track attendance with AI-powered facial recognition via Groq and Screenpipe.",
                link: "/attendance",
              },
              {
                icon: <CalendarDays className="h-5 w-5 text-primary" />,
                title: "Room Booking",
                description: "Book rooms with blockchain-secured confirmations on Monad.",
                link: "/booking",
              },
              {
                icon: <Bell className="h-5 w-5 text-primary" />,
                title: "Safety Alerts",
                description: "Receive and manage real-time campus safety alerts via Fluvio streaming.",
                link: "/safety",
              },
              {
                icon: <Zap className="h-5 w-5 text-primary" />,
                title: "Energy Dashboard",
                description: "Monitor and optimize campus energy consumption with Groq analytics.",
                link: "/energy",
              },
              {
                icon: <BarChart2 className="h-5 w-5 text-primary" />,
                title: "Campus Dashboard",
                description: "View real-time analytics and insights about your campus.",
                link: "/dashboard",
              },
              {
                icon: <Building className="h-5 w-5 text-primary" />,
                title: "Resource Management",
                description: "Manage campus resources and facilities efficiently.",
                link: "/resources",
              },
            ].map((item, index) => (
              <div key={index} className="border rounded-lg p-6 space-y-4 hover-card slide-in-right">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">{item.icon}</div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                <Button className="w-full sm:w-auto button-hover" asChild>
                  <Link href={item.link}>{item.title.split(" ")[0]}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container">
          <div className="flex flex-col items-center gap-2 fade-in">
            {!isLoading && schoolConfig && (
              <div className="flex items-center gap-2 mb-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-md">
                  {schoolConfig.logo ? (
                    <Image
                      src={schoolConfig.logo || "/placeholder.svg"}
                      alt={`${schoolConfig.name} Logo`}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-primary/10">
                      <span className="text-sm font-bold text-primary">{schoolConfig.shortName.substring(0, 2)}</span>
                    </div>
                  )}
                </div>
                <span className="font-medium">{schoolConfig.name}</span>
              </div>
            )}
            <div className="text-center text-sm text-muted-foreground">
              © 2025 Smart Campus Toolkit. All rights reserved.
            </div>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span>Powered by Groq</span>
              <span>•</span>
              <span>Monad Blockchain</span>
              <span>•</span>
              <span>Fluvio Streaming</span>
              <span>•</span>
              <span>Screenpipe</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
