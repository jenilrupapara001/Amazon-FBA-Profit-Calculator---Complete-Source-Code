"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search, Package, DollarSign, Weight, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SingleProductFormProps {
  onSuccess: () => void;
}

interface ProductFormData {
  asin: string;
  productName: string;
  category: string;
  sellingPrice: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  fulfillment: string;
  stepLevel: string;
  region: string;
}

const CATEGORIES = [
  "Beauty - Haircare, Bath and Shower",
  "Beauty - Make-up",
  "Beauty - Other products",
  "Beauty - Fragrance",
  "Deodorants",
  "Face Wash",
  "Moisturiser Cream",
  "Sunscreen",
  "Luxury Beauty",
  "Feminine Hygiene & Care",
  "Health & Household - Medical Equipment, Sexual Wellness, Adult Incontinence, Elderly Care",
  "Health & Household - Sports Nutrition & Meal Replacement Shakes",
  "Health & Household - Ayurvedic, Homeopathic & Alternate Medicine products",
  "Health & Household - Household Cleaning, Laundry, Air Fresheners, Personal Hygiene",
  "Health & Household - Vitamins & Mineral Health Supplements",
  "Health & Household - Other products",
  "Baby Hardlines - Swings, Bouncers & Rockers, Carriers, Baby Safety - Guards & Locks, Baby Room Décor, Baby Furniture, Baby Car Seats & Accessories",
  "Baby Strollers",
  "Baby & Kids - Furniture & Home Décor",
  "Baby - Walker",
  "Baby - Diapers",
  "Baby - Other products",
  "Grocery - Herbs & Spices",
  "Grocery - Dried Fruits & Nuts",
  "Grocery - Hampers & gifting",
  "Grocery & Gourmet - Oils",
  "Grocery & Gourmet - Beverages",
  "Grocery & Gourmet - Other products",
  "OTC Medicine",
  "Personal Care Appliances - Weighing Scales & Fat Analysers",
  "Personal Care Appliances - Grooming & Styling",
  "Personal Care Appliances - Electric Massagers",
  "Personal Care Appliances - Thermometers",
  "Personal Care Appliances - Blood Pressure Monitors",
  "Personal Care Appliances - Electric Tooth brush, Oral Irrigators & Accessories",
  "Personal Care Appliances - Other products",
  "Apparel - Women's Innerwear & Lingerie",
  "Apparel - Sarees & Dress Materials",
  "Apparel - Sweatshirts & Jackets",
  "Apparel - Dress",
  "Apparel - Shirts",
  "Apparel - Socks & Stockings",
  "Apparel - Thermals",
  "Pants - Trousers, Jeans, Trackpants & Leggings",
  "Apparel - Other Innerwear",
  "Sleepwear",
  "Apparel - Accessories",
  "Apparel - Men's T-Shirts (except Tank Tops & Full Sleeve Tops)",
  "Apparel - Ethnic Wear",
  "Apparel - Baby",
  "Apparel - Shorts",
  "Apparel - Other products",
  "Eyewear - Sunglasses, Frames & Zero Power Eye Glasses",
  "Watches",
  "Flip Flops",
  "Kids Shoes",
  "Shoes",
  "Wallets",
  "Backpacks",
  "Handbags",
  "Luggage - Suitcase & Trolleys",
  "Luggage - Travel Accessories",
  "Luggage - Other products",
  "Silver Jewellery",
  "Silver Coins & Bars",
  "Fine Jewellery - Unstudded & Solitaire",
  "Fine Jewellery - Studded",
  "Fine Jewellery - Gold Coins",
  "Fashion Jewellery",
  "Kitchen Tools & Supplies - Choppers, Knives, Bakeware & Accessories",
  "Cookware, Tableware & Dinnerware",
  "Kitchen - Glassware & Ceramicware",
  "Gas Stoves & Pressure Cookers",
  "Small Appliances",
  "Fans & Robotic Vacuums",
  "Water Purifier & Accessories",
  "Water Heaters & Accessories",
  "Inverter & Batteries",
  "Cleaning & Home Appliances",
  "Containers, Boxes, Bottles & Kitchen Storage",
  "Slipcovers & Kitchen Linens",
  "Kitchen - Other products",
  "Wall Art",
  "Home Fragrance & Candles",
  "Home Furnishing (Excluding Curtain & Curtain Accessories)",
  "Bedsheets, Blankets & Covers",
  "Home Storage (Excluding Kitchen Containers, Boxes, Bottles & Kitchen Storage)",
  "Home - Waste & Recycling",
  "Craft Materials",
  "Home Decor Products",
  "Clocks",
  "LED Bulbs & Battens",
  "Indoor Lighting - Wall, Ceiling Fixture Lights, Lamp Bases, Lamp Shades & Smart Lighting",
  "Indoor Lighting - Other products",
  "Cushion Covers",
  "Curtains & Curtain Accessories",
  "Rugs & Doormats",
  "Doors & Windows (Wooden, Metal, PVC/UPVC Doors & Windows)",
  "Sanitaryware - Toilets, Bathtubs, Basins/Sinks, Bath Mirrors & Vanities, & Shower Enclosures/Partitions",
  "Tiles & Flooring Accessories",
  "Wires (Electrical Wires/cables for House Wiring, ad hoc usage)",
  "Home - Other products",
  "Home Improvement -",
  "Wallpapers & Wallpaper Accessories",
  "Wall Paints & Tools",
  "Home Improvement Accessories",
  "Safes & Lockers with Locking Mechanism",
  "Home improvement - Kitchen & Bath (Fittings, accessories), Cleaning Supplies, Electricals, Hardware, Building Materials",
  "Ladders",
  "Home Safety & Security Systems",
  "Home Improvement - Other products",
  "Lawn & Garden - Solar Panels",
  "Lawn & Garden - Leaf Blower & Water Pump",
  "Lawn & Garden - Solar Devices, Inverters, Charge Controller, Battery, Lights, Solar Gadgets",
  "Lawn & Garden - Chemical Pest Control, Mosquito Nets, Bird Control, Plant Protection, Foggers",
  "Lawn & Garden - Outdoor equipments, Saws, Lawn Mowers, Cultivator, Tiller, String Trimmers, Generators, Barbeque Grills, Greenhouses",
  "Lawn & Garden - Plants, Seeds, Bulbs & Gardening Tools",
  "Lawn & Garden - Other products",
  "Automotive - Tyres & Rims",
  "Automotive - Batteries & Air Fresheners",
  "Automotive Accessories - Floor Mats, Seat, Car & Bike Covers",
  "Automotive Helmets & Riding Gloves",
  "Automotive Vehicles - 2W/4W/EV",
  "Automotive - Car & Bike Parts, Brakes, Styling & Body Fittings, Transmission, Engine Parts, Exhaust Systems, Interior Fitting, Suspension & Wipers",
  "Vehicle Tools & Appliances",
  "Oils, Lubricants",
  "Automotive - Cleaning Kits, Sponges, Brush, Duster, Cloths & Liquids, Car Interior & Exterior Care, Waxes, Polish, Shampoo, Car & Bike, Lighting & Paints",
  "Automotive - Other products",
  "Mattresses",
  "Office Furniture - Study Table, Office & Gaming Chairs",
  "Furniture - Other products",
  "Business & Scientific Supplies",
  "3D_Printers",
  "Business & Industrial Supplies - Electrical Testing, Dimensional Measurement, Thermal Printers & Barcode Scanners",
  "Business & Industrial Supplies - Commercial, Food H&ling Equipment, & Health Supplies",
  "Business & Industrial Supplies - Other products",
  "Cables & Adapters - Electronics, PC & Wireless",
  "Camera Accessories",
  "Camera & Camcorder",
  "Camera Lenses",
  "Car Cradles, Lens Kits & Tablet Cases",
  "Car Electronics Accessories",
  "Car Electronics Devices",
  "Cases, Covers & Skins, & Screen Guards",
  "Electronic Devices (Excluding TV, Camera & Camcorder, Camera Lenses & Accessories, GPS Devices & Speakers)",
  "Entertainment Collectibles",
  "Computer & Laptop - Keyboards & Mouse",
  "Hard Disks",
  "Headsets, Headphones & Earphones",
  "Laptop & Camera Battery",
  "Laptop Bags & Sleeves",
  "Laptops",
  "Monitors",
  "Musical Instruments - DJ & VJ Equipment, Recording & Computer, Cables & Leads, & PA & Stage",
  "Musical Instruments - Guitars",
  "Musical Instruments - Keyboards",
  "Musical Instruments - Microphones",
  "Musical Instruments - Other products",
  "Office - Electronic Devices",
  "Office - Other products",
  "Office Products - Arts & Crafts",
  "Office Products - Office Supplies",
  "Office Products - Writing Instruments",
  "Power & H& Tools & Water Dispenser",
  "Power Banks & Chargers",
  "Scanners & Printers",
  "Smart Watches & Accessories",
  "Speakers",
  "Sports - Cricket & Badminton Equipments, Tennis, Table Tennis, Squash, Football, Volleyball, Basketball, Throwball & Swimming",
  "Sports - Cricket Bats, Badminton Racquets, Tennis Racquets, Pickleball Paddles, Squash Racquets & TT Tables",
  "Sports - Footwear",
  "Sports - Other products",
  "Sports Collectibles",
  "Stethoscopes",
  "Tablets",
  "Warranty Services",
  "Coins Collectibles",
  "General"
];

