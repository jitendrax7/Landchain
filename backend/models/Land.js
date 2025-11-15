import mongoose from "mongoose";

const landSchema = new mongoose.Schema({
  landId: { type: Number, required: true },
  ownerName: { type: String, required: true },
  wallet_address: { type: String, required: true },

  price: { type: Number, required: true },
  landSize: { type: String }, 
  landType: { type: String, enum: ["agriculture", "forest", "residential", "commercial"], default: "agriculture" },


  status: { type: String, enum: ["pending", "approved", "listed", "available", "sold"], default: "pending" },
  isApproved: { type: Boolean, default: false },


  approvedBy: { type: String },   
  approvalDate: { type: Date },


  location: { type: String, required: true },
  geoLocation: {
    lat: Number,
    lng: Number
  },


  documents: [
    {
      name: String,
      url: String, 
      uploadedAt: Date
    } 
  ],


  blockchainTxHash: { type: String },   
  boundaryMapURL: { type: String },     


  previousOwners: [
    {
      name: String,
      walletAddress: String,
      transferDate: Date
    }
  ],

  
  addedBy: { type: String, required: true }, 

  extraNotes: { type: String }

}, { timestamps: true });

export default mongoose.model("Land", landSchema);
 