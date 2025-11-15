import { ethers } from "ethers";
import { BHUMICHAIN_CONTRACT_ADDRESS, BHUMICHAIN_CONTRACT_ABI } from "./contractConfig";

export const DUMMY_LANDS = [
  {
    landId: 1n,
    currentOwner: "0x496b60a137D252eea9de0A3BCeC77498C3b4aeda",
    priceWei: ethers.parseEther("0.1"),
    isListed: true,
    isApproved: true,
    metadataURI: "ipfs://QmExample1",
    docHash: "hash1",
    createdAt: 1700000000n,
    updatedAt: 1700000000n,
    previousOwners: [],
  },
  {
    landId: 2n,
    currentOwner: "0x496b60a137D252eea9de0A3BCeC77498C3b4aeda",
    priceWei: ethers.parseEther("0.15"),
    isListed: false,
    isApproved: true,
    metadataURI: "ipfs://QmExample2",
    docHash: "hash2",
    createdAt: 1700000100n,
    updatedAt: 1700000100n,
    previousOwners: [],
  },
];

export const DUMMY_PROPERTIES = [
  {
    id: 1n,
    name: "Sunny Valley Estate",
    location: "California, USA",
    priceInWei: ethers.parseEther("0.1"),
    isAvailable: true,
    owner: "0x0000000000000000000000000000000000000000",
    seller: "0x496b60a137D252eea9de0A3BCeC77498C3b4aeda",
    createdAt: 1700000000n,
  },
  {
    id: 2n,
    name: "Ocean View Paradise",
    location: "Malibu, California",
    priceInWei: ethers.parseEther("0.15"),
    isAvailable: true,
    owner: "0x0000000000000000000000000000000000000000",
    seller: "0x496b60a137D252eea9de0A3BCeC77498C3b4aeda",
    createdAt: 1700000100n,
  },
];

export async function getProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner(provider: ethers.BrowserProvider) {
  return provider.getSigner();
}

export async function getBhumichainContract(signer: ethers.Signer) {
  return new ethers.Contract(
    BHUMICHAIN_CONTRACT_ADDRESS,
    BHUMICHAIN_CONTRACT_ABI,
    signer
  );
}

export async function getListedLands() {
  try {
    const provider = await getProvider();
    const contract = new ethers.Contract(
      BHUMICHAIN_CONTRACT_ADDRESS,
      BHUMICHAIN_CONTRACT_ABI,
      provider
    );
    const listedIds = await contract.getListedLandIds();
    console.log("[v0] Listed land IDs:", listedIds);
    
    const lands = [];
    for (const id of listedIds) {
      const land = await contract.getLand(id);
      console.log("[v0] Fetched land:", { id: id.toString(), ...land });
      lands.push({
        landId: land[0],
        currentOwner: land[1],
        priceWei: land[2],
        isListed: land[3],
        isApproved: land[4],
        metadataURI: land[5],
        docHash: land[6],
        createdAt: land[7],
        updatedAt: land[8],
        previousOwners: land[9],
      });
    }
    console.log("[v0] Total listed lands retrieved:", lands.length);
    return lands;
  } catch (error) {
    console.error("[v0] Error fetching listed lands:", error);
    return DUMMY_LANDS.filter((l) => l.isListed);
  }
}

export async function getLandsByOwner(ownerAddress: string) {
  try {
    const provider = await getProvider();
    const contract = new ethers.Contract(
      BHUMICHAIN_CONTRACT_ADDRESS,
      BHUMICHAIN_CONTRACT_ABI,
      provider
    );
    const allIds = await contract.getAllLandIds();
    const ownedLands = [];
    for (const id of allIds) {
      const land = await contract.getLand(id);
      if (land.currentOwner.toLowerCase() === ownerAddress.toLowerCase()) {
        ownedLands.push(land);
      }
    }
    return ownedLands;
  } catch (error) {
    console.error("[v0] Error fetching lands by owner:", error);
    return DUMMY_LANDS;
  }
}

