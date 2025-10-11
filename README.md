# Amazon FBA Profit Calculator - Complete Source Code

> Project Overview
A comprehensive Amazon FBA profit calculator built with Next.js 15, TypeScript, and Prisma. Features include product management, fee calculations, admin panel, and real-time data processing.
```yaml
Technology Stack
Framework: Next.js 15 with App Router
Language: TypeScript 5
Database: Prisma ORM with SQLite
UI: Tailwind CSS 4 with shadcn/ui components
Authentication: NextAuth.js v4
State Management: Zustand + TanStack Query
Real-time: Socket.io

```
## Project Structure
```yaml
amazon-fba-calculator/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── admin/             # Admin panel
│   │   ├── products/          # Product management
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── ProductManagement.tsx
│   │   ├── product-table.tsx
│   │   ├── dashboard-cards.tsx
│   │   └── upload-component.tsx
│   ├── lib/                   # Utility libraries
│   │   ├── db.ts             # Database connection
│   │   ├── auth.ts           # Authentication config
│   │   └── utils.ts          # Helper functions
│   └── hooks/                 # Custom React hooks
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts              # Database seeding
├── public/                   # Static assets
└── db/                      # Database files
```
## Key Features
- Product Management: Add, edit, delete products with fee calculations
- Admin Panel: Manage categories, referral fees, and bulk uploads
- Dashboard: Real-time profitability analytics
- Authentication: Secure login system with role-based access
- Bulk Operations: Excel/CSV import/export functionality
- Real-time Updates: Socket.io for live data synchronization

## Database Schema
- ProductCalculations: Main product data with calculated fees
- Categories: Product categories with return percentages
- CategoryFees: Referral fee tiers by category and price
- ProductBatch: Batch upload tracking
##  API Endpoints
``` yaml
/api/products - Product CRUD operations
/api/admin/* - Admin management endpoints
/api/dashboard - Dashboard analytics
/api/upload - File upload processing
/api/calculate-fees - Fee calculation engine
```
## Installation & Setup
``` yaml
Install dependencies: npm install
Set up database: npm run db:push
Run development server: npm run dev
Access at: http://localhost:3000
```
## Environment Variables
```
DATABASE_URL="file:./db/custom.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```


## Admin Access
```yaml
URL: /admin
Default credentials: admin@fba-calculator.com / admin123
```
## Key Components Documentation
### ProductManagement Component
- Location: /src/components/ProductManagement.tsx
- Purpose: Advanced product management with filtering, pagination, and bulk operations
- Features: Search, category filtering, fulfillment method filtering, batch operations
### ProductTable Component
- Location: /src/components/product-table.tsx
- Purpose: Display products with detailed fee breakdown
- Features: Export functionality, detailed view modal, profit indicators
### DashboardCards Component
- Location: /src/components/dashboard-cards.tsx
- Purpose: Real-time dashboard analytics
- Features: Total products, revenue, profit margins, visual indicators
### UploadComponent Component
- Location: /src/components/upload-component.tsx
- Purpose: Bulk product upload via Excel/CSV
- Features: File validation, batch processing, error reporting
  
## Authentication System
- NextAuth.js integration with JWT tokens
- Role-based access control
- Session management
- Protected routes with middleware
### Fee Calculation Engine
- Location: /src/app/api/calculate-fees/route.ts
- Features: Referral fees, closing fees, shipping fees, storage costs
- Category-based fee structures
- Regional fulfillment calculations
### Development Notes
- Uses TypeScript for type safety
- Prisma for database operations
- Tailwind CSS for styling
- shadcn/ui for consistent UI components
- Socket.io for real-time features
- Comprehensive error handling
- Input validation and sanitization
### Production Deployment
- Build: npm run build
- Start: npm start
- Environment: Configure production database URL
- Security: Enable HTTPS, set secure cookies
## License
> This project is provided as-is for educational and development purposes.
