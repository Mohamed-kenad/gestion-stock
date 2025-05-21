import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Calendar, History, 
  TrendingUp, TrendingDown, LineChart, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useToast } from "../../../components/ui/use-toast";

// Mock data for price history
const mockPriceHistory = [
  {
    productId: 1,
    productName: 'Farine de blé T55',
    category: 'Ingrédients',
    history: [
      { 
        date: '2025-04-15', 
        price: 4.75, 
        previousPrice: 4.50, 
        changePercent: 5.56, 
        reason: 'Ajustement pour inflation',
        auditor: 'Mohammed Alami'
      },
      { 
        date: '2025-03-10', 
        price: 4.50, 
        previousPrice: 4.25, 
        changePercent: 5.88, 
        reason: 'Augmentation du prix d\'achat',
        auditor: 'Mohammed Alami'
      },
      { 
        date: '2025-02-05', 
        price: 4.25, 
        previousPrice: 4.00, 
        changePercent: 6.25, 
        reason: 'Ajustement saisonnier',
        auditor: 'Fatima Benali'
      }
    ]
  },
  {
    productId: 2,
    productName: 'Sucre en poudre',
    category: 'Ingrédients',
    history: [
      { 
        date: '2025-04-20', 
        price: 3.25, 
        previousPrice: 3.00, 
        changePercent: 8.33, 
        reason: 'Ajustement pour inflation',
        auditor: 'Mohammed Alami'
      },
      { 
        date: '2025-03-15', 
        price: 3.00, 
        previousPrice: 2.85, 
        changePercent: 5.26, 
        reason: 'Harmonisation des prix',
        auditor: 'Fatima Benali'
      },
      { 
        date: '2025-02-10', 
        price: 2.85, 
        previousPrice: 2.75, 
        changePercent: 3.64, 
        reason: 'Légère augmentation',
        auditor: 'Fatima Benali'
      }
    ]
  },
  {
    productId: 4,
    productName: 'Vodka premium',
    category: 'Boissons',
    history: [
      { 
        date: '2025-04-05', 
        price: 42.50, 
        previousPrice: 39.90, 
        changePercent: 6.52, 
        reason: 'Ajustement suite à l\'augmentation des taxes',
        auditor: 'Mohammed Alami'
      },
      { 
        date: '2025-02-20', 
        price: 39.90, 
        previousPrice: 38.50, 
        changePercent: 3.64, 
        reason: 'Ajustement pour inflation',
        auditor: 'Fatima Benali'
      }
    ]
  },
  {
    productId: 5,
    productName: 'Rhum ambré',
    category: 'Boissons',
    history: [
      { 
        date: '2025-04-12', 
        price: 48.90, 
        previousPrice: 45.75, 
        changePercent: 6.89, 
        reason: 'Ajustement suite à l\'augmentation des taxes',
        auditor: 'Mohammed Alami'
      },
      { 
        date: '2025-03-01', 
        price: 45.75, 
        previousPrice: 44.50, 
        changePercent: 2.81, 
        reason: 'Ajustement pour inflation',
        auditor: 'Fatima Benali'
      }
    ]
  },
  {
    productId: 7,
    productName: 'Détergent multi-surfaces',
    category: 'Entretien',
    history: [
      { 
        date: '2025-04-22', 
        price: 5.90, 
        previousPrice: 5.50, 
        changePercent: 7.27, 
        reason: 'Ajustement pour inflation',
        auditor: 'Mohammed Alami'
      },
      { 
        date: '2025-02-15', 
        price: 5.50, 
        previousPrice: 5.25, 
        changePercent: 4.76, 
        reason: 'Augmentation du prix d\'achat',
        auditor: 'Fatima Benali'
      }
    ]
  }
];