const FULFILLMENT_METHODS = ["FBA", "FBM"];
const STEP_LEVELS = ["Standard", "Basic", "Advanced", "Premium"];
const REGIONS = ["Local", "Regional", "National"];

export function SingleProductForm({ onSuccess }: SingleProductFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProductFormData>({
    asin: "",
    productName: "",
    category: "General",
    sellingPrice: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    fulfillment: "FBA",
    stepLevel: "Standard",
    region: "National"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAmazon, setIsFetchingAmazon] = useState(false);

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fetchAmazonData = async () => {
    if (!formData.asin.trim()) {
      toast({
        title: "Error",
        description: "Please enter an ASIN first",
        variant: "destructive"
      });
      return;
    }

    setIsFetchingAmazon(true);
    try {
      const response = await fetch('/api/fetch-amazon-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asin: formData.asin.trim() }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          productName: result.data.productName || prev.productName,
          category: result.data.category || prev.category,
          sellingPrice: result.data.sellingPrice ? result.data.sellingPrice.toString() : prev.sellingPrice,
          weight: result.data.weight ? result.data.weight.toString() : prev.weight,
          length: result.data.length ? result.data.length.toString() : prev.length,
          width: result.data.width ? result.data.width.toString() : prev.width,
          height: result.data.height ? result.data.height.toString() : prev.height,
        }));
        toast({
          title: "Success",
          description: result.message || "Amazon data fetched successfully!"
        });
      } else {
        const errorMessage = result.error || "Could not fetch Amazon data. Please enter manually.";
        const errorDetails = result.details ? ` (${result.details})` : "";
        toast({
          title: "Amazon Data Unavailable",
          description: `${errorMessage}${errorDetails}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching Amazon data:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch Amazon data";
      toast({
        title: "Network Error",
        description: `Unable to connect to Amazon data service: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsFetchingAmazon(false);
    }
  };

  const validateForm = () => {
    if (!formData.asin.trim()) {
      toast({
        title: "Error",
        description: "ASIN is required",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) {
      toast({
        title: "Error",
        description: "Valid selling price is required",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      toast({
        title: "Error",
        description: "Valid weight is required",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // First calculate fees
      const feeCalculationResponse = await fetch('/api/calculate-fees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asin: formData.asin.trim().toUpperCase(),
          productName: formData.productName.trim() || `Product ${formData.asin.trim().toUpperCase()}`,
          category: formData.category,
          sellingPrice: parseFloat(formData.sellingPrice),
          weight: parseFloat(formData.weight),
          length: parseFloat(formData.length) || 0,
          width: parseFloat(formData.width) || 0,
          height: parseFloat(formData.height) || 0,
          fulfillment: formData.fulfillment,
          stepLevel: formData.stepLevel,
          region: formData.region
        }),
      });

      const feeResult = await feeCalculationResponse.json();

      if (feeResult.success) {
        toast({
          title: "Success",
          description: "Product added and fees calculated successfully!",
        });
        // Reset form
        setFormData({
          asin: "",
          productName: "",
          category: "General",
          sellingPrice: "",
          weight: "",
          length: "",
          width: "",
          height: "",
          fulfillment: "FBA",
          stepLevel: "Standard",
          region: "National"
        });
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: feeResult.error || "Failed to calculate fees",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Single Product
        </CardTitle>
        <CardDescription>
          Manually add a product and optionally fetch data from Amazon using ASIN
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ASIN Section */}
          <div className="space-y-2">
            <Label htmlFor="asin" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              ASIN *
            </Label>
            <div className="flex gap-2">
              <Input
                id="asin"
                placeholder="e.g., B08N5WRWNW"
                value={formData.asin}
                onChange={(e) => handleInputChange('asin', e.target.value)}
                className="flex-1"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={fetchAmazonData}
                disabled={isFetchingAmazon || !formData.asin.trim()}
                className="whitespace-nowrap"
              >
                {isFetchingAmazon ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Fetch Data
              </Button>
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Textarea
              id="productName"
              placeholder="Enter product name (optional - will be auto-filled if available)"
              value={formData.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              rows={2}
            />
          </div>

          {/* Category, Fulfillment and Region */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fulfillment">Fulfillment Method</Label>
              <Select value={formData.fulfillment} onValueChange={(value) => handleInputChange('fulfillment', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fulfillment" />
                </SelectTrigger>
                <SelectContent>
                  {FULFILLMENT_METHODS.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price and Weight */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sellingPrice" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Selling Price (₹) *
              </Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.sellingPrice}
                onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Weight className="w-4 h-4" />
                Weight (kg) *
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Dimensions */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Dimensions (cm) - Optional
            </Label>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="length">Length</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={formData.length}
                  onChange={(e) => handleInputChange('length', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={formData.width}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* STEP Level */}
          <div className="space-y-2">
            <Label htmlFor="stepLevel">STEP Level</Label>
            <Select value={formData.stepLevel} onValueChange={(value) => handleInputChange('stepLevel', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select STEP level" />
              </SelectTrigger>
              <SelectContent>
                {STEP_LEVELS.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Form Status */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                <Package className="w-3 h-3 mr-1" />
                Single Product Entry
              </Badge>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Product
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}