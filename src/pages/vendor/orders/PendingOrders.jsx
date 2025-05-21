import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Clock, Eye, AlertTriangle, Calendar, 
  User, Building, FileText, Download, Printer, CheckCircle2, XCircle
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { useToast } from "../../../components/ui/use-toast";
import { Progress } from "../../../components/ui/progress";

// Mock data for pending orders
const mockPendingOrders = [
  {
    id: 'BC-2025-001',
    title: 'Commande hebdomadaire cuisine',
    department: 'Cuisine',
    createdAt: '2025-05-15',
    status: 'pending',
    urgency: 'normal',
    waitingTime: 2, // days
    items: [
      { product: 'Poulet', category: 'Viandes', quantity: 10, unit: 'kg', price: 45.00 },
      { product: 'Tomates', category: 'Légumes', quantity: 5, unit: 'kg', price: 8.00 },
      { product: 'Oignons', category: 'Légumes', quantity: 3, unit: 'kg', price: 6.00 },
    ],
    total: 503.00,
    createdBy: 'John Doe',
    comments: [],
    progress: 0,
  },
  {
    id: 'BC-2025-006',
    title: 'Commande produits secs',
    department: 'Cuisine',
    createdAt: '2025-05-17',
    status: 'pending',
    urgency: 'low',
    waitingTime: 1, // days
    items: [
      { product: 'Farine', category: 'Céréales', quantity: 20, unit: 'kg', price: 10.00 },
      { product: 'Sucre', category: 'Épicerie', quantity: 15, unit: 'kg', price: 12.00 },
      { product: 'Sel', category: 'Épices', quantity: 5, unit: 'kg', price: 3.00 },
    ],
    total: 395.00,
    createdBy: 'John Doe',
    comments: [],
    progress: 0,
  },
  {
    id: 'BC-2025-008',
    title: 'Commande urgente bar',
    department: 'Bar',
    createdAt: '2025-05-19',
    status: 'pending',
    urgency: 'high',
    waitingTime: 0, // days
    items: [
      { product: 'Jus d\'orange', category: 'Boissons', quantity: 15, unit: 'L', price: 10.00 },
      { product: 'Eau minérale', category: 'Boissons', quantity: 30, unit: 'L', price: 5.00 },
      { product: 'Sirop de grenadine', category: 'Boissons', quantity: 5, unit: 'L', price: 20.00 },
    ],
    total: 400.00,
    createdBy: 'Jane Smith',
    comments: [],
    progress: 0,
  },
  {
    id: 'BC-2025-009',
    title: 'Commande fruits et légumes',
    department: 'Cuisine',
    createdAt: '2025-05-18',
    status: 'in_review',
    urgency: 'normal',
    waitingTime: 1, // days
    items: [
      { product: 'Pommes', category: 'Fruits', quantity: 10, unit: 'kg', price: 15.00 },
      { product: 'Bananes', category: 'Fruits', quantity: 8, unit: 'kg', price: 12.00 },
      { product: 'Carottes', category: 'Légumes', quantity: 7, unit: 'kg', price: 7.00 },
      { product: 'Courgettes', category: 'Légumes', quantity: 5, unit: 'kg', price: 9.00 },
    ],
    total: 343.00,
    createdBy: 'John Doe',
    comments: [],
    progress: 50,
  },
  {
    id: 'BC-2025-010',
    title: 'Commande produits laitiers',
    department: 'Pâtisserie',
    createdAt: '2025-05-18',
    status: 'in_review',
    urgency: 'normal',
    waitingTime: 1, // days
    items: [
      { product: 'Lait', category: 'Produits laitiers', quantity: 20, unit: 'L', price: 7.00 },
      { product: 'Beurre', category: 'Produits laitiers', quantity: 10, unit: 'kg', price: 60.00 },
      { product: 'Crème fraîche', category: 'Produits laitiers', quantity: 5, unit: 'L', price: 30.00 },
    ],
    total: 890.00,
    createdBy: 'Jane Smith',
    comments: [],
    progress: 75,
  },
];

const PendingOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders(mockPendingOrders);
    }, 500);
  }, []);
  
  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || order.department === departmentFilter;
    const matchesUrgency = urgencyFilter === 'all' || order.urgency === urgencyFilter;
    
    return matchesSearch && matchesDepartment && matchesUrgency;
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
    // Find the order by ID
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      toast({
        title: "Erreur",
        description: `Bon de commande ${orderId} introuvable`,
        variant: "destructive",
      });
      return;
    }
    
    // Create CSV content from the order items
    const header = "Référence,Produit,Catégorie,Quantité,Unité\n";
    const csvContent = header + order.items.map(item => 
      `${order.id},${item.product},${item.category},${item.quantity},${item.unit}`
    ).join("\n");
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link and trigger the download
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `bon_commande_${orderId}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Téléchargement terminé",
      description: `Le bon de commande ${orderId} a été téléchargé`,
    });
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
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'in_review':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En cours de validation</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bons en attente</h1>
          <p className="text-muted-foreground">
            Consultez l'état de vos bons de commande en attente de validation
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/vendor/orders')}>
          <FileText className="h-4 w-4 mr-2" />
          Tous mes bons
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
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Urgence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les urgences</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
                <SelectItem value="normal">Normale</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des bons en attente</CardTitle>
          <CardDescription>
            {filteredOrders.length} bons de commande en attente de validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Aucun bon en attente</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tous vos bons de commande ont été traités
              </p>
              <Button className="mt-4" onClick={() => navigate('/dashboard/vendor/orders/create')}>
                <FileText className="h-4 w-4 mr-2" />
                Créer un nouveau bon
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
                  <TableHead>Urgence</TableHead>
                  <TableHead>Statut</TableHead>
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
                    <TableCell>{getUrgencyBadge(order.urgency)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(order.status)}
                        {order.status === 'in_review' && (
                          <div className="w-full mt-1">
                            <Progress value={order.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </TableCell>
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Informations</TabsTrigger>
                <TabsTrigger value="products">Produits</TabsTrigger>
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
                  
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Progression de la validation</h4>
                    <div className="mt-2">
                      <Progress value={selectedOrder.status === 'in_review' ? selectedOrder.progress : 0} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Soumis</span>
                        <span>En cours de validation</span>
                        <span>Validé</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Temps d'attente</h4>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {selectedOrder.waitingTime === 0 
                          ? "Soumis aujourd'hui" 
                          : selectedOrder.waitingTime === 1 
                            ? "En attente depuis 1 jour" 
                            : `En attente depuis ${selectedOrder.waitingTime} jours`}
                      </span>
                    </div>
                  </div>
                  
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

export default PendingOrders;
