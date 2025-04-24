"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { connectToMetaMask, getCurrentAccount, isMetaMaskInstalled } from "@/lib/blockchain"
import { Wallet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const currentAccount = await getCurrentAccount()
      setAccount(currentAccount)
    }

    checkConnection()

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts.length > 0 ? accounts[0] : null)
      })
    }

    return () => {
      // Clean up listeners
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
      }
    }
  }, [])

  const handleConnect = async () => {
    if (!isMetaMaskInstalled()) {
      toast({
        title: "MetaMask not installed",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)
    try {
      const connectedAccount = await connectToMetaMask()
      setAccount(connectedAccount)

      if (connectedAccount) {
        toast({
          title: "Wallet Connected",
          description: `Connected to ${connectedAccount.substring(0, 6)}...${connectedAccount.substring(connectedAccount.length - 4)}`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to MetaMask",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // Format account address for display
  const formatAccount = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div>
      {account ? (
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          <span>{formatAccount(account)}</span>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          <Wallet className="h-4 w-4" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </div>
  )
}
