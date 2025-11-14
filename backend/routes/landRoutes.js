import express from "express";
import Land from "../models/Land.js";
// import { contract } from "../blockchain/web3.js";

const router = express.Router();

// Add land metadata only
router.post("/add", async (req, res) => {
  try {
    const { landId, ownerName, location, addedBy } = req.body;
    const land = await Land.create({ landId, ownerName, location, addedBy });
    res.json({ status: "land_added", land });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
  
// Get all lands
router.get("/", async (req, res) => {
  const lands = await Land.find();
  res.json(lands);
});

// Sync blockchain approval
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

export default router;
