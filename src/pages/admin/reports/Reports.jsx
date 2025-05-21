import React, { useState, useEffect } from 'react';
import { 
  BarChart2, PieChart, TrendingUp, Download, Calendar, Filter, 
  RefreshCw, Package, ShoppingCart, DollarSign, Users
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";

// Mock data
const mockReports = {
  salesByCategory: [
    { category: 'Viandes', amount: 12500.50, percentage: 27.4 },
    { category: 'Légumes', amount: 8750.25, percentage: 19.2 },
    { category: 'Fruits', amount: 6320.75, percentage: 13.8 },
    { category: 'Produits laitiers', amount: 5480.30, percentage: 12.0 },
    { category: 'Boissons', amount: 4950.60, percentage: 10.8 },
    { category: 'Céréales', amount: 3650.20, percentage: 8.0 },
    { category: 'Épices', amount: 2150.40, percentage: 4.7 },
    { category: 'Autres', amount: 1878.00, percentage: 4.1 },
  ],
  purchasesBySupplier: [
    { supplier: 'Fournisseur A', amount: 10250.30, percentage: 31.6 },
    { supplier: 'Fournisseur B', amount: 8450.75, percentage: 26.0 },
    { supplier: 'Fournisseur C', amount: 5320.40, percentage: 16.4 },
    { supplier: 'Fournisseur D', amount: 3650.25, percentage: 11.2 },
    { supplier: 'Fournisseur E', amount: 2950.60, percentage: 9.1 },
    { supplier: 'Fournisseur F', amount: 1828.90, percentage: 5.7 },
  ],
  monthlySales: [
    { month: 'Janvier', amount: 8250.50 },
    { month: 'Février', amount: 8750.75 },
    { month: 'Mars', amount: 9320.25 },
    { month: 'Avril', amount: 9850.60 },
    { month: 'Mai', amount: 10450.80 },
  ],
  monthlyPurchases: [
    { month: 'Janvier', amount: 6150.30 },
    { month: 'Février', amount: 6350.45 },
    { month: 'Mars', amount: 6520.75 },
    { month: 'Avril', amount: 6750.20 },
    { month: 'Mai', amount: 7150.50 },
  ],
  topSellingProducts: [
    { id: 1, name: 'Poulet', category: 'Viandes', quantity: 320, revenue: 4000.00 },
    { id: 2, name: 'Tomates', category: 'Légumes', quantity: 450, revenue: 1575.00 },
    { id: 3, name: 'Riz', category: 'Céréales', quantity: 380, revenue: 1710.00 },
    { id: 4, name: 'Huile d\'olive', category: 'Huiles', quantity: 150, revenue: 1275.00 },
    { id: 5, name: 'Fromage', category: 'Produits laitiers', quantity: 120, revenue: 1800.00 },
    { id: 6, name: 'Boeuf', category: 'Viandes', quantity: 110, revenue: 2035.00 },
    { id: 7, name: 'Pommes', category: 'Fruits', quantity: 280, revenue: 700.00 },
    { id: 8, name: 'Lait', category: 'Produits laitiers', quantity: 420, revenue: 504.00 },
    { id: 9, name: 'Oignons', category: 'Légumes', quantity: 350, revenue: 980.00 },
    { id: 10, name: 'Eau minérale', category: 'Boissons', quantity: 500, revenue: 400.00 },
  ],
  inventoryValue: [
    { category: 'Viandes', value: 8250.50, items: 15 },
    { category: 'Légumes', value: 3750.75, items: 22 },
    { category: 'Fruits', value: 2320.25, items: 18 },
    { category: 'Produits laitiers', value: 4850.60, items: 12 },
    { category: 'Boissons', value: 3450.80, items: 25 },
    { category: 'Céréales', value: 2650.30, items: 8 },
    { category: 'Épices', value: 1350.45, items: 30 },
    { category: 'Autres', value: 1878.00, items: 20 },
  ],
  profitMargins: [
    { category: 'Viandes', revenue: 12500.50, cost: 8250.50, margin: 34.0 },
    { category: 'Légumes', revenue: 8750.25, cost: 3750.75, margin: 57.1 },
    { category: 'Fruits', revenue: 6320.75, cost: 2320.25, margin: 63.3 },
    { category: 'Produits laitiers', revenue: 5480.30, cost: 4850.60, margin: 11.5 },
    { category: 'Boissons', revenue: 4950.60, cost: 3450.80, margin: 30.3 },
    { category: 'Céréales', revenue: 3650.20, cost: 2650.30, margin: 27.4 },
    { category: 'Épices', revenue: 2150.40, cost: 1350.45, margin: 37.2 },
    { category: 'Autres', revenue: 1878.00, cost: 1278.00, margin: 31.9 },
  ],
  departmentConsumption: [
    { department: 'Cuisine', amount: 18500.50, percentage: 45.2 },
    { department: 'Pâtisserie', amount: 8750.25, percentage: 21.4 },
    { department: 'Bar', amount: 6320.75, percentage: 15.5 },
    { department: 'Service', amount: 4850.60, percentage: 11.9 },
    { department: 'Entretien', amount: 2450.80, percentage: 6.0 },
  ],
};

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [reportType, setReportType] = useState('sales');
  const [date, setDate] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 800);
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 800);
  };

  // Handle export
  const handleExport = (format = 'csv') => {
    alert(`Exporting ${reportType} report as ${format}...`);
    // Implement actual export functionality
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports et Statistiques</h1>
          <p className="text-muted-foreground">
            Analysez les données de votre entreprise
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={`${reportType === 'sales' ? 'border-primary' : ''}`} onClick={() => setReportType('sales')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.salesByCategory.reduce((sum, item) => sum + item.amount, 0).toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground">
              Analyse des ventes par catégorie et période
            </p>
          </CardContent>
        </Card>
        <Card className={`${reportType === 'purchases' ? 'border-primary' : ''}`} onClick={() => setReportType('purchases')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achats</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.purchasesBySupplier.reduce((sum, item) => sum + item.amount, 0).toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground">
              Analyse des achats par fournisseur et période
            </p>
          </CardContent>
        </Card>
        <Card className={`${reportType === 'inventory' ? 'border-primary' : ''}`} onClick={() => setReportType('inventory')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventaire</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.inventoryValue.reduce((sum, item) => sum + item.value, 0).toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground">
              Valeur de l'inventaire par catégorie
            </p>
          </CardContent>
        </Card>
        <Card className={`${reportType === 'profit' ? 'border-primary' : ''}`} onClick={() => setReportType('profit')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marges</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(reports.profitMargins.reduce((sum, item) => sum + (item.revenue - item.cost), 0) / 
                reports.profitMargins.reduce((sum, item) => sum + item.revenue, 0) * 100).toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Analyse des marges bénéficiaires par catégorie
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Journalier</SelectItem>
            <SelectItem value="week">Hebdomadaire</SelectItem>
            <SelectItem value="month">Mensuel</SelectItem>
            <SelectItem value="quarter">Trimestriel</SelectItem>
            <SelectItem value="year">Annuel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Report Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {reportType === 'sales' && 'Rapport des ventes'}
            {reportType === 'purchases' && 'Rapport des achats'}
            {reportType === 'inventory' && 'Rapport d\'inventaire'}
            {reportType === 'profit' && 'Rapport des marges bénéficiaires'}
          </CardTitle>
          <CardDescription>
            {reportType === 'sales' && 'Analyse détaillée des ventes par catégorie et période'}
            {reportType === 'purchases' && 'Analyse détaillée des achats par fournisseur et période'}
            {reportType === 'inventory' && 'Valeur actuelle de l\'inventaire par catégorie'}
            {reportType === 'profit' && 'Analyse des marges bénéficiaires par catégorie de produits'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reportType === 'sales' && (
            <Tabs defaultValue="category">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="category">Par catégorie</TabsTrigger>
                <TabsTrigger value="monthly">Par mois</TabsTrigger>
                <TabsTrigger value="products">Par produit</TabsTrigger>
              </TabsList>
              <TabsContent value="category" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead className="text-right">Pourcentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.salesByCategory.map((item) => (
                      <TableRow key={item.category}>
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell className="text-right">{item.amount.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">
                        {reports.salesByCategory.reduce((sum, item) => sum + item.amount, 0).toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-right font-bold">100.0%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="monthly" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mois</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead className="text-right">Évolution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.monthlySales.map((item, index) => (
                      <TableRow key={item.month}>
                        <TableCell className="font-medium">{item.month}</TableCell>
                        <TableCell className="text-right">{item.amount.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">
                          {index > 0 ? (
                            <div className="flex items-center justify-end">
                              {((item.amount - reports.monthlySales[index - 1].amount) / reports.monthlySales[index - 1].amount * 100).toFixed(1)}%
                              {item.amount > reports.monthlySales[index - 1].amount ? (
                                <TrendingUp className="h-4 w-4 text-green-500 ml-1" />
                              ) : (
                                <TrendingUp className="h-4 w-4 text-red-500 ml-1 rotate-180" />
                              )}
                            </div>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="products" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Revenus</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.topSellingProducts.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.revenue.toFixed(2)} €</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="font-bold text-right">Total</TableCell>
                      <TableCell className="text-right font-bold">
                        {reports.topSellingProducts.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)} €
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          )}

          {reportType === 'purchases' && (
            <Tabs defaultValue="supplier">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="supplier">Par fournisseur</TabsTrigger>
                <TabsTrigger value="monthly">Par mois</TabsTrigger>
              </TabsList>
              <TabsContent value="supplier" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead className="text-right">Pourcentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.purchasesBySupplier.map((item) => (
                      <TableRow key={item.supplier}>
                        <TableCell className="font-medium">{item.supplier}</TableCell>
                        <TableCell className="text-right">{item.amount.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">
                        {reports.purchasesBySupplier.reduce((sum, item) => sum + item.amount, 0).toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-right font-bold">100.0%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="monthly" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mois</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead className="text-right">Évolution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.monthlyPurchases.map((item, index) => (
                      <TableRow key={item.month}>
                        <TableCell className="font-medium">{item.month}</TableCell>
                        <TableCell className="text-right">{item.amount.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">
                          {index > 0 ? (
                            <div className="flex items-center justify-end">
                              {((item.amount - reports.monthlyPurchases[index - 1].amount) / reports.monthlyPurchases[index - 1].amount * 100).toFixed(1)}%
                              {item.amount > reports.monthlyPurchases[index - 1].amount ? (
                                <TrendingUp className="h-4 w-4 text-red-500 ml-1" />
                              ) : (
                                <TrendingUp className="h-4 w-4 text-green-500 ml-1 rotate-180" />
                              )}
                            </div>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          )}

          {reportType === 'inventory' && (
            <Tabs defaultValue="value">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="value">Valeur d'inventaire</TabsTrigger>
                <TabsTrigger value="department">Consommation par département</TabsTrigger>
              </TabsList>
              <TabsContent value="value" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Nombre d'articles</TableHead>
                      <TableHead className="text-right">Valeur</TableHead>
                      <TableHead className="text-right">Pourcentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.inventoryValue.map((item) => (
                      <TableRow key={item.category}>
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell className="text-right">{item.items}</TableCell>
                        <TableCell className="text-right">{item.value.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">
                          {(item.value / reports.inventoryValue.reduce((sum, i) => sum + i.value, 0) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">
                        {reports.inventoryValue.reduce((sum, item) => sum + item.items, 0)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {reports.inventoryValue.reduce((sum, item) => sum + item.value, 0).toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-right font-bold">100.0%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="department" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Département</TableHead>
                      <TableHead className="text-right">Consommation</TableHead>
                      <TableHead className="text-right">Pourcentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.departmentConsumption.map((item) => (
                      <TableRow key={item.department}>
                        <TableCell className="font-medium">{item.department}</TableCell>
                        <TableCell className="text-right">{item.amount.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">
                        {reports.departmentConsumption.reduce((sum, item) => sum + item.amount, 0).toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-right font-bold">100.0%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          )}

          {reportType === 'profit' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Revenus</TableHead>
                  <TableHead className="text-right">Coûts</TableHead>
                  <TableHead className="text-right">Bénéfice</TableHead>
                  <TableHead className="text-right">Marge (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.profitMargins.map((item) => (
                  <TableRow key={item.category}>
                    <TableCell className="font-medium">{item.category}</TableCell>
                    <TableCell className="text-right">{item.revenue.toFixed(2)} €</TableCell>
                    <TableCell className="text-right">{item.cost.toFixed(2)} €</TableCell>
                    <TableCell className="text-right">{(item.revenue - item.cost).toFixed(2)} €</TableCell>
                    <TableCell className="text-right">{item.margin.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-bold">Total</TableCell>
                  <TableCell className="text-right font-bold">
                    {reports.profitMargins.reduce((sum, item) => sum + item.revenue, 0).toFixed(2)} €
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {reports.profitMargins.reduce((sum, item) => sum + item.cost, 0).toFixed(2)} €
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {reports.profitMargins.reduce((sum, item) => sum + (item.revenue - item.cost), 0).toFixed(2)} €
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {(reports.profitMargins.reduce((sum, item) => sum + (item.revenue - item.cost), 0) / 
                      reports.profitMargins.reduce((sum, item) => sum + item.revenue, 0) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => handleExport('csv')}>
          <Download className="h-4 w-4 mr-2" />
          Exporter en CSV
        </Button>
        <Button variant="outline" onClick={() => handleExport('pdf')}>
          <Download className="h-4 w-4 mr-2" />
          Exporter en PDF
        </Button>
        <Button variant="outline" onClick={() => handleExport('excel')}>
          <Download className="h-4 w-4 mr-2" />
          Exporter en Excel
        </Button>
      </div>
    </div>
  );
};

export default Reports;
