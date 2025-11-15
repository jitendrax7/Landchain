'use client'

import { useState } from 'react'
import { addProperty } from '@/lib/web3Client'
import { submitLandToApi } from '@/lib/landApi'

interface SellerPropertyFormProps {
  onPropertyAdded: () => void
}

export default function SellerPropertyForm({ onPropertyAdded }: SellerPropertyFormProps) {
  const [formData, setFormData] = useState({
    ownerName: '',
    landSize: '',
    landType: 'agriculture',
    location: '',
    price: '',
    documentURL: '',
    approvedBy: 'Admin03',
    lat: '22.720',
    lng: '75.857',
    boundaryMapURL: '/maps/land_dummy.png',
    extraNotes: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      if (
        !formData.ownerName.trim() ||
        !formData.landSize.trim() ||
        !formData.location.trim() ||
        !formData.price
      ) {
        throw new Error('Please fill in all required fields')
      }

      const priceNum = parseFloat(formData.price)
      if (isNaN(priceNum)) {
        throw new Error('Price must be a valid number')
      }
      if (priceNum <= 0) {
        throw new Error('Price must be greater than 0')
      }

      console.log('[v0] Adding land to blockchain:', formData)

      const blockchainReceipt = await addProperty(formData.ownerName, formData.location, formData.price)
      console.log('[v0] Blockchain transaction successful:', blockchainReceipt?.hash)

      const txHash = blockchainReceipt?.hash || 'pending'

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed')
      }
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      const walletAddress = accounts[0]

      const priceInWei = parseFloat(formData.price) * 1e18
      await submitLandToApi({
        landId: Math.floor(Math.random() * 10000),
        ownerName: formData.ownerName,
        wallet_address: walletAddress,
        price: priceNum,
        landSize: formData.landSize,
        landType: formData.landType,
        status: 'listed',
        isApproved: true,
        approvedBy: formData.approvedBy,
        location: formData.location,
        geoLocation: {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
        },
        blockchainTxHash: txHash,
        boundaryMapURL: formData.boundaryMapURL,
        extraNotes: formData.extraNotes,
      })

      setSuccess(`✓ Your land listed successfully! You can track it in My Properties section.`)
      setFormData({
        ownerName: '',
        landSize: '',
        landType: 'agriculture',
        location: '',
        price: '',
        documentURL: '',
        approvedBy: 'Admin03',
        lat: '22.720',
        lng: '75.857',
        boundaryMapURL: '/maps/land_dummy.png',
        extraNotes: '',
      })
      
      setTimeout(() => {
        setSuccess('')
        onPropertyAdded()
      }, 3000)
    } catch (err) {
      console.error('[v0] Error adding land:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to add land. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const isPriceValid = formData.price && parseFloat(formData.price) > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Owner Name *
          </label>
          <input
            type="text"
            value={formData.ownerName}
            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
            placeholder="e.g., Amit Verma"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Land Size *
          </label>
          <input
            type="text"
            value={formData.landSize}
            onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
            placeholder="e.g., 1200 Sq Ft"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Land Type *
          </label>
          <select
            value={formData.landType}
            onChange={(e) => setFormData({ ...formData, landType: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="agriculture">Agriculture</option>
            <option value="forest">Forest</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Location *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Indore, MP"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Price (ETH) *
          </label>
          <input
            type="number"
            step="0.001"
            min="0.001"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g., 0.5"
            className={`w-full px-4 py-2 bg-background border rounded-lg text-foreground placeholder-gray-600 focus:outline-none focus:ring-2 ${
              formData.price && !isPriceValid 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-border focus:ring-primary'
            }`}
          />
          {formData.price && !isPriceValid && (
            <p className="text-xs text-red-500 mt-1">Please enter a price greater than 0</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Approved By
          </label>
          <input
            type="text"
            value={formData.approvedBy}
            onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
            placeholder="e.g., CityOfficer_05"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Latitude
          </label>
          <input
            type="number"
            step="0.001"
            value={formData.lat}
            onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
            placeholder="22.720"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Longitude
          </label>
          <input
            type="number"
            step="0.001"
            value={formData.lng}
            onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
            placeholder="75.857"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Boundary Map URL
        </label>
        <input
          type="text"
          value={formData.boundaryMapURL}
          onChange={(e) => setFormData({ ...formData, boundaryMapURL: e.target.value })}
          placeholder="/maps/land_dummy.png"
          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-gray-500 mt-1">Dummy URL used for now</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Document URL
        </label>
        <input
          type="text"
          value={formData.documentURL}
          onChange={(e) => setFormData({ ...formData, documentURL: e.target.value })}
          placeholder="e.g., /docs/land.pdf"
          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-gray-500 mt-1">Dummy URL used in API submission</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Extra Notes
        </label>
        <textarea
          value={formData.extraNotes}
          onChange={(e) => setFormData({ ...formData, extraNotes: e.target.value })}
          placeholder="e.g., Prime location, road-facing plot"
          rows={3}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-secondary hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        {isLoading ? 'Listing...' : 'List Land'}
      </button>

      {error && (
        <div className="bg-red-500/15 border-2 border-red-500/60 rounded-lg p-4 text-sm text-red-300 space-y-2">
          <p className="font-semibold flex items-center gap-2">
            <span className="text-lg">✕</span> Error Listing Property
          </p>
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/15 border-2 border-green-500/60 rounded-lg p-4 text-sm text-green-300 space-y-2">
          <p className="font-semibold flex items-center gap-2">
            <span className="text-lg">✓</span> {success}
          </p>
        </div>
      )}
    </form>
  )
}
