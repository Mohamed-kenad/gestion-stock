import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, Filter, Calendar, Eye, RefreshCw, Download, FileText
} from 'lucide-react';
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Mock data
const mockPurchases = [
  { 
    id: 'PUR-2025-001', 
    reference: 'FAC-12345',
    supplier: 'Fournisseur B', 
    department: 'Cuisine',
    date: '2025-05-17', 
    totalItems: 2,
    total: 175.50,
    createdBy: 'Nadia Tazi',
    createdAt: '2025-05-17',
    notes: 'Livraison effectuée le même jour',
    items: [
      { id: 1, name: 'Tomates', category: 'Légumes', quantity: 20, unit: 'kg', unitPrice: 3.5, total: 70, batchNumber: 'LOT-T001', expiryDate: '2025-05-24' },
      { id: 2, name: 'Oignons', category: 'Légumes', quantity: 15, unit: 'kg', unitPrice: 2.8, total: 42, batchNumber: 'LOT-O001', expiryDate: '2025-06-17' }
    ],
    relatedOrderId: 'PO-2025-002'
  },
  { 
    id: 'PUR-2025-002', 
    reference: 'FAC-12346',
    supplier: 'Fournisseur A', 
    department: 'Pâtisserie',
    date: '2025-05-13', 
    totalItems: 2,
    total: 150.00,
    createdBy: 'Nadia Tazi',
    createdAt: '2025-05-13',
    notes: 'Produits de bonne qualité',
    items: [
      { id: 1, name: 'Lait', category: 'Produits laitiers', quantity: 50, unit: 'L', unitPrice: 1.2, total: 60, batchNumber: 'LOT-L001', expiryDate: '2025-05-20' },
      { id: 2, name: 'Crème fraîche', category: 'Produits laitiers', quantity: 10, unit: 'L', unitPrice: 4.5, total: 45, batchNumber: 'LOT-C001', expiryDate: '2025-05-18' }
    ],
    relatedOrderId: 'PO-2025-004'
  },
  { 
    id: 'PUR-2025-003', 
    reference: 'FAC-12347',
    supplier: 'Fournisseur B', 
    department: 'Cuisine',
    date: '2025-05-07', 
    totalItems: 2,
    total: 55.50,
    createdBy: 'Nadia Tazi',
    createdAt: '2025-05-07',
    notes: 'Achat direct sans bon de commande',
    items: [
      { id: 1, name: 'Pommes', category: 'Fruits', quantity: 15, unit: 'kg', unitPrice: 2.5, total: 37.5, batchNumber: 'LOT-P001', expiryDate: '2025-05-17' },
      { id: 2, name: 'Bananes', category: 'Fruits', quantity: 10, unit: 'kg', unitPrice: 1.8, total: 18, batchNumber: 'LOT-B001', expiryDate: '2025-05-14' }
    ],
    relatedOrderId: null
  },
  { 
    id: 'PUR-2025-004', 
    reference: 'FAC-12348',
    supplier: 'Fournisseur C', 
    department: 'Cuisine',
    date: '2025-05-10', 
    totalItems: 2,
    total: 295.00,
    createdBy: 'Nadia Tazi',
    createdAt: '2025-05-10',
    notes: 'Achat direct sans bon de commande',
    items: [
      { id: 1, name: 'Boeuf', category: 'Viandes', quantity: 10, unit: 'kg', unitPrice: 18.5, total: 185, batchNumber: 'LOT-V001', expiryDate: '2025-05-15' },
      { id: 2, name: 'Agneau', category: 'Viandes', quantity: 5, unit: 'kg', unitPrice: 22.0, total: 110, batchNumber: 'LOT-V002', expiryDate: '2025-05-14' }
    ],
    relatedOrderId: null
  },
  { 
    id: 'PUR-2025-005', 
    reference: 'FAC-12349',
    supplier: 'Fournisseur E', 
    department: 'Bar',
    date: '2025-05-15', 
    totalItems: 3,
    total: 215.00,
    createdBy: 'Nadia Tazi',
    createdAt: '2025-05-15',
    notes: 'Livraison partielle, reste à livrer',
    items: [
      { id: 1, name: 'Eau minérale', category: 'Boissons', quantity: 100, unit: 'bouteille', unitPrice: 0.8, total: 80, batchNumber: 'LOT-E001', expiryDate: '2025-11-15' },
      { id: 2, name: 'Jus d\'orange', category: 'Boissons', quantity: 50, unit: 'bouteille', unitPrice: 1.5, total: 75, batchNumber: 'LOT-J001', expiryDate: '2025-08-15' },
      { id: 3, name: 'Coca-Cola', category: 'Boissons', quantity: 50, unit: 'bouteille', unitPrice: 1.2, total: 60, batchNumber: 'LOT-C001', expiryDate: '2025-10-15' }
    ],
    relatedOrderId: 'PO-2025-006'
  }
];

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [date, setDate] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  
  // Purchase details
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPurchases(mockPurchases);
      setLoading(false);
    }, 800);
  }, []);

  // Filter purchases based on search term, filters, and date range
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         purchase.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSupplier = supplierFilter === '' || purchase.supplier === supplierFilter;
    const matchesDepartment = departmentFilter === '' || purchase.department === departmentFilter;
    
    // Date filtering
    let matchesDate = true;
    if (date.from && date.to) {
      const purchaseDate = new Date(purchase.date);
      matchesDate = purchaseDate >= date.from && purchaseDate <= date.to;
    }
    
    return matchesSearch && matchesSupplier && matchesDepartment && matchesDate;
  });

  // Get unique suppliers and departments for filter dropdowns
  const suppliers = [...new Set(purchases.map(purchase => purchase.supplier))];
  const departments = [...new Set(purchases.map(purchase => purchase.department))];

  // Open view dialog
  const openViewDialog = (purchase) => {
    setSelectedPurchase(purchase);
    setIsViewDialogOpen(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPurchases(mockPurchases);
      setLoading(false);
    }, 800);
  };

  // Handle export
  const handleExport = () => {
    alert('Exporting purchases to CSV...');
    // Implement actual export functionality
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique des Achats</h1>
          <p className="text-muted-foreground">
            Consultez l'historique des achats effectués
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des achats</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchases.reduce((sum, purchase) => sum + purchase.total, 0).toFixed(2)} €
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fournisseurs</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(purchases.map(purchase => purchase.supplier)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Départements</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(purchases.map(purchase => purchase.department)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un achat..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Fournisseur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les fournisseurs</SelectItem>
              {suppliers.map(supplier => (
                <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Département" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les départements</SelectItem>
              {departments.map(department => (
                <SelectItem key={department} value={department}>{department}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des achats</CardTitle>
          <CardDescription>
            Liste des achats effectués
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Achat</TableHead>
                    <TableHead>Référence</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Nb. produits</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Bon de commande</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases.length > 0 ? (
                    filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">{purchase.id}</TableCell>
                        <TableCell>{purchase.reference}</TableCell>
                        <TableCell>{purchase.supplier}</TableCell>
                        <TableCell>{purchase.department}</TableCell>
                        <TableCell>{purchase.date}</TableCell>
                        <TableCell>{purchase.totalItems}</TableCell>
                        <TableCell className="text-right">{purchase.total.toFixed(2)} €</TableCell>
                        <TableCell>
                          {purchase.relatedOrderId ? (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                              {purchase.relatedOrderId}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                              Achat direct
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openViewDialog(purchase)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        Aucun achat trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Purchase Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de l'achat</DialogTitle>
            <DialogDescription>
              {selectedPurchase && (
                <span>
                  {selectedPurchase.id} - {selectedPurchase.reference}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Informations générales</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Date d'achat:</span> {selectedPurchase.date}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Fournisseur:</span> {selectedPurchase.supplier}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Département:</span> {selectedPurchase.department}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Référence:</span> {selectedPurchase.reference}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Détails de la transaction</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Créé par:</span> {selectedPurchase.createdBy}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Date de création:</span> {selectedPurchase.createdAt}
                    </p>
                    {selectedPurchase.relatedOrderId && (
                      <p className="text-sm">
                        <span className="font-medium">Bon de commande:</span> {selectedPurchase.relatedOrderId}
                      </p>
                    )}
                    {selectedPurchase.notes && (
                      <p className="text-sm">
                        <span className="font-medium">Notes:</span> {selectedPurchase.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Produits achetés</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Prix unitaire</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>N° Lot</TableHead>
                      <TableHead>Date d'expiration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPurchase.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.unitPrice.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-right">
                          {item.total.toFixed(2)} €
                        </TableCell>
                        <TableCell>{item.batchNumber || '-'}</TableCell>
                        <TableCell>{item.expiryDate || '-'}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {selectedPurchase.total.toFixed(2)} €
                      </TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseHistory;
