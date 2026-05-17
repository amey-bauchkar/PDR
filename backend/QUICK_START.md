# Quick Start Guide - Backend

## 5 Minutes to Get Started

### Step 1: Install Dependencies
```bash
cd pdrworld-backend
npm install
```

### Step 2: Setup Environment
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
JWT_SECRET=your-random-secret
CORS_ORIGIN=http://localhost:5173
```

### Step 3: Start Development Server
```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════╗
║   🚀 PDR World API Started              ║
║   Server: http://localhost:3001         ║
║   Environment: development              ║
╚════════════════════════════════════════╝
```

### Step 4: Test API
Open a new terminal and test:

```bash
# Health check
curl http://localhost:3001/api/health

# Get products
curl http://localhost:3001/api/products

# Submit RFQ
curl -X POST http://localhost:3001/api/rfq/submit \
  -H "Content-Type: application/json" \
  -d '{
    "sessionHash": "test-session",
    "name": "John Doe",
    "email": "john@example.com",
    "company": "Tech Corp",
    "items": [{
      "productId": "prod-1",
      "productName": "Fiber Optic Cable",
      "quantity": 5
    }]
  }'

# Calculate optical link budget
curl -X POST http://localhost:3001/api/calculator/optical-link-budget \
  -H "Content-Type: application/json" \
  -d '{
    "distance": 50,
    "fiberLoss": 0.2,
    "connectorCount": 4
  }'
```

---

## API Response Examples

### Success Response
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
  "timestamp": 1705327200000
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Product not found",
    "code": "PRODUCT_NOT_FOUND"
  },
  "timestamp": 1705327200000
}
```

---

## Main API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Check server status |
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get single product |
| GET | `/api/products/search` | Search products |
| POST | `/api/rfq/submit` | Submit quote request |
| GET | `/api/rfq/:id` | Get RFQ details |
| POST | `/api/calculator/optical-link-budget` | Calculate signal loss |

---

## Directory Overview

```
pdrworld-backend/
├── src/
│   ├── config/          ← Environment & database setup
│   ├── controllers/     ← Handle HTTP requests
│   ├── services/        ← Business logic (Products, RFQ, Calculator)
│   ├── routes/          ← API endpoints definition
│   ├── middleware/      ← Auth, validation, error handling
│   ├── types/           ← TypeScript interfaces
│   └── index.ts         ← Main app file
├── .env                 ← Your secrets (create from .env.example)
└── package.json         ← Dependencies
```

---

## File Responsibilities

- **index.ts**: Express app setup + route registration
- **routes/*.ts**: URL → Controller mapping
- **controllers/*.ts**: Request handling
- **services/*.ts**: Business logic & database operations
- **middleware/**: Request validation, auth, error handling
- **config/**: Environment variables & database client
- **types/**: All TypeScript interfaces

---

## Common Tasks

### Add New API Endpoint

1. Create route in `src/routes/`
2. Create controller method in `src/controllers/`
3. Create service method in `src/services/`
4. Register route in `src/index.ts`

### Change Database Query

Edit the corresponding service file in `src/services/`

### Add Authentication

Routes using JWT:
```typescript
router.get('/', verifyToken, RfqController.getAllRfqs);
```

### Handle Validation Errors

Errors are automatically caught and returned as JSON:
```typescript
throw new AppError(400, 'ERROR_CODE', 'Error message');
```

---

## Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=3002
```

### Database Connection Failed
Check in .env:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### CORS Error
Update `.env`:
```
CORS_ORIGIN=http://your-frontend-url:port
```

---

## Next Steps

1. Read `README.md` for full API documentation
2. Check `IMPLEMENTATION_GUIDE.md` for architecture details
3. See `PROJECT_STRUCTURE.md` for file organization
4. Implement CRM/Google Sheets integrations in `.env`

---

**You're ready to go! 🚀**
