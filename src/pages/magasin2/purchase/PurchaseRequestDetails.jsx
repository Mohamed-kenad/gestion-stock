import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersAPI } from '../../../lib/api';
import { 
  ArrowLeft, Calendar, Truck, ShoppingCart, Clock, CheckCircle, AlertTriangle
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PurchaseRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch purchase request details
  const { 
    data: request, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['purchaseRequest', id],
    queryFn: () => ordersAPI.getById(id)
  });
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">En attente</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">En traitement</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approuvé</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Livré</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">Basse</Badge>;
      case 'normal':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Normale</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Haute</Badge>;
      case 'urgent':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Urgente</Badge>;
      default:
        return <Badge variant="outline">Normale</Badge>;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'PPP', { locale: fr });
  };
  
  // Loading state
  if (isLoading) {
    return <div className="p-6">Chargement des détails de la demande...</div>;
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement des détails: {error.message}
      </div>
    );
  }
  
  // Not found state
  if (!request) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Demande non trouvée</CardTitle>
            <CardDescription>
              La demande d'achat que vous recherchez n'existe pas ou n'est plus disponible.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/dashboard/magasin2/purchase">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard/magasin2/purchase">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Demande d'Achat #{id}</h1>
          {getStatusBadge(request.status)}
          {getPriorityBadge(request.priority)}
        </div>
        
        {request.status === 'pending' && (
          <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Annuler la demande
          </Button>
        )}
      </div>
      
      {/* Request Details */}
      <Card>
        <CardHeader>
          <CardTitle>{request.title || "Demande d'achat"}</CardTitle>
          <CardDescription>
            Créée le {formatDate(request.createdAt)} par {request.createdBy}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Statut</h3>
              <p className="font-medium flex items-center mt-1">
                {request.status === 'pending' && <Clock className="mr-2 h-4 w-4 text-amber-500" />}
                {request.status === 'processing' && <Truck className="mr-2 h-4 w-4 text-blue-500" />}
                {request.status === 'delivered' && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                {request.status}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Priorité</h3>
              <p className="font-medium mt-1">{request.priority || 'normale'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
              <p className="font-medium mt-1">{request.total?.toFixed(2) || '0.00'} DH</p>
            </div>
            
            {request.processedBy && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Traité par</h3>
                <p className="font-medium mt-1">{request.processedBy}</p>
              </div>
            )}
            
            {request.processedAt && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date de traitement</h3>
                <p className="font-medium mt-1">{formatDate(request.processedAt)}</p>
              </div>
            )}
            
            {request.supplier && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Fournisseur</h3>
                <p className="font-medium mt-1">{request.supplier}</p>
              </div>
            )}
            
            {request.expectedDeliveryDate && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Livraison prévue</h3>
                <p className="font-medium mt-1">{formatDate(request.expectedDeliveryDate)}</p>
              </div>
            )}
            
            {request.notes && (
              <div className="col-span-3">
                <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                <p className="font-medium mt-1">{request.notes}</p>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Products */}
          <div>
            <h3 className="text-lg font-medium mb-3">Produits demandés</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Prix unitaire</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {request.items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.product || item.name}</TableCell>
                    <TableCell>{item.quantity} {item.unit}</TableCell>
                    <TableCell>{(item.price || 0).toFixed(2)} DH</TableCell>
                    <TableCell>{((item.price || 0) * item.quantity).toFixed(2)} DH</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                  <TableCell className="font-bold">{request.total?.toFixed(2) || request.totalConfirmed?.toFixed(2) || '0.00'} DH</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          {/* Purchase info if available */}
          {request.purchaseId && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-3">Informations de commande</h3>
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="flex items-center">
                    <ShoppingCart className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Commande #{request.purchaseId} créée par Achat2</span>
                  </p>
                  {request.expectedDeliveryDate && (
                    <p className="flex items-center mt-2">
                      <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                      <span>Livraison prévue le {formatDate(request.expectedDeliveryDate)}</span>
                    </p>
                  )}
                  {request.supplier && (
                    <p className="flex items-center mt-2">
                      <Truck className="mr-2 h-4 w-4 text-blue-500" />
                      <span>Fournisseur: {request.supplier}</span>
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button asChild variant="outline">
            <Link to="/dashboard/magasin2/purchase">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>
          
          {request.status === 'pending' && (
            <Button variant="default">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Relancer Achat2
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PurchaseRequestDetails;
