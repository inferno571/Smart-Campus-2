"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Save, Eye, EyeOff, AlertCircle, CheckCircle, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { updateApiKey } from "../actions/update-api-key"

export function ApiKeysManager() {
  const [groqApiKey, setGroqApiKey] = useState("")
  const [showGroqApiKey, setShowGroqApiKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("groq")
  const { toast } = useToast()

  // Load API keys on component mount
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        // In a real implementation, this would fetch from a secure storage
        // For demo purposes, we'll use localStorage with a prefix to indicate it's masked
        const storedGroqKey = localStorage.getItem("groq_api_key")

        if (storedGroqKey) {
          // If key exists, show masked version
          setGroqApiKey(storedGroqKey.startsWith("sk_") ? storedGroqKey : "sk_●●●●●●●●●●●●●●●●●●●●●●●●●●●●")
        } else {
          // Check if we have an environment variable
          const envGroqKey = process.env.GROQ_API_KEY
          if (envGroqKey) {
            setGroqApiKey("sk_●●●●●●●●●●●●●●●●●●●●●●●●●●●●")
          }
        }
      } catch (error) {
        console.error("Error loading API keys:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadApiKeys()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Don't save if it's the masked version
      if (groqApiKey.includes("●")) {
        toast({
          title: "No changes detected",
          description: "API key was not changed",
        })
        setIsSaving(false)
        return
      }

      // Validate Groq API key format
      if (!groqApiKey.startsWith("gsk_") && !groqApiKey.startsWith("sk-")) {
        toast({
          title: "Invalid API Key",
          description: "Groq API key should start with 'gsk_' or 'sk-'",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      // In a real implementation, this would call a server action to securely store the API key
      // For demo purposes, we'll use localStorage
      localStorage.setItem("groq_api_key", groqApiKey)

      // Call the server action to update the API key
      await updateApiKey("GROQ_API_KEY", groqApiKey)

      toast({
        title: "API Key Saved",
        description: "Your Groq API key has been updated successfully",
      })

      // Mask the API key after saving
      setShowGroqApiKey(false)
      setGroqApiKey(
        groqApiKey.startsWith("gsk_") || groqApiKey.startsWith("sk-") ? groqApiKey : "sk_●●●●●●●●●●●●●●●●●●●●●●●●●●●●",
      )
    } catch (error) {
      console.error("Error saving API key:", error)
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle API key visibility
  const toggleGroqApiKeyVisibility = () => {
    setShowGroqApiKey(!showGroqApiKey)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="slide-up">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="groq" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Groq API
          </TabsTrigger>
          <TabsTrigger value="other" className="flex items-center gap-2" disabled>
            <Key className="h-4 w-4" />
            Other APIs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groq">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="animate-spin-slow">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  Groq API Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Important</AlertTitle>
                  <AlertDescription>
                    Your API key is used to authenticate requests to the Groq API. Keep it secure and never share it
                    publicly.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="groqApiKey">Groq API Key</Label>
                  <div className="relative">
                    <Input
                      id="groqApiKey"
                      type={showGroqApiKey ? "text" : "password"}
                      value={groqApiKey}
                      onChange={(e) => setGroqApiKey(e.target.value)}
                      placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={toggleGroqApiKeyVisibility}
                    >
                      {showGroqApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can find your Groq API key in your Groq dashboard.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">API Key Status</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>API key is configured</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Usage Instructions</h3>
                  <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
                    <li>Enter your Groq API key in the field above</li>
                    <li>Click "Save API Key" to securely store it</li>
                    <li>The API key will be used for facial recognition and energy anomaly detection</li>
                  </ol>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving} className="w-full button-hover">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save API Key
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="other">
          <Card>
            <CardHeader>
              <CardTitle>Other API Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Additional API key management will be available in future updates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
