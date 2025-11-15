import mongoose from "mongoose";

const transferHistorySchema = new mongoose.Schema(
  {
    landId: {
      type: Number,
      required: true,
    },
    seller: {
      type: String,
      required: true,
    },
    buyer: {
      type: String,
      required: true,
    },
    txHash: {
      type: String,
      required: true,
      unique: true
    },
    amountWei: {
      type: String,
      required: true,
    },
    blockNumber: {
      type: Number,
    },
    timestamp: {
      type: Number,
    },
    metadataURI: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("TransferHistory", transferHistorySchema);
