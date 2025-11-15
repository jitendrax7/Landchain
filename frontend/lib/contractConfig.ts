import { ethers } from "ethers";

export const BHUMICHAIN_CONTRACT_ABI = [
  // addLand function
  {
    inputs: [
      { internalType: "string", name: "metadataURI", type: "string" },
      { internalType: "string", name: "docHash", type: "string" },
    ],
    name: "addLand",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // listForSale function
  {
    inputs: [
      { internalType: "uint256", name: "_landId", type: "uint256" },
      { internalType: "uint256", name: "_priceWei", type: "uint256" },
    ],
    name: "listForSale",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // unlist function
  {
    inputs: [{ internalType: "uint256", name: "_landId", type: "uint256" }],
    name: "unlist",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // buyLand function
  {
    inputs: [{ internalType: "uint256", name: "_landId", type: "uint256" }],
    name: "buyLand",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_landId", type: "uint256" }],
    name: "getLand",
    outputs: [
      { internalType: "uint256", name: "landId", type: "uint256" },
      { internalType: "address", name: "currentOwner", type: "address" },
      { internalType: "uint256", name: "priceWei", type: "uint256" },
      { internalType: "bool", name: "isListed", type: "bool" },
      { internalType: "bool", name: "isApproved", type: "bool" },
      { internalType: "string", name: "metadataURI", type: "string" },
      { internalType: "string", name: "docHash", type: "string" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "address[]", name: "previousOwners", type: "address[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // getListedLandIds view function
  {
    inputs: [],
    name: "getListedLandIds",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  // getAllLandIds view function
  {
    inputs: [],
    name: "getAllLandIds",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "landId", type: "uint256" },
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "string", name: "metadataURI", type: "string" },
    ],
    name: "LandAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "landId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "priceWei", type: "uint256" },
    ],
    name: "LandListed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "landId", type: "uint256" },
    ],
    name: "LandUnlisted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "landId", type: "uint256" },
      { indexed: true, internalType: "address", name: "seller", type: "address" },
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
      { indexed: false, internalType: "uint256", name: "priceWei", type: "uint256" },
    ],
    name: "LandBought",
    type: "event",
  },
];

function getValidAddress(address: string): string {
  try {
    return ethers.getAddress(address);
  } catch (error) {
    try {
      return ethers.getAddress(address.toLowerCase());
    } catch {
      console.warn(`Invalid contract address: ${address}. Using as-is.`);
      return address;
    }
  }
}

const rawAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xA5Df4054A1bCB49CB10f71DCCcd4DB30b986C11C";
export const BHUMICHAIN_CONTRACT_ADDRESS = getValidAddress(rawAddress);

export function getContractConfig() {
  return {
    address: BHUMICHAIN_CONTRACT_ADDRESS,
    abi: BHUMICHAIN_CONTRACT_ABI,
  };
}
