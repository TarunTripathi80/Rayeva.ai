const { generateAndSaveCategory } = require('../services/categoryService');

const generateCategory = async (req, res) => {
  try {
    const { productName, productDescription } = req.body;
    
    if (!productName || !productDescription) {
      return res.status(400).json({ error: 'productName and productDescription are required' });
    }

    const categoryDocs = await generateAndSaveCategory({ productName, productDescription });
    
    // We can just return the relevant data matching the instructions
    return res.status(200).json({
      primaryCategory: categoryDocs.primaryCategory,
      subCategory: categoryDocs.subCategory,
      seoTags: categoryDocs.seoTags,
      sustainabilityFilters: categoryDocs.sustainabilityFilters,
      confidence: categoryDocs.confidence
    });
  } catch (error) {
    console.error('Category Generation Error:', error);
    return res.status(400).json({ error: error.message || 'Failed to generate category' });
  }
};

module.exports = {
  generateCategory
};
