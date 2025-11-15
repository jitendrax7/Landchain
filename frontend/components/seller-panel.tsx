'use client'

import { useEffect, useState } from 'react'
import SellerPropertyForm from './seller-property-form'
import SellerListings from './seller-listings'
import PremiumFeatures from './premium-features'
import AdvancedInsights from './advanced-insights'
import { Plus, Package, TrendingUp, BarChart3 } from 'lucide-react'

interface SellerPanelProps {
  sellerAccount: string
}

export default function SellerPanel({ sellerAccount }: SellerPanelProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'add'>('listings')
  const [refreshKey, setRefreshKey] = useState(0)

  const handlePropertyAdded = () => {
    setRefreshKey((prev) => prev + 1)
    setActiveTab('listings')
  }

  return (
    <div className="space-y-12">
      <AdvancedInsights userRole="seller" />

      <PremiumFeatures userRole="seller" />

      {/* Tabs */}
      <div>
        <div className="mb-8">
          <div className="flex gap-4 border-b border-border pb-0">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-6 py-4 font-semibold border-b-2 transition-all flex items-center gap-2 text-sm md:text-base ${
                activeTab === 'listings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-foreground'
              }`}
            >
              <Package className="w-4 h-4 md:w-5 md:h-5" />
              My Properties
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-6 py-4 font-semibold border-b-2 transition-all flex items-center gap-2 text-sm md:text-base ${
                activeTab === 'add'
                  ? 'border-secondary text-secondary'
                  : 'border-transparent text-gray-400 hover:text-foreground'
              }`}
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              List Property
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'listings' && (
          <div>
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">Your Properties</h2>
                <p className="text-gray-400 text-sm">Manage and track your land listings</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg transition border border-accent/30 text-sm font-medium w-fit">
                <BarChart3 className="w-4 h-4" />
                Performance
              </button>
            </div>
            <SellerListings key={refreshKey} sellerAccount={sellerAccount} />
          </div>
        )}

        {activeTab === 'add' && (
          <div className="max-w-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">List New Property</h2>
              <p className="text-gray-400 text-sm">Register your land on the blockchain marketplace</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="mb-6 p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-secondary mb-1">List to reach more buyers</p>
                    <p className="text-xs text-gray-400">Your property will be visible to all marketplace users worldwide</p>
                  </div>
                </div>
              </div>
              
              <SellerPropertyForm onPropertyAdded={handlePropertyAdded} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
