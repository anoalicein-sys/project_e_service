import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  type: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  serialNo: { type: String, required: true, unique: true, trim: true, index: true },
  installDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Under Maintenance', 'Decommissioned'], 
    default: 'Active' 
  }
}, { timestamps: true });

export default mongoose.model('Machine', machineSchema);
