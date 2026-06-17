import mongoose from 'mongoose';

const workTimeSchema = new mongoose.Schema({
  timeFrom: { type: Date, required: true },
  timeUpto: { type: Date, required: true },
  workTime: { type: Number, required: true }, // in minutes or hours
  engineerName: { type: String, required: true },
  remark: { type: String, default: "" }
}, { _id: false });

const serviceReportSchema = new mongoose.Schema({
  reportNo: { type: String, required: true, unique: true, index: true },
  reportDate: { type: Date, required: true, default: Date.now },
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
  engineerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: false
  },
  jobTitle: { type: String, required: true },
  jobCategory: { type: String, required: true },
  plantName: { type: String, default: "" },
  plantAddress: { type: String, default: "" },
  attName: { type: String, default: "" },
  serviceType: { type: String, default: 'On Site' },
  engineerSignature: { type: String, default: "" },
  customerSignature: { type: String, default: "" },
  chargesType: { 
    type: String, 
    enum: ['Warranty', 'AMC', 'Chargeable', 'FOC'], 
    required: true 
  },
  observation: { type: String, required: true },
  causeOfFailure: { type: String, required: true },
  actionTaken: { type: String, required: true },
  recommendation: { type: String, required: true },
  workTime: [workTimeSchema],
  approvalStatus: { 
    type: String, 
    enum: ['Draft', 'Submitted', 'Approved'], 
    default: 'Draft',
    index: true
  }
}, { timestamps: true });

export default mongoose.model('ServiceReport', serviceReportSchema);
