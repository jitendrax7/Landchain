import express from "express";
import TransferHistory from "../models/TransferHistory.js";

const router = express.Router();

router.post("/store", async (req, res) => {
  try {
    const {
      landId,
      seller,
      buyer,
      amountWei,
      txHash,
      blockNumber,
      timestamp,
      metadataURI
    } = req.body;

    if (
      !landId ||
      !seller ||
      !buyer ||
      !amountWei ||
      !txHash ||
      !blockNumber ||
      !timestamp
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (typeof landId !== "number" || landId <= 0) {
      return res.status(400).json({ message: "Invalid landId" });
    }

    if (!seller.startsWith("0x") || !buyer.startsWith("0x")) {
      return res.status(400).json({ message: "Invalid wallet address format" });
    }

    if (!/^\d+$/.test(amountWei)) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const exists = await TransferHistory.findOne({ txHash });
    if (exists) {
      return res.status(409).json({ message: "Transaction already stored" });
    }

    const newHistory = await TransferHistory.create({
      landId,
      seller,
      buyer,
      amountWei,
      txHash,
      blockNumber,
      timestamp,
      metadataURI: metadataURI || ""
    });

    return res.status(201).json({
      message: "Transfer history saved",
      data: newHistory
    });

  } catch {
    return res.status(500).json({ message: "Server error" });
  }
});



router.get("/recent/:address", async (req, res) => {
  try {
    const address = req.params.address;
    if (!address) {
      return res.status(400).json({ message: "Address required" });
    }

    // Limit safety max = 50
    const limit = parseInt(req.query.limit) || 10;
    const safeLimit = limit > 50 ? 50 : limit;

    // Find transfer history where user is seller OR buyer
    const transactions = await TransferHistory
      .find({
        $or: [
          { seller: address },
          { buyer: address }
        ]
      })
      .sort({ timestamp: -1 })
      .limit(safeLimit);

    return res.json({
      count: transactions.length,
      transactions
    });

  } catch {
    return res.status(500).json({ message: "Server error" });
  }
});
export default router;
