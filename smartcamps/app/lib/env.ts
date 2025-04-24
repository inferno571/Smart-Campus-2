
/**
 * Environment variables configuration
 * Centralizes access to all environment variables used in the application
 */

// Function to get an environment variable with validation
function getEnvVar(key: string, defaultValue?: string): string {
  let value = process.env[key] || defaultValue

  // Production environment variables
  if (typeof window === 'undefined') {
    if (key === "GROQ_API_KEY") {
      value = "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"
    }
  }

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

  // Default School Configuration
  NEXT_PUBLIC_DEFAULT_SCHOOL_NAME: getEnvVar("NEXT_PUBLIC_DEFAULT_SCHOOL_NAME", "IIT Delhi"),
  NEXT_PUBLIC_DEFAULT_SCHOOL_SHORT_NAME: getEnvVar("NEXT_PUBLIC_DEFAULT_SCHOOL_SHORT_NAME", "IITD"),
}
