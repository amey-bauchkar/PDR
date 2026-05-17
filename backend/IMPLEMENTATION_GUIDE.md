# PDR World Backend - Implementation Guide

## ✅ Backend Setup Complete

Your professional backend has been successfully created at:
```
pdrworld-backend/
```

This is a **separate, independent backend** following enterprise-level architecture patterns.

---

## 🏗️ Architecture Overview

### Folder Structure
```
pdrworld-backend/
├── src/
│   ├── config/              # Environment & database config
│   ├── controllers/         # HTTP request handlers
│   ├── services/            # Business logic (Products, RFQ, Calculator)
│   ├── routes/              # API endpoint definitions
│   ├── middleware/          # Auth, validation, error handling
│   ├── types/               # TypeScript interfaces
│   ├── utils/               # Helper utilities
│   └── index.ts             # Express app entry point
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── .env.example             # Environment template
└── README.md                # API documentation
```

---

## 📚 Service Layer (Business Logic)

### 1. **ProductService** (`src/services/ProductService.ts`)
Handles all product-related operations:
- ✅ Get products with filters (environment, mountType, capacity)
- ✅ Get single product by ID or slug
- ✅ Get product configuration options
- ✅ Get products by category
- ✅ Search products

**Used by**: ProductController → GET /api/products

### 2. **RfqService** (`src/services/RfqService.ts`)
Handles RFQ (Request for Quotation) operations:
- ✅ Submit RFQ with validation
- ✅ Store RFQ and items in database
- ✅ Get RFQ by ID
- ✅ Get all RFQs (for admin dashboard)
- ✅ Trigger CRM webhook integration
- ✅ Log to Google Sheets (optional)

**Used by**: RfqController → POST /api/rfq/submit

### 3. **CalculatorService** (`src/services/CalculatorService.ts`)
Handles optical link budget calculations:
- ✅ Calculate total signal loss (fiber + connectors)
- ✅ Assess signal quality
- ✅ Provide recommendations
- ✅ Generate detailed reports

**Used by**: CalculatorController → POST /api/calculator/optical-link-budget

---

## 🛣️ API Routes

### **Products API** (`/api/products`)
```
GET    /api/products                          # List products
GET    /api/products/:id                      # Get single product
GET    /api/products/:id/configuration-options # Get config options
GET    /api/products/search?q=query           # Search products
GET    /api/products/category/:categoryId     # Get by category
```

### **RFQ API** (`/api/rfq`)
```
POST   /api/rfq/submit                        # Submit quote request
GET    /api/rfq/:id                           # Get RFQ details
GET    /api/rfq                               # Get all (admin only)
```

### **Calculator API** (`/api/calculator`)
```
POST   /api/calculator/optical-link-budget    # Calculate loss
POST   /api/calculator/optical-link-budget/report # Generate report
```

### **Health Check** (`/api/health`)
```
GET    /api/health                            # Server status
```

---

## 🔧 How to Start

### 1. Setup Dependencies
```bash
cd pdrworld-backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Start Development Server
```bash
npm run dev
```

Server runs at: **http://localhost:3001**

### 4. Test API
```bash
# Health check
curl http://localhost:3001/api/health

# Get products
curl http://localhost:3001/api/products

# Submit RFQ
curl -X POST http://localhost:3001/api/rfq/submit \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## 📖 Key Features

### ✅ Error Handling
All errors return consistent JSON format:
```json
{
  "success": false,
  "error": {
    "message": "Descriptive error",
    "code": "ERROR_CODE"
  },
  "timestamp": 1234567890
}
```

### ✅ Async/Await Pattern
Clean, modern async code throughout:
```typescript
export const asyncHandler = (fn: Function) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

### ✅ Request Validation
Middleware-based validation:
```typescript
app.post('/api/rfq/submit', validateBody(rfqSchema), RfqController.submitRfq);
```

### ✅ CORS Enabled
Frontend can safely communicate:
```typescript
app.use(cors({ origin: process.env.CORS_ORIGIN }));
```

### ✅ Request Logging
Every request is logged with timestamp, method, path, status, and duration.

---

## 🔐 Database Integration

The backend uses **Supabase** (PostgreSQL) with:
- Service role client (for server operations)
- Anon key client (for public operations)

All database operations are in the service layer:
```typescript
const { data, error } = await supabaseServiceClient
  .from('catalog_products')
  .select('*')
  .eq('status', 'published');
```

---

## 🔗 Integration Points

### CRM Integration
When RFQ is submitted, automatically sends data via webhook:
```typescript
await this.triggerCrmIntegration(rfqData, items);
```

Set `CRM_WEBHOOK_URL` in `.env` to enable.

### Google Sheets
Optional logging of RFQs:
```typescript
await this.logToGoogleSheets(rfqData, items);
```

Set `GOOGLE_SHEETS_ID` and `GOOGLE_SHEETS_API_KEY` in `.env` to enable.

---

## 🚀 Production Deployment

### Build
```bash
npm run build
```

### Run
```bash
npm start
```

### Environment
Set `NODE_ENV=production` in `.env`

---

## 📋 Type Safety

All data is TypeScript typed:
```typescript
interface QuoteRequest {
  id: string;
  sessionHash: string;
  name: string;
  email: string;
  company: string;
  items: QuoteItem[];
  status: 'pending' | 'submitted' | 'processed';
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🧩 Next Steps (Optional Enhancements)

1. **Authentication**: Implement JWT for admin routes
2. **PDF Generation**: Use libraries like `jspdf` to generate reports
3. **Email Service**: Send confirmations via SendGrid
4. **Caching**: Add Redis for frequently accessed data
5. **Testing**: Add Jest tests for services and controllers
6. **API Documentation**: Add Swagger/OpenAPI specs
7. **Rate Limiting**: Prevent abuse with rate limiting middleware

---

## 📞 Support

All code follows the FRD requirements and is:
- ✅ Professional enterprise-grade
- ✅ Fully typed with TypeScript
- ✅ Well-organized with clear separation of concerns
- ✅ Error handling at every level
- ✅ Ready for scaling and deployment

---

## 📝 Notes

- The backend is **completely separate** from the frontend
- Frontend communicates **only via REST API**
- **All business logic** is server-side (no direct frontend DB access)
- **All validations** happen on the backend
- Configuration is **environment-based** (12-factor app)
- Code follows **async/await** patterns (no callbacks)

---

**Backend is ready to use! 🚀**
