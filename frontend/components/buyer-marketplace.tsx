'use client'

import { useState, useEffect } from 'react'
import PropertyCard from './property-card'
import LandDetailsPopup from './land-details-popup'
import PremiumFeatures from './premium-features'
import BuyerPropertyDetailsTab from './buyer-property-details-tab'
import { getAllProperties } from '@/lib/web3Client'
import { Search, Sliders, MapPin, TrendingUp, Filter } from 'lucide-react'

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

interface BuyerMarketplaceProps {
  buyerAccount: string
}

export default function BuyerMarketplace({ buyerAccount }: BuyerMarketplaceProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<bigint | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await getAllProperties()
      setProperties(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching properties:', err)
      setError('Failed to load properties from blockchain')
      setProperties([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePropertyClick = (propertyId: bigint) => {
    setSelectedPropertyId(propertyId)
  }

  const selectedProperty = properties.find(p => p.id === selectedPropertyId)

  const availableProperties = properties.filter((p) => p.isAvailable)
  const soldProperties = properties.filter((p) => !p.isAvailable)

  const filteredAvailable = availableProperties.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (selectedPropertyId !== null && selectedProperty) {
    return (
      <BuyerPropertyDetailsTab
        property={selectedProperty}
        onClose={() => setSelectedPropertyId(null)}
        buyerAccount={buyerAccount}
        onPurchased={() => {
          fetchProperties()
          setSelectedPropertyId(null)
        }}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-400">Loading properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Search & Filters Section */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-1">Marketplace</h2>
            <p className="text-gray-400">Browse and purchase land in our blockchain-based marketplace</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition border border-primary/30 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              Trending
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition border border-accent/30 text-sm font-medium">
              <MapPin className="w-4 h-4" />
              Near Me
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by property name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:border-primary transition"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-card border border-border rounded-lg hover:border-primary transition flex items-center gap-2 text-gray-400 hover:text-foreground"
          >
            <Sliders className="w-5 h-5" />
            <span className="hidden md:inline text-sm">Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-card border border-border rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block">Price Range</label>
              <select className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary">
                <option>All Prices</option>
                <option>0 - 1 ETH</option>
                <option>1 - 5 ETH</option>
                <option>5+ ETH</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block">Location</label>
              <select className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary">
                <option>All Locations</option>
                <option>North</option>
                <option>South</option>
                <option>East</option>
                <option>West</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block">Status</label>
              <select className="w-full px-3 py-2 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary">
                <option>All Status</option>
                <option>Available</option>
                <option>Sold</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded text-sm font-medium transition">
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 text-sm text-blue-400 mb-6">
          <strong>Note:</strong> {error}
        </div>
      )}

      {/* Available Properties */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">
            Available Properties <span className="text-gray-400 font-normal">({filteredAvailable.length})</span>
          </h3>
        </div>
        {filteredAvailable.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAvailable.map((property) => (
              <div 
                key={Number(property.id)} 
                onClick={() => handlePropertyClick(property.id)} 
                className="cursor-pointer"
              >
                <PropertyCard property={property} buyerAccount={buyerAccount} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Filter className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">No properties found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Sold Properties */}
      {soldProperties.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-400 mb-6">
            Sold Properties <span className="font-normal">({soldProperties.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {soldProperties.map((property) => (
              <div key={Number(property.id)} onClick={() => handlePropertyClick(property.id)} className="cursor-pointer opacity-60">
                <PropertyCard property={property} buyerAccount={buyerAccount} />
              </div>
            ))}
          </div>
        </div>
      )}

      <PremiumFeatures userRole="buyer" />
    </div>
  )
}
