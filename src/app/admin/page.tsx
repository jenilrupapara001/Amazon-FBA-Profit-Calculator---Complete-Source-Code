"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Settings, Upload, Download, Database, Shield, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ErrorBoundary from "@/components/error-boundary";

interface CategoryFee {
  id: number;
  categoryName: string;
  minPrice: number;
  maxPrice: number;
  referralFeePercent: number;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  returnPercent: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const [categoryFees, setCategoryFees] = useState<CategoryFee[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<CategoryFee | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState("fees");
  const [selectedFeeIds, setSelectedFeeIds] = useState<number[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [feeFormData, setFeeFormData] = useState({
    categoryName: '',
    minPrice: '',
    maxPrice: '',
    referralFeePercent: ''
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    returnPercent: ''
  });
  const [feeUploadProgress, setFeeUploadProgress] = useState<number>(0);
  const [feeUploadFileName, setFeeUploadFileName] = useState<string>('');
  const [feeUploadResult, setFeeUploadResult] = useState<any>(null);
  const [categoryUploadProgress, setCategoryUploadProgress] = useState<number>(0);
  const [categoryUploadFileName, setCategoryUploadFileName] = useState<string>('');
  const [categoryUploadResult, setCategoryUploadResult] = useState<any>(null);
  const [selectAllFees, setSelectAllFees] = useState<boolean>(false);
  const [selectAllCategories, setSelectAllCategories] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feesResponse, categoriesResponse] = await Promise.all([
        fetch('/api/admin/category-fees'),
        fetch('/api/admin/categories')
      ]);
      
      const feesResult = await feesResponse.json();
      const categoriesResult = await categoriesResponse.json();
      
      if (feesResult.success) {
        setCategoryFees(feesResult.data);
      }
      if (categoriesResult.success) {
        setCategories(categoriesResult.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectFee = (id: number) => {
    setSelectedFeeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectCategory = (id: number) => {
    setSelectedCategoryIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectAllFees = () => {
    if (selectAllFees) {
      setSelectedFeeIds([]);
      setSelectAllFees(false);
    } else {
      setSelectedFeeIds(categoryFees.map(f => f.id));
      setSelectAllFees(true);
    }
  };
  const toggleSelectAllCategories = () => {
    if (selectAllCategories) {
      setSelectedCategoryIds([]);
      setSelectAllCategories(false);
    } else {
      setSelectedCategoryIds(categories.map(c => c.id));
      setSelectAllCategories(true);
    }
  };
  const bulkDeleteFees = async () => {
    if (selectedFeeIds.length === 0) return;
    if (!confirm(`Delete ${selectedFeeIds.length} fee(s)? This cannot be undone.`)) return;
    const res = await fetch('/api/admin/category-fees/bulk-delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selectedFeeIds })
    });
    const result = await res.json();
    if (result.success) {
      toast({ title: 'Deleted', description: `Removed ${result.deleted} fee(s)` });
      setSelectedFeeIds([]);
      fetchData();
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to bulk delete fees', variant: 'destructive' });
    }
  };
  const bulkDeleteCategories = async () => {
    if (selectedCategoryIds.length === 0) return;
    if (!confirm(`Delete ${selectedCategoryIds.length} categor(ies)?`)) return;
    const res = await fetch('/api/admin/categories/bulk-delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: selectedCategoryIds })
    });
    const result = await res.json();
    if (result.success) {
      const blockedMsg = Array.isArray(result.blocked) && result.blocked.length > 0
        ? `; blocked (has fees): ${result.blocked.slice(0, 5).join(', ')}${result.blocked.length > 5 ? '…' : ''}`
        : '';
      toast({ title: 'Deleted', description: `Removed ${result.deleted} categor(ies)${blockedMsg}` });
      setSelectedCategoryIds([]);
      fetchData();
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to bulk delete categories', variant: 'destructive' });
    }
  };

  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingFee 
        ? `/api/admin/category-fees/${editingFee.id}`
        : '/api/admin/category-fees';
      
      const method = editingFee ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryName: feeFormData.categoryName,
          minPrice: parseFloat(feeFormData.minPrice),
          maxPrice: parseFloat(feeFormData.maxPrice),
          referralFeePercent: parseFloat(feeFormData.referralFeePercent),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: editingFee ? "Category fee updated successfully" : "Category fee created successfully",
        });
        setIsFeeDialogOpen(false);
        setEditingFee(null);
        resetFeeForm();
        fetchData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save category fee",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving category fee:', error);
      toast({
        title: "Error",
        description: "Failed to save category fee",
        variant: "destructive",
      });
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: categoryFormData.name,
          description: categoryFormData.description,
          returnPercent: parseFloat(categoryFormData.returnPercent),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: editingCategory ? "Category updated successfully" : "Category created successfully",
        });
        setIsCategoryDialogOpen(false);
        setEditingCategory(null);
        resetCategoryForm();
        fetchData();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save category",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeeUploadFileName(file.name);
    setFeeUploadProgress(0);
    setFeeUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/admin/category-fees/bulk-upload');
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setFeeUploadProgress(percent);
          }
        };
        xhr.onload = () => {
          try {
            const result = JSON.parse(xhr.responseText || '{}');
            setFeeUploadResult(result);
      if (result.success) {
              toast({ title: 'Success', description: `Imported ${result.imported} fees` });
        fetchData();
              resolve();
      } else {
              toast({ title: 'Error', description: result.error || 'Failed to upload category fees', variant: 'destructive' });
              resolve();
            }
          } catch (err) {
            toast({ title: 'Error', description: 'Invalid server response', variant: 'destructive' });
            reject(err);
          }
        };
        xhr.onerror = () => {
          toast({ title: 'Error', description: 'Network error during upload', variant: 'destructive' });
          reject(new Error('Upload failed'));
        };
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleCategoryBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCategoryUploadFileName(file.name);
    setCategoryUploadProgress(0);
    setCategoryUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/admin/categories/bulk-upload');
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setCategoryUploadProgress(percent);
          }
        };
        xhr.onload = () => {
          try {
            const result = JSON.parse(xhr.responseText || '{}');
            setCategoryUploadResult(result);
            if (result.success) {
              toast({ title: 'Success', description: `Imported ${result.imported} categories` });
              fetchData();
              resolve();
            } else {
              toast({ title: 'Error', description: result.error || 'Failed to upload categories', variant: 'destructive' });
              resolve();
            }
          } catch (err) {
            toast({ title: 'Error', description: 'Invalid server response', variant: 'destructive' });
            reject(err);
          }
        };
        xhr.onerror = () => {
          toast({ title: 'Error', description: 'Network error during upload', variant: 'destructive' });
          reject(new Error('Upload failed'));
        };
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Error uploading categories:', error);
    }
  };

  const handleDelete = async (type: 'fee' | 'category', id: number) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/${type === 'fee' ? 'category-fees' : 'categories'}/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: `${type === 'fee' ? 'Category fee' : 'Category'} deleted successfully`,
        });
        fetchData();
      } else {
        toast({
          title: "Error",
          description: result.error || `Failed to delete ${type}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete ${type}`,
        variant: "destructive",
      });
    }
  };

  const resetFeeForm = () => {
    setFeeFormData({
      categoryName: '',
      minPrice: '',
      maxPrice: '',
      referralFeePercent: ''
    });
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      description: '',
      returnPercent: ''
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-8 h-8" />
                Admin Panel
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage categories, referral fees, and system settings
              </p>
            </div>
          </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fees" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Referral Fees
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Bulk Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Category Referral Fees</CardTitle>
                    <CardDescription>
                      Manage referral fee percentages for different categories and price ranges
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={bulkDeleteFees} disabled={selectedFeeIds.length === 0}>
                      Delete Selected ({selectedFeeIds.length})
                    </Button>
                  <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingFee(null); resetFeeForm(); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Fee
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingFee ? 'Edit Category Fee' : 'Add New Category Fee'}
                        </DialogTitle>
                        <DialogDescription>
                          Set referral fee percentages for different price ranges
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleFeeSubmit} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Category</label>
                          <Select
                            value={feeFormData.categoryName}
                            onValueChange={(value) => setFeeFormData(prev => ({ ...prev, categoryName: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Min Price (₹)</label>
                            <Input
                              type="number"
                              value={feeFormData.minPrice}
                              onChange={(e) => setFeeFormData(prev => ({ ...prev, minPrice: e.target.value }))}
                              required
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Max Price (₹)</label>
                            <Input
                              type="number"
                              value={feeFormData.maxPrice}
                              onChange={(e) => setFeeFormData(prev => ({ ...prev, maxPrice: e.target.value }))}
                              required
                              min="0"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Referral Fee (%)</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={feeFormData.referralFeePercent}
                            onChange={(e) => setFeeFormData(prev => ({ ...prev, referralFeePercent: e.target.value }))}
                            required
                            min="0"
                            max="100"
                          />
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsFeeDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingFee ? 'Update' : 'Create'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <input type="checkbox" className="mr-2" checked={selectAllFees} onChange={toggleSelectAllFees} />
                          Category
                        </TableHead>
                        <TableHead>Price Range</TableHead>
                        <TableHead>Referral Fee</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryFees.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell>
                            <input type="checkbox" checked={selectedFeeIds.includes(fee.id)} onChange={() => toggleSelectFee(fee.id)} />
                            <Badge variant="outline">{fee.categoryName}</Badge>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(fee.minPrice)} - {fee.maxPrice === 999999 ? '∞' : formatCurrency(fee.maxPrice)}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-600">{fee.referralFeePercent}%</span>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(fee.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingFee(fee);
                                  setFeeFormData({
                                    categoryName: fee.categoryName,
                                    minPrice: fee.minPrice.toString(),
                                    maxPrice: fee.maxPrice.toString(),
                                    referralFeePercent: fee.referralFeePercent.toString(),
                                  });
                                  setIsFeeDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete('fee', fee.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {categoryFees.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No category fees configured. Add your first category fee to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>
                      Manage product categories and their default return percentages
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={bulkDeleteCategories} disabled={selectedCategoryIds.length === 0}>
                      Delete Selected ({selectedCategoryIds.length})
                    </Button>
                  <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingCategory(null); resetCategoryForm(); }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingCategory ? 'Edit Category' : 'Add New Category'}
                        </DialogTitle>
                        <DialogDescription>
                          Create or modify product categories
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCategorySubmit} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Category Name</label>
                          <Input
                            value={categoryFormData.name}
                            onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            placeholder="e.g., Electronics, Apparel, Home"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={categoryFormData.description}
                            onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Optional description of the category"
                            rows={3}
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Default Return %</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={categoryFormData.returnPercent}
                            onChange={(e) => setCategoryFormData(prev => ({ ...prev, returnPercent: e.target.value }))}
                            required
                            min="0"
                            max="100"
                            placeholder="e.g., 15"
                          />
                        </div>
                        
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingCategory ? 'Update' : 'Create'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <input type="checkbox" className="mr-2" checked={selectAllCategories} onChange={toggleSelectAllCategories} />
                          Category Name
                        </TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Return %</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">
                            <input type="checkbox" className="mr-2" checked={selectedCategoryIds.includes(category.id)} onChange={() => toggleSelectCategory(category.id)} />
                            {category.name}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                            {category.description || '-'}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">{category.returnPercent}%</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={category.isActive ? "default" : "secondary"}>
                              {category.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setCategoryFormData({
                                    name: category.name,
                                    description: category.description || '',
                                    returnPercent: category.returnPercent.toString(),
                                  });
                                  setIsCategoryDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete('category', category.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {categories.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No categories configured. Add your first category to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Upload</CardTitle>
                <CardDescription>
                  Upload category fees and categories in bulk using CSV or Excel files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload Referral Fees
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        CSV or Excel files (MAX. 10MB)
                      </span>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleBulkUpload}
                    />
                    {feeUploadFileName && (
                      <div className="mt-3 text-sm text-gray-600">
                        File: <span className="font-medium">{feeUploadFileName}</span>
                      </div>
                    )}
                    <div className="mt-3 h-2 w-full bg-gray-200 rounded">
                      <div className="h-2 bg-blue-600 rounded" style={{ width: `${feeUploadProgress}%` }} />
                    </div>
                    {feeUploadResult && (
                      <div className="mt-3 text-xs text-gray-600 text-left">
                        <div>Imported: <span className="font-medium">{feeUploadResult.imported ?? 0}</span></div>
                        {feeUploadResult.total !== undefined && (
                          <div>Total Rows: <span className="font-medium">{feeUploadResult.total}</span></div>
                        )}
                        {Array.isArray(feeUploadResult.errors) && feeUploadResult.errors.length > 0 && (
                          <div className="mt-2 max-h-24 overflow-auto border rounded p-2 bg-white">
                            {(feeUploadResult.errors as string[]).slice(0, 10).map((err, idx) => (
                              <div key={idx} className="text-red-600">• {err}</div>
                            ))}
                            {feeUploadResult.errors.length > 10 && (
                              <div className="text-gray-500">…and {feeUploadResult.errors.length - 10} more</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="category-file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload Categories
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        CSV or Excel files (MAX. 10MB)
                      </span>
                    </label>
                    <input
                      id="category-file-upload"
                      name="category-file-upload"
                      type="file"
                      className="sr-only"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleCategoryBulkUpload}
                    />
                    {categoryUploadFileName && (
                      <div className="mt-3 text-sm text-gray-600">
                        File: <span className="font-medium">{categoryUploadFileName}</span>
                      </div>
                    )}
                    <div className="mt-3 h-2 w-full bg-gray-200 rounded">
                      <div className="h-2 bg-blue-600 rounded" style={{ width: `${categoryUploadProgress}%` }} />
                    </div>
                    {categoryUploadResult && (
                      <div className="mt-3 text-xs text-gray-600 text-left">
                        <div>Imported: <span className="font-medium">{categoryUploadResult.imported ?? 0}</span></div>
                        {categoryUploadResult.total !== undefined && (
                          <div>Total Rows: <span className="font-medium">{categoryUploadResult.total}</span></div>
                        )}
                        {Array.isArray(categoryUploadResult.errors) && categoryUploadResult.errors.length > 0 && (
                          <div className="mt-2 max-h-24 overflow-auto border rounded p-2 bg-white">
                            {(categoryUploadResult.errors as string[]).slice(0, 10).map((err, idx) => (
                              <div key={idx} className="text-red-600">• {err}</div>
                            ))}
                            {categoryUploadResult.errors.length > 10 && (
                              <div className="text-gray-500">…and {categoryUploadResult.errors.length - 10} more</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">File Format Requirements</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Your file should include the following columns:
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      <li>• categoryName (string) - Name of the category</li>
                      <li>• minPrice (number) - Minimum price for this fee tier</li>
                      <li>• maxPrice (number) - Maximum price for this fee tier</li>
                      <li>• referralFeePercent (number) - Referral fee percentage</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => window.open('/api/admin/category-fees/template')}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                  <Button variant="outline" onClick={() => window.open('/api/admin/categories/template')}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Categories Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}