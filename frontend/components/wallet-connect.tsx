'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface WalletConnectProps {
  onConnect: (account: string, role: 'admin' | 'buyer') => void
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const connectWallet = async () => {
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed')
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length > 0) {
        setSuccess(true)
        setTimeout(() => {
          onConnect(accounts[0], 'buyer')
        }, 1000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/30 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-xl mb-4 border border-primary/20">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg">
                <span className="text-white font-bold text-lg">▲</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">Land Marketplace</h1>
            <p className="text-gray-400">Connect your MetaMask wallet to get started</p>
          </div>

          <button
            onClick={connectWallet}
            disabled={isLoading}
            className={`w-full font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2 mb-4 ${
              success
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : isLoading
                ? 'bg-primary/50 text-white'
                : 'bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 text-white'
            } disabled:opacity-75`}
          >
            {success ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Connected!
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect MetaMask'
            )}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-400 flex gap-3 mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="font-semibold mb-1">Connection Error</p>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-3 mt-6 pt-6 border-t border-border">
            <div className="flex items-start gap-3 text-sm text-gray-400">
              <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <span>Make sure you have MetaMask installed</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-400">
              <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <span>You will be asked to sign in with your wallet</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-gray-400">
              <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <span>Your data is always secure and encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
