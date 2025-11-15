export async function submitLandToApi(landData: {
  landId: number;
  ownerName: string;
  wallet_address: string;
  price: number;
  landSize: string;
  landType: string;
  status: string;
  isApproved: boolean;
  approvedBy?: string;
  location: string;
  geoLocation?: { lat: number; lng: number };
  blockchainTxHash: string;
  boundaryMapURL?: string;
  extraNotes?: string;
}) {
  try {
    const response = await fetch("https://4cb53e5289e3.ngrok-free.app/api/lands/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...landData,
        isApproved: true,
        approvalDate: new Date().toISOString().split("T")[0],
        documents: [
          {
            name: "Land Document",
            url: "/docs/land_dummy.pdf",
            uploadedAt: new Date().toISOString().split("T")[0],
          },
        ],
        geoLocation: landData.geoLocation || { lat: 0, lng: 0 },
        boundaryMapURL: landData.boundaryMapURL || "/maps/land_dummy.png",
        previousOwners: [],
        addedBy: "User",
        extraNotes: landData.extraNotes || "Added via blockchain marketplace",
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("[v0] Land submitted to API successfully:", result);
    return result;
  } catch (error) {
    console.error("[v0] Error submitting land to API:", error);
    throw error;
  }
}

export async function getLandDetailsFromApi(landId: number) {
  try {
    const response = await fetch(`https://4cb53e5289e3.ngrok-free.app/api/lands/land/${landId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("[v0] Land details fetched from API:", result);
    return result;
  } catch (error) {
    console.error("[v0] Error fetching land details from API:", error);
    throw error;
  }
}
