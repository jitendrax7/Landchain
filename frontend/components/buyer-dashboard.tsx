'use client'

import { useState, useEffect } from 'react'
import PropertyCard from './property-card'

interface Property {
  id: number
  name: string
  location: string
  isAvailable: boolean
  owner: string
}

interface BuyerDashboardProps {
  buyerAccount: string
}

export default function BuyerDashboard({ buyerAccount }: BuyerDashboardProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      // Mock data for demonstration
      const mockProperties: Property[] = [
        {
          id: 1,
          name: 'Downtown Penthouse',
          location: 'New York, NY',
          isAvailable: true,
          owner: '0x0000000000000000000000000000000000000000',
        },
        {
          id: 2,
          name: 'Beachfront Villa',
          location: 'Miami, FL',
          isAvailable: true,
          owner: '0x0000000000000000000000000000000000000000',
        },
        {
          id: 3,
          name: 'Mountain Cabin',
          location: 'Aspen, CO',
          isAvailable: false,
          owner: '0x1234567890123456789012345678901234567890',
        },
      ]
      setProperties(mockProperties)
    } catch (error) {
      console.error('Error loading properties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const availableProperties = properties.filter((p) => p.isAvailable)
  const soldProperties = properties.filter((p) => !p.isAvailable)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Buyer Dashboard</h2>
        <p className="text-gray-400">Browse and purchase available properties</p>
      </div>

      <div className="mb-12">
        <h3 className="text-xl font-semibold text-secondary mb-4">
          Available Properties ({availableProperties.length})
        </h3>
        {availableProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                buyerAccount={buyerAccount}
                onPurchase={loadProperties}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-gray-400">No available properties at the moment</p>
          </div>
        )}
      </div>

      {soldProperties.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-400 mb-4">
            Sold Properties ({soldProperties.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {soldProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                buyerAccount={buyerAccount}
                onPurchase={loadProperties}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
