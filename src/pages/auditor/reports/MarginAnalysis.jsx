import React, { useState, useEffect } from 'react';
import { 
  BarChart3, PieChart, TrendingUp, Filter, Download, 
  DollarSign, Percent, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useToast } from "../../../components/ui/use-toast";

// Mock data for categories
const mockCategoryMargins = [
  { 
    category: 'Boissons', 
    revenue: 12500, 
    cost: 5200, 
    margin: 7300, 
    marginPercent: 58.4,
    trend: 2.3 
  },
  { 
    category: 'Ingrédients', 
    revenue: 8750, 
    cost: 4800, 
    margin: 3950, 
    marginPercent: 45.1,
    trend: -1.5 
  },
  { 
    category: 'Entretien', 
    revenue: 3200, 
    cost: 1850, 
    margin: 1350, 
    marginPercent: 42.2,
    trend: 0.8 
  }
];

// Mock data for products
const mockProductMargins = [
  { 
    id: 4,
    name: 'Vodka premium', 
    category: 'Boissons',
    revenue: 5100, 
    cost: 2250, 
    margin: 2850, 
    marginPercent: 55.9,
    trend: 3.2,
    volumeSold: 120
  },
  { 
    id: 5,
    name: 'Rhum ambré', 
    category: 'Boissons',
    revenue: 4400, 
    cost: 2025, 
    margin: 2375, 
    marginPercent: 54.0,
    trend: 1.8,
    volumeSold: 90
  },
  { 
    id: 6,
    name: 'Gin London Dry', 
    category: 'Boissons',
    revenue: 3000, 
    cost: 925, 
    margin: 2075, 
    marginPercent: 69.2,
    trend: 4.5,
    volumeSold: 67
  },
  { 
    id: 1,
    name: 'Farine de blé T55', 
    category: 'Ingrédients',
    revenue: 3800, 
    cost: 2000, 
    margin: 1800, 
    marginPercent: 47.4,
    trend: -0.6,
    volumeSold: 800
  },
  { 
    id: 2,
    name: 'Sucre en poudre', 
    category: 'Ingrédients',
    revenue: 2950, 
    cost: 1530, 
    margin: 1420, 
    marginPercent: 48.1,
    trend: -1.2,
    volumeSold: 908
  },
  { 
    id: 3,
    name: 'Huile d\'olive extra vierge', 
    category: 'Ingrédients',
    revenue: 2000, 
    cost: 1270, 
    margin: 730, 
    marginPercent: 36.5,
    trend: -2.8,
    volumeSold: 126
  },
  { 
    id: 7,
    name: 'Détergent multi-surfaces', 
    category: 'Entretien',
    revenue: 1770, 
    cost: 975, 
    margin: 795, 
    marginPercent: 44.9,
    trend: 1.1,
    volumeSold: 300
  },
  { 
    id: 8,
    name: 'Désinfectant alimentaire', 
    category: 'Entretien',
    revenue: 1430, 
    cost: 875, 
    margin: 555, 
    marginPercent: 38.8,
    trend: 0.3,
    volumeSold: 181
  }
];

// Mock data for time periods
const mockTimePeriodsMargins = [
  { period: 'Janvier', revenue: 7500, cost: 4100, margin: 3400, marginPercent: 45.3 },
  { period: 'Février', revenue: 8200, cost: 4400, margin: 3800, marginPercent: 46.3 },
  { period: 'Mars', revenue: 7800, cost: 4200, margin: 3600, marginPercent: 46.2 },
  { period: 'Avril', revenue: 8500, cost: 4600, margin: 3900, marginPercent: 45.9 },
  { period: 'Mai', revenue: 9100, cost: 4800, margin: 4300, marginPercent: 47.3 }
];

