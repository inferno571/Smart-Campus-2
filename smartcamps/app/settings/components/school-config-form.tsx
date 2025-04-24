"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, RotateCcw, Upload, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSchoolConfig, saveSchoolConfig, resetSchoolConfig, type SchoolConfig } from "@/app/lib/school-config"
import Image from "next/image"

export function SchoolConfigForm() {
  const [config, setConfig] = useState<SchoolConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load school configuration on component mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const schoolConfig = await getSchoolConfig()
        setConfig(schoolConfig)
        if (schoolConfig.logo) {
          setLogoPreview(schoolConfig.logo)
        }
      } catch (error) {
        console.error("Error loading school config:", error)
        toast({
          title: "Error",
          description: "Failed to load school configuration",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadConfig()
  }, [toast])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (config) {
      setConfig({ ...config, [name]: value })
    }
  }

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Logo image must be less than 2MB",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    // Create a preview URL
    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setLogoPreview(result)
      if (config) {
        setConfig({ ...config, logo: result })
      }
    }
    reader.readAsDataURL(file)
  }

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!config) return

    setIsSaving(true)
    try {
      saveSchoolConfig(config)

      toast({
        title: "Configuration Saved",
        description: "School configuration has been updated successfully",
      })
    } catch (error) {
      console.error("Error saving school config:", error)
      toast({
        title: "Error",
        description: "Failed to save school configuration",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Reset configuration to default
  const handleReset = () => {
    if (confirm("Are you sure you want to reset to default configuration?")) {
      resetSchoolConfig()
      getSchoolConfig().then((config) => {
        setConfig(config)
        setLogoPreview(config.logo)
      })

      toast({
        title: "Configuration Reset",
        description: "School configuration has been reset to default values",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load configuration</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload Section */}
          <div className="space-y-2">
            <Label>School Logo</Label>
            <div className="flex flex-col items-center gap-4 p-4 border rounded-md">
              <div className="relative w-40 h-40 bg-muted rounded-md overflow-hidden">
                {logoPreview ? (
                  <Image src={logoPreview || "/placeholder.svg"} alt="School Logo" fill className="object-contain" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <ImageIcon className="h-16 w-16 text-muted-foreground opacity-30" />
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
              <Button type="button" variant="outline" onClick={handleUploadClick}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Logo
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Upload your school logo (PNG or JPG, max 2MB).
                <br />
                This will be displayed across all pages.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">School Name</Label>
            <Input
              id="name"
              name="name"
              value={config.name}
              onChange={handleInputChange}
              placeholder="e.g., IIT Delhi"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortName">Short Name / Abbreviation</Label>
            <Input
              id="shortName"
              name="shortName"
              value={config.shortName}
              onChange={handleInputChange}
              placeholder="e.g., IITD"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentIdPrefix">Student ID Prefix</Label>
            <Input
              id="studentIdPrefix"
              name="studentIdPrefix"
              value={config.studentIdPrefix}
              onChange={handleInputChange}
              placeholder="e.g., IITD"
              required
            />
            <p className="text-xs text-muted-foreground">
              This prefix will be used for student IDs (e.g., {config.studentIdPrefix}/CSE/2022/001)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  name="primaryColor"
                  value={config.primaryColor}
                  onChange={handleInputChange}
                  placeholder="#2563eb"
                />
                <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: config.primaryColor }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  name="secondaryColor"
                  value={config.secondaryColor}
                  onChange={handleInputChange}
                  placeholder="#4f46e5"
                />
                <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: config.secondaryColor }}></div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={config.address}
              onChange={handleInputChange}
              placeholder="School address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={config.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={config.contactEmail}
                onChange={handleInputChange}
                placeholder="info@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                value={config.contactPhone}
                onChange={handleInputChange}
                placeholder="+91-123-456-7890"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
