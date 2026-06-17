import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  reportId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ServiceReport', 
    required: true,
    unique: true // One feedback per report
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comments: { type: String, trim: true }
}, { timestamps: true });

export default mongoose.model('Feedback', feedbackSchema);
