"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download, Package, TrendingUp, DollarSign, BarChart3, Settings, Plus } from "lucide-react";
import { UploadComponent } from "@/components/upload-component";
import { ProductTable } from "@/components/product-table";
import { DashboardCards } from "@/components/dashboard-cards";
import { SingleProductForm } from "@/components/single-product-form";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/error-boundary";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab("products");
  };

  const handleSingleProductSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab("products");
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Kitna Milega Amazon </h1>
              <p className="text-muted-foreground mt-2">Analyze your products' profitability with comprehensive fee calculations</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.location.href = '/products'}>
                <Package className="w-4 h-4 mr-2" />
                Manage Products
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/admin'}>
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/api/export'}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Products
              </TabsTrigger>
              <TabsTrigger value="single" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Products
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <ErrorBoundary>
                <DashboardCards refreshKey={refreshKey} />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="upload">
              <ErrorBoundary>
                <UploadComponent onUploadSuccess={handleUploadSuccess} />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="single">
              <ErrorBoundary>
                <SingleProductForm onSuccess={handleSingleProductSuccess} />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="products">
              <ErrorBoundary>
                <ProductTable refreshKey={refreshKey} />
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Toaster />
    </ErrorBoundary>
  );
}