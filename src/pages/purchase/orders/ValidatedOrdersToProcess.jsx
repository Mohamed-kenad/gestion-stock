import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, CheckCircle, ShoppingCart, Eye, Download, 
  Printer, FileText, Calendar, Building, Package, Truck, User
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
import { Textarea } from "../../../components/ui/textarea";
import { Separator } from "../../../components/ui/separator";

// Mock data for approved orders
const mockApprovedOrders = [
  {
    id: 'BON-2025-042',
    title: 'Réapprovisionnement cuisine centrale',
    date: '2025-05-15',
    department: 'Cuisine',
    requestedBy: 'Jean Dupont',
    approvedBy: 'Marie Directrice',
    approvalDate: '2025-05-16',
    status: 'approved',
    urgency: 'normal',
    items: [
      { id: 1, name: 'Farine de blé T55', quantity: 25, unit: 'kg', estimatedPrice: 45.50 },
      { id: 2, name: 'Sucre en poudre', quantity: 15, unit: 'kg', estimatedPrice: 22.75 },
      { id: 3, name: 'Huile d\'olive extra vierge', quantity: 10, unit: 'L', estimatedPrice: 65.80 },
      { id: 4, name: 'Sel de mer', quantity: 5, unit: 'kg', estimatedPrice: 18.50 },
      { id: 5, name: 'Levure boulangère', quantity: 2, unit: 'kg', estimatedPrice: 110.75 },
    ],
    totalEstimatedPrice: 2450.75,
    notes: 'Approuvé avec les quantités demandées.',
    suppliers: [
      { id: 1, name: 'Fournisseur Alpha', selected: false },
      { id: 2, name: 'Grossiste Beta', selected: false },
      { id: 3, name: 'Distributeur Gamma', selected: false },
    ]
  },
  {
    id: 'BON-2025-041',
    title: 'Commande boissons bar',
    date: '2025-05-14',
    department: 'Bar',
    requestedBy: 'Sophie Barman',
    approvedBy: 'Marie Directrice',
    approvalDate: '2025-05-15',
    status: 'approved',
    urgency: 'high',
    items: [
      { id: 1, name: 'Vodka premium', quantity: 6, unit: 'bouteilles', estimatedPrice: 125.50 },
      { id: 2, name: 'Rhum ambré', quantity: 4, unit: 'bouteilles', estimatedPrice: 98.75 },
      { id: 3, name: 'Gin London Dry', quantity: 3, unit: 'bouteilles', estimatedPrice: 85.30 },
      { id: 4, name: 'Tequila Reposado', quantity: 2, unit: 'bouteilles', estimatedPrice: 110.20 },
      { id: 5, name: 'Whisky écossais', quantity: 3, unit: 'bouteilles', estimatedPrice: 83.67 },
    ],
    totalEstimatedPrice: 1875.30,
    notes: 'Urgent pour le weekend.',
    suppliers: [
      { id: 4, name: 'Fournisseur Delta', selected: false },
      { id: 5, name: 'Grossiste Epsilon', selected: false },
    ]
  },
  {
    id: 'BON-2025-039',
    title: 'Produits d\'entretien restaurant',
    date: '2025-05-12',
    department: 'Restaurant',
    requestedBy: 'Pierre Serveur',
    approvedBy: 'Marie Directrice',
    approvalDate: '2025-05-13',
    status: 'approved',
    urgency: 'normal',
    items: [
      { id: 1, name: 'Détergent multi-surfaces', quantity: 10, unit: 'L', estimatedPrice: 35.50 },
      { id: 2, name: 'Désinfectant alimentaire', quantity: 5, unit: 'L', estimatedPrice: 48.75 },
      { id: 3, name: 'Liquide vaisselle professionnel', quantity: 20, unit: 'L', estimatedPrice: 42.30 },
      { id: 4, name: 'Serviettes en papier', quantity: 50, unit: 'paquets', estimatedPrice: 12.20 },
      { id: 5, name: 'Sacs poubelle renforcés', quantity: 10, unit: 'rouleaux', estimatedPrice: 18.67 },
    ],
    totalEstimatedPrice: 1250.75,
    notes: 'Approuvé avec ajustement des quantités.',
    suppliers: [
      { id: 6, name: 'Distributeur Zeta', selected: false },
      { id: 7, name: 'Fournisseur Eta', selected: false },
    ]
  },
];

