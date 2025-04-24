"use client"

import Link from "next/link"
import Image from "next/image"
import type { ReactNode } from "react"
import { WalletConnect } from "./wallet-connect"
import { ThemeToggle } from "./theme-toggle"
import { Settings, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { getSchoolConfig, type SchoolConfig } from "@/app/lib/school-config"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface LayoutProps {
  children: ReactNode
  title: string
  backLink?: string
  backLabel?: string
}

export function Layout({ children, title, backLink, backLabel }: LayoutProps) {
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
      <header className="border-b fade-in">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="button-hover">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-muted">
                    Home
                  </Link>
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-muted">
                    Dashboard
                  </Link>
                  <Link href="/attendance" className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-muted">
                    Attendance
                  </Link>
                  <Link href="/booking" className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-muted">
                    Room Booking
                  </Link>
                  <Link href="/safety" className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-muted">
                    Safety Alerts
                  </Link>
                  <Link href="/energy" className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-muted">
                    Energy Dashboard
                  </Link>
                  <Link href="/resources" className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-muted">
                    Resources
                  </Link>
                  <Link href="/settings" className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-muted">
                    Settings
                  </Link>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo and Institute Name */}
            <div className="flex items-center gap-3">
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
                  <div className="hidden md:block">
                    <h1 className="text-lg font-bold leading-tight">{schoolConfig.name}</h1>
                    <p className="text-xs text-muted-foreground">{title}</p>
                  </div>
                </>
              )}
              <h1 className="text-xl font-bold md:hidden">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4 fade-in">
            <ThemeToggle />
            <WalletConnect />
            <Button variant="ghost" size="icon" asChild className="button-hover">
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
            {backLink && (
              <Link
                href={backLink}
                className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
              >
                ← {backLabel || "Back"}
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8 fade-in">{children}</main>
      <footer className="border-t py-6 fade-in">
        <div className="container">
          <div className="flex flex-col items-center gap-2">
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

export default Layout
