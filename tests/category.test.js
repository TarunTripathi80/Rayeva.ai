const request = require('supertest');
const app = require('../src/index');

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
                    primaryCategory: "Personal Care",
                    subCategory: "Oral Hygiene",
                    seoTags: ["bamboo toothbrush", "eco", "teeth", "sustainable", "vegan"],
                    sustainabilityFilters: ["plastic-free", "vegan"],
                    confidence: 0.95
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

// Mock Mongoose Category Model
jest.mock('../src/models/Category', () => {
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

describe('Category API', () => {
  it('should generate a category for a given product', async () => {
    const res = await request(app)
      .post('/api/category/generate')
      .send({
        productName: 'Bamboo Toothbrush',
        productDescription: 'Eco friendly toothbrush'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('primaryCategory', 'Personal Care');
    expect(res.body).toHaveProperty('subCategory', 'Oral Hygiene');
    expect(res.body.sustainabilityFilters).toContain('plastic-free');
    expect(res.body.seoTags.length).toBe(5);
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/category/generate')
      .send({
        productName: 'Bamboo Toothbrush'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });
});
