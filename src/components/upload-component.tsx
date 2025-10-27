"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadComponentProps {
  onUploadSuccess: () => void;
}

export function UploadComponent({ onUploadSuccess }: UploadComponentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile);
        setError(null);
        setSuccess(false);
      } else {
        setError('Please upload an Excel file (.xlsx or .xls)');
        toast({
          title: "Invalid file format",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        toast({
          title: "Upload successful!",
          description: `Successfully processed ${result.data.processed} products`,
        });
        onUploadSuccess();
      } else {
        setError(result.error || 'Upload failed');
        toast({
          title: "Upload failed",
          description: result.error || 'An error occurred during upload',
          variant: "destructive",
        });
      }
    } catch (error) {
      setError('Network error occurred');
      toast({
        title: "Network error",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ['ASIN', 'SellingPrice', 'Weight', 'Length', 'Width', 'Height', 'Fulfillment', 'StepLevel'],
      ['B08N5WRWNW', 2999, 0.5, 20, 15, 5, 'FBA', 'Standard'],
      ['B07XJ8C8F5', 1599, 0.3, 15, 10, 8, 'FBA', 'Standard'],
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fba_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Excel File
          </CardTitle>
          <CardDescription>
            Upload your product data in Excel format with ASIN, pricing, and dimensions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex flex-col items-center"
            >
              <FileText className="w-12 h-12 text-gray-400 mb-4" />
              <span className="text-lg font-medium text-gray-700">
                {file ? file.name : "Choose Excel file or drag and drop"}
              </span>
              <span className="text-sm text-gray-500 mt-1">
                .xlsx or .xls files only
              </span>
            </label>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="min-w-24"
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading and processing...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                File uploaded successfully! Products have been processed and are ready for analysis.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Excel Format Requirements</CardTitle>
          <CardDescription>
            Your Excel file should contain the following columns in order:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Required Columns:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li><strong>ASIN:</strong> Amazon product identifier</li>
                <li><strong>SellingPrice:</strong> Your selling price in INR</li>
                <li><strong>Weight:</strong> Product weight in kg</li>
                <li><strong>Length:</strong> Package length in cm</li>
                <li><strong>Width:</strong> Package width in cm</li>
                <li><strong>Height:</strong> Package height in cm</li>
                <li><strong>Fulfillment:</strong> FBA or FBM</li>
                <li><strong>StepLevel:</strong> Standard or Premium</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Example Data:</h4>
              <div className="text-sm bg-gray-50 p-3 rounded font-mono">
                B08N5WRWNW, 2999, 0.5, 20, 15, 5, FBA, Standard
              </div>
              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="w-full mt-2"
              >
                Download Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}