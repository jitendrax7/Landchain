'use client'

import { useState, useEffect } from 'react'
import WalletConnect from '@/components/wallet-connect'
import Dashboard from '@/components/dashboard'
import LandingPage from '@/components/landing-page'

export default function Home() {
  const [account, setAccount] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<'none' | 'buyer' | 'seller'>('none')
  const [isLoading, setIsLoading] = useState(true)
  const [showWalletConnect, setShowWalletConnect] = useState(false)

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setUserRole('buyer')
        }
      }
    } catch (error) {
      console.error('Error checking wallet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = (connectedAccount: string, role: 'buyer' | 'seller') => {
    setAccount(connectedAccount)
    setUserRole(role)
    setShowWalletConnect(false)
  }

  const handleDisconnect = () => {
    setAccount(null)
    setUserRole('none')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!account) {
    if (showWalletConnect) {
      return <WalletConnect onConnect={handleConnect} />
    }
    return <LandingPage onGetStarted={() => setShowWalletConnect(true)} />
  }

  return (
    <Dashboard
      account={account}
      userRole={userRole}
      onDisconnect={handleDisconnect}
      setUserRole={setUserRole}
    />
  )
}
