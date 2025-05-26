import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { inventoryAPI, stockMovementsAPI, ordersAPI } from '../../../lib/api';
import { 
  Users, Search, ArrowUpDown, FileText, ArrowUpCircle, Check, X
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const VendorRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [sortField, setSortField] = useState('requestDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [itemAvailability, setItemAvailability] = useState({});
  
  // Fetch inventory data
  const { 
    data: inventory = [], 
    isLoading: inventoryLoading 
  } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryAPI.getAll()
  });
  
  // Fetch vendor requests using the API
  const { 
    data: vendorRequests = [], 
    isLoading: requestsLoading,
    error: requestsError,
    refetch
  } = useQuery({
    queryKey: ['vendorRequests', statusFilter],
    queryFn: async () => {
      console.log('Fetching vendor requests with status:', statusFilter);
      const data = await ordersAPI.getVendorRequests(statusFilter);
      console.log('Vendor requests data:', data);
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0
  });
  
  // Force refetch on component mount
  useEffect(() => {
    refetch();
  }, [refetch]);
  
  // Mutation for processing a vendor request
  const processRequestMutation = useMutation({
    mutationFn: async (data) => {
      const { request, items, action, newStatus } = data;
      
      // Update the order status in the database
      await ordersAPI.update(request.id, {
        ...request,
        status: newStatus,
        processedAt: new Date().toISOString(),
        processedBy: 'Magasin2 Department'
      });
      
      if (action === 'reject') {
        // For rejected requests, we just update the status
        return { success: true, message: 'Demande rejetée avec succès' };
      }
      
      // For fulfilled requests, process each item
      for (const item of items) {
        if (item.provide > 0) {
          // Find the product in inventory
          const product = inventory.find(p => p.name === item.product);
          
          if (product) {
            // Update inventory quantity
            await inventoryAPI.update(product.id, {
              ...product,
              quantity: Math.max(0, product.quantity - item.provide)
            });
            
            // Record stock movement
            await stockMovementsAPI.create({
              productId: product.id,
              product: product.name,
              type: 'out',
              quantity: item.provide,
              date: new Date().toISOString(),
              unit: item.unit || product.unit,
              createdBy: 'Magasin2 Department',
              notes: `Fourni au vendeur ${request.vendorName} (${request.department}) - Demande #${request.id}`
            });
          }
        }
      }
      
      return { success: true, message: 'Demande traitée avec succès' };
    },
    onSuccess: (data) => {
      toast({
        title: data.message || "Demande traitée",
        description: "La demande a été mise à jour dans le système.",
      });
      
      // Refetch requests to update the UI
      queryClient.invalidateQueries(['vendorRequests']);
      queryClient.invalidateQueries(['inventory']);
      
      // Reset state
      setSelectedRequest(null);
      setShowProcessDialog(false);
      setItemAvailability({});
      
      // Force refetch to ensure we have the latest data
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du traitement de la demande.",
        variant: "destructive"
      });
    }
  });
  
  // Filter requests based on search and status
  const filteredRequests = vendorRequests.filter(request => {
    const matchesSearch = 
      request.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle dates
    if (sortField.includes('Date')) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Handle nulls
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    // Compare
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Toggle sort
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle opening the process dialog
  const handleOpenProcessDialog = (request) => {
    setSelectedRequest(request);
    
    // Check availability for each item
    const availability = {};
    
    request.items.forEach(item => {
      const product = inventory.find(p => p.name === item.product);
      
      if (product) {
        availability[item.id] = {
          available: product.quantity,
          provide: Math.min(item.quantity, product.quantity),
          canFulfill: product.quantity >= item.quantity
        };
      } else {
        availability[item.id] = {
          available: 0,
          provide: 0,
          canFulfill: false
        };
      }
    });
    
    setItemAvailability(availability);
    setShowProcessDialog(true);
  };
  
  // Handle providing quantity change
  const handleProvideChange = (itemId, quantity) => {
    setItemAvailability(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        provide: Math.min(parseInt(quantity) || 0, prev[itemId].available)
      }
    }));
  };
  
  // Check if request can be fulfilled
  const canFulfillRequest = () => {
    if (!selectedRequest) return false;
    
    return selectedRequest.items.some(item => {
      const availability = itemAvailability[item.id];
      return availability && availability.provide > 0;
    });
  };
  
  // Handle request processing
  const handleProcessRequest = (action) => {
    try {
      // Get the original order from the database
      const requestToProcess = selectedRequest;
      
      // Create a new status based on the action
      const newStatus = action === 'fulfill' ? 'completed' : 'rejected';
      
      // Update items with provided quantities
      const updatedItems = requestToProcess.items.map(item => ({
        ...item,
        provide: itemAvailability[item.id]?.provide || 0,
        provided: itemAvailability[item.id]?.provide || 0 // Add provided field for tracking
      }));
      
      // Show processing toast
      toast({
        title: action === 'fulfill' ? "Traitement de la demande" : "Rejet de la demande",
        description: "Veuillez patienter...",
        variant: "default",
      });
      
      // Process the request
      processRequestMutation.mutate({
        request: requestToProcess,
        items: updatedItems,
        action,
        newStatus
      });
      
      setShowProcessDialog(false);
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  // Loading state
  if (requestsLoading || inventoryLoading) {
    return <div className="p-6">Chargement des demandes...</div>;
  }
  
  // Error state
  if (requestsError) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement des données: {requestsError.message}
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Demandes des Vendeurs</h1>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to="/dashboard/magasin2">
              <FileText className="mr-2 h-4 w-4" />
              Tableau de Bord
            </Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard/magasin2/inventory">
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Gestion Stock
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="pending" onValueChange={setStatusFilter}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">En Attente</TabsTrigger>
          <TabsTrigger value="completed">Complétées</TabsTrigger>
          <TabsTrigger value="rejected">Rejetées</TabsTrigger>
        </TabsList>
        
        <div className="mt-4 space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Filtres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par ID, vendeur ou département..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Demandes ({sortedRequests.length})</CardTitle>
              <CardDescription>
                {statusFilter === 'pending' && "Demandes en attente de traitement"}
                {statusFilter === 'completed' && "Demandes traitées et complétées"}
                {statusFilter === 'rejected' && "Demandes rejetées"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sortedRequests.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">Aucune demande trouvée</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('id')}>
                          ID
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('vendorName')}>
                          Vendeur
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('department')}>
                          Département
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" onClick={() => toggleSort('requestDate')}>
                          Date Demande
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Articles</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedRequests.map(request => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.id}</TableCell>
                        <TableCell>{request.vendorName}</TableCell>
                        <TableCell>{request.department}</TableCell>
                        <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell>{request.items.length}</TableCell>
                        <TableCell>
                          <Badge className={
                            request.status === 'pending' ? 'bg-blue-500' : 
                            request.status === 'completed' ? 'bg-green-500' : 
                            'bg-red-500'
                          }>
                            {request.status === 'pending' ? 'En attente' : 
                             request.status === 'completed' ? 'Complétée' : 
                             'Rejetée'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {request.status === 'pending' ? (
                            <Button 
                              size="sm"
                              onClick={() => handleOpenProcessDialog(request)}
                            >
                              Traiter
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleOpenProcessDialog(request)}
                            >
                              Détails
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>
      
      {/* Process Request Dialog */}
      {selectedRequest && (
        <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {selectedRequest.status === 'pending' 
                  ? 'Traiter la Demande' 
                  : 'Détails de la Demande'}
              </DialogTitle>
              <DialogDescription>
                {selectedRequest.status === 'pending' 
                  ? 'Vérifiez la disponibilité et fournissez les articles demandés' 
                  : `Demande ${selectedRequest.status === 'completed' ? 'complétée' : 'rejetée'}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Vendeur</p>
                  <p className="font-medium">{selectedRequest.vendorName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Département</p>
                  <p className="font-medium">{selectedRequest.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date de Demande</p>
                  <p className="font-medium">{new Date(selectedRequest.requestDate).toLocaleDateString()}</p>
                </div>
                {selectedRequest.status === 'completed' && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date de Complétion</p>
                    <p className="font-medium">{new Date(selectedRequest.completedDate).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedRequest.status === 'rejected' && (
                  <div>
                    <p className="text-sm text-muted-foreground">Date de Rejet</p>
                    <p className="font-medium">{new Date(selectedRequest.rejectedDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
              
              {selectedRequest.rejectionReason && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">Raison du Rejet</p>
                  <p className="font-medium">{selectedRequest.rejectionReason}</p>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Articles Demandés</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Quantité Demandée</TableHead>
                      {selectedRequest.status === 'pending' && (
                        <>
                          <TableHead>Disponible</TableHead>
                          <TableHead>À Fournir</TableHead>
                        </>
                      )}
                      {selectedRequest.status === 'completed' && (
                        <TableHead>Quantité Fournie</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRequest.items.map(item => {
                      const availability = itemAvailability[item.id];
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.product}</TableCell>
                          <TableCell>{item.quantity} {item.unit}</TableCell>
                          
                          {selectedRequest.status === 'pending' && availability && (
                            <>
                              <TableCell>
                                {availability.available} {item.unit}
                                {availability.available < item.quantity && (
                                  <Badge className="ml-2 bg-amber-500">Insuffisant</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  max={availability.available}
                                  value={availability.provide}
                                  onChange={(e) => handleProvideChange(item.id, e.target.value)}
                                  className="w-20"
                                  disabled={selectedRequest.status !== 'pending'}
                                />
                              </TableCell>
                            </>
                          )}
                          
                          {selectedRequest.status === 'completed' && (
                            <TableCell>{item.provided} {item.unit}</TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <DialogFooter>
              {selectedRequest.status === 'pending' ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowProcessDialog(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleProcessRequest('reject')}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Rejeter
                  </Button>
                  <Button 
                    onClick={() => handleProcessRequest('fulfill')}
                    disabled={!canFulfillRequest()}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Fournir
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setShowProcessDialog(false)}
                >
                  Fermer
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default VendorRequests;
