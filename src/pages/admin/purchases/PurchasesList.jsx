import React, { useState } from 'react';
import { 
  Search, Filter, Calendar, Download, Printer, Eye, 
  FileText, ShoppingCart, Package, Building, User, Truck 
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

// Mock data for purchases
const mockPurchases = [
  {
    id: 'PUR-001',
    date: '2025-05-15',
    supplier: 'Fournisseur Alpha',
    amount: 2450.75,
    status: 'completed',
    items: 12,
    department: 'Cuisine',
    paymentMethod: 'Virement bancaire',
    paymentStatus: 'paid',
    receivedBy: 'Jean Dupont',
    orderReference: 'BON-2025-042',
  },
  {
    id: 'PUR-002',
    date: '2025-05-14',
    supplier: 'Grossiste Beta',
    amount: 1875.30,
    status: 'completed',
    items: 8,
    department: 'Bar',
    paymentMethod: 'Chèque',
    paymentStatus: 'paid',
    receivedBy: 'Marie Martin',
    orderReference: 'BON-2025-041',
  },
  {
    id: 'PUR-003',
    date: '2025-05-12',
    supplier: 'Distributeur Gamma',
    amount: 3250.00,
    status: 'processing',
    items: 15,
    department: 'Restaurant',
    paymentMethod: 'Virement bancaire',
    paymentStatus: 'pending',
    receivedBy: 'Pierre Dubois',
    orderReference: 'BON-2025-039',
  },
  {
    id: 'PUR-004',
    date: '2025-05-10',
    supplier: 'Fournisseur Delta',
    amount: 950.45,
    status: 'completed',
    items: 5,
    department: 'Cuisine',
    paymentMethod: 'Carte bancaire',
    paymentStatus: 'paid',
    receivedBy: 'Sophie Leroy',
    orderReference: 'BON-2025-038',
  },
  {
    id: 'PUR-005',
    date: '2025-05-08',
    supplier: 'Grossiste Epsilon',
    amount: 4125.90,
    status: 'completed',
    items: 22,
    department: 'Restaurant',
    paymentMethod: 'Virement bancaire',
    paymentStatus: 'paid',
    receivedBy: 'Thomas Bernard',
    orderReference: 'BON-2025-036',
  },
  {
    id: 'PUR-006',
    date: '2025-05-05',
    supplier: 'Distributeur Zeta',
    amount: 1560.25,
    status: 'cancelled',
    items: 9,
    department: 'Bar',
    paymentMethod: 'Chèque',
    paymentStatus: 'refunded',
    receivedBy: 'N/A',
    orderReference: 'BON-2025-034',
  },
];

// Mock data for purchase items
const mockPurchaseItems = {
  'PUR-001': [
    { id: 1, name: 'Farine de blé T55', quantity: 25, unit: 'kg', price: 45.50, total: 1137.50 },
    { id: 2, name: 'Sucre en poudre', quantity: 15, unit: 'kg', price: 22.75, total: 341.25 },
    { id: 3, name: 'Huile d\'olive extra vierge', quantity: 10, unit: 'L', price: 65.80, total: 658.00 },
    { id: 4, name: 'Sel de mer', quantity: 5, unit: 'kg', price: 18.50, total: 92.50 },
    { id: 5, name: 'Levure boulangère', quantity: 2, unit: 'kg', price: 110.75, total: 221.50 },
  ],
  'PUR-002': [
    { id: 1, name: 'Vodka premium', quantity: 6, unit: 'bouteilles', price: 125.50, total: 753.00 },
    { id: 2, name: 'Rhum ambré', quantity: 4, unit: 'bouteilles', price: 98.75, total: 395.00 },
    { id: 3, name: 'Gin London Dry', quantity: 3, unit: 'bouteilles', price: 85.30, total: 255.90 },
    { id: 4, name: 'Tequila Reposado', quantity: 2, unit: 'bouteilles', price: 110.20, total: 220.40 },
    { id: 5, name: 'Whisky écossais', quantity: 3, unit: 'bouteilles', price: 83.67, total: 251.00 },
  ],
};

const PurchasesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [viewMode, setViewMode] = useState('details'); // 'details' or 'items'

  // Filter purchases based on search term, status, and date
  const filteredPurchases = mockPurchases.filter(purchase => {
    const matchesSearch = 
      purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.orderReference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    
    // Simple date filtering logic
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = purchase.date === new Date().toISOString().split('T')[0];
    } else if (dateFilter === 'week') {
      const purchaseDate = new Date(purchase.date);
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      matchesDate = purchaseDate >= weekAgo && purchaseDate <= today;
    } else if (dateFilter === 'month') {
      const purchaseMonth = purchase.date.substring(0, 7);
      const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7);
      matchesDate = purchaseMonth === currentMonth;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Open purchase details dialog
  const openPurchaseDetails = (purchase) => {
    setSelectedPurchase(purchase);
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
        <h1 className="text-2xl font-bold">Gestion des Achats</h1>
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
          <CardTitle>Liste des Achats</CardTitle>
          <CardDescription>
            Consultez et gérez tous les achats effectués par l'établissement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher un achat..."
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
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                      Aucun achat trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPurchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="font-medium">{purchase.id}</TableCell>
                      <TableCell>{purchase.date}</TableCell>
                      <TableCell>{purchase.supplier}</TableCell>
                      <TableCell>{purchase.amount.toFixed(2)} €</TableCell>
                      <TableCell>{purchase.items}</TableCell>
                      <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(purchase.paymentStatus)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openPurchaseDetails(purchase)}
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

      {/* Purchase Details Dialog */}
      {selectedPurchase && (
        <Dialog open={!!selectedPurchase} onOpenChange={(open) => !open && setSelectedPurchase(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Détails de l'achat {selectedPurchase.id}
              </DialogTitle>
              <DialogDescription>
                Informations complètes sur cet achat
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
                    <p className="font-medium">{selectedPurchase.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Date</Label>
                    <p className="font-medium">{selectedPurchase.date}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Bon de commande</Label>
                    <p className="font-medium">{selectedPurchase.orderReference}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Département</Label>
                    <p className="font-medium">{selectedPurchase.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Statut</Label>
                    <div>{getStatusBadge(selectedPurchase.status)}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Nombre d'articles</Label>
                    <p className="font-medium">{selectedPurchase.items}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Fournisseur</Label>
                    <p className="font-medium flex items-center">
                      <Building className="h-4 w-4 mr-1 text-gray-500" />
                      {selectedPurchase.supplier}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Reçu par</Label>
                    <p className="font-medium flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-500" />
                      {selectedPurchase.receivedBy}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Méthode de paiement</Label>
                    <p className="font-medium">{selectedPurchase.paymentMethod}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Statut du paiement</Label>
                    <div>{getPaymentStatusBadge(selectedPurchase.paymentStatus)}</div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm text-gray-500">Montant total</Label>
                    <p className="text-xl font-bold">{selectedPurchase.amount.toFixed(2)} €</p>
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
                    {mockPurchaseItems[selectedPurchase.id] ? (
                      mockPurchaseItems[selectedPurchase.id].map((item) => (
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
                          Aucun détail disponible pour cet achat
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Nombre d'articles: {selectedPurchase.items}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Montant total</p>
                    <p className="text-xl font-bold">{selectedPurchase.amount.toFixed(2)} €</p>
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
                  Exporter
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

export default PurchasesList;
