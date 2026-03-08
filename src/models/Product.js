const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  sustainabilityFilters: [{
    type: String,
    enum: [
      "plastic-free", "compostable", "vegan", "recycled",
      "biodegradable", "organic", "fair-trade", "zero-waste",
      "local-sourced", "carbon-neutral"
    ]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
