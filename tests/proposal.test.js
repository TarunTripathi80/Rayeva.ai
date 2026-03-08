const request = require('supertest');
const app = require('../src/index');
const Product = require('../src/models/Product');

// Mock analysis engine SDK
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: JSON.stringify({
                    clientName: "GreenOffice Corp",
                    totalBudget: 50000,
                    proposedProducts: [
                      {
                        productName: "Bamboo Stationery Kit",
                        quantity: 200,
                        unitPrice: 120,
                        totalCost: 24000,
                        sustainabilityHighlight: "100% plastic-free"
                      }
                    ],
                    budgetBreakdown: {
                      products: 45000,
                      packaging: 3000,
                      logistics: 2000
                    },
                    impactSummary: "Eliminates plastic",
                    totalCost: 50000
                  })
                }
              }]
            })
          }
        }
      };
    })
  };
});

// Mock Mongoose Models
jest.mock('../src/models/Product', () => ({
  find: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue([
      { name: "Bamboo Stationery Kit", description: "Nice kit", price: 120, sustainabilityFilters: ["plastic-free"] }
    ])
  })
}));

jest.mock('../src/models/Proposal', () => {
  return jest.fn().mockImplementation((data) => ({
    ...data,
    save: jest.fn().mockResolvedValue({
      ...data,
      _id: "fake_id"
    })
  }));
});

// Mock Logger
jest.mock('../src/logs/engineLogger', () => ({
  logEngineAction: jest.fn()
}));

describe('Proposal API', () => {
  it('should generate a b2b proposal', async () => {
    const res = await request(app)
      .post('/api/proposal/generate')
      .send({
        clientName: "GreenOffice Corp",
        budget: 50000,
        employeeCount: 200,
        preferences: ["plastic-free"],
        useCase: "Corporate gifting"
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('clientName', 'GreenOffice Corp');
    expect(res.body).toHaveProperty('totalCost', 50000);
    expect(res.body.proposedProducts).toBeInstanceOf(Array);
    expect(res.body.proposedProducts[0].productName).toBe('Bamboo Stationery Kit');
  });

  it('should return 400 if budget is missing', async () => {
    const res = await request(app)
      .post('/api/proposal/generate')
      .send({
        clientName: "GreenOffice Corp",
        useCase: "Corporate gifting"
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });
});