const PricingHistory = () => {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  
  const [priceHistory, setPriceHistory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPriceHistory(mockPriceHistory);
      setLoading(false);
    }, 800);
  }, []);
  
  // Filter price history based on search term and category
  const filteredPriceHistory = priceHistory.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  // View detailed history for a product
  const handleViewHistory = (product) => {
    setSelectedProduct(product);
    setIsHistoryDialogOpen(true);
  };
  
  // Export history report
  const handleExportReport = () => {
    toast({
      title: "Rapport exporté",
      description: "L'historique des prix a été exporté avec succès.",
    });
  };
  
  // Calculate average price change for a product
  const calculateAverageChange = (history) => {
    if (!history || history.length === 0) return 0;
    const totalChange = history.reduce((sum, item) => sum + item.changePercent, 0);
    return totalChange / history.length;
  };
  
  // Get the latest price for a product
  const getLatestPrice = (history) => {
    if (!history || history.length === 0) return 0;
    return history[0].price;
  };
  
  // Get the previous price for a product
  const getPreviousPrice = (history) => {
    if (!history || history.length < 2) return 0;
    return history[1].price;
  };
  
  // Calculate total price change over all history
  const calculateTotalChange = (history) => {
    if (!history || history.length < 2) return 0;
    const firstPrice = history[history.length - 1].previousPrice;
    const latestPrice = history[0].price;
    return ((latestPrice - firstPrice) / firstPrice) * 100;
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Historique des prix</h1>
          <p className="text-gray-600">Suivez l'évolution des prix de vente des produits</p>
        </div>
        <Button onClick={handleExportReport} className="flex items-center">
          <Download className="mr-2 h-4 w-4" /> Exporter l'historique
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>
            Filtrez l'historique des prix par produit, catégorie ou période
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher un produit..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="Ingrédients">Ingrédients</SelectItem>
                <SelectItem value="Boissons">Boissons</SelectItem>
                <SelectItem value="Entretien">Entretien</SelectItem>
              </SelectContent>
            </Select>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de début</label>
              <Input
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date de fin</label>
              <Input
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Liste des produits avec historique de prix</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <TableHead className="text-right">Prix actuel</TableHead>
                    <TableHead className="text-right">Prix précédent</TableHead>
                    <TableHead className="text-right">Dernière variation</TableHead>
                    <TableHead className="text-right">Variation totale</TableHead>
                    <TableHead className="text-right">Dernière mise à jour</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPriceHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        Aucun historique de prix trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPriceHistory.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell className="font-medium">{product.productName}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">{getLatestPrice(product.history).toFixed(2)} DH</TableCell>
                        <TableCell className="text-right">{getPreviousPrice(product.history).toFixed(2)} DH</TableCell>
                        <TableCell className="text-right">
                          {product.history.length > 0 && (
                            <span className={product.history[0].changePercent > 0 ? "text-green-600" : "text-red-600"}>
                              {product.history[0].changePercent > 0 ? "+" : ""}
                              {product.history[0].changePercent.toFixed(2)}%
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.history.length > 1 && (
                            <span className={calculateTotalChange(product.history) > 0 ? "text-green-600" : "text-red-600"}>
                              {calculateTotalChange(product.history) > 0 ? "+" : ""}
                              {calculateTotalChange(product.history).toFixed(2)}%
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.history.length > 0 ? product.history[0].date : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center"
                            onClick={() => handleViewHistory(product)}
                          >
                            <History className="mr-2 h-4 w-4" />
                            Historique
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Detailed History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Historique des prix - {selectedProduct?.productName}</DialogTitle>
            <DialogDescription>
              Évolution complète des prix de vente
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Produit</p>
                  <p className="font-medium">{selectedProduct.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Catégorie</p>
                  <p className="font-medium">{selectedProduct.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Variation moyenne</p>
                  <p className="font-medium">
                    {calculateAverageChange(selectedProduct.history).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Variation totale</p>
                  <p className={`font-medium ${calculateTotalChange(selectedProduct.history) > 0 ? "text-green-600" : "text-red-600"}`}>
                    {calculateTotalChange(selectedProduct.history) > 0 ? "+" : ""}
                    {calculateTotalChange(selectedProduct.history).toFixed(2)}%
                  </p>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Prix</TableHead>
                      <TableHead className="text-right">Prix précédent</TableHead>
                      <TableHead className="text-right">Variation</TableHead>
                      <TableHead>Raison</TableHead>
                      <TableHead>Auditeur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProduct.history.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.date}</TableCell>
                        <TableCell className="text-right">{item.price.toFixed(2)} DH</TableCell>
                        <TableCell className="text-right">{item.previousPrice.toFixed(2)} DH</TableCell>
                        <TableCell className="text-right">
                          <span className={item.changePercent > 0 ? "text-green-600 flex items-center justify-end" : "text-red-600 flex items-center justify-end"}>
                            {item.changePercent > 0 ? (
                              <ArrowUpRight className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 mr-1" />
                            )}
                            {item.changePercent > 0 ? "+" : ""}
                            {item.changePercent.toFixed(2)}%
                          </span>
                        </TableCell>
                        <TableCell>{item.reason}</TableCell>
                        <TableCell>{item.auditor}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">Analyse de tendance</h3>
                <p className="text-sm text-gray-600">
                  {calculateTotalChange(selectedProduct.history) > 10 
                    ? "Ce produit montre une forte tendance à la hausse des prix. Cela pourrait être dû à l'inflation ou à l'augmentation des coûts d'approvisionnement."
                    : calculateTotalChange(selectedProduct.history) > 5
                    ? "Ce produit montre une tendance modérée à la hausse des prix, conforme à l'inflation générale."
                    : calculateTotalChange(selectedProduct.history) > 0
                    ? "Ce produit montre une légère tendance à la hausse des prix, inférieure à l'inflation générale."
                    : calculateTotalChange(selectedProduct.history) < 0
                    ? "Ce produit montre une tendance à la baisse des prix, ce qui pourrait indiquer une stratégie de compétitivité ou une baisse des coûts d'approvisionnement."
                    : "Ce produit montre une stabilité des prix sur la période analysée."
                  }
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={handleExportReport} variant="outline" className="flex items-center">
              <Download className="mr-2 h-4 w-4" /> Exporter
            </Button>
            <DialogClose asChild>
              <Button>Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingHistory;
