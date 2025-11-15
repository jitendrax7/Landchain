import { ethers } from 'ethers';
import { BHUMICHAIN_CONTRACT_ADDRESS, BHUMICHAIN_CONTRACT_ABI } from './contractConfig';
import { storeTransferData, type TransferData } from './transferApi';

export interface TransactionStep {
  step: number;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  hash?: string;
  timestamp?: number;
  details?: string;
}

export interface TransactionFlow {
  steps: TransactionStep[];
  currentStep: number;
  overallStatus: 'idle' | 'processing' | 'completed' | 'failed';
  totalAmount: string;
  sellerAddress: string;
  landId: number;
}

export async function executeLandPurchaseTransaction(
  landId: number,
  priceInEth: string,
  sellerAddress: string,
  metadataURI?: string,
  onStepUpdate?: (flow: TransactionFlow) => void
): Promise<{ success: boolean; hash: string; error?: string }> {
  const transactionFlow: TransactionFlow = {
    steps: [
      { step: 1, name: 'Prepare Transaction', status: 'pending' },
      { step: 2, name: 'Transfer Funds to Seller', status: 'pending' },
      { step: 3, name: 'Update Land Ownership', status: 'pending' },
      { step: 4, name: 'Store Transfer Data', status: 'pending' },
      { step: 5, name: 'Confirm Transaction', status: 'pending' },
    ],
    currentStep: 0,
    overallStatus: 'processing',
    totalAmount: priceInEth,
    sellerAddress,
    landId,
  };

  try {
    // Step 1: Prepare Transaction
    transactionFlow.currentStep = 0;
    transactionFlow.steps[0].status = 'processing';
    transactionFlow.steps[0].timestamp = Date.now();
    onStepUpdate?.(transactionFlow);

    if (!window.ethereum) {
      throw new Error('MetaMask is not available');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      BHUMICHAIN_CONTRACT_ADDRESS,
      BHUMICHAIN_CONTRACT_ABI,
      signer
    );

    const priceInWei = ethers.parseEther(priceInEth);
    const userAddress = await signer.getAddress();

    console.log('[v0] Purchase validation:', {
      landId,
      buyer: userAddress,
      seller: sellerAddress,
      amount: priceInEth,
    });

    transactionFlow.steps[0].status = 'completed';
    transactionFlow.steps[0].details = `Preparing to purchase Land #${landId}`;
    onStepUpdate?.(transactionFlow);

    // Step 2: Transfer Funds to Seller Wallet
    transactionFlow.currentStep = 1;
    transactionFlow.steps[1].status = 'processing';
    transactionFlow.steps[1].timestamp = Date.now();
    onStepUpdate?.(transactionFlow);

    console.log('[v0] Initiating fund transfer to seller wallet:', sellerAddress);

    const tx = await contract.buyLand(landId, { value: priceInWei });
    transactionFlow.steps[1].hash = tx.hash;
    transactionFlow.steps[1].details = `Transferring ${priceInEth} ETH to seller`;
    onStepUpdate?.(transactionFlow);

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error('Transaction receipt not received');
    }

    transactionFlow.steps[1].status = 'completed';
    transactionFlow.steps[1].timestamp = Date.now();
    onStepUpdate?.(transactionFlow);

    // Step 3: Update Land Ownership (happens within buyProperty contract function)
    transactionFlow.currentStep = 2;
    transactionFlow.steps[2].status = 'processing';
    transactionFlow.steps[2].timestamp = Date.now();
    transactionFlow.steps[2].details = 'Updating land ownership on blockchain';
    onStepUpdate?.(transactionFlow);

    console.log('[v0] Verifying ownership transfer...');

    try {
      const updatedProperty = await contract.getProperty(landId);
      const newOwner = updatedProperty.owner;

      if (newOwner.toLowerCase() === userAddress.toLowerCase()) {
        console.log('[v0] Ownership successfully transferred to:', userAddress);
        transactionFlow.steps[2].status = 'completed';
        transactionFlow.steps[2].details = 'Land ownership transferred successfully';
      } else {
        console.warn('[v0] Ownership transfer verification pending');
        transactionFlow.steps[2].status = 'completed';
        transactionFlow.steps[2].details = 'Ownership update in progress';
      }
    } catch (err) {
      console.log('[v0] Could not verify ownership immediately:', err);
      transactionFlow.steps[2].status = 'completed';
      transactionFlow.steps[2].details = 'Ownership update initiated';
    }

    onStepUpdate?.(transactionFlow);

    // Step 4: Store Transfer Data
    transactionFlow.currentStep = 3;
    transactionFlow.steps[3].status = 'processing';
    transactionFlow.steps[3].timestamp = Date.now();
    transactionFlow.steps[3].details = 'Sending transaction data to backend';
    onStepUpdate?.(transactionFlow);

    console.log('[v0] Receipt received:', {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      transactionHash: tx.hash,
    });

    const transferData: TransferData = {
      landId,
      seller: sellerAddress,
      buyer: userAddress,
      amountWei: priceInWei.toString(),
      txHash: receipt.hash || tx.hash,
      blockNumber: receipt.blockNumber,
      timestamp: Math.floor(Date.now() / 1000),
      metadataURI: metadataURI || `land-${landId}`,
    };

    console.log('[v0] Calling API with transfer data:', transferData);
    
    const apiResult = await storeTransferData(transferData);

    if (apiResult.success) {
      transactionFlow.steps[3].status = 'completed';
      transactionFlow.steps[3].details = 'Transfer data stored successfully';
      console.log('[v0] API call successful:', apiResult);
    } else {
      console.warn('[v0] API call warning:', apiResult.error);
      transactionFlow.steps[3].status = 'completed';
      transactionFlow.steps[3].details = `Data storage: ${apiResult.error || 'Pending'}`;
    }

    onStepUpdate?.(transactionFlow);

    // Step 5: Confirm Transaction
    transactionFlow.currentStep = 4;
    transactionFlow.steps[4].status = 'processing';
    transactionFlow.steps[4].timestamp = Date.now();
    transactionFlow.steps[4].details = 'Finalizing transaction';
    onStepUpdate?.(transactionFlow);

    transactionFlow.steps[4].status = 'completed';
    transactionFlow.steps[4].hash = receipt.hash || tx.hash;
    transactionFlow.steps[4].timestamp = Date.now();
    transactionFlow.overallStatus = 'completed';
    onStepUpdate?.(transactionFlow);

    console.log('[v0] Land purchase transaction completed:', tx.hash);

    return {
      success: true,
      hash: tx.hash,
    };
  } catch (error) {
    console.error('[v0] Transaction error:', error);
    transactionFlow.overallStatus = 'failed';
    transactionFlow.steps[transactionFlow.currentStep].status = 'failed';
    transactionFlow.steps[transactionFlow.currentStep].details =
      error instanceof Error ? error.message : 'Transaction failed';

    onStepUpdate?.(transactionFlow);

    return {
      success: false,
      hash: '',
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
}
