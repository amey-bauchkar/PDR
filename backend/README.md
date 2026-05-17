# PDR World - Backend API

Professional backend API for PDR World - a modern fiber optic product selection and quote request platform.

## 📋 Project Structure

```
pdrworld-backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── env.ts           # Environment variables
│   │   └── database.ts      # Database initialization
│   ├── controllers/         # Request handlers
│   │   ├── ProductController.ts
│   │   ├── RfqController.ts
│   │   └── CalculatorController.ts
│   ├── services/            # Business logic
│   │   ├── ProductService.ts
│   │   ├── RfqService.ts
│   │   └── CalculatorService.ts
│   ├── routes/              # API endpoints
│   │   ├── products.ts
│   │   ├── rfq.ts
│   │   ├── calculator.ts
│   │   └── health.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # Authentication
│   │   ├── common.ts        # Common middleware
│   │   └── errorHandler.ts  # Error handling
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   └── index.ts             # Application entry point
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account with configured database

### Installation

1. Clone the repository (or navigate to the backend folder)
```bash
cd pdrworld-backend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```bash
cp .env.example .env
```

4. Update `.env` with your configuration
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

### Development

Start the development server with hot reload:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Production Build

Build the TypeScript:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### 1. Products API

#### Get All Products
```http
GET /api/products?page=1&pageSize=10&environment=indoor&mountType=wall
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10)
- `environment` (optional): Filter by environment
- `mountType` (optional): Filter by mount type
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  },
  "timestamp": 1234567890
}
```

#### Get Single Product
```http
GET /api/products/:id
```

#### Get Product Configuration Options
```http
GET /api/products/:id/configuration-options
```

#### Search Products
```http
GET /api/products/search?q=cable
```

### 2. RFQ (Quote Request) API

#### Submit RFQ
```http
POST /api/rfq/submit
Content-Type: application/json

{
  "sessionHash": "abc123",
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Tech Corp",
  "items": [
    {
      "productId": "prod-1",
      "productName": "Single Mode Fiber",
      "quantity": 5,
      "configuration": {
        "fiberType": "SMF-28",
        "connectorType": "LC",
        "cableLength": 100
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rfq-uuid",
    "sessionHash": "abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Tech Corp",
    "items": [...],
    "status": "submitted",
    "submittedAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "timestamp": 1234567890
}
```

#### Get RFQ
```http
GET /api/rfq/:id
```

#### Get All RFQs (Admin Only)
```http
GET /api/rfq?page=1&pageSize=10
Authorization: Bearer <token>
```

### 3. Calculator API

#### Calculate Optical Link Budget
```http
POST /api/calculator/optical-link-budget
Content-Type: application/json

{
  "distance": 50,
  "fiberLoss": 0.2,
  "connectorCount": 4
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalLoss": 11.4,
    "signalQuality": "GOOD",
    "recommendation": "Good signal quality with acceptable performance margins."
  },
  "timestamp": 1234567890
}
```

#### Generate Detailed Report
```http
POST /api/calculator/optical-link-budget/report
Content-Type: application/json

{
  "distance": 50,
  "fiberLoss": 0.2,
  "connectorCount": 4
}
```

### 4. Health Check API

#### Server Health
```http
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": 1234567890,
  "uptime": 3600
}
```

## 🔐 Authentication

Protected routes require a JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

## ⚙️ Configuration

All configuration is managed through environment variables. See `.env.example` for available options.

### Important Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anon key (for public access)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for admin operations)
- `JWT_SECRET`: Secret key for JWT tokens
- `CORS_ORIGIN`: Frontend URL for CORS
- `CRM_WEBHOOK_URL`: Optional CRM webhook for RFQ integration
- `GOOGLE_SHEETS_ID`: Optional Google Sheets for logging RFQs

## 📊 Database Schema

The backend uses Supabase PostgreSQL with the following key tables:

- `catalog_products`: Product catalog
- `quote_requests`: RFQ submissions
- `quote_request_items`: Individual items in RFQ
- `product_configuration_options`: Configuration choices

See `../pdrworld-react/supabase/schema.sql` for full schema.

## 🔗 Integration

### CRM Integration
RFQs are automatically sent to CRM via webhook if `CRM_WEBHOOK_URL` is configured.

### Google Sheets
RFQs can be logged to Google Sheets if `GOOGLE_SHEETS_ID` and `GOOGLE_SHEETS_API_KEY` are configured.

## 📝 Logging

Logs are output to console with timestamp and request details. Log level can be configured via `LOG_LEVEL` environment variable.

## 🛠️ Development

### TypeScript
All code is written in TypeScript for type safety.

### Code Style
- Use async/await for asynchronous operations
- All errors are handled and returned with appropriate HTTP status codes
- Services contain business logic, controllers handle HTTP requests

### Testing
(To be implemented)

## 📦 Dependencies

- **express**: Web framework
- **@supabase/supabase-js**: Supabase client
- **cors**: CORS middleware
- **zod**: Schema validation
- **uuid**: UUID generation
- **dotenv**: Environment variables
- **typescript**: Type safety

## 🚨 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Descriptive error message",
    "code": "ERROR_CODE"
  },
  "timestamp": 1234567890
}
```

## 📄 License

(Add your license here)

## 👥 Contributing

(Add contribution guidelines here)
