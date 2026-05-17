pdrworld-backend/
│
├── 📄 package.json              # Dependencies & scripts
├── 📄 tsconfig.json             # TypeScript configuration
├── 📄 .env.example              # Environment template
├── 📄 .gitignore               # Git ignore rules
├── 📄 README.md                # API documentation
├── 📄 IMPLEMENTATION_GUIDE.md   # This setup guide
│
└── src/
    │
    ├── 📄 index.ts
    │   └─ Express app initialization
    │   └─ Route registration
    │   └─ Middleware setup
    │   └─ Server startup
    │
    ├── config/
    │   ├── 📄 env.ts
    │   │   └─ Environment variables
    │   │   └─ Configuration object
    │   │   └─ Validation logic
    │   │
    │   └── 📄 database.ts
    │       └─ Supabase client initialization
    │       └─ Service role & anon key setup
    │
    ├── types/
    │   └── 📄 index.ts
    │       └─ Product interface
    │       └─ QuoteRequest interface
    │       └─ CalculatorInput interface
    │       └─ AppError class
    │       └─ Admin user types
    │       └─ All TypeScript interfaces
    │
    ├── middleware/
    │   ├── 📄 auth.ts
    │   │   └─ JWT verification
    │   │   └─ Role-based access control
    │   │   └─ Async error wrapper
    │   │
    │   ├── 📄 common.ts
    │   │   └─ Request logging
    │   │   └─ Body validation
    │   │   └─ Query validation
    │   │
    │   └── 📄 errorHandler.ts
    │       └─ Global error handler
    │       └─ 404 not found handler
    │
    ├── services/
    │   ├── 📄 ProductService.ts
    │   │   └─ getProducts()
    │   │   └─ getProduct()
    │   │   └─ getProductConfigurationOptions()
    │   │   └─ getProductsByCategory()
    │   │   └─ searchProducts()
    │   │
    │   ├── 📄 RfqService.ts
    │   │   └─ submitRfq()
    │   │   └─ getRfq()
    │   │   └─ getAllRfqs()
    │   │   └─ triggerCrmIntegration()
    │   │   └─ logToGoogleSheets()
    │   │   └─ Email validation
    │   │
    │   └── 📄 CalculatorService.ts
    │       └─ calculateOpticalLinkBudget()
    │       └─ validateInput()
    │       └─ generateDetailedReport()
    │
    ├── controllers/
    │   ├── 📄 ProductController.ts
    │   │   └─ getProducts()
    │   │   └─ getProduct()
    │   │   └─ getProductConfigurationOptions()
    │   │   └─ getProductsByCategory()
    │   │   └─ searchProducts()
    │   │
    │   ├── 📄 RfqController.ts
    │   │   └─ submitRfq()
    │   │   └─ getRfq()
    │   │   └─ getAllRfqs()
    │   │
    │   └── 📄 CalculatorController.ts
    │       └─ calculateOpticalLinkBudget()
    │       └─ generateOpticalLinkBudgetReport()
    │
    ├── routes/
    │   ├── 📄 health.ts
    │   │   └─ GET /health
    │   │   └─ GET /info
    │   │
    │   ├── 📄 products.ts
    │   │   └─ GET /
    │   │   └─ GET /:id
    │   │   └─ GET /search
    │   │   └─ GET /:id/configuration-options
    │   │   └─ GET /category/:categoryId
    │   │
    │   ├── 📄 rfq.ts
    │   │   └─ POST /submit
    │   │   └─ GET /:id
    │   │   └─ GET / (admin)
    │   │
    │   └── 📄 calculator.ts
    │       └─ POST /optical-link-budget
    │       └─ POST /optical-link-budget/report
    │
    └── utils/
        └─ (Ready for utility functions)


=================================================================
ARCHITECTURE FLOW
=================================================================

Frontend Request
    ↓
Express Route (routes/*.ts)
    ↓
Express Controller (controllers/*.ts)
    ↓
Business Logic Service (services/*.ts)
    ↓
Supabase Database
    ↓
Response (JSON)


=================================================================
KEY FILES SUMMARY
=================================================================

1. src/index.ts
   - Main Express app entry point
   - Registers all middleware and routes
   - Starts server on port 3001

2. src/config/env.ts
   - Manages all environment variables
   - Validates required configs
   - Exports config object

3. src/config/database.ts
   - Initializes Supabase clients
   - Handles authentication

4. src/types/index.ts
   - All TypeScript interfaces
   - Type definitions for entire app
   - AppError class definition

5. src/middleware/
   - auth.ts: JWT & role-based access
   - common.ts: Logging & validation
   - errorHandler.ts: Error handling

6. src/services/
   - ProductService: Product queries
   - RfqService: RFQ management & integrations
   - CalculatorService: Calculations

7. src/controllers/
   - Receive HTTP requests
   - Call services
   - Return JSON responses

8. src/routes/
   - Define API endpoints
   - Map URLs to controllers


=================================================================
RUNNING THE BACKEND
=================================================================

1. cd pdrworld-backend
2. npm install
3. cp .env.example .env
4. Edit .env with Supabase credentials
5. npm run dev
6. Access: http://localhost:3001


=================================================================
