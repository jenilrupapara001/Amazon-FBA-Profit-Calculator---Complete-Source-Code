import { db } from '@/lib/db';

const categoryFees = [
  // Beauty
  { categoryName: 'Beauty', minPrice: 0, maxPrice: 1000, referralFeePercent: 15 },
  { categoryName: 'Beauty', minPrice: 1000, maxPrice: 5000, referralFeePercent: 15 },
  { categoryName: 'Beauty', minPrice: 5000, maxPrice: 10000, referralFeePercent: 15 },
  { categoryName: 'Beauty', minPrice: 10000, maxPrice: 999999, referralFeePercent: 15 },
  
  // Electronics
  { categoryName: 'Electronics', minPrice: 0, maxPrice: 1000, referralFeePercent: 8 },
  { categoryName: 'Electronics', minPrice: 1000, maxPrice: 5000, referralFeePercent: 8 },
  { categoryName: 'Electronics', minPrice: 5000, maxPrice: 10000, referralFeePercent: 8 },
  { categoryName: 'Electronics', minPrice: 10000, maxPrice: 999999, referralFeePercent: 8 },
  
  // Clothing
  { categoryName: 'Clothing', minPrice: 0, maxPrice: 1000, referralFeePercent: 17 },
  { categoryName: 'Clothing', minPrice: 1000, maxPrice: 5000, referralFeePercent: 17 },
  { categoryName: 'Clothing', minPrice: 5000, maxPrice: 10000, referralFeePercent: 17 },
  { categoryName: 'Clothing', minPrice: 10000, maxPrice: 999999, referralFeePercent: 17 },
  
  // Home & Kitchen
  { categoryName: 'Home', minPrice: 0, maxPrice: 1000, referralFeePercent: 15 },
  { categoryName: 'Home', minPrice: 1000, maxPrice: 5000, referralFeePercent: 15 },
  { categoryName: 'Home', minPrice: 5000, maxPrice: 10000, referralFeePercent: 15 },
  { categoryName: 'Home', minPrice: 10000, maxPrice: 999999, referralFeePercent: 15 },
  
  // Books
  { categoryName: 'Books', minPrice: 0, maxPrice: 1000, referralFeePercent: 12 },
  { categoryName: 'Books', minPrice: 1000, maxPrice: 5000, referralFeePercent: 12 },
  { categoryName: 'Books', minPrice: 5000, maxPrice: 10000, referralFeePercent: 12 },
  { categoryName: 'Books', minPrice: 10000, maxPrice: 999999, referralFeePercent: 12 },
  
  // Toys & Games
  { categoryName: 'Toys', minPrice: 0, maxPrice: 1000, referralFeePercent: 15 },
  { categoryName: 'Toys', minPrice: 1000, maxPrice: 5000, referralFeePercent: 15 },
  { categoryName: 'Toys', minPrice: 5000, maxPrice: 10000, referralFeePercent: 15 },
  { categoryName: 'Toys', minPrice: 10000, maxPrice: 999999, referralFeePercent: 15 },
  
  // Sports & Outdoors
  { categoryName: 'Sports', minPrice: 0, maxPrice: 1000, referralFeePercent: 15 },
  { categoryName: 'Sports', minPrice: 1000, maxPrice: 5000, referralFeePercent: 15 },
  { categoryName: 'Sports', minPrice: 5000, maxPrice: 10000, referralFeePercent: 15 },
  { categoryName: 'Sports', minPrice: 10000, maxPrice: 999999, referralFeePercent: 15 },
  
  // General (fallback category)
  { categoryName: 'General', minPrice: 0, maxPrice: 1000, referralFeePercent: 15 },
  { categoryName: 'General', minPrice: 1000, maxPrice: 5000, referralFeePercent: 15 },
  { categoryName: 'General', minPrice: 5000, maxPrice: 10000, referralFeePercent: 15 },
  { categoryName: 'General', minPrice: 10000, maxPrice: 999999, referralFeePercent: 15 },
];

async function seedCategoryFees() {
  try {
    console.log('Seeding category fees...');
    
    // Clear existing fees
    await db.categoryFee.deleteMany();
    
    // Insert new fees
    await db.categoryFee.createMany({
      data: categoryFees
    });
    
    console.log(`Successfully seeded ${categoryFees.length} category fee records`);
  } catch (error) {
    console.error('Error seeding category fees:', error);
  }
}

seedCategoryFees()
  .then(() => {
    console.log('Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });