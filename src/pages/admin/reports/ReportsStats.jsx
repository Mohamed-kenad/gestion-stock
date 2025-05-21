import React, { useState } from 'react';
import { 
  Calendar, BarChart3, PieChart, LineChart, Download, Filter, RefreshCcw
} from 'lucide-react';
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useToast } from "../../../components/ui/use-toast";
import { Badge } from "../../../components/ui/badge";

// Mock data for sales chart
const salesData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
  datasets: [
    {
      label: 'Ventes 2023',
      data: [12500, 15000, 18200, 14500, 16800, 19200, 22000, 21500, 23000, 20500, 24000, 27500],
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.5)',
    },
    {
      label: 'Ventes 2022',
      data: [10000, 12500, 14000, 13000, 15500, 17000, 19500, 18500, 20000, 19000, 21500, 23000],
      borderColor: 'rgb(156, 163, 175)',
      backgroundColor: 'rgba(156, 163, 175, 0.5)',
    }
  ]
};

// Mock data for purchases chart
const purchasesData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
  datasets: [
    {
      label: 'Achats 2023',
      data: [8500, 10200, 12500, 9800, 11500, 13200, 15000, 14500, 16000, 14000, 16500, 18500],
      borderColor: 'rgb(234, 88, 12)',
      backgroundColor: 'rgba(234, 88, 12, 0.5)',
    },
    {
      label: 'Achats 2022',
      data: [7000, 8500, 9500, 8800, 10500, 11500, 13000, 12500, 14000, 13000, 15000, 16000],
      borderColor: 'rgb(156, 163, 175)',
      backgroundColor: 'rgba(156, 163, 175, 0.5)',
    }
  ]
};

// Mock data for inventory value chart
const inventoryData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
  datasets: [
    {
      label: 'Valeur du stock 2023',
      data: [45000, 48000, 52000, 50000, 53000, 56000, 58000, 57000, 60000, 59000, 62000, 65000],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.5)',
    }
  ]
};

// Mock data for category distribution
const categoryData = {
  labels: ['Viandes', 'Poissons', 'Légumes', 'Fruits', 'Épicerie', 'Boissons', 'Produits laitiers'],
  datasets: [
    {
      label: 'Répartition des ventes par catégorie',
      data: [30, 15, 20, 10, 12, 8, 5],
      backgroundColor: [
        'rgba(239, 68, 68, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(236, 72, 153, 0.7)',
        'rgba(249, 115, 22, 0.7)',
      ],
      borderWidth: 1,
    },
  ],
};

// Mock data for top products
const topProducts = [
  { id: 'P001', name: 'Filet de bœuf', category: 'Viandes', sales: 1250, revenue: 18750 },
  { id: 'P015', name: 'Saumon frais', category: 'Poissons', sales: 980, revenue: 14700 },
  { id: 'P042', name: 'Pommes de terre', category: 'Légumes', sales: 1500, revenue: 3750 },
  { id: 'P078', name: 'Riz basmati', category: 'Épicerie', sales: 1200, revenue: 4800 },
  { id: 'P103', name: 'Vin rouge', category: 'Boissons', sales: 850, revenue: 12750 },
];

// Mock data for summary stats
const summaryStats = {
  totalSales: 235000,
  totalPurchases: 160000,
  profit: 75000,
  profitMargin: 31.9,
  inventoryValue: 65000,
  inventoryTurnover: 2.5,
  averageOrderValue: 450,
  totalOrders: 520,
};

