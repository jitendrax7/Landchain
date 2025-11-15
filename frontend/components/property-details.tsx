'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
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

interface PropertyDetailsProps {
  property: Property
  onClose: () => void
  buyerAccount: string
  onPurchased?: () => void
}

export default function PropertyDetails({
  property,
  onClose,
  buyerAccount,
  onPurchased,
}: PropertyDetailsProps) {
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

  const priceInEth = ethers.formatEther(property.priceInWei)

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
        
        // Wait a moment before showing success modal
        setTimeout(() => {
          setShowProgress(false)
          setShowSuccess(true)
        }, 2000)
      } else {
        throw new Error(result.error || 'Purchase failed')
      }
      
      onPurchased?.()
    } catch (err) {
      console.error('[v0] Purchase error:', err)
      setError(err instanceof Error ? err.message : 'Purchase failed')
      setShowProgress(false)
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header with Close Button */}
          <div className="flex justify-between items-center p-6 border-b border-border sticky top-0 bg-card">
            <h2 className="text-2xl font-bold text-foreground">Property Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-foreground transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Property Image */}
            <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src="/property-real-estate-land.jpg"
                alt={property.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Basic Info */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{property.name}</h3>
                  <p className="text-gray-400">{property.location}</p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Status</p>
                <p className={`text-xl font-bold ${property.isAvailable ? 'text-secondary' : 'text-gray-500'}`}>
                  {property.isAvailable ? 'Available' : 'Sold'}
                </p>
              </div>
              <div className="bg-background rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Seller</p>
                <p className="text-sm font-mono text-cyan-500">
                  {property.seller.slice(0, 6)}...{property.seller.slice(-4)}
                </p>
              </div>
            </div>

            {/* Price and Action */}
            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Price</p>
                  <p className="text-3xl font-bold text-cyan-500">{priceInEth} ETH</p>
                </div>
                {property.isAvailable && (
                  <button
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                    className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold py-3 px-8 rounded-lg transition"
                  >
                    {isPurchasing ? 'Processing...' : 'Buy Now'}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}
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
