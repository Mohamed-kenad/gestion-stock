import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { purchasesAPI, ordersAPI } from '../../../lib/api';
import { 
  ArrowLeft, Calendar, Truck, ShoppingCart, Clock, CheckCircle, FileText, Package, DollarSign
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

const PurchaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Fetch purchase details
  const { 
    data: purchase, 
    isLoading: purchaseLoading, 
    error: purchaseError 
  } = useQuery({
    queryKey: ['purchase', id],
    queryFn: () => purchasesAPI.getById(id)
  });
  
  // Fetch original order if available
  const { 
    data: originalOrder, 
    isLoading: orderLoading 
  } = useQuery({
    queryKey: ['order', purchase?.orderId],
    queryFn: () => ordersAPI.getById(purchase?.orderId),
    enabled: !!purchase?.orderId
  });
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'PPP', { locale: fr });
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-500">Programmé</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Livré</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Annulé</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Loading state
  if (purchaseLoading || orderLoading) {
    return <div className="p-6">Chargement des détails de l'achat...</div>;
  }
  
  // Error state
  if (purchaseError) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement des détails: {purchaseError.message}
      </div>
    );
  }
  
  // Not found state
  if (!purchase) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Achat non trouvé</CardTitle>
            <CardDescription>
              L'achat que vous recherchez n'existe pas ou n'est plus disponible.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/dashboard/achat2/purchases">
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
            <Link to="/dashboard/achat2/purchases">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Achat #{id}</h1>
          {getStatusBadge(purchase.status)}
        </div>
        
        {purchase.status === 'scheduled' && (
          <div className="flex space-x-2">
            <Button variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
              <CheckCircle className="mr-2 h-4 w-4" />
              Marquer comme livré
            </Button>
            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
              <Clock className="mr-2 h-4 w-4" />
              Reporter la livraison
            </Button>
          </div>
        )}
      </div>
      
      {/* Purchase Details */}
      <Card>
        <CardHeader>
          <CardTitle>{purchase.title || "Achat programmé"}</CardTitle>
          <CardDescription>
            Créé le {formatDate(purchase.createdAt)} par le département Achat2
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Statut</h3>
              <p className="font-medium flex items-center mt-1">
                {purchase.status === 'scheduled' && <Clock className="mr-2 h-4 w-4 text-blue-500" />}
                {purchase.status === 'delivered' && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                {purchase.status}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Fournisseur</h3>
              <p className="font-medium mt-1">{purchase.supplier}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
              <p className="font-medium mt-1">{purchase.total?.toFixed(2) || '0.00'} DH</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Demandé par</h3>
              <p className="font-medium mt-1">{purchase.requestedBy || 'Magasin2'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Bon d'origine</h3>
              <p className="font-medium mt-1">
                {purchase.orderId ? (
                  <Link to={`/dashboard/achat2/orders/${purchase.orderId}`} className="text-blue-600 hover:underline">
                    #{purchase.orderId}
                  </Link>
                ) : '-'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Livraison prévue</h3>
              <p className="font-medium mt-1">{formatDate(purchase.expectedDeliveryDate)}</p>
            </div>
            
            {purchase.deliveredAt && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Livré le</h3>
                <p className="font-medium mt-1">{formatDate(purchase.deliveredAt)}</p>
              </div>
            )}
            
            {purchase.priority && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Priorité</h3>
                <p className="font-medium mt-1">{purchase.priority}</p>
              </div>
            )}
            
            {purchase.notes && (
              <div className="col-span-3">
                <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                <p className="font-medium mt-1">{purchase.notes}</p>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Products */}
          <div>
            <h3 className="text-lg font-medium mb-3">Produits commandés</h3>
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
                {purchase.items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.product}</TableCell>
                    <TableCell>{item.quantity} {item.unit}</TableCell>
                    <TableCell>{(item.price || 0).toFixed(2)} DH</TableCell>
                    <TableCell>{((item.price || 0) * item.quantity).toFixed(2)} DH</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                  <TableCell className="font-bold">{purchase.total?.toFixed(2) || '0.00'} DH</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          {/* Original order info if available */}
          {originalOrder && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-medium mb-3">Demande d'origine</h3>
                <div className="bg-amber-50 p-4 rounded-md">
                  <p className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-amber-500" />
                    <span>Demande #{originalOrder.id} créée par {originalOrder.createdBy}</span>
                  </p>
                  <p className="flex items-center mt-2">
                    <Calendar className="mr-2 h-4 w-4 text-amber-500" />
                    <span>Créée le {formatDate(originalOrder.createdAt)}</span>
                  </p>
                  {originalOrder.priority && (
                    <p className="flex items-center mt-2">
                      <Clock className="mr-2 h-4 w-4 text-amber-500" />
                      <span>Priorité: {originalOrder.priority}</span>
                    </p>
                  )}
                  <div className="mt-3">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/dashboard/achat2/orders/${originalOrder.id}`}>
                        Voir la demande d'origine
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button asChild variant="outline">
            <Link to="/dashboard/achat2/purchases">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Link>
          </Button>
          
          {purchase.status === 'scheduled' && (
            <div className="flex space-x-2">
              <Button variant="default">
                <Package className="mr-2 h-4 w-4" />
                Générer bon de livraison
              </Button>
              <Button variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Enregistrer facture
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PurchaseDetails;
