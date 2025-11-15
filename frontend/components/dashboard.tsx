'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import BuyerMarketplace from './buyer-marketplace'
import SellerPanel from './seller-panel'
import { ThemeToggle } from './theme-toggle'
import { Menu, Bell, Settings, Search, LogOut, Sparkles, TrendingUp } from 'lucide-react'

interface DashboardProps {
  account: string
  userRole: 'buyer' | 'seller'
  onDisconnect: () => void
  setUserRole: (role: 'buyer' | 'seller') => void
}

interface DashboardStats {
  propertiesListed: number
  totalSales: number
  totalRequests: number
  totalValue: number
}

interface ChartData {
  month: string
  sales: number
  requests: number
}

export default function Dashboard({
  account,
  userRole,
  onDisconnect,
  setUserRole,
}: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    propertiesListed: 12,
    totalSales: 4,
    totalRequests: 8,
    totalValue: 85.5,
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const chartData: ChartData[] = [
    { month: 'Jan', sales: 2, requests: 3 },
    { month: 'Feb', sales: 1, requests: 2 },
    { month: 'Mar', sales: 3, requests: 5 },
    { month: 'Apr', sales: 4, requests: 8 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-lg">▲</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Land Marketplace</h1>
                <p className="text-xs text-gray-400">Decentralized Real Estate</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search properties..." 
                  className="pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>
              <button className="p-2 hover:bg-card rounded-lg transition">
                <Bell className="w-5 h-5 text-gray-400 hover:text-foreground" />
              </button>
              <ThemeToggle />
            </div>

            {/* Mobile Menu */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-card rounded-lg transition"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Role Toggle & Account Info */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex gap-2 bg-card border border-border rounded-lg p-1.5">
              <button
                onClick={() => setUserRole('buyer')}
                className={`px-4 py-2 rounded-md transition-all font-medium text-sm ${
                  userRole === 'buyer'
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30'
                    : 'text-gray-400 hover:text-foreground'
                }`}
              >
                Buyer Mode
              </button>
              <button
                onClick={() => setUserRole('seller')}
                className={`px-4 py-2 rounded-md transition-all font-medium text-sm ${
                  userRole === 'seller'
                    ? 'bg-gradient-to-r from-secondary to-green-600 text-white shadow-lg shadow-secondary/30'
                    : 'text-gray-400 hover:text-foreground'
                }`}
              >
                Seller Mode
              </button>
            </div>

            {/* Account Info */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-300 font-mono">{account.slice(0, 6)}...{account.slice(-4)}</span>
              </div>
              <button
                onClick={onDisconnect}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition border border-transparent hover:border-red-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Stats - Show for Seller */}
        {userRole === 'seller' && (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
                  <p className="text-gray-400 text-sm">Track your property sales and market insights</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition border border-primary/30">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Premium Analytics</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Properties Listed Card */}
                <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6 hover:border-primary/30 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1 font-medium">Properties Listed</p>
                      <p className="text-3xl font-bold text-primary">{stats.propertiesListed}</p>
                      <p className="text-xs text-gray-500 mt-2">+2 this month</p>
                    </div>
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>

                {/* Total Sales Card */}
                <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6 hover:border-secondary/30 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1 font-medium">Total Sales</p>
                      <p className="text-3xl font-bold text-secondary">{stats.totalSales}</p>
                      <p className="text-xs text-gray-500 mt-2">+1 this month</p>
                    </div>
                    <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Total Requests Card */}
                <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6 hover:border-accent/30 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1 font-medium">Requests Received</p>
                      <p className="text-3xl font-bold text-accent">{stats.totalRequests}</p>
                      <p className="text-xs text-gray-500 mt-2">3 pending</p>
                    </div>
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Total Value Card */}
                <div className="bg-gradient-to-br from-card to-card/50 border border-border rounded-xl p-6 hover:border-cyan-500/30 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1 font-medium">Total Value (ETH)</p>
                      <p className="text-3xl font-bold text-cyan-500">{stats.totalValue}</p>
                      <p className="text-xs text-gray-500 mt-2">All-time earnings</p>
                    </div>
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.16 5.314l4.897-1.596A1 1 0 0115 4.97v4.383a5 5 0 01-2.5 4.33V8.87a1 1 0 10-2 0v5.466a5 5 0 01-2.5-4.33V4.97a1 1 0 011.16-1.656z"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Sales vs Requests Chart */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Sales & Requests Trend
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f0f1c',
                        border: '1px solid #1e1e32',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="sales" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="requests" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Trend Chart */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  Revenue Trend (ETH)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f0f1c',
                        border: '1px solid #1e1e32',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#06B6D4"
                      dot={{ fill: '#06B6D4', r: 4 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Role-specific Content */}
        {userRole === 'buyer' && <BuyerMarketplace buyerAccount={account} />}
        {userRole === 'seller' && <SellerPanel sellerAccount={account} />}
      </main>
    </div>
  )
}
