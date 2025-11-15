'use client'

import { useState, useEffect } from 'react'
import { getLandsByOwner, unlistLand, listLandForSale } from '@/lib/web3Client'
import { ethers } from 'ethers'
import { Check, X, AlertCircle, MapPin, User } from 'lucide-react'

interface Land {
  landId: bigint
  currentOwner: string
  priceWei: bigint
  isListed: boolean
  isApproved: boolean
  metadataURI: string
  docHash: string
  createdAt: bigint
  updatedAt: bigint
  previousOwners: string[]
}

interface SellerListingsProps {
  sellerAccount: string
}

export default function SellerListings({ sellerAccount }: SellerListingsProps) {
  const [lands, setLands] = useState<Land[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isUnlisting, setIsUnlisting] = useState<number | null>(null)
  const [isListing, setIsListing] = useState<number | null>(null)
  const [landStatuses, setLandStatuses] = useState<{ [key: number]: 'idle' | 'loading' | 'approved' | 'listed' | 'error' }>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [priceInput, setPriceInput] = useState<{ [key: number]: string }>({})
  const [filterTab, setFilterTab] = useState<'all' | 'listed' | 'notListed'>('all')

  useEffect(() => {
    fetchLands()
  }, [sellerAccount])

  const fetchLands = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await getLandsByOwner(sellerAccount)
      setLands(data)
    } catch (err) {
      console.error('Error fetching lands:', err)
      setError('Failed to load your lands')
    } finally {
      setIsLoading(false)
    }
  }

  const handleListForSale = async (landId: bigint) => {
    const price = priceInput[Number(landId)]
    if (!price || price === '') {
      setError('Please enter a price')
      return
    }

    try {
      setIsListing(Number(landId))
      setError('')
      setSuccessMessage('')
      
      await listLandForSale(Number(landId), price)
      
      setSuccessMessage(`✓ Land #${landId} listed successfully! You can track it in My Properties section.`)
      setPriceInput((prev) => {
        const newState = { ...prev }
        delete newState[Number(landId)]
        return newState
      })
      
      // Refresh the lands list
      setTimeout(() => {
        fetchLands()
        setSuccessMessage('')
      }, 3000)
    } catch (err) {
      console.error('Error listing land:', err)
      setError(`Failed to list land: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsListing(null)
    }
  }

  const handleUnlist = async (landId: bigint) => {
    try {
      setIsUnlisting(Number(landId))
      setError('')
      setSuccessMessage('')
      
      await unlistLand(Number(landId))
      
      setSuccessMessage(`Land #${landId} has been delisted successfully`)
      
      // Refresh the lands list
      setTimeout(() => {
        fetchLands()
        setSuccessMessage('')
      }, 2000)
    } catch (err) {
      console.error('Error unlisting land:', err)
      setError(`Failed to delist land: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsUnlisting(null)
    }
  }

  const listedLands = lands.filter(land => land.isListed)
  const notListedLands = lands.filter(land => !land.isListed)
  
  const displayedLands = filterTab === 'listed' ? listedLands : filterTab === 'notListed' ? notListedLands : lands

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-400">Loading your lands...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex gap-2 border-b border-border pb-4">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 font-medium text-sm transition-all ${
              filterTab === 'all'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-foreground'
            }`}
          >
            All Properties <span className="text-gray-500 ml-1">({lands.length})</span>
          </button>
          <button
            onClick={() => setFilterTab('listed')}
            className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 ${
              filterTab === 'listed'
                ? 'text-secondary border-b-2 border-secondary'
                : 'text-gray-400 hover:text-foreground'
            }`}
          >
            <Check className="w-4 h-4" />
            Listed <span className="text-gray-500 ml-1">({listedLands.length})</span>
          </button>
          <button
            onClick={() => setFilterTab('notListed')}
            className={`px-4 py-2 font-medium text-sm transition-all flex items-center gap-2 ${
              filterTab === 'notListed'
                ? 'text-accent border-b-2 border-accent'
                : 'text-gray-400 hover:text-foreground'
            }`}
          >
            <X className="w-4 h-4" />
            Not Listed <span className="text-gray-500 ml-1">({notListedLands.length})</span>
          </button>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-foreground mb-4">
        {filterTab === 'listed' ? 'Listed Properties' : filterTab === 'notListed' ? 'Not Listed Properties' : 'All Properties'}
      </h3>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400 mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-sm text-green-400 mb-6 flex items-center gap-2">
          <Check className="w-4 h-4 flex-shrink-0" />
          {successMessage}
        </div>
      )}

      {displayedLands.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">
            {lands.length === 0 
              ? "You haven't registered any lands yet" 
              : `No ${filterTab === 'listed' ? 'listed' : filterTab === 'notListed' ? 'unlisted' : ''} properties found`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedLands.map((land) => (
            <div
              key={Number(land.landId)}
              className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary/30 transition"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-lg font-semibold text-foreground">
                    Land #{land.landId.toString()}
                  </h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      land.isListed
                        ? 'bg-secondary/20 text-secondary'
                        : 'bg-gray-700/50 text-gray-400'
                    }`}
                  >
                    {land.isListed ? (
                      <>
                        <Check className="w-3 h-3" />
                        Listed
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3" />
                        Not Listed
                      </>
                    )}
                  </span>
                  {land.isApproved && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Approved
                    </span>
                  )}
                </div>
                <div className="flex gap-4 text-sm mb-2">
                  <span className='text-gray-400 flex items-center gap-1'>
                    <User className="w-4 h-4" />
                    Owner: <span className="text-foreground font-medium">Property Owner</span>
                  </span>
                  <span className='text-gray-400 flex items-center gap-1'>
                    <MapPin className="w-4 h-4" />
                    Location: <span className="text-foreground font-medium">Marketplace</span>
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  ID: {land.metadataURI}
                </p>
              </div>

              <div className="text-right ml-4 flex flex-col items-end gap-3">
                <div>
                  <p className="text-2xl font-bold text-cyan-500 mb-1">
                    {(Number(land.priceWei) / 1e18).toFixed(7)} ETH
                  </p>
                </div>
                
                {land.isListed ? (
                  <button
                    onClick={() => handleUnlist(land.landId)}
                    disabled={isUnlisting === Number(land.landId)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                      isUnlisting === Number(land.landId)
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    {isUnlisting === Number(land.landId) ? 'Delisting...' : 'Delist'}
                  </button>
                ) : (
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Price in ETH"
                      value={priceInput[Number(land.landId)] || ''}
                      onChange={(e) => setPriceInput({
                        ...priceInput,
                        [Number(land.landId)]: e.target.value,
                      })}
                      className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm w-24 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={() => handleListForSale(land.landId)}
                      disabled={isListing === Number(land.landId)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1 ${
                        isListing === Number(land.landId)
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      {isListing === Number(land.landId) ? 'Listing...' : 'List'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
