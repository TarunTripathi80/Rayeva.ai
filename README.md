# Rayeva AI

Production-ready Node.js + Express project for a sustainable e-commerce platform featuring smart auto-categorization and B2B proposal generation using Anthropic's Claude.

## 1. Project Overview
Rayeva system is a microservice designed to handle intelligent operations for a sustainable e-commerce platform. It provides two core functionalities:
- **Module 1 (Auto-Category & Tag Generator)**: Automatically analyzes a product and assigns relevant categories, and sustainability tags.
- **Module 2 (B2B Proposal Generator)**: Automatically generates targeted and logically sound sales proposals for corporate clients while adhering to strict budgets and fetching from real product data.

## 2. Setup and Run Locally

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB connection string.
- Opensystem API Key (`gpt-4o`)

### Installation & Execution
```bash
# Install dependencies
npm install

# Copy environment variables and fill them
cp .env.example .env

# Run the local development server
npm run dev

# Run automated tests
npm test
```

## 3. Architecture Overview

### Separation of Concerns (system vs Business Logic)
The application strictly separates **system Prompts/API calls** (in `src/ai`) from **Business Logic** (in `src/services`).

**Why this matters:**
1. **Reliability:** system models are non-deterministic. Placing the budget calculator or strict database validations inside the prompt invites hallucinations and math errors. By keeping business logic in `services/`, we guarantee that if system misbehaves (e.g., exceeds budget), the service catches the error before affecting the user.
2. **Maintainability:** Prompt engineering is an evolving discipline. Keeping prompts isolated in the `ai/` folder allows prompt engineers to iterate without risking database contamination or breaking controller logic.
3. **Security:** system integrations should never talk directly to the database. The Service Layer acts as a secure intermediary.

## 4. Prompt Design Decisions

- **Raw JSON Enforcement**: Instructed OpenAI's GPT-4o model clearly to strictly return `ONLY the raw JSON object` with no markdown wrappers using explicit commands (`DO NOT include any markdown formatting`) combined with `response_format: { type: "json_object" }`. This prevents parsing failures.
- **Enumerations in Prompts**: For Module 1, the exact accepted lists of categories and filters are injected into the prompt. This heavily anchors the model toward only using valid tags.
- **Database Context Injection**: For Module 2, instead of asking the system to "make up" eco-friendly products, we query `Product.find()` in the service layer and pass that array directly into the prompt. The prompt includes rules stating: `You MUST ONLY choose from these`. This ensures complete correlation between system outputs and actual store inventory.

## 5. Sample API Requests & Responses

### Module 1: Auto-Category
**POST /api/category/generate**
```json
// Request
{
  "productName": "Bamboo Toothbrush",
  "productDescription": "Biodegradable toothbrush made from organic bamboo with BPA-free bristles"
}

// Response (200 OK)
{
  "primaryCategory": "Personal Care",
  "subCategory": "Oral Hygiene",
  "seoTags": ["bamboo toothbrush", "eco toothbrush", "sustainable living", "bpa-free", "zero waste bathroom"],
  "sustainabilityFilters": ["plastic-free", "compostable", "biodegradable", "organic"],
  "confidence": 0.95
}
```

### Module 2: B2B Proposal
**POST /api/proposal/generate**
```json
// Request
{
  "clientName": "GreenOffice Corp",
  "budget": 50000,
  "employeeCount": 200,
  "preferences": ["plastic-free", "vegan"],
  "useCase": "Corporate gifting for annual sustainability drive"
}

// Response (200 OK)
{
  "clientName": "GreenOffice Corp",
  "totalBudget": 50000,
  "proposedProducts": [
    {
      "productName": "Bamboo Stationery Kit",
      "quantity": 200,
      "unitPrice": 120,
      "totalCost": 24000,
      "sustainabilityHighlight": "100% plastic-free and ideal for office desks."
    }
  ],
  "budgetBreakdown": {
    "products": 45000,
    "packaging": 3000,
    "logistics": 2000
  },
  "impactSummary": "This order will eliminate approximately 40kg of single-use plastic, directly supporting GreenOffice Corp's zero-waste initiatives.",
  "totalCost": 50000
}
```

## 6. Future Architecture Outlines

### Module 3: Impact Reporting
**Goal:** Generate post-purchase impact certificates for clients.
- **Architecture**: A cron job or web hook listener in a background worker (e.g., BullMQ with Redis).
- **Process**: Upon order completion, `ImpactService` fetches the order's `sustainabilityFilters` and quantity. It sends a prompt to `impactAI.js` to calculate equivalent environmental metrics (e.g., "Trees planted", "CO2 offset") and generate a personalized impact narrative. Result is saved to an `ImpactReport` MongoDB collection and exposed via a GET endpoint.

### Module 4: WhatsApp Bot
**Goal:** Direct B2C support and fast ordering.
- **Architecture**: Integate Twilio WhatsApp API with a webhook endpoint in Express.
- **Process**: Incoming messages hit `whatsappController`. The `chatService` retrieves recent chat history from Redis, fetches relevant products from MongoDB, and calls `chatbotAI.js`. The prompt provides persona rules (friendly but concise) and injects product answers. The response is sent back via Twilio.
