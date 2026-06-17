import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ['Admin', 'Manager', 'Engineer', 'Customer'], 
    required: true 
  },
  managerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null,
    index: true
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
