const mongoose = require('mongoose');

const proposedProductSchema = new mongoose.Schema({
  productName: String,
  quantity: Number,
  unitPrice: Number,
  totalCost: Number,
  sustainabilityHighlight: String
}, { _id: false });

const budgetBreakdownSchema = new mongoose.Schema({
  products: Number,
  packaging: Number,
  logistics: Number
}, { _id: false });

const proposalSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: true
  },
  initialBudget: Number,
  employeeCount: Number,
  preferences: [String],
  useCase: String,
  
  // Generated output fields
  totalBudget: Number, // Reference budget in system output
  proposedProducts: [proposedProductSchema],
  budgetBreakdown: budgetBreakdownSchema,
  impactSummary: String,
  totalCost: {
    type: Number,
    required: true
  },
  
  // Store raw system response for audit
  engineResponse: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

module.exports = mongoose.model('Proposal', proposalSchema);
