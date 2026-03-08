const { OpenAI } = require('openai');

const getClient = () => new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateProposalPrompt = ({ clientName, totalBudget, employeeCount, preferences, useCase }, availableProducts) => {
  return `You are an expert B2B sales strategist for a sustainable e-commerce platform.

Task: Create a B2B product proposal based on the client's needs and available products.
DO NOT include any markdown formatting, no code blocks, no explanations. Return ONLY the raw JSON object.

Client Details:
- Name: ${clientName}
- Budget: ${totalBudget}
- Employees: ${employeeCount}
- Preferences: ${preferences.join(', ')}
- Use Case: ${useCase}

Available Products in Database (You MUST ONLY choose from these):
${JSON.stringify(availableProducts, null, 2)}

Rules:
1. "proposedProducts" MUST be an array. Each object MUST have:
   - "productName": MUST exactly match a name from Available Products.
   - "quantity": Number of units.
   - "unitPrice": Cost per unit (MUST match the price from Available Products).
   - "totalCost": quantity * unitPrice.
   - "sustainabilityHighlight": A short string explaining why this product fits their needs.
2. "budgetBreakdown" MUST be an object with: "products", "packaging", and "logistics" (Number values). 
   - The sum of these three MUST exactly equal "totalBudget".
3. "totalCost": MUST be the sum of the totalCost of all proposedProducts + packaging + logistics. It must not exceed the provided budget.
4. "impactSummary": A short paragraph summarizing the positive environmental impact of this order.

Required JSON Structure:
{
  "clientName": "string",
  "totalBudget": number,
  "proposedProducts": [
    {
      "productName": "string",
      "quantity": number,
      "unitPrice": number,
      "totalCost": number,
      "sustainabilityHighlight": "string"
    }
  ],
  "budgetBreakdown": {
    "products": number,
    "packaging": number,
    "logistics": number
  },
  "impactSummary": "string",
  "totalCost": number
}`;
};

/**
 * Calls the analysis engine to generate proposal data
 * @param {Object} proposalData Input data for proposal
 * @param {Array} availableProducts Array of product objects from DB
 * @returns {Promise<{rawResponse: string, prompt: string}>}
 */
const generateProposalData = async (proposalData, availableProducts) => {
  const prompt = generateProposalPrompt(proposalData, availableProducts);
  
  const client = getClient();
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2, // Slightly higher for content generation
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

module.exports = { generateProposalData };
