"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { env, validateEnv } from "@/app/lib/env"
import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function EnvVariablesDisplay() {
  const [validation, setValidation] = useState<{ valid: boolean; missing: string[] }>({ valid: true, missing: [] })

  useEffect(() => {
    // Validate environment variables on client-side
    setValidation(validateEnv())
  }, [])

  // Filter out sensitive values and prepare for display
  const envVars = Object.entries(env).map(([key, value]) => {
    // Mask sensitive values like API keys
    const isSensitive = key.includes("API_KEY") || key.includes("SECRET") || key.includes("PASSWORD")
    const displayValue = isSensitive ? (value ? "********" : "Not set") : value || "Not set"

    // Determine if this is a public variable (accessible on client-side)
    const isPublic = key.startsWith("NEXT_PUBLIC_")

    // Determine variable status
    let status = "default"
    if (!value) {
      status = "destructive"
    } else if (isSensitive) {
      status = "success"
    }

    return {
      key,
      displayValue,
      isSensitive,
      isPublic,
      status,
    }
  })

  return (
    <div className="space-y-6">
      {!validation.valid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missing Required Environment Variables</AlertTitle>
          <AlertDescription>
            The following environment variables are required but not set:
            <ul className="list-disc pl-5 mt-2">
              {validation.missing.map((key) => (
                <li key={key}>{key}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.valid && (
        <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>All Required Environment Variables Set</AlertTitle>
          <AlertDescription>All required environment variables are properly configured.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>These environment variables are used to configure the Smart Campus Toolkit</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variable</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {envVars.map((envVar) => (
                <TableRow key={envVar.key}>
                  <TableCell className="font-mono text-sm">{envVar.key}</TableCell>
                  <TableCell className="font-mono text-sm">{envVar.displayValue}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={envVar.isPublic ? "bg-blue-50 text-blue-800" : ""}>
                      {envVar.isPublic ? "Public" : "Server-only"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        envVar.status === "destructive"
                          ? "destructive"
                          : envVar.status === "success"
                            ? "success"
                            : "default"
                      }
                    >
                      {envVar.status === "destructive"
                        ? "Not Set"
                        : envVar.status === "success"
                          ? "Configured"
                          : "Default"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables Guide</CardTitle>
          <CardDescription>How to set up environment variables for the Smart Campus Toolkit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Required Variables</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-mono text-sm">GROQ_API_KEY</span> - API key for Groq AI services
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Optional Variables</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-mono text-sm">MONAD_CONTRACT_ADDRESS</span> - Address of the Monad blockchain
                contract
              </li>
              <li>
                <span className="font-mono text-sm">MONAD_EXPLORER_URL</span> - URL of the Monad blockchain explorer
              </li>
              <li>
                <span className="font-mono text-sm">ENABLE_BLOCKCHAIN_VERIFICATION</span> - Enable/disable blockchain
                verification (true/false)
              </li>
              <li>
                <span className="font-mono text-sm">ENABLE_FACIAL_RECOGNITION</span> - Enable/disable facial recognition
                (true/false)
              </li>
              <li>
                <span className="font-mono text-sm">NEXT_PUBLIC_DEFAULT_SCHOOL_NAME</span> - Default school name
              </li>
              <li>
                <span className="font-mono text-sm">NEXT_PUBLIC_DEFAULT_SCHOOL_SHORT_NAME</span> - Default school short
                name
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Setting Environment Variables</h3>
            <p>
              Environment variables can be set in a <span className="font-mono text-sm">.env.local</span> file in the
              root of your project:
            </p>
            <pre className="bg-muted p-4 rounded-md mt-2 overflow-x-auto">
              <code>
                {`GROQ_API_KEY=your_groq_api_key
MONAD_CONTRACT_ADDRESS=0xYourContractAddress
MONAD_EXPLORER_URL=https://testnet.monadexplorer.com
ENABLE_BLOCKCHAIN_VERIFICATION=true
ENABLE_FACIAL_RECOGNITION=true
NEXT_PUBLIC_DEFAULT_SCHOOL_NAME=Your School Name
NEXT_PUBLIC_DEFAULT_SCHOOL_SHORT_NAME=YSN`}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
