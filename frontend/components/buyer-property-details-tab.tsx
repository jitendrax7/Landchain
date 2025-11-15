'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { X, Wallet, User, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import TransactionSuccessModal from './transaction-success-modal'
import TransactionProgressModal from './transaction-progress-modal'
import { executeLandPurchaseTransaction, type TransactionFlow } from '@/lib/transactionService'

interface Property {
  id: bigint
  name: string
  location: string
  priceInWei: bigint
  isAvailable: boolean
  owner: string
  seller: string
  createdAt: bigint
}

interface BuyerPropertyDetailsTabProps {
  property: Property
  onClose: () => void
  buyerAccount: string
  onPurchased?: () => void
}

type TabType = 'overview' | 'wallet' | 'owner' | 'seller' | 'transaction'

export default function BuyerPropertyDetailsTab({
  property,
  onClose,
  buyerAccount,
  onPurchased,
}: BuyerPropertyDetailsTabProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [transactionHash, setTransactionHash] = useState('')
  const [showProgress, setShowProgress] = useState(false)
  const [transactionFlow, setTransactionFlow] = useState<TransactionFlow>({
    steps: [],
    currentStep: 0,
    overallStatus: 'idle',
    totalAmount: '',
    sellerAddress: '',
    landId: 0,
  })
  const [walletBalance, setWalletBalance] = useState<bigint>(0n)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [createdDate, setCreatedDate] = useState('')

  const priceInEth = ethers.formatEther(property.priceInWei)
  const balanceInEth = ethers.formatEther(walletBalance)
  const hasSufficientFunds = walletBalance >= property.priceInWei

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const { getWalletBalance } = await import('@/lib/web3Client')
        const balance = await getWalletBalance(buyerAccount)
        setWalletBalance(balance)
      } catch (err) {
        console.error('[v0] Error loading wallet balance:', err)
      } finally {
        setIsLoadingBalance(false)
      }
    }
    
    if (buyerAccount) {
      loadBalance()
    }

    // Format created date
    const timestamp = Number(property.createdAt) * 1000
    const date = new Date(timestamp)
    setCreatedDate(date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }))
  }, [buyerAccount, property.createdAt])

  const handlePurchase = async () => {
    setIsPurchasing(true)
    setError('')
    setShowProgress(true)

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not available')
      }

      console.log('[v0] Purchase initiated for property:', property.id)

      const result = await executeLandPurchaseTransaction(
        Number(property.id),
        priceInEth,
        property.seller,
        (flow) => {
          setTransactionFlow(flow)
        }
      )

      if (result.success && result.hash) {
        console.log('[v0] Transaction successful:', result.hash)
        setTransactionHash(result.hash)
        
        setTimeout(() => {
          setShowProgress(false)
          setShowSuccess(true)
        }, 2000)
      } else {
        throw new Error(result.error || 'Purchase failed')
      }
      
      setTimeout(() => {
        onPurchased?.()
      }, 4000)
    } catch (err) {
      console.error('[v0] Purchase error:', err)
      setError(err instanceof Error ? err.message : 'Purchase failed')
      setShowProgress(false)
    } finally {
      setIsPurchasing(false)
    }
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" /> },
    { id: 'owner', label: 'Owner', icon: <User className="w-4 h-4" /> },
    { id: 'seller', label: 'Seller', icon: <User className="w-4 h-4" /> },
    { id: 'transaction', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
  ]

  const landImages = [
    '/agricultural-land-property-field-countryside.jpg',
  ]
  const randomImage = landImages[0]

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
          {/* Header with Close Button */}
          <div className="flex justify-between items-center p-6 border-b border-border bg-gradient-to-r from-card to-card/50">
            <h2 className="text-2xl font-bold text-foreground">Property Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-foreground" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Left: Image Section */}
            <div className="lg:w-5/12 border-r border-border flex flex-col bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="flex-1 relative overflow-hidden">
                <img
                  src={randomImage || "/placeholder.svg"}
                  alt={property.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/rural-land-property.png'
                  }}
                />
              </div>

              {/* Property Quick Info */}
              <div className="p-4 bg-card/50 border-t border-border">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{property.name}</h3>
                    <p className="text-sm text-gray-400">{property.location}</p>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      property.isAvailable
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-gray-700/50 text-gray-300 border border-gray-600/30'
                    }`}
                  >
                    {property.isAvailable ? '✓ Available' : '✗ Sold'}
                  </span>
                </div>

                {/* Price Display */}
                <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-3 border border-primary/20">
                  <p className="text-xs text-gray-400 mb-1">Listed Price</p>
                  <p className="text-2xl font-bold text-cyan-400">{parseFloat(priceInEth).toFixed(4)} ETH</p>
                </div>
              </div>
            </div>

            {/* Right: Tabs Section */}
            <div className="lg:w-7/12 flex flex-col overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex gap-1 p-3 bg-background border-b border-border overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'bg-card text-gray-400 hover:text-foreground border border-border'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background rounded-lg p-4 border border-border">
                        <p className="text-xs text-gray-400 mb-2">Status</p>
                        <p className={`text-lg font-bold ${property.isAvailable ? 'text-green-400' : 'text-gray-500'}`}>
                          {property.isAvailable ? 'Available' : 'Sold Out'}
                        </p>
                      </div>
                      <div className="bg-background rounded-lg p-4 border border-border">
                        <p className="text-xs text-gray-400 mb-2">Property ID</p>
                        <p className="text-lg font-mono text-cyan-400">#{Number(property.id)}</p>
                      </div>
                    </div>

                    <div className="bg-background rounded-lg p-4 border border-border">
                      <p className="text-xs text-gray-400 mb-2">Location</p>
                      <p className="text-foreground font-medium">{property.location}</p>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-blue-400 font-medium mb-1">Verification Status</p>
                          <p className="text-blue-300/80">This property is listed on the blockchain and verified by the network.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Wallet Tab */}
                {activeTab === 'wallet' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg p-4 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <Wallet className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-1">Your Wallet Address</p>
                          <p className="text-sm font-mono text-primary break-all">{buyerAccount}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-background rounded-lg p-4 border border-border">
                      <p className="text-xs text-gray-400 mb-3">Wallet Balance</p>
                      {isLoadingBalance ? (
                        <div className="animate-pulse h-8 bg-gray-700 rounded"></div>
                      ) : (
                        <div>
                          <p className="text-3xl font-bold text-cyan-400 mb-2">{parseFloat(balanceInEth).toFixed(4)} ETH</p>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${hasSufficientFunds ? 'bg-green-500' : 'bg-red-500'}`}
                            ></div>
                            <p className={`text-sm ${hasSufficientFunds ? 'text-green-400' : 'text-red-400'}`}>
                              {hasSufficientFunds 
                                ? `Sufficient funds to purchase (${(parseFloat(balanceInEth) - parseFloat(priceInEth)).toFixed(4)} ETH remaining)`
                                : `Insufficient funds. Need ${(parseFloat(priceInEth) - parseFloat(balanceInEth)).toFixed(4)} ETH more`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background rounded-lg p-4 border border-border text-center">
                        <p className="text-xs text-gray-400 mb-1">Purchase Amount</p>
                        <p className="text-xl font-bold text-cyan-400">{parseFloat(priceInEth).toFixed(4)} ETH</p>
                      </div>
                      <div className="bg-background rounded-lg p-4 border border-border text-center">
                        <p className="text-xs text-gray-400 mb-1">After Purchase</p>
                        <p className={`text-xl font-bold ${hasSufficientFunds ? 'text-green-400' : 'text-red-400'}`}>
                          {hasSufficientFunds 
                            ? (parseFloat(balanceInEth) - parseFloat(priceInEth)).toFixed(4)
                            : '0'} ETH
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Owner Tab */}
                {activeTab === 'owner' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 rounded-lg p-4 border border-secondary/20">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-1">Current Owner Address</p>
                          <p className="text-sm font-mono text-secondary break-all">{property.owner}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-background rounded-lg p-4 border border-border">
                      <p className="text-xs text-gray-400 mb-3">Owner Details</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-sm text-gray-400">Owner Type</span>
                          <span className="text-sm font-medium text-foreground">Primary Owner</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-sm text-gray-400">Registration Status</span>
                          <span className="flex items-center gap-1 text-sm font-medium text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            Verified
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Address Type</span>
                          <span className="text-sm font-medium text-foreground">Ethereum Account</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-xs text-blue-400 font-medium">Note:</p>
                      <p className="text-xs text-blue-300/80 mt-1">Upon purchase, the property ownership will be transferred to your wallet address.</p>
                    </div>
                  </div>
                )}

                {/* Seller Tab */}
                {activeTab === 'seller' && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg p-4 border border-accent/20">
                      <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-400 mb-1">Seller Address</p>
                          <p className="text-sm font-mono text-accent break-all">{property.seller}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-background rounded-lg p-4 border border-border">
                      <p className="text-xs text-gray-400 mb-3">Seller Information</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-sm text-gray-400">Seller Type</span>
                          <span className="text-sm font-medium text-foreground">Property Owner</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-border/50">
                          <span className="text-sm text-gray-400">Status</span>
                          <span className="flex items-center gap-1 text-sm font-medium text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            Active
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Listing Method</span>
                          <span className="text-sm font-medium text-foreground">Direct Sale</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-background rounded-lg p-4 border border-border">
                      <p className="text-xs text-gray-400 mb-2">Listing Price (Asking)</p>
                      <p className="text-2xl font-bold text-cyan-400">{parseFloat(priceInEth).toFixed(4)} ETH</p>
                    </div>
                  </div>
                )}

                {/* Transaction Timeline Tab */}
                {activeTab === 'transaction' && (
                  <div className="space-y-4">
                    <div className="relative space-y-6">
                      {/* Listed Event */}
                      <div className="relative pl-6">
                        <div className="absolute left-0 top-2 w-3 h-3 bg-primary rounded-full border-2 border-card"></div>
                        <div className="absolute left-1 top-5 w-1 h-12 bg-primary/30"></div>
                        <div className="bg-background rounded-lg p-4 border border-border">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-foreground">Property Listed</h4>
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Active</span>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{createdDate}</p>
                          <p className="text-sm text-gray-400">Listed for sale at {parseFloat(priceInEth).toFixed(4)} ETH</p>
                        </div>
                      </div>

                      {/* Pending Purchase Event */}
                      <div className="relative pl-6">
                        <div className="absolute left-0 top-2 w-3 h-3 bg-gray-600 rounded-full border-2 border-card"></div>
                        <div className="absolute left-1 top-5 w-1 h-12 bg-gray-600/30"></div>
                        <div className="bg-background rounded-lg p-4 border border-border opacity-60">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-foreground">Purchase Transaction</h4>
                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Pending</span>
                          </div>
                          <p className="text-xs text-gray-400">Awaiting buyer transaction</p>
                        </div>
                      </div>

                      {/* Ownership Transfer Event */}
                      <div className="relative pl-6">
                        <div className="absolute left-0 top-2 w-3 h-3 bg-gray-600 rounded-full border-2 border-card"></div>
                        <div className="bg-background rounded-lg p-4 border border-border opacity-60">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-foreground">Ownership Transfer</h4>
                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Pending</span>
                          </div>
                          <p className="text-xs text-gray-400">Property will be transferred to your wallet</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400 flex gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}
              </div>

              {/* Purchase Button */}
              {property.isAvailable && activeTab === 'overview' && (
                <div className="border-t border-border p-4 bg-gradient-to-r from-card to-card/50">
                  <button
                    onClick={handlePurchase}
                    disabled={isPurchasing || !hasSufficientFunds || isLoadingBalance}
                    className={`w-full font-semibold py-3 px-4 rounded-lg transition text-sm flex items-center justify-center gap-2 ${
                      hasSufficientFunds && !isLoadingBalance
                        ? 'bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    } disabled:opacity-50`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isLoadingBalance ? 'Loading...' : isPurchasing ? 'Processing...' : 'Purchase Now'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TransactionProgressModal
        flow={transactionFlow}
        isOpen={showProgress}
        onClose={() => setShowProgress(false)}
      />

      {showSuccess && (
        <TransactionSuccessModal
          propertyName={property.name}
          amount={priceInEth}
          sellerAddress={property.seller}
          transactionHash={transactionHash}
          onClose={() => {
            setShowSuccess(false)
            onClose()
          }}
        />
      )}
    </>
  )
}
