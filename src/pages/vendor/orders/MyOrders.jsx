import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Plus, FileText, Eye, Clock, CheckCircle2, 
  XCircle, AlertTriangle, Calendar, Download, Printer
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

// Mock data for orders
const mockOrders = [
  {
    id: 'BC-2025-001',
    title: 'Commande hebdomadaire cuisine',
    department: 'Cuisine',
    createdAt: '2025-05-15',
    status: 'pending',
    urgency: 'normal',
    items: [
      { product: 'Poulet', category: 'Viandes', quantity: 10, unit: 'kg', price: 45.00 },
      { product: 'Tomates', category: 'Légumes', quantity: 5, unit: 'kg', price: 8.00 },
      { product: 'Oignons', category: 'Légumes', quantity: 3, unit: 'kg', price: 6.00 },
    ],
    total: 503.00,
    createdBy: 'John Doe',
    comments: [],
  },
  {
    id: 'BC-2025-002',
    title: 'Commande mensuelle épices',
    department: 'Cuisine',
    createdAt: '2025-05-10',
    status: 'approved',
    urgency: 'low',
    items: [
      { product: 'Sel', category: 'Épices', quantity: 2, unit: 'kg', price: 3.00 },
      { product: 'Poivre', category: 'Épices', quantity: 1, unit: 'kg', price: 50.00 },
      { product: 'Cumin', category: 'Épices', quantity: 0.5, unit: 'kg', price: 60.00 },
    ],
    total: 86.00,
    createdBy: 'John Doe',
    approvedBy: 'Chef Pierre',
    approvedAt: '2025-05-11',
    comments: [
      { author: 'Chef Pierre', date: '2025-05-11', text: 'Bon validé, quantités correctes.' }
    ],
  },
  {
    id: 'BC-2025-003',
    title: 'Commande urgente boissons',
    department: 'Bar',
    createdAt: '2025-05-18',
    status: 'rejected',
    urgency: 'high',
    items: [
      { product: 'Eau minérale', category: 'Boissons', quantity: 20, unit: 'L', price: 5.00 },
      { product: 'Jus d\'orange', category: 'Boissons', quantity: 10, unit: 'L', price: 10.00 },
    ],
    total: 200.00,
    createdBy: 'John Doe',
    rejectedBy: 'Chef Pierre',
    rejectedAt: '2025-05-19',
    comments: [
      { author: 'Chef Pierre', date: '2025-05-19', text: 'Stock suffisant, commande non nécessaire pour le moment.' }
    ],
  },
  {
    id: 'BC-2025-004',
    title: 'Commande produits laitiers',
    department: 'Pâtisserie',
    createdAt: '2025-05-14',
    status: 'delivered',
    urgency: 'normal',
    items: [
      { product: 'Lait', category: 'Produits laitiers', quantity: 20, unit: 'L', price: 7.00 },
      { product: 'Fromage', category: 'Produits laitiers', quantity: 5, unit: 'kg', price: 80.00 },
      { product: 'Beurre', category: 'Produits laitiers', quantity: 3, unit: 'kg', price: 60.00 },
    ],
    total: 720.00,
    createdBy: 'John Doe',
    approvedBy: 'Chef Pierre',
    approvedAt: '2025-05-15',
    deliveredAt: '2025-05-17',
    comments: [
      { author: 'Chef Pierre', date: '2025-05-15', text: 'Bon validé.' },
      { author: 'Service Achat', date: '2025-05-17', text: 'Livraison effectuée.' }
    ],
  },
  {
    id: 'BC-2025-005',
    title: 'Commande fruits',
    department: 'Cuisine',
    createdAt: '2025-05-16',
    status: 'processing',
    urgency: 'normal',
    items: [
      { product: 'Pommes', category: 'Fruits', quantity: 10, unit: 'kg', price: 15.00 },
      { product: 'Bananes', category: 'Fruits', quantity: 8, unit: 'kg', price: 12.00 },
      { product: 'Oranges', category: 'Fruits', quantity: 12, unit: 'kg', price: 10.00 },
    ],
    total: 366.00,
    createdBy: 'John Doe',
    approvedBy: 'Chef Pierre',
    approvedAt: '2025-05-17',
    comments: [
      { author: 'Chef Pierre', date: '2025-05-17', text: 'Bon validé.' },
      { author: 'Service Achat', date: '2025-05-18', text: 'Commande en cours de traitement.' }
    ],
  },
];

const MyOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders(mockOrders);
    }, 500);
  }, []);
  
  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || order.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });
  
  // Get unique departments for filter
  const departments = [...new Set(orders.map(order => order.department))];
  
  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };
  
  // Handle print order
  const handlePrintOrder = (orderId) => {
    toast({
      title: "Impression en cours",
      description: `Impression du bon de commande ${orderId}`,
    });
  };
  
  // Handle download order
  const handleDownloadOrder = (orderId) => {
    toast({
      title: "Téléchargement en cours",
      description: `Téléchargement du bon de commande ${orderId}`,
    });
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Approuvé</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">En traitement</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Livré</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  // Get urgency badge
  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'low':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Basse</Badge>;
      case 'normal':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Normale</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Haute</Badge>;
      case 'critical':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Critique</Badge>;
      default:
        return <Badge variant="outline">Inconnue</Badge>;
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes bons de commande</h1>
          <p className="text-muted-foreground">
            Consultez et gérez vos bons de commande
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/vendor/orders/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau bon
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un bon de commande..."
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
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="processing">En traitement</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Département" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les départements</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des bons de commande</CardTitle>
          <CardDescription>
            {filteredOrders.length} bons de commande trouvés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Aucun bon de commande trouvé</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Aucun bon de commande ne correspond à vos critères de recherche
              </p>
              <Button className="mt-4" onClick={() => navigate('/dashboard/vendor/orders/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un bon de commande
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Urgence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.title}</TableCell>
                    <TableCell>{order.department}</TableCell>
                    <TableCell>{order.createdAt}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{getUrgencyBadge(order.urgency)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handlePrintOrder(order.id)}>
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadOrder(order.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
          <DialogContent className="sm:max-w-[900px]">
            <DialogHeader>
              <DialogTitle>Détails du bon de commande</DialogTitle>
              <DialogDescription>
                Référence: {selectedOrder.id}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Informations</TabsTrigger>
                <TabsTrigger value="products">Produits</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Titre</h4>
                    <p className="text-base">{selectedOrder.title}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Département</h4>
                    <p className="text-base">{selectedOrder.department}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Date de création</h4>
                    <p className="text-base">{selectedOrder.createdAt}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Créé par</h4>
                    <p className="text-base">{selectedOrder.createdBy}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Statut</h4>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Urgence</h4>
                    <div className="mt-1">{getUrgencyBadge(selectedOrder.urgency)}</div>
                  </div>
                  
                  {selectedOrder.status === 'approved' && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Approuvé par</h4>
                        <p className="text-base">{selectedOrder.approvedBy}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Date d'approbation</h4>
                        <p className="text-base">{selectedOrder.approvedAt}</p>
                      </div>
                    </>
                  )}
                  
                  {selectedOrder.status === 'rejected' && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Rejeté par</h4>
                        <p className="text-base">{selectedOrder.rejectedBy}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Date de rejet</h4>
                        <p className="text-base">{selectedOrder.rejectedAt}</p>
                      </div>
                    </>
                  )}
                  
                  {selectedOrder.status === 'delivered' && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Date de livraison</h4>
                      <p className="text-base">{selectedOrder.deliveredAt}</p>
                    </div>
                  )}
                  
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Montant total</h4>
                    <p className="text-xl font-bold">{selectedOrder.total.toFixed(2)} DH</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="products" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-center">Quantité</TableHead>
                      <TableHead className="text-right">Prix unitaire</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.product}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-center">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">{item.price.toFixed(2)} DH</TableCell>
                        <TableCell className="text-right">{(item.price * item.quantity).toFixed(2)} DH</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">{selectedOrder.total.toFixed(2)} DH</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="history" className="pt-4">
                {selectedOrder.comments.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Aucun commentaire</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Aucun commentaire n'a été ajouté à ce bon de commande
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedOrder.comments.map((comment, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">{comment.author}</div>
                          <div className="text-sm text-muted-foreground">{comment.date}</div>
                        </div>
                        <p>{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => handlePrintOrder(selectedOrder.id)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
                <Button variant="outline" onClick={() => handleDownloadOrder(selectedOrder.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
              <Button variant="outline" onClick={() => setShowOrderDetails(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MyOrders;
