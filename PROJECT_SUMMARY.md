# Amazon FBA Profit Calculator - Complete Source Code

## Project Overview
A comprehensive Amazon FBA profit calculator built with Next.js 15, TypeScript, and Prisma. Features include product management, fee calculations, admin panel, and real-time data processing.

## Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Database**: Prisma ORM with SQLite
- **UI**: Tailwind CSS 4 with shadcn/ui components
- **Authentication**: NextAuth.js v4
- **State Management**: Zustand + TanStack Query
- **Real-time**: Socket.io

## Project Structure
```
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
1. **Product Management**: Add, edit, delete products with fee calculations
2. **Admin Panel**: Manage categories, referral fees, and bulk uploads
3. **Dashboard**: Real-time profitability analytics
4. **Authentication**: Secure login system with role-based access
5. **Bulk Operations**: Excel/CSV import/export functionality
6. **Real-time Updates**: Socket.io for live data synchronization

## Database Schema
- **ProductCalculations**: Main product data with calculated fees
- **Categories**: Product categories with return percentages
- **CategoryFees**: Referral fee tiers by category and price
- **ProductBatch**: Batch upload tracking

## API Endpoints
- `/api/products` - Product CRUD operations
- `/api/admin/*` - Admin management endpoints
- `/api/dashboard` - Dashboard analytics
- `/api/upload` - File upload processing
- `/api/calculate-fees` - Fee calculation engine

## Installation & Setup
1. Install dependencies: `npm install`
2. Set up database: `npm run db:push`
3. Run development server: `npm run dev`
4. Access at: `http://localhost:3000`

## Environment Variables
```env
DATABASE_URL="file:./db/custom.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Admin Access
- URL: `/admin`
- Default credentials: `admin@fba-calculator.com` / `admin123`

## Key Components Documentation

### ProductManagement Component
- Location: `/src/components/ProductManagement.tsx`
- Purpose: Advanced product management with filtering, pagination, and bulk operations
- Features: Search, category filtering, fulfillment method filtering, batch operations

### ProductTable Component
- Location: `/src/components/product-table.tsx`
- Purpose: Display products with detailed fee breakdown
- Features: Export functionality, detailed view modal, profit indicators

### DashboardCards Component
- Location: `/src/components/dashboard-cards.tsx`
- Purpose: Real-time dashboard analytics
- Features: Total products, revenue, profit margins, visual indicators

### UploadComponent Component
- Location: `/src/components/upload-component.tsx`
- Purpose: Bulk product upload via Excel/CSV
- Features: File validation, batch processing, error reporting

## Authentication System
- NextAuth.js integration with JWT tokens
- Role-based access control
- Session management
- Protected routes with middleware

## Fee Calculation Engine
- Location: `/src/app/api/calculate-fees/route.ts`
- Features: Referral fees, closing fees, shipping fees, storage costs
- Category-based fee structures
- Regional fulfillment calculations

## Development Notes
- Uses TypeScript for type safety
- Prisma for database operations
- Tailwind CSS for styling
- shadcn/ui for consistent UI components
- Socket.io for real-time features
- Comprehensive error handling
- Input validation and sanitization

## Production Deployment
1. Build: `npm run build`
2. Start: `npm start`
3. Environment: Configure production database URL
4. Security: Enable HTTPS, set secure cookies

## License
This project is provided as-is for educational and development purposes.

---

**Generated on**: $(date)
**Total Files**: $(find . -type f -not -path "./node_modules/*" -not -path "./.next/*" | wc -l)
**Project Size**: $(du -sh . --exclude=node_modules --exclude=.next | cut -f1)
```