import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Calendar, FileText, 
  ShoppingCart, Package, DollarSign, AlertTriangle, 
  CheckCircle, XCircle, Info, Eye, ArrowUpDown
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useToast } from "../../../components/ui/use-toast";

// Mock data for operations
const mockPurchases = [
  {
    id: 'PO-2025-001',
    date: '2025-05-15',
    supplier: 'Fournisseur ABC',
    items: [
      { id: 1, name: 'Farine de blé T55', quantity: 50, price: 2.50, total: 125.00 },
      { id: 2, name: 'Sucre en poudre', quantity: 30, price: 1.80, total: 54.00 }
    ],
    total: 179.00,
    status: 'completed',
    audited: true,
    auditDate: '2025-05-16',
    auditNotes: 'Conforme aux prix négociés',
    auditStatus: 'approved'
  },
  {
    id: 'PO-2025-002',
    date: '2025-05-17',
    supplier: 'Distillerie XYZ',
    items: [
      { id: 4, name: 'Vodka premium', quantity: 10, price: 18.75, total: 187.50 },
      { id: 5, name: 'Rhum ambré', quantity: 8, price: 22.50, total: 180.00 }
    ],
    total: 367.50,
    status: 'completed',
    audited: true,
    auditDate: '2025-05-18',
    auditNotes: 'Prix supérieur au tarif négocié pour le rhum',
    auditStatus: 'flagged'
  },
  {
    id: 'PO-2025-003',
    date: '2025-05-19',
    supplier: 'Produits d\'entretien Pro',
    items: [
      { id: 7, name: 'Détergent multi-surfaces', quantity: 15, price: 3.25, total: 48.75 },
      { id: 8, name: 'Désinfectant alimentaire', quantity: 12, price: 4.50, total: 54.00 }
    ],
    total: 102.75,
    status: 'completed',
    audited: false,
    auditDate: null,
    auditNotes: null,
    auditStatus: 'pending'
  }
];

const mockSales = [
  {
    id: 'SO-2025-001',
    date: '2025-05-16',
    customer: 'Restaurant Le Gourmet',
    items: [
      { id: 1, name: 'Farine de blé T55', quantity: 10, price: 4.75, total: 47.50 },
      { id: 3, name: 'Huile d\'olive extra vierge', quantity: 5, price: 15.90, total: 79.50 }
    ],
    total: 127.00,
    status: 'completed',
    audited: true,
    auditDate: '2025-05-17',
    auditNotes: 'Prix de vente conformes',
    auditStatus: 'approved'
  },
  {
    id: 'SO-2025-002',
    date: '2025-05-18',
    customer: 'Bar Le Cocktail',
    items: [
      { id: 4, name: 'Vodka premium', quantity: 3, price: 42.50, total: 127.50 },
      { id: 6, name: 'Gin London Dry', quantity: 2, price: 44.50, total: 89.00 }
    ],
    total: 216.50,
    status: 'completed',
    audited: true,
    auditDate: '2025-05-19',
    auditNotes: 'Remise accordée sans autorisation',
    auditStatus: 'rejected'
  },
  {
    id: 'SO-2025-003',
    date: '2025-05-20',
    customer: 'Hôtel Luxe',
    items: [
      { id: 4, name: 'Vodka premium', quantity: 5, price: 42.50, total: 212.50 },
      { id: 5, name: 'Rhum ambré', quantity: 4, price: 48.90, total: 195.60 }
    ],
    total: 408.10,
    status: 'completed',
    audited: false,
    auditDate: null,
    auditNotes: null,
    auditStatus: 'pending'
  }
];

const mockInventoryMovements = [
  {
    id: 'IM-2025-001',
    date: '2025-05-15',
    type: 'reception',
    reference: 'PO-2025-001',
    items: [
      { id: 1, name: 'Farine de blé T55', quantity: 50, previousStock: 70, newStock: 120 },
      { id: 2, name: 'Sucre en poudre', quantity: 30, previousStock: 55, newStock: 85 }
    ],
    audited: true,
    auditDate: '2025-05-16',
    auditNotes: 'Quantités reçues conformes à la commande',
    auditStatus: 'approved'
  },
  {
    id: 'IM-2025-002',
    date: '2025-05-16',
    type: 'adjustment',
    reference: 'ADJ-2025-001',
    items: [
      { id: 3, name: 'Huile d\'olive extra vierge', quantity: -2, previousStock: 47, newStock: 45 }
    ],
    audited: true,
    auditDate: '2025-05-17',
    auditNotes: 'Ajustement pour casse, photos vérifiées',
    auditStatus: 'approved'
  },
  {
    id: 'IM-2025-003',
    date: '2025-05-18',
    type: 'transfer',
    reference: 'TR-2025-001',
    items: [
      { id: 7, name: 'Détergent multi-surfaces', quantity: -5, previousStock: 65, newStock: 60 }
    ],
    audited: false,
    auditDate: null,
    auditNotes: null,
    auditStatus: 'pending'
  }
];

