"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Product {
  id: number;
  asin: string;
  productName: string;
  category: string;
  sellingPrice: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  fulfillment: string;
  stepLevel: string;
  referralFee: number;
  closingFee: number;
  shippingFee: number;
  pickPackFee: number;
  removalFee: number;
  storageFee: number;
  totalOtherCost: number;
  totalFees: number;
  taxCredit: number;
  taxToPay: number;
  finalWithoutTax: number;
  netEarnings: number;
  netEarningsPercent: number;
  createdAt: string;
}

interface FilterState {
  search: string;
  category: string;
  fulfillment: string;
  minProfit: string;
  maxProfit: string;
}

export function ProductTable({ refreshKey }: { refreshKey: number }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    fulfillment: 'all',
    minProfit: '',
    maxProfit: ''
  });
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, [refreshKey]);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data);
        const uniqueCategories = [...new Set(result.data.map((p: Product) => p.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (filters.search) {
      filtered = filtered.filter(p => 
        p.asin.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.productName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters.fulfillment && filters.fulfillment !== 'all') {
      filtered = filtered.filter(p => p.fulfillment === filters.fulfillment);
    }

    if (filters.minProfit) {
      filtered = filtered.filter(p => p.netEarningsPercent >= parseFloat(filters.minProfit));
    }

    if (filters.maxProfit) {
      filtered = filtered.filter(p => p.netEarningsPercent <= parseFloat(filters.maxProfit));
    }

    setFilteredProducts(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getProfitBadgeVariant = (percent: number) => {
    if (percent >= 20) return "default";
    if (percent >= 10) return "secondary";
    return "destructive";
  };

  const exportData = () => {
    const headers = [
      'ASIN', 'Product Name', 'Category', 'Selling Price', 'Weight', 'Length', 'Width', 'Height',
      'Fulfillment', 'Referral Fee', 'Closing Fee', 'Shipping Fee', 'Pick & Pack Fee',
      'Removal Fee', 'Storage Fee', 'Total Fees', 'Net Earnings', 'Net Earnings %'
    ];
    
    const csvData = filteredProducts.map(p => [
      p.asin,
      p.productName,
      p.category,
      p.sellingPrice,
      p.weight,
      p.length,
      p.width,
      p.height,
      p.fulfillment,
      p.referralFee,
      p.closingFee,
      p.shippingFee,
      p.pickPackFee,
      p.removalFee,
      p.storageFee,
      p.totalFees,
      p.netEarnings,
      p.netEarningsPercent.toFixed(2)
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fba_products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>Loading product data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Products ({filteredProducts.length})</span>
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Filtered
            </Button>
          </CardTitle>
          <CardDescription>
            Analyze and filter your product profitability data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search ASIN or name..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.fulfillment} onValueChange={(value) => setFilters(prev => ({ ...prev, fulfillment: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Fulfillment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="FBA">FBA</SelectItem>
                <SelectItem value="FBM">FBM</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="Min Profit %"
              value={filters.minProfit}
              onChange={(e) => setFilters(prev => ({ ...prev, minProfit: e.target.value }))}
            />

            <Input
              type="number"
              placeholder="Max Profit %"
              value={filters.maxProfit}
              onChange={(e) => setFilters(prev => ({ ...prev, maxProfit: e.target.value }))}
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ASIN</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                  <TableHead className="text-right">Total Fees</TableHead>
                  <TableHead className="text-right">Net Earnings</TableHead>
                  <TableHead className="text-right">Profit %</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">{product.asin}</TableCell>
                    <TableCell className="max-w-xs truncate" title={product.productName}>
                      {product.productName}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.sellingPrice)}</TableCell>
                    <TableCell className="text-right">{product.weight}kg</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.totalFees)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(product.netEarnings)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getProfitBadgeVariant(product.netEarningsPercent)}>
                        {product.netEarningsPercent.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Product Details - {product.asin}</DialogTitle>
                            <DialogDescription>{product.productName}</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                              <h4 className="font-semibold">Basic Information</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>ASIN:</span>
                                  <span className="font-mono">{product.asin}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Category:</span>
                                  <span>{product.category}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Fulfillment:</span>
                                  <span>{product.fulfillment}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Step Level:</span>
                                  <span>{product.stepLevel}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="font-semibold">Dimensions</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Weight:</span>
                                  <span>{product.weight} kg</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Length:</span>
                                  <span>{product.length} cm</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Width:</span>
                                  <span>{product.width} cm</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Height:</span>
                                  <span>{product.height} cm</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="font-semibold">Fee Breakdown</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Referral Fee:</span>
                                  <span>{formatCurrency(product.referralFee)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Closing Fee:</span>
                                  <span>{formatCurrency(product.closingFee)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Shipping Fee:</span>
                                  <span>{formatCurrency(product.shippingFee)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Pick & Pack Fee:</span>
                                  <span>{formatCurrency(product.pickPackFee)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Removal Fee:</span>
                                  <span>{formatCurrency(product.removalFee)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Storage Fee:</span>
                                  <span>{formatCurrency(product.storageFee)}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                  <span>Total Fees:</span>
                                  <span>{formatCurrency(product.totalFees)}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="font-semibold">Profitability</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Selling Price:</span>
                                  <span>{formatCurrency(product.sellingPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tax Credit:</span>
                                  <span>{formatCurrency(product.taxCredit)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tax to Pay:</span>
                                  <span>{formatCurrency(product.taxToPay)}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                  <span>Net Earnings:</span>
                                  <span className={product.netEarnings >= 0 ? "text-green-600" : "text-red-600"}>
                                    {formatCurrency(product.netEarnings)}
                                  </span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                  <span>Profit Margin:</span>
                                  <span className={product.netEarningsPercent >= 0 ? "text-green-600" : "text-red-600"}>
                                    {product.netEarningsPercent.toFixed(2)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}