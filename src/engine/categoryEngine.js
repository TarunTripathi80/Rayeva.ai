const { OpenAI } = require('openai');

// Initialize openai client only when the function is called 
// to ensure process.env.OPENAI_API_KEY is available
const getClient = () => new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateCategoryPrompt = (productName, productDescription) => {
  return `You are an expert categorization system for a sustainable e-commerce platform.

Task: Analyze the product and return a strictly formatted JSON object with category and sustainability details.
DO NOT include any markdown formatting, no code blocks, no explanations. Just the raw JSON object.

Product Name: ${productName}
Product Description: ${productDescription}

Rules:
1. "primaryCategory" MUST be exactly one of: ["Personal Care", "Kitchen & Dining", "Home & Living", "Food & Beverage", "Office & Stationery", "Fashion & Accessories", "Baby & Kids", "Pet Care", "Travel & Outdoors", "Cleaning & Hygiene"]
2. "subCategory" is a short string of your choice.
3. "seoTags" MUST be an array of exactly 5-10 descriptive tracking tags.
4. "sustainabilityFilters" MUST be an array containing ONLY values from this list: ["plastic-free", "compostable", "vegan", "recycled", "biodegradable", "organic", "fair-trade", "zero-waste", "local-sourced", "carbon-neutral"]. Include all that apply.
5. "confidence" MUST be a number between 0 and 1 indicating how confident you are in this categorization.

Required JSON Structure:
{
  "primaryCategory": "string",
  "subCategory": "string",
  "seoTags": ["string"],
  "sustainabilityFilters": ["string"],
  "confidence": number
}`;
};

/**
 * Calls the analysis engine to generate category data
 * @param {string} productName 
 * @param {string} productDescription 
 * @returns {Promise<{rawResponse: string, prompt: string}>}
 */
const generateCategoryData = async (productName, productDescription) => {
  const prompt = generateCategoryPrompt(productName, productDescription);
  
  const client = getClient();
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return {
    rawResponse: response.choices[0].message.content,
    prompt
  };
};

module.exports = { generateCategoryData };
