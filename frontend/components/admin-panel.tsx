'use client'

import { useState } from 'react'
import PropertyForm from './property-form'

interface AdminPanelProps {
  adminAccount: string
}

export default function AdminPanel({ adminAccount }: AdminPanelProps) {
  const [propertyAdded, setPropertyAdded] = useState(false)

  const handlePropertyAdded = () => {
    setPropertyAdded(!propertyAdded)
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Admin Panel</h2>
        <p className="text-gray-400">Add new properties to the marketplace</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Add New Property</h3>
            <PropertyForm onPropertyAdded={handlePropertyAdded} />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Information</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">✓</span>
                <span>Fill in the property name and location</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">✓</span>
                <span>Click "Add Property" to list it on the marketplace</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">✓</span>
                <span>New properties are automatically set as available</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-secondary mt-1">✓</span>
                <span>Buyers will see your properties in their dashboard</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
