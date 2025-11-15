'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import TransactionSuccessModal from './transaction-success-modal'
import { Heart, Share2, MapPin, Zap } from 'lucide-react'

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

interface PropertyCardProps {
  property: Property
  buyerAccount: string
  onPurchase?: () => void
}

export default function PropertyCard({
  property,
  buyerAccount,
  onPurchase,
}: PropertyCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [transactionHash, setTransactionHash] = useState('')
  const [walletBalance, setWalletBalance] = useState<bigint>(0n)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)

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
  }, [buyerAccount])

  const handleBuy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!property.isAvailable) {
      setError('This property is no longer available')
      return
    }

    if (!hasSufficientFunds) {
      setError(`Insufficient funds. You need ${priceInEth} ETH but have ${balanceInEth} ETH`)
      return
    }

    setIsPurchasing(true)
    setError('')

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to purchase properties.')
      }

      const { buyProperty } = await import('@/lib/web3Client')
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts available in MetaMask')
      }

      console.log('[v0] Buyer account:', accounts[0])
      console.log('[v0] Initiating purchase for property:', property.id)
      console.log('[v0] Price in ETH:', priceInEth)
      
      const receipt = await buyProperty(Number(property.id), priceInEth)
      console.log('[v0] Transaction receipt:', receipt)
      
      if (receipt?.hash) {
        setTransactionHash(receipt.hash)
      }
      setShowSuccess(true)
      onPurchase?.()
    } catch (err) {
      console.error('[v0] Purchase error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed. Please check the console for details.'
      setError(errorMessage)
    } finally {
      setIsPurchasing(false)
    }
  }

  const landImages = [
    '/agricultural-land-property-field-countryside.jpg',
  ]
  const randomImage = landImages[0]

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-300 h-full flex flex-col hover:shadow-lg hover:shadow-primary/10">
        {/* Image Container */}
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden relative group">
          <img
            src={randomImage || "/placeholder.svg"}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/rural-land-property.png'
            }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4 gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsFavorited(!isFavorited) }}
              className={`flex-1 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                isFavorited 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Heart className="w-4 h-4" fill={isFavorited ? 'currentColor' : 'none'} />
              {isFavorited ? 'Saved' : 'Save'}
            </button>
            <button 
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Status Badge */}
          <span
            className={`absolute top-3 left-3 inline-block px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur ${
              property.isAvailable
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-gray-700/50 text-gray-300 border border-gray-600/30'
            }`}
          >
            {property.isAvailable ? '✓ Available' : '✗ Sold Out'}
          </span>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          {/* Property Title & Location */}
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-foreground leading-snug">{property.name}</h4>
            <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
              <MapPin className="w-4 h-4" />
              {property.location}
            </div>
          </div>

          {/* Price & Balance */}
          <div className="mb-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">Price</span>
              <span className="text-sm font-bold text-primary">{parseFloat(priceInEth).toFixed(4)} ETH</span>
            </div>
            {property.isAvailable && !isLoadingBalance && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Your Balance</span>
                <span className={`text-sm font-bold ${hasSufficientFunds ? 'text-green-400' : 'text-red-400'}`}>
                  {parseFloat(balanceInEth).toFixed(4)} ETH
                </span>
              </div>
            )}
          </div>

          {property.isAvailable ? (
            <>
              <button
                onClick={handleBuy}
                disabled={isPurchasing || !hasSufficientFunds || isLoadingBalance}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition text-sm mt-auto mb-3 flex items-center justify-center gap-2 ${
                  hasSufficientFunds && !isLoadingBalance
                    ? 'bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                } disabled:opacity-50`}
              >
                <Zap className="w-4 h-4" />
                {isLoadingBalance ? 'Loading...' : isPurchasing ? 'Processing...' : 'Buy Now'}
              </button>
              
              {error && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded p-2">
                  {error}
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-gray-500 text-center py-3 bg-gray-900/50 rounded-lg border border-gray-800">
              Owned by {property.seller.slice(0, 6)}...{property.seller.slice(-4)}
            </div>
          )}
        </div>
      </div>

      {showSuccess && (
        <TransactionSuccessModal
          propertyName={property.name}
          amount={priceInEth}
          sellerAddress={property.seller}
          transactionHash={transactionHash}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </>
  )
}