const ReportsStats = () => {
  const { toast } = useToast();
  const [periodFilter, setPeriodFilter] = useState('year');
  const [yearFilter, setYearFilter] = useState('2023');
  
  // Handle download report
  const handleDownloadReport = (reportType) => {
    toast({
      title: "Téléchargement du rapport",
      description: `Le rapport ${reportType} a été téléchargé.`,
    });
  };
  
  // Handle refresh data
  const handleRefreshData = () => {
    toast({
      title: "Données actualisées",
      description: "Les données des rapports ont été mises à jour.",
    });
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports et statistiques</h1>
          <p className="text-muted-foreground">
            Analysez les performances de votre entreprise
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mois</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Année</SelectItem>
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Année" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ventes totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalSales.toLocaleString()} €</div>
            <Badge className="mt-1 bg-green-100 text-green-800 hover:bg-green-100">+12.5% vs 2022</Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Achats totaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalPurchases.toLocaleString()} €</div>
            <Badge className="mt-1 bg-orange-100 text-orange-800 hover:bg-orange-100">+15.2% vs 2022</Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bénéfice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.profit.toLocaleString()} €</div>
            <Badge className="mt-1 bg-green-100 text-green-800 hover:bg-green-100">Marge: {summaryStats.profitMargin}%</Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valeur du stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.inventoryValue.toLocaleString()} €</div>
            <Badge className="mt-1 bg-blue-100 text-blue-800 hover:bg-blue-100">Rotation: {summaryStats.inventoryTurnover}</Badge>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Tabs */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="purchases">Achats</TabsTrigger>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Évolution des ventes</CardTitle>
                <CardDescription>
                  Comparaison des ventes {yearFilter} vs {parseInt(yearFilter) - 1}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDownloadReport('ventes')}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </CardHeader>
            <CardContent className="h-96">
              {/* This would be a real chart component in a production app */}
              <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-md">
                <LineChart className="h-16 w-16 text-slate-400" />
                <span className="ml-2 text-slate-500">Graphique d'évolution des ventes</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Top 5 des produits vendus</CardTitle>
              <CardDescription>
                Produits les plus vendus en {yearFilter}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Produit</th>
                      <th className="text-left py-3 px-4 font-medium">Catégorie</th>
                      <th className="text-right py-3 px-4 font-medium">Quantité vendue</th>
                      <th className="text-right py-3 px-4 font-medium">Chiffre d'affaires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4">{product.category}</td>
                        <td className="py-3 px-4 text-right">{product.sales.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{product.revenue.toLocaleString()} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Évolution des achats</CardTitle>
                <CardDescription>
                  Comparaison des achats {yearFilter} vs {parseInt(yearFilter) - 1}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDownloadReport('achats')}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </CardHeader>
            <CardContent className="h-96">
              {/* This would be a real chart component in a production app */}
              <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-md">
                <BarChart3 className="h-16 w-16 text-slate-400" />
                <span className="ml-2 text-slate-500">Graphique d'évolution des achats</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Évolution de la valeur du stock</CardTitle>
                <CardDescription>
                  Valeur du stock sur l'année {yearFilter}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDownloadReport('inventaire')}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </CardHeader>
            <CardContent className="h-96">
              {/* This would be a real chart component in a production app */}
              <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-md">
                <LineChart className="h-16 w-16 text-slate-400" />
                <span className="ml-2 text-slate-500">Graphique d'évolution du stock</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Répartition des ventes par catégorie</CardTitle>
                <CardDescription>
                  Distribution des ventes par catégorie de produits en {yearFilter}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDownloadReport('categories')}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </CardHeader>
            <CardContent className="h-96">
              {/* This would be a real chart component in a production app */}
              <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-md">
                <PieChart className="h-16 w-16 text-slate-400" />
                <span className="ml-2 text-slate-500">Graphique de répartition par catégorie</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Statistiques des commandes</CardTitle>
            <CardDescription>
              Informations sur les commandes en {yearFilter}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Nombre total de commandes</span>
                <span className="font-medium">{summaryStats.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Valeur moyenne des commandes</span>
                <span className="font-medium">{summaryStats.averageOrderValue} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Commandes par mois (moyenne)</span>
                <span className="font-medium">{Math.round(summaryStats.totalOrders / 12)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Performance financière</CardTitle>
            <CardDescription>
              Indicateurs financiers clés pour {yearFilter}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Marge bénéficiaire</span>
                <span className="font-medium">{summaryStats.profitMargin}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Rotation des stocks</span>
                <span className="font-medium">{summaryStats.inventoryTurnover}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ratio coût/vente</span>
                <span className="font-medium">{(summaryStats.totalPurchases / summaryStats.totalSales * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsStats;