const OperationsAudit = () => {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("purchases");
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [inventoryMovements, setInventoryMovements] = useState([]);
  
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAuditDialogOpen, setIsAuditDialogOpen] = useState(false);
  
  // Audit form state
  const [auditNotes, setAuditNotes] = useState('');
  const [auditStatus, setAuditStatus] = useState('approved');
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPurchases(mockPurchases);
      setSales(mockSales);
      setInventoryMovements(mockInventoryMovements);
      setLoading(false);
    }, 800);
  }, []);
  
  // Filter operations based on search term and status
  const getFilteredOperations = (operations) => {
    return operations.filter(operation => {
      const matchesSearch = operation.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === '' || operation.auditStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };
  
  const filteredPurchases = getFilteredOperations(purchases);
  const filteredSales = getFilteredOperations(sales);
  const filteredInventoryMovements = getFilteredOperations(inventoryMovements);
  
  // Get current operations based on active tab
  const getCurrentOperations = () => {
    switch (activeTab) {
      case 'purchases':
        return filteredPurchases;
      case 'sales':
        return filteredSales;
      case 'inventory':
        return filteredInventoryMovements;
      default:
        return [];
    }
  };
  
  // Open details dialog
  const handleViewDetails = (operation) => {
    setSelectedOperation(operation);
    setIsDetailsDialogOpen(true);
  };
  
  // Open audit dialog
  const handleAudit = (operation) => {
    setSelectedOperation(operation);
    setAuditNotes(operation.auditNotes || '');
    setAuditStatus(operation.auditStatus === 'pending' ? 'approved' : operation.auditStatus);
    setIsAuditDialogOpen(true);
  };
  
  // Save audit
  const handleSaveAudit = () => {
    if (!auditNotes) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir des notes d'audit.",
        variant: "destructive",
      });
      return;
    }
    
    const auditedOperation = {
      ...selectedOperation,
      audited: true,
      auditDate: new Date().toISOString().split('T')[0],
      auditNotes: auditNotes,
      auditStatus: auditStatus
    };
    
    // Update the appropriate operations array
    if (activeTab === 'purchases') {
      setPurchases(purchases.map(op => op.id === selectedOperation.id ? auditedOperation : op));
    } else if (activeTab === 'sales') {
      setSales(sales.map(op => op.id === selectedOperation.id ? auditedOperation : op));
    } else if (activeTab === 'inventory') {
      setInventoryMovements(inventoryMovements.map(op => op.id === selectedOperation.id ? auditedOperation : op));
    }
    
    setIsAuditDialogOpen(false);
    
    toast({
      title: "Audit enregistré",
      description: `L'opération ${selectedOperation.id} a été auditée avec succès.`,
    });
  };
  
  // Export audit report
  const handleExportReport = () => {
    toast({
      title: "Rapport exporté",
      description: "Le rapport d'audit a été exporté avec succès.",
    });
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approuvé</Badge>;
      case 'flagged':
        return <Badge className="bg-yellow-500">Signalé</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejeté</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-gray-500">En attente</Badge>;
    }
  };
  
  // Get operation type icon
  const getOperationTypeIcon = (type) => {
    switch (type) {
      case 'reception':
        return <Package className="h-4 w-4 text-green-500" />;
      case 'adjustment':
        return <ArrowUpDown className="h-4 w-4 text-yellow-500" />;
      case 'transfer':
        return <ArrowUpDown className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Audit des opérations</h1>
          <p className="text-gray-600">Auditez et contrôlez toutes les opérations commerciales</p>
        </div>
        <Button onClick={handleExportReport} className="flex items-center">
          <Download className="mr-2 h-4 w-4" /> Exporter le rapport
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Opérations totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchases.length + sales.length + inventoryMovements.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Opérations auditées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchases.filter(p => p.audited).length + 
               sales.filter(s => s.audited).length + 
               inventoryMovements.filter(i => i.audited).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Anomalies détectées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchases.filter(p => p.auditStatus === 'flagged' || p.auditStatus === 'rejected').length + 
               sales.filter(s => s.auditStatus === 'flagged' || s.auditStatus === 'rejected').length + 
               inventoryMovements.filter(i => i.auditStatus === 'flagged' || i.auditStatus === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Liste des opérations</CardTitle>
              <CardDescription>
                Auditez et vérifiez toutes les opérations commerciales
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher par ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Statut d'audit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="flagged">Signalé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-full md:w-[180px]"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="purchases">Achats</TabsTrigger>
              <TabsTrigger value="sales">Ventes</TabsTrigger>
              <TabsTrigger value="inventory">Mouvements de stock</TabsTrigger>
            </TabsList>
            
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      {activeTab === 'purchases' && <TableHead>Fournisseur</TableHead>}
                      {activeTab === 'sales' && <TableHead>Client</TableHead>}
                      {activeTab === 'inventory' && <TableHead>Type</TableHead>}
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Statut d'audit</TableHead>
                      <TableHead>Date d'audit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getCurrentOperations().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          Aucune opération trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      getCurrentOperations().map((operation) => (
                        <TableRow key={operation.id}>
                          <TableCell className="font-medium">{operation.id}</TableCell>
                          <TableCell>{operation.date}</TableCell>
                          {activeTab === 'purchases' && <TableCell>{operation.supplier}</TableCell>}
                          {activeTab === 'sales' && <TableCell>{operation.customer}</TableCell>}
                          {activeTab === 'inventory' && (
                            <TableCell className="flex items-center">
                              {getOperationTypeIcon(operation.type)}
                              <span className="ml-2">
                                {operation.type === 'reception' ? 'Réception' : 
                                 operation.type === 'adjustment' ? 'Ajustement' : 
                                 operation.type === 'transfer' ? 'Transfert' : operation.type}
                              </span>
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            {operation.total ? `${operation.total.toLocaleString()} DH` : '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(operation.auditStatus)}</TableCell>
                          <TableCell>{operation.auditDate || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleViewDetails(operation)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon"
                                className={operation.audited ? "text-yellow-500" : "text-blue-500"}
                                onClick={() => handleAudit(operation)}
                              >
                                {operation.audited ? (
                                  <FileText className="h-4 w-4" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Operation Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de l'opération {selectedOperation?.id}</DialogTitle>
            <DialogDescription>
              Informations détaillées sur l'opération
            </DialogDescription>
          </DialogHeader>
          
          {selectedOperation && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="font-medium">{selectedOperation.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{selectedOperation.date}</p>
                </div>
                
                {activeTab === 'purchases' && (
                  <div>
                    <p className="text-sm text-gray-500">Fournisseur</p>
                    <p className="font-medium">{selectedOperation.supplier}</p>
                  </div>
                )}
                
                {activeTab === 'sales' && (
                  <div>
                    <p className="text-sm text-gray-500">Client</p>
                    <p className="font-medium">{selectedOperation.customer}</p>
                  </div>
                )}
                
                {activeTab === 'inventory' && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium">
                        {selectedOperation.type === 'reception' ? 'Réception' : 
                         selectedOperation.type === 'adjustment' ? 'Ajustement' : 
                         selectedOperation.type === 'transfer' ? 'Transfert' : selectedOperation.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Référence</p>
                      <p className="font-medium">{selectedOperation.reference}</p>
                    </div>
                  </>
                )}
                
                {(activeTab === 'purchases' || activeTab === 'sales') && (
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-medium">{selectedOperation.total.toLocaleString()} DH</p>
                  </div>
                )}
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      {(activeTab === 'purchases' || activeTab === 'sales') && (
                        <>
                          <TableHead className="text-right">Prix unitaire</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </>
                      )}
                      {activeTab === 'inventory' && (
                        <>
                          <TableHead className="text-right">Stock précédent</TableHead>
                          <TableHead className="text-right">Nouveau stock</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOperation.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        {(activeTab === 'purchases' || activeTab === 'sales') && (
                          <>
                            <TableCell className="text-right">{item.price.toFixed(2)} DH</TableCell>
                            <TableCell className="text-right">{item.total.toFixed(2)} DH</TableCell>
                          </>
                        )}
                        {activeTab === 'inventory' && (
                          <>
                            <TableCell className="text-right">{item.previousStock}</TableCell>
                            <TableCell className="text-right">{item.newStock}</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {selectedOperation.audited && (
                <div className="p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium mb-2">Informations d'audit</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date d'audit</p>
                      <p className="font-medium">{selectedOperation.auditDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Statut</p>
                      <div>{getStatusBadge(selectedOperation.auditStatus)}</div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Notes d'audit</p>
                      <p>{selectedOperation.auditNotes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button>Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Audit Dialog */}
      <Dialog open={isAuditDialogOpen} onOpenChange={setIsAuditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedOperation?.audited ? "Modifier l'audit" : "Auditer l'opération"}
            </DialogTitle>
            <DialogDescription>
              {selectedOperation?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut d'audit</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={auditStatus === 'approved' ? 'default' : 'outline'}
                  className={auditStatus === 'approved' ? 'bg-green-500 hover:bg-green-600' : ''}
                  onClick={() => setAuditStatus('approved')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approuvé
                </Button>
                <Button
                  type="button"
                  variant={auditStatus === 'flagged' ? 'default' : 'outline'}
                  className={auditStatus === 'flagged' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                  onClick={() => setAuditStatus('flagged')}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Signalé
                </Button>
                <Button
                  type="button"
                  variant={auditStatus === 'rejected' ? 'default' : 'outline'}
                  className={auditStatus === 'rejected' ? 'bg-red-500 hover:bg-red-600' : ''}
                  onClick={() => setAuditStatus('rejected')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejeté
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes d'audit</label>
              <textarea
                className="w-full min-h-[100px] p-2 border rounded-md"
                placeholder="Saisissez vos observations et notes d'audit..."
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleSaveAudit}>
              Enregistrer l'audit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OperationsAudit;
