export interface TransferData {
  landId: number;
  seller: string;
  buyer: string;
  amountWei: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  metadataURI?: string;
}

const API_BASE_URL = 'https://4cb53e5289e3.ngrok-free.app';
const API_ENDPOINT = '/api/land/add';

export async function storeTransferData(transferData: TransferData): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    console.log('[v0] Preparing to send land transfer data:', transferData);

    const payload = {
      landId: transferData.landId,
      seller: transferData.seller,
      buyer: transferData.buyer,
      amountWei: transferData.amountWei,
      txHash: transferData.txHash,
      blockNumber: transferData.blockNumber,
      timestamp: transferData.timestamp,
      metadataURI: transferData.metadataURI || `land-${transferData.landId}`,
    };

    console.log('[v0] Sending POST request to:', `${API_BASE_URL}${API_ENDPOINT}`);
    console.log('[v0] Payload:', JSON.stringify(payload, null, 2));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      mode: 'cors',
    });

    clearTimeout(timeoutId);

    console.log('[v0] API Response Status:', response.status);
    console.log('[v0] API Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch {
        const text = await response.text();
        console.error('[v0] API error response (text):', text);
        errorData = { message: text };
      }

      const errorMessage = errorData?.message || `API error: ${response.status} ${response.statusText}`;
      console.error('[v0] API Error:', errorMessage);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('[v0] Land data sent successfully. API Response:', result);

    return {
      success: true,
      message: result.message || 'Land purchase recorded successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[v0] Failed to send land transfer data to API:', errorMessage);

    // Still return a response so transaction can complete
    return {
      success: false,
      error: errorMessage,
    };
  }
}
