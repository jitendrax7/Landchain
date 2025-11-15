import express from "express";
import Land from "../models/Land.js";
// import { contract } from "../blockchain/web3.js";

const router = express.Router();




router.get("/sync/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const landData = await contract.methods.lands(id).call();

    await Land.findOneAndUpdate(
      { landId: id },
      { isApproved: landData.isApproved }
    );

    res.json({ status: "synced", approved: landData.isApproved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/land/:landId", async (req, res) => {
    try {
        const landId = req.params.landId;

        // Call smart contract
        const land = await contract.getLand(landId);

        // Format output
        const responseData = {
            landId: Number(land[0]),
            currentOwner: land[1],
            priceWei: land[2].toString(),
            isListed: land[3],
            isApproved: land[4],
            metadataURI: land[5],
            docHash: land[6],
            createdAt: Number(land[7]),
            updatedAt: Number(land[8]),
            previousOwners: land[9],
        };

        return res.status(200).json({
            success: true,
            message: "Land details fetched successfully",
            data: responseData,
        });

    } catch (error) {
        console.error("Error fetching land:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch land details",
            error: error.message,
        });
    }
});






router.get("/listed", async (req, res) => {
  try {
    
    const lands = await Land.find({ status: "listed" })
      .sort({ createdAt: -1 }) 
      .select("-__v");         

    return res.status(200).json({
      success: true,
      count: lands.length,
      lands,
    });

  } catch (error) {
    console.error("Error fetching listed lands:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch listed lands.",
    });
  }
});


router.post("/add", async (req, res) => {
  try {
    const {
      landId,
      ownerName,
      wallet_address,
      price,
      landSize,
      landType,
      status,
      isApproved,
      approvedBy,
      approvalDate,
      location,
      geoLocation,
      documents,
      blockchainTxHash,
      boundaryMapURL,
      previousOwners,
      addedBy,
      extraNotes
    } = req.body;

    
    if (!landId || !ownerName || !wallet_address || !price || !location || !addedBy) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

   
    const exists = await Land.findOne({ landId });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Land with this landId already exists"
      });
    }

   
    const newLand = new Land({
      landId,
      ownerName,
      wallet_address,
      price,
      landSize,
      landType,
      status,
      isApproved,
      approvedBy,
      approvalDate,
      location,
      geoLocation,
      documents,
      blockchainTxHash,
      boundaryMapURL,
      previousOwners,
      addedBy,
      extraNotes,
    });

    await newLand.save();

    return res.status(201).json({
      success: true,
      message: "Land added successfully",
      data: newLand
    });

  } catch (error) {
    console.error("Add Land Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});




export default router;