const MarginAnalysis = () => {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("categories");
  const [timeRange, setTimeRange] = useState("last-3-months");
  const [categoryFilter, setCategoryFilter] = useState("");
  
  const [categoryMargins, setCategoryMargins] = useState([]);
  const [productMargins, setProductMargins] = useState([]);
  const [timePeriodsMargins, setTimePeriodsMargins] = useState([]);
  
  // Calculate totals
  const totalRevenue = categoryMargins.reduce((sum, item) => sum + item.revenue, 0);
  const totalCost = categoryMargins.reduce((sum, item) => sum + item.cost, 0);
  const totalMargin = categoryMargins.reduce((sum, item) => sum + item.margin, 0);
  const totalMarginPercent = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCategoryMargins(mockCategoryMargins);
      setProductMargins(mockProductMargins);
      setTimePeriodsMargins(mockTimePeriodsMargins);
      setLoading(false);
    }, 800);
  }, []);
  
  // Filter products by category
  const filteredProducts = categoryFilter 
    ? productMargins.filter(product => product.category === categoryFilter)
    : productMargins;
  
  // Handle export report
  const handleExportReport = () => {
    toast({
      title: "Rapport exporté",
      description: "Le rapport d'analyse des marges a été exporté avec succès.",
    });
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analyse des marges</h1>
          <p className="text-gray-600">Analysez la rentabilité par catégorie, produit et période</p>
        </div>
        <Button onClick={handleExportReport} className="flex items-center">
          <Download className="mr-2 h-4 w-4" /> Exporter le rapport
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Chiffre d'affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} DH</div>
              <div className="text-sm text-green-600 flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" /> 8.2%
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Marge brute</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{totalMargin.toLocaleString()} DH</div>
              <div className="text-sm text-green-600 flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" /> 5.7%
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Taux de marge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold">{totalMarginPercent.toFixed(1)}%</div>
              <div className="text-sm text-red-600 flex items-center">
                <ArrowDownRight className="h-4 w-4 mr-1" /> 0.8%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Analyse détaillée des marges</CardTitle>
              <CardDescription>
                Visualisez et comparez les marges par différentes dimensions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">Ce mois</SelectItem>
                  <SelectItem value="last-month">Mois dernier</SelectItem>
                  <SelectItem value="last-3-months">3 derniers mois</SelectItem>
                  <SelectItem value="year-to-date">Année en cours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="categories">Par catégorie</TabsTrigger>
              <TabsTrigger value="products">Par produit</TabsTrigger>
              <TabsTrigger value="time">Par période</TabsTrigger>
            </TabsList>
            
            <TabsContent value="categories">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Chiffre d'affaires</TableHead>
                        <TableHead className="text-right">Coût d'achat</TableHead>
                        <TableHead className="text-right">Marge brute</TableHead>
                        <TableHead className="text-right">Taux de marge</TableHead>
                        <TableHead className="text-right">Tendance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryMargins.map((category) => (
                        <TableRow key={category.category}>
                          <TableCell className="font-medium">{category.category}</TableCell>
                          <TableCell className="text-right">{category.revenue.toLocaleString()} DH</TableCell>
                          <TableCell className="text-right">{category.cost.toLocaleString()} DH</TableCell>
                          <TableCell className="text-right">{category.margin.toLocaleString()} DH</TableCell>
                          <TableCell className="text-right">{category.marginPercent.toFixed(1)}%</TableCell>
                          <TableCell className="text-right">
                            {category.trend > 0 ? (
                              <span className="text-green-600 flex items-center justify-end">
                                <ArrowUpRight className="h-4 w-4 mr-1" /> {category.trend.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-red-600 flex items-center justify-end">
                                <ArrowDownRight className="h-4 w-4 mr-1" /> {Math.abs(category.trend).toFixed(1)}%
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50 font-bold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right">{totalRevenue.toLocaleString()} DH</TableCell>
                        <TableCell className="text-right">{totalCost.toLocaleString()} DH</TableCell>
                        <TableCell className="text-right">{totalMargin.toLocaleString()} DH</TableCell>
                        <TableCell className="text-right">{totalMarginPercent.toFixed(1)}%</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="products">
              <div className="mb-4 flex justify-between items-center">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrer par catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les catégories</SelectItem>
                    <SelectItem value="Boissons">Boissons</SelectItem>
                    <SelectItem value="Ingrédients">Ingrédients</SelectItem>
                    <SelectItem value="Entretien">Entretien</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-right">Volume vendu</TableHead>
                        <TableHead className="text-right">Chiffre d'affaires</TableHead>
                        <TableHead className="text-right">Coût d'achat</TableHead>
                        <TableHead className="text-right">Marge brute</TableHead>
                        <TableHead className="text-right">Taux de marge</TableHead>
                        <TableHead className="text-right">Tendance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell className="text-right">{product.volumeSold}</TableCell>
                          <TableCell className="text-right">{product.revenue.toLocaleString()} DH</TableCell>
                          <TableCell className="text-right">{product.cost.toLocaleString()} DH</TableCell>
                          <TableCell className="text-right">{product.margin.toLocaleString()} DH</TableCell>
                          <TableCell className="text-right">{product.marginPercent.toFixed(1)}%</TableCell>
                          <TableCell className="text-right">
                            {product.trend > 0 ? (
                              <span className="text-green-600 flex items-center justify-end">
                                <ArrowUpRight className="h-4 w-4 mr-1" /> {product.trend.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-red-600 flex items-center justify-end">
                                <ArrowDownRight className="h-4 w-4 mr-1" /> {Math.abs(product.trend).toFixed(1)}%
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="time">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Période</TableHead>
                        <TableHead className="text-right">Chiffre d'affaires</TableHead>
                        <TableHead className="text-right">Coût d'achat</TableHead>
                        <TableHead className="text-right">Marge brute</TableHead>
                        <TableHead className="text-right">Taux de marge</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timePeriodsMargins.map((period) => (
                        <TableRow key={period.period}>
                          <TableCell className="font-medium">{period.period}</TableCell>
                          <TableCell className="text-right">{period.revenue.toLocaleString()} DH</TableCell>
                          <TableCell className="text-right">{period.cost.toLocaleString()} DH</TableCell>
                          <TableCell className="text-right">{period.margin.toLocaleString()} DH</TableCell>
                          <TableCell className="text-right">{period.marginPercent.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarginAnalysis;
