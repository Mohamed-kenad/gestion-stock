import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersAPI, notificationsAPI, suppliersAPI, purchasesAPI } from '../../../lib/api';
import { 
  FileText, Search, Filter, Calendar, Eye, RefreshCw, ShoppingCart, 
  Phone, Mail, Download, CheckCircle, Truck, X, Clock, DollarSign
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * ApprovedOrders component for the Achat department
 * This component handles approved bons from the Chef
 */
const ApprovedOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Purchase data recording state
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [purchaseDetails, setPurchaseDetails] = useState({
    invoiceNumber: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: addDays(new Date(), 7).toISOString().split('T')[0],
    supplierId: '',
    paymentMethod: 'bank_transfer',
    paymentStatus: 'pending',
    notes: '',
    actualTotal: 0
  });
  const [itemQuantities, setItemQuantities] = useState({});
  const [itemPrices, setItemPrices] = useState({});
  
  // Fetch approved orders using React Query
  const { 
    data: orders = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['orders', 'approved'],
    queryFn: () => ordersAPI.getAll(),
    select: (data) => data.filter(order => order.status === 'approved'),
    refetchInterval: 30000, // Refetch every 30 seconds to check for new approved orders
  });
  
  // Fetch suppliers for dropdown
  const {
    data: suppliersList = [],
    isLoading: suppliersLoading
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersAPI.getAll()
  });
  
  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: (orderData) => ordersAPI.update(orderData.id, orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Achat enregistré",
        description: "L'achat a été enregistré avec succès et le magasin a été notifié.",
      });
      setPurchaseDialogOpen(false);
      resetPurchaseForm();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'enregistrement: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Create purchase record mutation
  const createPurchaseMutation = useMutation({
    mutationFn: (purchaseData) => purchasesAPI.create(purchaseData),
    onSuccess: () => {
      console.log('Purchase record created successfully');
    },
    onError: (error) => {
      console.error('Error creating purchase record:', error);
    }
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: (notificationData) => notificationsAPI.create(notificationData),
    onSuccess: () => {
      console.log('Notification sent successfully');
    },
    onError: (error) => {
      console.error('Error sending notification:', error);
    }
  });
  
  // Handle view order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  // Handle processing an order (marking it as in progress)
  const handleProcessOrder = async (order) => {
    try {
      // Update order status to in_progress
      const updatedOrder = {
        ...order,
        status: 'processing',
        processingDate: new Date().toISOString().split('T')[0],
        processingBy: 'Achat Mohamed', // Would come from auth context in a real app
      };
      
      // Update the order
      await ordersAPI.update(order.id, updatedOrder);
      
      // Refresh the orders list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      toast({
        title: "Bon en cours de traitement",
        description: `Le bon ${order.id} est maintenant en cours de traitement.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Filter orders based on search term, filters, and date range
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (order.title && order.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.createdBy && order.createdBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.approvedBy && order.approvedBy.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = !departmentFilter || order.department === departmentFilter;
    
    // Date filtering
    let matchesDate = true;
    if (dateRange.from && dateRange.to && order.approvedAt) {
      const orderDate = new Date(order.approvedAt);
      matchesDate = orderDate >= dateRange.from && orderDate <= dateRange.to;
    }
    
    return matchesSearch && matchesDepartment && matchesDate;
  });
  
  // Get unique departments for filters
  const departments = [...new Set(orders.map(order => order.department).filter(Boolean))];
  
  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bons validés à traiter</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries(['orders'])}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
          <CardDescription>Filtrer les bons validés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="department">Département</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Tous les départements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les départements</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Date d'approbation</Label>
              <DatePickerWithRange
                date={dateRange}
                setDate={setDateRange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Bons validés</CardTitle>
          <CardDescription>
            {filteredOrders.length} bon(s) validé(s) en attente de traitement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Chargement des bons...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p>Aucun bon validé à traiter</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Date d'approbation</TableHead>
                    <TableHead>Approuvé par</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.title}</TableCell>
                      <TableCell>{order.department}</TableCell>
                      <TableCell>{order.approvedAt ? format(new Date(order.approvedAt), 'dd/MM/yyyy') : 'N/A'}</TableCell>
                      <TableCell>{order.approvedBy}</TableCell>
                      <TableCell>{order.total?.toFixed(2) || 0} DH</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleProcessOrder(order)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Traiter
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {filteredOrders.length > 0 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Math.max(1, currentPage - 1));
                      }} 
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === i + 1}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(i + 1);
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(Math.min(totalPages, currentPage + 1));
                      }} 
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails du bon</DialogTitle>
            <DialogDescription>
              Référence: {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Titre</h3>
                  <p>{selectedOrder.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Département</h3>
                  <p>{selectedOrder.department}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Créé par</h3>
                  <p>{selectedOrder.createdBy} ({selectedOrder.createdByRole})</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date d'approbation</h3>
                  <p>{selectedOrder.approvedAt ? format(new Date(selectedOrder.approvedAt), 'dd/MM/yyyy') : 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Approuvé par</h3>
                  <p>{selectedOrder.approvedBy || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total</h3>
                  <p>{selectedOrder.total?.toFixed(2) || 0} DH</p>
                </div>
              </div>
              
              {selectedOrder.validationNote && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Note de validation</h3>
                  <p className="p-2 bg-gray-50 rounded">{selectedOrder.validationNote}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Articles</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Unité</TableHead>
                        <TableHead>Prix unitaire</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items && selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.product || item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{item.price || item.unitPrice} DH</TableCell>
                          <TableCell>{item.total?.toFixed(2) || 0} DH</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Fermer
            </Button>
            {selectedOrder && (
              <Button variant="default" onClick={() => {
                setViewDialogOpen(false);
                handleProcessOrder(selectedOrder);
              }}>
                <ShoppingCart className="h-4 w-4 mr-1" />
                Traiter ce bon
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovedOrders;
