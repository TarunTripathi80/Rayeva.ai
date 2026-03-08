const { generateAndSaveProposal } = require('../services/proposalService');

const generateProposal = async (req, res) => {
  try {
    const { clientName, budget, employeeCount, preferences, useCase } = req.body;

    if (!clientName || !budget || !useCase) {
      return res.status(400).json({ error: 'clientName, budget, and useCase are required' });
    }

    const proposal = await generateAndSaveProposal({
      clientName,
      budget,
      employeeCount,
      preferences,
      useCase
    });

    return res.status(200).json({
      clientName: proposal.clientName,
      totalBudget: proposal.totalBudget,
      proposedProducts: proposal.proposedProducts,
      budgetBreakdown: proposal.budgetBreakdown,
      impactSummary: proposal.impactSummary,
      totalCost: proposal.totalCost
    });
  } catch (error) {
    console.error('Proposal Generation Error:', error);
    return res.status(400).json({ error: error.message || 'Failed to generate proposal' });
  }
};

module.exports = {
  generateProposal
};
