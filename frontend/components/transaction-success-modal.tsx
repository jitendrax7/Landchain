'use client'

import { CheckCircle } from 'lucide-react'

interface TransactionSuccessModalProps {
  propertyName: string
  amount: string
  sellerAddress: string
  transactionHash?: string
  onClose: () => void
}

export default function TransactionSuccessModal({
  propertyName,
  amount,
  sellerAddress,
  transactionHash,
  onClose,
}: TransactionSuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 space-y-6 text-center">
        {/* Success Checkmark */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-lg"></div>
            <CheckCircle className="w-20 h-20 text-green-500 relative z-10" />
          </div>
        </div>

        {/* Success Message */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Purchase Successful!</h2>
          <p className="text-gray-400">Your transaction has been confirmed on the blockchain.</p>
        </div>

        {/* Details */}
        <div className="bg-background rounded-lg p-4 space-y-3 text-left">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Property</p>
            <p className="text-sm font-semibold text-foreground">{propertyName}</p>
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Amount Transferred</p>
            <p className="text-xl font-bold text-cyan-500">{amount} ETH</p>
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">To Seller Wallet</p>
            <p className="text-xs font-mono text-gray-300 break-all">{sellerAddress}</p>
          </div>

          {transactionHash && (
            <div className="border-t border-border pt-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Transaction Hash</p>
              <a
                href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-blue-400 hover:text-blue-300 break-all transition"
              >
                {transactionHash.slice(0, 10)}...{transactionHash.slice(-10)}
              </a>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Purchased Success
        </button>
      </div>
    </div>
  )
}
