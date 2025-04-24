/**
 * Environment variables configuration
 * Centralizes access to all environment variables used in the application
 */

// Function to get an environment variable with validation
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue

  if (!value && defaultValue === undefined) {
    console.warn(`Environment variable ${key} is not set`)
  }

  return value || ""
}

// Environment variables used in the application
export const env = {
  // API Keys
  GROQ_API_KEY: getEnvVar("GROQ_API_KEY"),

  // Blockchain Configuration
  MONAD_CONTRACT_ADDRESS: getEnvVar("MONAD_CONTRACT_ADDRESS", "0xE3D6cC3E5bA8c0D5c1b1A1fD5cE6A8bA9c1D3E3F"),
  MONAD_EXPLORER_URL: getEnvVar("MONAD_EXPLORER_URL", "https://testnet.monadexplorer.com"),

  // Application Configuration
  NODE_ENV: getEnvVar("NODE_ENV", "development"),
  NEXT_PUBLIC_APP_URL: getEnvVar("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),

  // Feature Flags
  ENABLE_BLOCKCHAIN_VERIFICATION: getEnvVar("ENABLE_BLOCKCHAIN_VERIFICATION", "true") === "true",
  ENABLE_FACIAL_RECOGNITION: getEnvVar("ENABLE_FACIAL_RECOGNITION", "true") === "true",

  // Default School Configuration (can be overridden in settings)
  NEXT_PUBLIC_DEFAULT_SCHOOL_NAME: getEnvVar("NEXT_PUBLIC_DEFAULT_SCHOOL_NAME", "IIT Delhi"),
  NEXT_PUBLIC_DEFAULT_SCHOOL_SHORT_NAME: getEnvVar("NEXT_PUBLIC_DEFAULT_SCHOOL_SHORT_NAME", "IITD"),
}

// Function to check if all required environment variables are set
export function validateEnv(): { valid: boolean; missing: string[] } {
  const requiredVars = ["GROQ_API_KEY"]
  const missing = requiredVars.filter((key) => !process.env[key])

  return {
    valid: missing.length === 0,
    missing,
  }
}
