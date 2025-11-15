'use client'

import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import type { TransactionFlow } from '@/lib/transactionService'

interface TransactionProgressModalProps {
  flow: TransactionFlow
  isOpen: boolean
  onClose: () => void
}

export default function TransactionProgressModal({
  flow,
  isOpen,
  onClose,
}: TransactionProgressModalProps) {
  if (!isOpen) return null

  const getStepIcon = (status: string, index: number) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'text-green-500'
      case 'processing':
        return 'text-blue-500'
      case 'failed':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Land Purchase</h2>
          <p className="text-gray-400">Processing your transaction</p>
        </div>

        {/* Amount Info */}
        <div className="bg-background rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Total Amount</span>
            <span className="text-xl font-bold text-cyan-500">{flow.totalAmount} ETH</span>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Land ID: #{flow.landId}
          </div>
        </div>

        {/* Transaction Steps */}
        <div className="space-y-3">
          {flow.steps.map((step, index) => (
            <div key={step.step} className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="mt-1">{getStepIcon(step.status, index)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold ${getStatusColor(step.status)}`}>
                      Step {step.step}: {step.name}
                    </p>
                    <span className="text-xs text-gray-500 capitalize">
                      {step.status}
                    </span>
                  </div>
                  {step.details && (
                    <p className="text-sm text-gray-400 mt-1">{step.details}</p>
                  )}
                  {step.hash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${step.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block"
                    >
                      {step.hash.slice(0, 10)}...{step.hash.slice(-8)}
                    </a>
                  )}
                </div>
              </div>
              {index < flow.steps.length - 1 && (
                <div className="ml-2.5 h-6 border-l-2 border-gray-700"></div>
              )}
            </div>
          ))}
        </div>

        {/* Status Footer */}
        {flow.overallStatus === 'completed' && (
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            Done
          </button>
        )}

        {flow.overallStatus === 'failed' && (
          <button
            onClick={onClose}
            className="w-full bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-400 font-semibold py-2 px-4 rounded-lg transition"
          >
            Close
          </button>
        )}

        {flow.overallStatus === 'processing' && (
          <div className="text-center">
            <p className="text-sm text-gray-400">
              Please don't close this window...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
