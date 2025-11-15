'use client'

import { useState } from 'react'
import { Zap, Shield, TrendingUp, Users, Clock, Award, ChevronRight, Star } from 'lucide-react'

interface PremiumFeaturesProps {
  userRole: 'buyer' | 'seller'
}

export default function PremiumFeatures({ userRole }: PremiumFeaturesProps) {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null)

  const buyerFeatures = [
    {
      icon: TrendingUp,
      title: 'Smart Price Alerts',
      description: 'Get notified when properties in your target price range become available',
      badge: 'Pro',
      details: 'Set price alerts and receive instant notifications via email and dashboard'
    },
    {
      icon: Star,
      title: 'Watchlist Manager',
      description: 'Save your favorite properties and compare them side by side',
      badge: 'New',
      details: 'Create custom lists and track price changes over time'
    },
    {
      icon: Shield,
      title: 'Verified Escrow',
      description: 'Secure transactions with blockchain-based escrow service',
      badge: 'Pro',
      details: 'Your funds are protected until the property transfer is complete'
    },
    {
      icon: Users,
      title: 'Direct Seller Chat',
      description: 'Negotiate directly with sellers through encrypted messaging',
      badge: 'Coming',
      details: 'Built-in communication system for seamless negotiations'
    }
  ]

  const sellerFeatures = [
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Track impressions, inquiries, and conversion metrics for your listings',
      badge: 'Pro',
      details: 'Detailed insights to help you optimize your property listings'
    },
    {
      icon: Zap,
      title: 'Instant Verification',
      description: 'Get your properties verified faster with premium processing',
      badge: 'Pro',
      details: 'Priority verification queue for faster listing approval'
    },
    {
      icon: Award,
      title: 'Featured Listings',
      description: 'Boost your property visibility with premium placement',
      badge: 'Pro',
      details: 'Appear at the top of search results and category pages'
    },
    {
      icon: Clock,
      title: 'Bulk Operations',
      description: 'Manage multiple listings efficiently with batch tools',
      badge: 'Coming',
      details: 'Edit, update, or publish multiple properties at once'
    }
  ]

  const features = userRole === 'buyer' ? buyerFeatures : sellerFeatures

  return (
    <div className="bg-gradient-to-br from-background to-card/30 rounded-xl border border-border p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Premium Features</h3>
          <p className="text-gray-400">Unlock powerful tools to enhance your experience</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border border-primary/30">
          <Zap className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-primary">Available Now</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon
          const isExpanded = expandedFeature === index
          
          return (
            <button
              key={index}
              onClick={() => setExpandedFeature(isExpanded ? null : index)}
              className="text-left p-5 bg-card border border-border rounded-lg hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{feature.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        feature.badge === 'Pro' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : feature.badge === 'New'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-700/50 text-gray-400'
                      }`}>
                        {feature.badge}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </div>
              
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-gray-300 mb-3">{feature.details}</p>
                  {feature.badge === 'Pro' && (
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 text-white text-sm font-semibold rounded-lg transition">
                      Upgrade to Pro
                    </button>
                  )}
                  {feature.badge === 'Coming' && (
                    <div className="px-4 py-2 bg-gray-700/30 text-gray-400 text-sm font-medium rounded-lg text-center">
                      Coming Soon
                    </div>
                  )}
                  {feature.badge === 'New' && (
                    <button className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-semibold rounded-lg transition border border-green-500/30">
                      Explore Feature
                    </button>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
