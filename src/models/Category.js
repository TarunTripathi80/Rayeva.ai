const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  productDescription: {
    type: String,
    required: true,
  },
  primaryCategory: {
    type: String,
    required: true,
    enum: [
      "Personal Care", "Kitchen & Dining", "Home & Living",
      "Food & Beverage", "Office & Stationery", "Fashion & Accessories", 
      "Baby & Kids", "Pet Care", "Travel & Outdoors", "Cleaning & Hygiene"
    ]
  },
  subCategory: {
    type: String,
    required: true,
  },
  seoTags: [{
    type: String
  }],
  sustainabilityFilters: [{
    type: String,
    enum: [
      "plastic-free", "compostable", "vegan", "recycled",
      "biodegradable", "organic", "fair-trade", "zero-waste",
      "local-sourced", "carbon-neutral"
    ]
  }],
  confidence: {
    type: Number,
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
