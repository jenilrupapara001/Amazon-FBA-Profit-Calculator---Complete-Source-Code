# Amazon FBA Profitability Calculator

A comprehensive web application for analyzing Amazon FBA product profitability with advanced fee calculations, batch processing, and detailed analytics.

## 🚀 Features

### Core Functionality
- **Excel Batch Upload**: Import product data via Excel files with ASIN, prices, and dimensions
- **Single Product Entry**: Manually add individual products with Amazon data auto-fetch
- **Amazon Data Integration**: Automatically fetch product information from Amazon
- **Comprehensive Fee Calculation**: 14 different fee types including referral, closing, shipping, storage, and more
- **Real-time Dashboard**: Overview of total revenue, profit, and profit margins
- **Advanced Filtering**: Filter products by category, fulfillment method, and profit margins
- **Data Export**: Export filtered results to Excel/CSV format
- **Admin Panel**: Manage category-specific referral fees

### Fee Calculations
1. **Referral Fee**: Category-based percentage of selling price
2. **Closing Fee**: Fixed fee based on price range
3. **Shipping Fee**: Weight and region-based shipping costs
4. **Pick & Pack Fee**: FBA fulfillment costs
5. **Storage Fee**: Monthly storage costs based on volume
6. **Removal Fee**: Cost for removing inventory
7. **Total Other Costs**: Additional miscellaneous costs
8. **Tax Calculations**: GST tax credit and payable amounts
9. **Net Earnings**: Final profit after all fees and taxes
10. **Profit Margins**: Percentage-based profitability analysis

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite
- **File Processing**: XLSX library for Excel handling
- **Data Scraping**: Cheerio + Axios for Amazon data extraction
- **Error Handling**: Custom error boundaries with graceful fallbacks

## 📋 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd amazon-fba-calculator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run db:push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 Usage Guide

### 1. Dashboard
- View overall profitability metrics
- Monitor total revenue, fees, and profit margins
- Track product count and average profit percentages

### 2. Single Product Entry
- Click "Add Product" tab to access the single product form
- Enter ASIN (Amazon Standard Identification Number)
- Optionally click "Fetch Data" to auto-fill product information from Amazon
- Manually enter required details:
  - Selling Price (required)
  - Weight (required)
  - Dimensions (optional)
  - Category selection
  - Fulfillment method (FBA/FBM)
  - STEP level
- Click "Add Product" to save and calculate fees automatically

### 3. Upload Products
- Prepare an Excel file with the following columns:
  - ASIN (required)
  - Product Name (optional)
  - Selling Price (required)
  - Weight (kg) (required)
  - Length (cm) (optional)
  - Width (cm) (optional)
  - Height (cm) (optional)
- Click "Upload Products" and select your Excel file
- The system will automatically fetch missing product data from Amazon

### 4. Product Analysis
- Browse all uploaded products in the Products tab
- Use filters to analyze specific segments:
  - Search by ASIN or product name
  - Filter by category
  - Filter by fulfillment method (FBA/FBM)
  - Filter by profit margin range
- Click the eye icon to view detailed fee breakdowns
- Export filtered results using the "Export Filtered" button

### 5. Admin Panel
- Access at `/admin` to manage category referral fees
- Add, edit, or delete category-specific fee structures
- Set price ranges and corresponding referral percentages
- Import default Amazon fee categories

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Amazon (optional for enhanced scraping)
AMAZON_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
```

### Database Schema
The application uses Prisma ORM with SQLite. Key tables:

- **ProductCalculations**: Stores product data and calculated fees
- **CategoryFees**: Manages category-specific referral fee structures

## 📈 API Endpoints

### Products
- `GET /api/products` - Retrieve all products with pagination
- `POST /api/products` - Create new product entries
- `POST /api/products/single` - Add single product with fee calculation
- `GET /api/products/export` - Export products as Excel file

### Amazon Data
- `POST /api/fetch-amazon-data` - Fetch product data from Amazon using ASIN

### Dashboard
- `GET /api/dashboard` - Get summary statistics

### Admin
- `GET /api/admin/category-fees` - Retrieve category fee structures
- `POST /api/admin/category-fees` - Create new category fee
- `PUT /api/admin/category-fees/:id` - Update category fee
- `DELETE /api/admin/category-fees/:id` - Delete category fee

## 🎯 Fee Calculation Logic

### Referral Fees
Category-based percentage calculated on selling price:
```javascript
referralFee = sellingPrice * (referralFeePercent / 100)
```

### Closing Fees
Fixed fees based on price ranges:
- ₹0-250: ₹26
- ₹251-500: ₹12
- ₹501-1000: ₹20
- ₹1001+: ₹35

### Shipping Fees
Weight and region-based:
- Local: ₹40-120 based on weight
- Regional: ₹50-150 based on weight
- National: ₹60-180 based on weight

### Storage Fees
Calculated monthly based on product volume:
```javascript
storageFee = (length * width * height / 28316.84) * monthlyRate
```

## 🔍 Error Handling

The application includes comprehensive error handling:
- **Error Boundaries**: Graceful fallbacks for component errors
- **API Error Handling**: Proper error responses and user notifications
- **File Upload Validation**: Checks for required fields and data types
- **Data Validation**: Validates Amazon data before processing

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Development

### Code Quality
```bash
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript checks
```

### Database Management
```bash
npm run db:push       # Push schema changes
npm run db:studio     # Open Prisma Studio
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section below

### Troubleshooting

**Q: Upload fails with "Invalid file format"**
A: Ensure your Excel file has the correct column headers and data types

**Q: Amazon data not fetching**
A: Check your internet connection and verify ASINs are correct

**Q: Calculations seem incorrect**
A: Verify category assignments and check admin panel for fee structures

**Q: Application crashes**
A: Check browser console for errors and try refreshing the page

---

<<<<<<< HEAD
Built with ❤️ using Next.js, TypeScript, and shadcn/ui
=======
Built with ❤️ using Next.js, TypeScript, and shadcn/ui
>>>>>>> 22fc113 (Initial project push)
