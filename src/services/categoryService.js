const Category = require('../models/Category');
const { generateCategoryData } = require('../engine/categoryEngine');
const { logEngineAction } = require('../logs/engineLogger');

const VALID_CATEGORIES = [
  "Personal Care", "Kitchen & Dining", "Home & Living",
  "Food & Beverage", "Office & Stationery", "Fashion & Accessories", 
  "Baby & Kids", "Pet Care", "Travel & Outdoors", "Cleaning & Hygiene"
];

const VALID_FILTERS = [
  "plastic-free", "compostable", "vegan", "recycled",
  "biodegradable", "organic", "fair-trade", "zero-waste",
  "local-sourced", "carbon-neutral"
];

const extractJSON = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
};

const generateAndSaveCategory = async (productData) => {
  const { productName, productDescription } = productData;
  let rawResponse = '';
  let promptText = '';

  try {
    const engineResult = await generateCategoryData(productName, productDescription);
    rawResponse = engineResult.rawResponse;
    promptText = engineResult.prompt;

    const jsonString = extractJSON(rawResponse);
    const parsedData = JSON.parse(jsonString);

    // Validation
    if (!VALID_CATEGORIES.includes(parsedData.primaryCategory)) {
      throw new Error(`Invalid primaryCategory returned by engine: ${parsedData.primaryCategory}`);
    }

    // Optional strict validation on filters
    const validSustainabilityFilters = (parsedData.sustainabilityFilters || []).filter(
      f => VALID_FILTERS.includes(f)
    );

    const categoryDocs = new Category({
      productName,
      productDescription,
      primaryCategory: parsedData.primaryCategory,
      subCategory: parsedData.subCategory,
      seoTags: parsedData.seoTags || [],
      sustainabilityFilters: validSustainabilityFilters,
      confidence: parsedData.confidence
    });

    const savedCategory = await categoryDocs.save();

    logEngineAction({
      moduleName: 'CategoryEngine',
      prompt: promptText,
      rawResponse,
      parsedOutput: parsedData,
      success: true
    });

    return savedCategory;
  } catch (error) {
    logEngineAction({
      moduleName: 'CategoryEngine',
      prompt: promptText,
      rawResponse,
      parsedOutput: null,
      success: false,
      error: error.message
    });
    throw error;
  }
};

module.exports = {
  generateAndSaveCategory
};
