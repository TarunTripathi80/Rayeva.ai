const Proposal = require('../models/Proposal');
const Product = require('../models/Product');
const { generateProposalData } = require('../engine/proposalEngine');
const { logEngineAction } = require('../logs/engineLogger');

const extractJSON = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
};

const generateAndSaveProposal = async (proposalData) => {
  const { clientName, budget, employeeCount, preferences, useCase } = proposalData;
  let rawResponse = '';
  let promptText = '';

  try {
    // 1. Fetch products from DB mapping to what the system needs to know
    const productsInDB = await Product.find({}, 'name description price sustainabilityFilters').lean();
    
    // Create a normalized list for the engine
    const availableProducts = productsInDB.map(p => ({
      name: p.name,
      description: p.description,
      price: p.price,
      sustainabilityFilters: p.sustainabilityFilters
    }));

    // Processing logic
    const engineInputData = {
      clientName,
      totalBudget: budget,
      employeeCount,
      preferences: preferences || [],
      useCase
    };

    const engineResult = await generateProposalData(engineInputData, availableProducts);
    rawResponse = engineResult.rawResponse;
    promptText = engineResult.prompt;

    const jsonString = extractJSON(rawResponse);
    const parsedData = JSON.parse(jsonString);

    // Business Logic Validation
    if (parsedData.totalCost > budget) {
      throw new Error(`system generated proposal exceeds budget. Budget: ${budget}, system Total: ${parsedData.totalCost}`);
    }

    const brkdown = parsedData.budgetBreakdown || {};
    const sumBreakdown = (brkdown.products || 0) + (brkdown.packaging || 0) + (brkdown.logistics || 0);
    
    // We tolerate small floating point issues, but conceptually it should be exact.
    if (Math.abs(sumBreakdown - parsedData.totalBudget) > 1) {
      throw new Error(`system generated budget breakdown sums to ${sumBreakdown}, expected ${parsedData.totalBudget}`);
    }

    // Optional: Validate that all proposed products exist in the available list
    const validNames = availableProducts.map(p => p.name);
    for (const item of parsedData.proposedProducts) {
      if (!validNames.includes(item.productName)) {
        throw new Error(`Engine proposed a product that does not exist in DB: ${item.productName}`);
      }
    }

    const proposalDoc = new Proposal({
      clientName,
      initialBudget: budget,
      employeeCount,
      preferences,
      useCase,
      
      totalBudget: parsedData.totalBudget,
      proposedProducts: parsedData.proposedProducts,
      budgetBreakdown: parsedData.budgetBreakdown,
      impactSummary: parsedData.impactSummary,
      totalCost: parsedData.totalCost,
      
      engineResponse: parsedData // Storing full json in DB
    });

    const savedProposal = await proposalDoc.save();

    logEngineAction({
      moduleName: 'ProposalEngine',
      prompt: promptText,
      rawResponse,
      parsedOutput: parsedData,
      success: true
    });

    return savedProposal;
  } catch (error) {
    logEngineAction({
      moduleName: 'ProposalEngine',
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
  generateAndSaveProposal
};
