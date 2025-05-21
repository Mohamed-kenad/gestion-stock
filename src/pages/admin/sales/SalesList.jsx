import React, { useState } from 'react';
import { 
  Search, Filter, Calendar, Download, Printer, Eye, 
  FileText, DollarSign, Package, Building, User, ShoppingBag 
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
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
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
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "../../../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";
import { Label } from "../../../components/ui/label";
import { Separator } from "../../../components/ui/separator";

// Mock data for sales
const mockSales = [
  {
    id: 'VEN-001',
    date: '2025-05-15',
    customer: 'Restaurant Le Gourmet',
    amount: 3250.75,
    status: 'completed',
    items: 15,
    department: 'Cuisine',
    paymentMethod: 'Virement bancaire',
    paymentStatus: 'paid',
    processedBy: 'Jean Dupont',
    invoiceReference: 'FAC-2025-042',
  },
  {
    id: 'VEN-002',
    date: '2025-05-14',
    customer: 'Hôtel Luxe',
    amount: 2175.30,
    status: 'completed',
    items: 10,
    department: 'Bar',
    paymentMethod: 'Chèque',
    paymentStatus: 'paid',
    processedBy: 'Marie Martin',
    invoiceReference: 'FAC-2025-041',
  },
  {
    id: 'VEN-003',
    date: '2025-05-12',
    customer: 'Café Central',
    amount: 1850.00,
    status: 'processing',
    items: 8,
    department: 'Restaurant',
    paymentMethod: 'Virement bancaire',
    paymentStatus: 'pending',
    processedBy: 'Pierre Dubois',
    invoiceReference: 'FAC-2025-039',
  },
  {
    id: 'VEN-004',
    date: '2025-05-10',
    customer: 'Bistro du Coin',
    amount: 750.45,
    status: 'completed',
    items: 5,
    department: 'Cuisine',
    paymentMethod: 'Carte bancaire',
    paymentStatus: 'paid',
    processedBy: 'Sophie Leroy',
    invoiceReference: 'FAC-2025-038',
  },
  {
    id: 'VEN-005',
    date: '2025-05-08',
    customer: 'Restaurant La Brasserie',
    amount: 3125.90,
    status: 'completed',
    items: 18,
    department: 'Restaurant',
    paymentMethod: 'Virement bancaire',
    paymentStatus: 'paid',
    processedBy: 'Thomas Bernard',
    invoiceReference: 'FAC-2025-036',
  },
  {
    id: 'VEN-006',
    date: '2025-05-05',
    customer: 'Bar Le Cocktail',
    amount: 960.25,
    status: 'cancelled',
    items: 6,
    department: 'Bar',
    paymentMethod: 'Chèque',
    paymentStatus: 'refunded',
    processedBy: 'N/A',
    invoiceReference: 'FAC-2025-034',
  },
];

// Mock data for sale items
const mockSaleItems = {
  'VEN-001': [
    { id: 1, name: 'Farine de blé T55', quantity: 50, unit: 'kg', price: 48.50, total: 2425.00 },
    { id: 2, name: 'Sucre en poudre', quantity: 25, unit: 'kg', price: 24.75, total: 618.75 },
    { id: 3, name: 'Sel de mer', quantity: 10, unit: 'kg', price: 20.70, total: 207.00 },
  ],
  'VEN-002': [
    { id: 1, name: 'Vodka premium', quantity: 8, unit: 'bouteilles', price: 130.50, total: 1044.00 },
    { id: 2, name: 'Rhum ambré', quantity: 6, unit: 'bouteilles', price: 105.75, total: 634.50 },
    { id: 3, name: 'Gin London Dry', quantity: 5, unit: 'bouteilles', price: 99.36, total: 496.80 },
  ],
};

const SalesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedSale, setSelectedSale] = useState(null);
  const [viewMode, setViewMode] = useState('details'); // 'details' or 'items'

  // Filter sales based on search term, status, and date
  const filteredSales = mockSales.filter(sale => {
    const matchesSearch = 
      sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.invoiceReference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    
    // Simple date filtering logic
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = sale.date === new Date().toISOString().split('T')[0];
    } else if (dateFilter === 'week') {
      const saleDate = new Date(sale.date);
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      matchesDate = saleDate >= weekAgo && saleDate <= today;
    } else if (dateFilter === 'month') {
      const saleMonth = sale.date.substring(0, 7);
      const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7);
      matchesDate = saleMonth === currentMonth;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Open sale details dialog
  const openSaleDetails = (sale) => {
    setSelectedSale(sale);
    setViewMode('details');
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Complété</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">En cours</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Annulé</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  // Get payment status badge color
  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Payé</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">En attente</Badge>;
      case 'refunded':
        return <Badge className="bg-purple-500">Remboursé</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Ventes</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Ventes</CardTitle>
          <CardDescription>
            Consultez et gérez toutes les ventes effectuées par l'établissement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher une vente..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="completed">Complété</SelectItem>
                <SelectItem value="processing">En cours</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les dates</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                      Aucune vente trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{sale.date}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>{sale.amount.toFixed(2)} €</TableCell>
                      <TableCell>{sale.items}</TableCell>
                      <TableCell>{getStatusBadge(sale.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(sale.paymentStatus)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openSaleDetails(sale)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sale Details Dialog */}
      {selectedSale && (
        <Dialog open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Détails de la vente {selectedSale.id}
              </DialogTitle>
              <DialogDescription>
                Informations complètes sur cette vente
              </DialogDescription>
            </DialogHeader>

            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="items">Articles</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Référence</Label>
                    <p className="font-medium">{selectedSale.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Date</Label>
                    <p className="font-medium">{selectedSale.date}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Facture</Label>
                    <p className="font-medium">{selectedSale.invoiceReference}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Département</Label>
                    <p className="font-medium">{selectedSale.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Statut</Label>
                    <div>{getStatusBadge(selectedSale.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Nombre d'articles</Label>
                    <p className="font-medium">{selectedSale.items}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Client</Label>
                    <p className="font-medium flex items-center">
                      <Building className="h-4 w-4 mr-1 text-gray-500" />
                      {selectedSale.customer}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Traité par</Label>
                    <p className="font-medium flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-500" />
                      {selectedSale.processedBy}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Méthode de paiement</Label>
                    <p className="font-medium">{selectedSale.paymentMethod}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Statut du paiement</Label>
                    <div>{getPaymentStatusBadge(selectedSale.paymentStatus)}</div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm text-gray-500">Montant total</Label>
                    <p className="text-xl font-bold">{selectedSale.amount.toFixed(2)} €</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="items" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Unité</TableHead>
                      <TableHead>Prix unitaire</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSaleItems[selectedSale.id] ? (
                      mockSaleItems[selectedSale.id].map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{item.price.toFixed(2)} €</TableCell>
                          <TableCell className="text-right">{item.total.toFixed(2)} €</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          Aucun détail disponible pour cette vente
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Nombre d'articles: {selectedSale.items}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Montant total</p>
                    <p className="text-xl font-bold">{selectedSale.amount.toFixed(2)} €</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter PDF
                </Button>
              </div>
              <DialogClose asChild>
                <Button variant="secondary">Fermer</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SalesList;
