"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, TrendingUp, BarChart3 } from "lucide-react";

interface DashboardData {
  totalProducts: number;
  totalRevenue: number;
  totalNetEarnings: number;
  avgProfitMargin: number;
  categoriesCount?: number;
  categories?: { id: number; name: string; returnPercent: number; isActive: boolean }[];
}

export function DashboardCards({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<DashboardData>({
    totalProducts: 0,
    totalRevenue: 0,
    totalNetEarnings: 0,
    avgProfitMargin: 0,
    categoriesCount: 0,
    categories: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const cards = [
    {
      title: "Total Products",
      value: loading ? "..." : data.totalProducts.toLocaleString(),
      description: "Products analyzed",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Total Revenue",
      value: loading ? "..." : formatCurrency(data.totalRevenue),
      description: "Combined selling price",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Total Net Earnings",
      value: loading ? "..." : formatCurrency(data.totalNetEarnings),
      description: "After all fees",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Avg. Profit Margin",
      value: loading ? "..." : `${data.avgProfitMargin.toFixed(2)}%`,
      description: "Average profitability",
      icon: BarChart3,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            {loading ? 'Loading…' : `${data.categoriesCount || 0} categories (showing up to 20)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(data.categories || []).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded border p-2 text-sm">
                <div className="truncate mr-2">{c.name}</div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>Return: {c.returnPercent}%</span>
                  <span className={`px-2 py-0.5 rounded ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            ))}
            {!loading && (data.categories || []).length === 0 && (
              <div className="text-sm text-gray-500">No categories found. Add some in Admin.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}