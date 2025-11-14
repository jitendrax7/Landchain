import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  walletAddress: { type: String,  },
  role: {
    type: String,
    enum: ["farmer", "gramsabha", "", "admin"],
    default: "farmer"
  },
  aadhaar: { type: String },

  address: { type: String }, 

  isVerified: { type: Boolean, default: false },

  lastLogin: { type: Date },

}, { timestamps: true });

export default mongoose.models.user || mongoose.model('user',userSchema);
 