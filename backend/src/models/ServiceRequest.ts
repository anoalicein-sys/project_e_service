import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  machineId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Machine', 
    required: true,
    index: true
  },
  status: { 
    type: String, 
    enum: ['Open', 'Assigned', 'Completed'], 
    default: 'Open',
    index: true
  },
  assignedEngineerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  issueDescription: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('ServiceRequest', serviceRequestSchema);
