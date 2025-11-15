'use client'

import { TrendingUp, Eye, Heart, Share2, Clock, Award } from 'lucide-react'

interface AdvancedInsightsProps {
  userRole: 'buyer' | 'seller'
}

export default function AdvancedInsights({ userRole }: AdvancedInsightsProps) {
  if (userRole === 'buyer') {
    return (
      <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6 hover:border-primary/30 transition">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Your Market Insights</h3>
            <p className="text-xs text-gray-400 mt-1">Track your browsing activity and favorites</p>
          </div>
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
            <Eye className="w-6 h-6 text-primary" />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-sm text-gray-300">Favorite Properties</span>
            </div>
            <span className="font-bold text-foreground">12</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-300">Recently Viewed</span>
            </div>
            <span className="font-bold text-foreground">8</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Share2 className="w-4 h-4 text-cyan-500" />
              <span className="text-sm text-gray-300">Shared Listings</span>
            </div>
            <span className="font-bold text-foreground">3</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6 hover:border-secondary/30 transition">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Your Performance</h3>
          <p className="text-xs text-gray-400 mt-1">Track seller metrics and achievements</p>
        </div>
        <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
          <Award className="w-6 h-6 text-secondary" />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-300">Conversion Rate</span>
          </div>
          <span className="font-bold text-green-500">75%</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Award className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-300">Seller Rating</span>
          </div>
          <span className="font-bold text-purple-500">4.8★</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-300">Avg. Response Time</span>
          </div>
          <span className="font-bold text-blue-500">2h</span>
        </div>
      </div>
    </div>
  )
}