export async function getAllProperties() {
  try {
    const provider = await getProvider();
    const contract = new ethers.Contract(
      BHUMICHAIN_CONTRACT_ADDRESS,
      BHUMICHAIN_CONTRACT_ABI,
      provider
    );
    const listedIds = await contract.getListedLandIds();
    console.log("[v0] Fetching properties for listed IDs:", listedIds);
    
    const properties = [];
    for (const id of listedIds) {
      const land = await contract.getLand(id);
      const property = {
        id: land[0],
        name: `Land #${land[0].toString()}`,
        location: land[5],
        priceInWei: land[2],
        isAvailable: land[3],
        owner: land[1],
        seller: land[1],
        createdAt: land[7],
      };
      properties.push(property);
      console.log("[v0] Added property:", property);
    }
    
    console.log("[v0] Total properties retrieved:", properties.length);
    return properties.length > 0 ? properties : DUMMY_PROPERTIES;
  } catch (error) {
    console.error("[v0] Error fetching properties from contract, using dummy data:", error);
    return DUMMY_PROPERTIES;
  }
}

export async function addLand(metadataURI: string, docHash: string) {
  const provider = await getProvider();
  const signer = await getSigner(provider);
  const contract = await getBhumichainContract(signer);

  const tx = await contract.addLand(metadataURI, docHash);
  return tx.wait();
}

export async function addProperty(name: string, location: string, priceInEth: string) {
  const provider = await getProvider();
  const signer = await getSigner(provider);
  const contract = await getBhumichainContract(signer);

  const priceInWei = ethers.parseEther(priceInEth);
  
  const tx = await contract.addLand(name, location);
  console.log('[v0] Land added:', tx.hash);
  
  const receipt = await tx.wait();
  
  if (receipt) {
    try {
      const allIds = await contract.getAllLandIds();
      if (allIds.length > 0) {
        const landId = allIds[allIds.length - 1];
        const landIdBigInt = BigInt(landId.toString());
        console.log('[v0] Attempting to list land:', { landId: landIdBigInt.toString(), priceInWei: priceInWei.toString() });
        const listTx = await contract.listForSale(landIdBigInt, priceInWei);
        await listTx.wait();
        console.log('[v0] Land listed for sale:', listTx.hash);
      }
    } catch (error) {
      console.error('[v0] Error listing land for sale:', error);
      throw error;
    }
  }
  
  return receipt;
}

export async function listLandForSale(landId: number, priceInEth: string) {
  const provider = await getProvider();
  const signer = await getSigner(provider);
  const contract = await getBhumichainContract(signer);

  const priceInWei = ethers.parseEther(priceInEth);
  const tx = await contract.listForSale(landId, priceInWei);
  console.log("[v0] Land listed:", tx.hash);
  return tx.wait();
}

export async function unlistLand(landId: number) {
  const provider = await getProvider();
  const signer = await getSigner(provider);
  const contract = await getBhumichainContract(signer);

  const tx = await contract.unlist(landId);
  console.log("[v0] Land unlisted:", tx.hash);
  return tx.wait();
}

export async function buyLand(landId: number, priceInEth: string) {
  return buyProperty(landId, priceInEth)
}

export async function buyProperty(landId: number, priceInEth: string) {
  try {
    const provider = await getProvider()
    const signer = await getSigner(provider)
    const contract = await getBhumichainContract(signer)

    const priceInWei = ethers.parseEther(priceInEth)
    console.log('[v0] Calling buyLand with landId:', landId, 'priceInWei:', priceInWei.toString())
    
    const tx = await contract.buyLand(landId, { value: priceInWei })
    console.log('[v0] Transaction sent:', tx.hash)

    const receipt = await tx.wait()
    console.log('[v0] Transaction confirmed:', receipt)

    return {
      hash: tx.hash,
      receipt: receipt,
    }
  } catch (error) {
    const err = error as any
    if (err.transaction) {
      const detailedError = {
        reason: err.reason || err.message,
        from: err.transaction.from,
        to: err.transaction.to,
        data: err.transaction.data,
        value: err.transaction.value,
        code: err.code,
        fullError: err.toString(),
      }
      console.error('[v0] Detailed buy property error:', detailedError)
      throw new Error(
        `Transaction failed: ${err.reason || err.message}\n` +
        `From: ${err.transaction.from}\n` +
        `To: ${err.transaction.to}\n` +
        `Value: ${err.transaction.value}`
      )
    }
    console.error('[v0] Buy property error:', error)
    throw error
  }
}

export async function getWalletBalance(address: string) {
  try {
    const provider = await getProvider();
    const balance = await provider.getBalance(address);
    return balance;
  } catch (error) {
    console.error("[v0] Error fetching wallet balance:", error);
    return 0n;
  }
}
