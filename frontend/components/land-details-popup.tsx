'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { ethers } from 'ethers'
import { getLandDetailsFromApi } from '@/lib/landApi'
import { buyProperty } from '@/lib/web3Client'

interface LandDetailsPopupProps {
  landId: number
  onClose: () => void
  buyerAccount: string
}

interface LandDetails {
  ownerName: string
  wallet_address: string
  price: number
  landSize: string
  landType: string
  status: string
  location: string
  geoLocation?: { lat: number; lng: number }
  documents?: Array<{ name: string; url: string; uploadedAt: string }>
  boundaryMapURL?: string
  extraNotes?: string
  blockchainTxHash?: string
}

export default function LandDetailsPopup({ landId, onClose, buyerAccount }: LandDetailsPopupProps) {
  const [landDetails, setLandDetails] = useState<LandDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [walletBalance, setWalletBalance] = useState<bigint>(0n)

  useEffect(() => {
    const fetchLandDetails = async () => {
      try {
        setIsLoading(true)
        setError('')
        const details = await getLandDetailsFromApi(landId)
        setLandDetails(details)

        // Fetch wallet balance
        const { getWalletBalance } = await import('@/lib/web3Client')
        const balance = await getWalletBalance(buyerAccount)
        setWalletBalance(balance)
      } catch (err) {
        console.error('[v0] Error fetching land details:', err)
        setError('Failed to load land details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLandDetails()
  }, [landId, buyerAccount])

  const handleBuy = async () => {
    if (!landDetails) return

    const priceInEth = ethers.formatEther(BigInt(Math.floor(landDetails.price * 1e18)))
    const hasSufficientFunds = walletBalance >= BigInt(Math.floor(landDetails.price * 1e18))

    if (!hasSufficientFunds) {
      setError(`Insufficient funds. You need ${priceInEth} ETH`)
      return
    }

    setIsPurchasing(true)
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed')
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts available in MetaMask')
      }

      const receipt = await buyProperty(landId, priceInEth)
      console.log('[v0] Purchase successful:', receipt)
      setError('')
      alert('Purchase successful!')
      onClose()
    } catch (err) {
      console.error('[v0] Purchase error:', err)
      setError(err instanceof Error ? err.message : 'Purchase failed')
    } finally {
      setIsPurchasing(false)
    }
  }

  const priceInEth = landDetails ? ethers.formatEther(BigInt(Math.floor(landDetails.price * 1e18))).substring(0, 10) : '0'
  const balanceInEth = ethers.formatEther(walletBalance).substring(0, 10)
  const hasSufficientFunds = walletBalance >= BigInt(Math.floor(landDetails?.price ? landDetails.price * 1e18 : 0))

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      {/* Half-screen popup */}
      <div className="w-full md:w-1/2 bg-card border-l border-border rounded-t-lg md:rounded-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Land Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
              {error}
            </div>
          ) : landDetails ? (
            <>
              {/* Land Image */}
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg overflow-hidden">
                <img
                  src={landDetails.boundaryMapURL || 'https://images.unsplash.com/photo-1500595046891-71f0e42e2e1c?w=500&h=300&fit=crop'}
                  alt="Land"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/rural-land-property.png'
                  }}
                />
              </div>

              {/* Owner Info */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">{landDetails.ownerName}</h3>
                <p className="text-sm text-gray-400">Owner: {landDetails.wallet_address.slice(0, 6)}...{landDetails.wallet_address.slice(-4)}</p>
              </div>

              {/* Land Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Land Type</p>
                  <p className="font-semibold text-foreground">{landDetails.landType}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Land Size</p>
                  <p className="font-semibold text-foreground">{landDetails.landSize}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Location</p>
                  <p className="font-semibold text-foreground">{landDetails.location}</p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <p className="font-semibold text-foreground capitalize">{landDetails.status}</p>
                </div>
              </div>

              {/* Price Section */}
              <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-4 border border-primary/30">
                <p className="text-sm text-gray-400 mb-2">Price</p>
                <p className="text-3xl font-bold text-cyan-500">{priceInEth} ETH</p>
                <p className="text-xs text-gray-500 mt-2">Your Balance: {balanceInEth} ETH</p>
              </div>

              {/* Geo Location */}
              {landDetails.geoLocation && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Geo Location</p>
                  <p className="text-foreground">
                    Lat: {landDetails.geoLocation.lat.toFixed(3)}, Lng: {landDetails.geoLocation.lng.toFixed(3)}
                  </p>
                </div>
              )}

              {/* Extra Notes */}
              {landDetails.extraNotes && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Notes</p>
                  <p className="text-foreground text-sm">{landDetails.extraNotes}</p>
                </div>
              )}

              {/* Documents */}
              {landDetails.documents && landDetails.documents.length > 0 && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-3">Documents</p>
                  <div className="space-y-2">
                    {landDetails.documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-primary hover:text-secondary transition"
                      >
                        📄 {doc.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Buy Button */}
              <button
                onClick={handleBuy}
                disabled={isPurchasing || !hasSufficientFunds}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                  hasSufficientFunds && !isPurchasing
                    ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isPurchasing ? 'Processing...' : hasSufficientFunds ? 'Buy Land' : 'Insufficient Funds'}
              </button>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No land details available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
