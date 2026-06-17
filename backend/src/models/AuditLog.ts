import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  action: { type: String, required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetModel: { type: String, required: true }, // e.g., 'ServiceReport', 'User'
  details: { type: mongoose.Schema.Types.Mixed }, // To store diff or specific changes
}, { timestamps: true, updatedAt: false }); // Audit logs should not be updated

export default mongoose.model('AuditLog', auditLogSchema);
