'use client'

import { useState } from 'react'

interface PropertyFormProps {
  onPropertyAdded: () => void
}

export default function PropertyForm({ onPropertyAdded }: PropertyFormProps) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      if (!name.trim() || !location.trim()) {
        throw new Error('Please fill in all fields')
      }

      // Simulate contract interaction
      console.log('Adding property:', { name, location })
      
      setSuccess(`Property "${name}" added successfully!`)
      setName('')
      setLocation('')
      onPropertyAdded()

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add property')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Property Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Downtown Penthouse"
          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Location
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., New York, NY"
          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-secondary hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition"
      >
        {isLoading ? 'Adding...' : 'Add Property'}
      </button>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-secondary/10 border border-secondary/50 rounded-lg p-3 text-sm text-secondary">
          {success}
        </div>
      )}
    </form>
  )
}
