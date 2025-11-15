'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Lock, Zap, Globe, TrendingUp, Shield, Rocket, BarChart3 } from 'lucide-react'

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: Lock,
      title: 'Secure & Transparent',
      description: 'All transactions secured by blockchain technology with complete transparency'
    },
    {
      icon: Zap,
      title: 'Instant Settlement',
      description: 'Real-time property transfers with automated smart contracts'
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Buy and sell land from anywhere in the world without intermediaries'
    },
    {
      icon: Shield,
      title: 'Verified Properties',
      description: 'All properties verified and registered on the blockchain'
    }
  ]

  const stats = [
    { value: '1000+', label: 'Properties Listed', icon: TrendingUp },
    { value: '$50M+', label: 'Total Volume', icon: BarChart3 },
    { value: '24/7', label: 'Platform Active', icon: Rocket }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card/30">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">▲</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Land Marketplace</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-gray-400 hover:text-foreground transition">Features</a>
            <a href="#benefits" className="text-sm text-gray-400 hover:text-foreground transition">Benefits</a>
            <a href="#stats" className="text-sm text-gray-400 hover:text-foreground transition">Stats</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16">
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-6 inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/30 backdrop-blur">
            <p className="text-sm text-primary font-semibold">Next Generation Real Estate</p>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-balance leading-tight bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
            Decentralized land marketplace powered by Web3
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-8 text-balance max-w-2xl mx-auto leading-relaxed">
            A decentralized marketplace for land transactions. Secure, transparent, and instant settlement powered by Web3 technology. Start trading today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <button 
              onClick={onGetStarted}
              className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 text-white font-semibold rounded-lg transition transform hover:scale-105 duration-200"
            >
              Get Started
            </button>
            <button className="px-8 py-3 border border-primary hover:bg-primary/10 text-foreground font-semibold rounded-lg transition">
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div id="stats" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition backdrop-blur">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{stat.value}</p>
                  <p className="text-sm text-gray-400 mt-2">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Everything you need for seamless land transactions on the blockchain</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={index}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className={`p-6 bg-card rounded-xl border transition-all duration-300 cursor-pointer ${
                    hoveredFeature === index 
                      ? 'border-primary shadow-lg shadow-primary/20' 
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Benefits of decentralized real estate transactions</p>
          </div>

          <div className="space-y-4">
            {[
              { title: 'No Intermediaries', desc: 'Direct transactions between buyers and sellers with no brokers or middlemen' },
              { title: 'Lower Costs', desc: 'Eliminate traditional real estate fees and reduce transaction costs significantly' },
              { title: 'Faster Transactions', desc: 'Complete land sales in hours instead of weeks or months' },
              { title: 'Immutable Records', desc: 'All property details and ownership history recorded permanently on blockchain' }
            ].map((benefit, index) => (
              <div key={index} className="flex gap-4 p-6 bg-card rounded-lg border border-border hover:border-primary/30 transition">
                <CheckCircle2 className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-1">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-gray-400 text-lg mb-8">Connect your wallet and begin trading land on the blockchain today</p>
          <button 
            onClick={onGetStarted}
            className="px-12 py-4 bg-gradient-to-r from-primary to-primary-dark hover:shadow-lg hover:shadow-primary/30 text-white font-bold text-lg rounded-lg transition transform hover:scale-105 duration-200"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
          <p className="mb-4">© 2025 Land Marketplace. All rights reserved.</p>
          <div className="flex gap-6 justify-center text-sm">
            <a href="#" className="hover:text-foreground transition">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