const ValidatedOrdersToProcess = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [purchaseNotes, setPurchaseNotes] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders(mockApprovedOrders);
      setLoading(false);
    }, 800);
  }, []);

  // Filter orders based on search term and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === '' || order.department === departmentFilter;
    const matchesUrgency = urgencyFilter === '' || order.urgency === urgencyFilter;
    
    return matchesSearch && matchesDepartment && matchesUrgency;
  });

  // View order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  // Process order (create purchase)
  const handleProcessOrder = (order) => {
    setProcessingOrder(order);
    setPurchaseNotes('');
    setExpectedDeliveryDate('');
    setSelectedSupplier(null);
  };

  // Submit purchase order to supplier
  const handleSubmitPurchase = () => {
    if (!selectedSupplier || !expectedDeliveryDate) {
      alert('Veuillez sélectionner un fournisseur et une date de livraison prévue.');
      return;
    }

    // Here you would typically send the purchase order to your backend
    alert(`Bon de commande envoyé au fournisseur: ${selectedSupplier}`);
    
    // Close dialog and update order status in the UI
    setProcessingOrder(null);
    
    // Update the order status in our local state
    const updatedOrders = orders.map(order => 
      order.id === processingOrder.id 
        ? { ...order, status: 'processing', purchaseStatus: 'sent_to_supplier' } 
        : order
    );
    setOrders(updatedOrders);
  };

  // Get urgency badge
  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'high':
        return <Badge className="bg-red-500">Urgent</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Moyen</Badge>;
      case 'normal':
      default:
        return <Badge className="bg-blue-500">Normal</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Bons validés à traiter</h1>
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
          <CardTitle>Liste des bons approuvés</CardTitle>
          <CardDescription>
            Traitez les bons de commande approuvés par les chefs de département
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher un bon..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les départements</SelectItem>
                <SelectItem value="Cuisine">Cuisine</SelectItem>
                <SelectItem value="Bar">Bar</SelectItem>
                <SelectItem value="Restaurant">Restaurant</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Urgence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les urgences</SelectItem>
                <SelectItem value="high">Urgent</SelectItem>
                <SelectItem value="medium">Moyen</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
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
                    <TableHead>Référence</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Date d'approbation</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Demandé par</TableHead>
                    <TableHead>Urgence</TableHead>
                    <TableHead>Montant estimé</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                        Aucun bon de commande approuvé trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.title}</TableCell>
                        <TableCell>{order.approvalDate}</TableCell>
                        <TableCell>{order.department}</TableCell>
                        <TableCell>{order.requestedBy}</TableCell>
                        <TableCell>{getUrgencyBadge(order.urgency)}</TableCell>
                        <TableCell>{order.totalEstimatedPrice.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleProcessOrder(order)}
                            >
                              <ShoppingCart className="h-4 w-4" />
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
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Détails du bon {selectedOrder.id}
              </DialogTitle>
              <DialogDescription>
                Informations complètes sur ce bon de commande
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Titre</Label>
                  <p className="font-medium">{selectedOrder.title}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Département</Label>
                  <p className="font-medium">{selectedOrder.department}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Date de demande</Label>
                  <p className="font-medium">{selectedOrder.date}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Date d'approbation</Label>
                  <p className="font-medium">{selectedOrder.approvalDate}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Demandé par</Label>
                  <p className="font-medium">{selectedOrder.requestedBy}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Approuvé par</Label>
                  <p className="font-medium">{selectedOrder.approvedBy}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Urgence</Label>
                  <div>{getUrgencyBadge(selectedOrder.urgency)}</div>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Statut</Label>
                  <Badge className="bg-green-500">Approuvé</Badge>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm text-gray-500">Notes d'approbation</Label>
                <p className="mt-1 p-2 bg-gray-50 rounded-md">{selectedOrder.notes}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-sm text-gray-500 mb-2 block">Articles</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Unité</TableHead>
                      <TableHead className="text-right">Prix estimé</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{item.estimatedPrice.toFixed(2)} €</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-4 text-right">
                  <p className="text-sm text-gray-500">Total estimé</p>
                  <p className="text-xl font-bold">{selectedOrder.totalEstimatedPrice.toFixed(2)} €</p>
                </div>
              </div>
            </div>

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

      {/* Process Order Dialog */}
      {processingOrder && (
        <Dialog open={!!processingOrder} onOpenChange={(open) => !open && setProcessingOrder(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Traiter le bon {processingOrder.id}
              </DialogTitle>
              <DialogDescription>
                Créer un bon d'achat pour ce bon de commande approuvé
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Titre</Label>
                  <p className="font-medium">{processingOrder.title}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Département</Label>
                  <p className="font-medium">{processingOrder.department}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm text-gray-500 mb-2 block">Articles à commander</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Unité</TableHead>
                      <TableHead className="text-right">Prix estimé</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processingOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right">{item.estimatedPrice.toFixed(2)} €</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="mt-4 text-right">
                  <p className="text-sm text-gray-500">Total estimé</p>
                  <p className="text-xl font-bold">{processingOrder.totalEstimatedPrice.toFixed(2)} €</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="supplier">Sélectionner un fournisseur</Label>
                  <Select onValueChange={setSelectedSupplier}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      {processingOrder.suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.name}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="deliveryDate">Date de livraison prévue</Label>
                  <Input 
                    id="deliveryDate" 
                    type="date" 
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes pour le fournisseur</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Ajoutez des instructions spécifiques pour le fournisseur..." 
                    value={purchaseNotes}
                    onChange={(e) => setPurchaseNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={handleSubmitPurchase}>
                Envoyer la commande au fournisseur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ValidatedOrdersToProcess;
