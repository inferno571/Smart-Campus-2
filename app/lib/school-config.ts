/**
 * School configuration system
 * Makes the application plug-and-play for different educational institutions
 */
import { env } from "@/app/lib/env"

// Default configuration from environment variables
const DEFAULT_CONFIG = {
  name: env.NEXT_PUBLIC_DEFAULT_SCHOOL_NAME,
  shortName: env.NEXT_PUBLIC_DEFAULT_SCHOOL_SHORT_NAME,
  logo: "", // Empty by default, will be set during setup
  primaryColor: "#2563eb", // blue-600
  secondaryColor: "#4f46e5", // indigo-600
  studentIdPrefix: env.NEXT_PUBLIC_DEFAULT_SCHOOL_SHORT_NAME,
  address: "Hauz Khas, New Delhi, Delhi 110016",
  website: "https://home.iitd.ac.in/",
  contactEmail: "info@iitd.ac.in",
  contactPhone: "+91-11-2659-7135",
}

// Interface for school configuration
export interface SchoolConfig {
  name: string
  shortName: string
  logo: string
  primaryColor: string
  secondaryColor: string
  studentIdPrefix: string
  address: string
  website: string
  contactEmail: string
  contactPhone: string
}

// Get school configuration from localStorage or use default
export async function getSchoolConfig(): Promise<SchoolConfig> {
  if (typeof window === "undefined") {
    return DEFAULT_CONFIG
  }

  const storedConfig = localStorage.getItem("schoolConfig")
  if (storedConfig) {
    try {
      return JSON.parse(storedConfig)
    } catch (error) {
      console.error("Error parsing school config:", error)
    }
  }

  return DEFAULT_CONFIG
}

// Save school configuration to localStorage
export function saveSchoolConfig(config: SchoolConfig): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem("schoolConfig", JSON.stringify(config))
}

// Reset school configuration to default
export function resetSchoolConfig(): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem("schoolConfig")
}
