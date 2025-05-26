import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchasesAPI, inventoryAPI, stockMovementsAPI, notificationsAPI } from '../../../lib/api';
import { 
  ArrowLeft, Check, X, Truck, Package, FileText, AlertTriangle, DollarSign
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ReceptionManager = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for form
  const [receivedQuantities, setReceivedQuantities] = useState({});
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  
  // Fetch purchase details
  const { 
    data: purchase, 
    isLoading: purchaseLoading, 
    error: purchaseError 
  } = useQuery({
    queryKey: ['purchase', id],
    queryFn: () => purchasesAPI.getById(id),
    onSuccess: (data) => {
      // Initialize received quantities with expected quantities
      const initialQuantities = {};
      data.items?.forEach(item => {
        initialQuantities[item.id] = item.quantity;
      });
      setReceivedQuantities(initialQuantities);
    }
  });
  
  // Mutation for processing the reception
  const receptionMutation = useMutation({
    mutationFn: async (receptionData) => {
      // 1. Update purchase status to 'delivered'
      await purchasesAPI.update(id, { 
        status: 'delivered',
        receivedBy: 'Magasin2 Department',
        receivedAt: new Date().toISOString(),
        receivedNotes: notes,
        receivedItems: receptionData.items
      });
      
      // 2. Record stock movements (stock in)
      for (const item of receptionData.items) {
        await stockMovementsAPI.recordReceipt(
          purchase.orderId,
          [item],
          'Magasin2 Department'
        );
      }
      
      // 3. Notify Audite department to define selling prices
      await notificationsAPI.create({
        title: `Définition de prix requise`,
        message: `Une nouvelle livraison a été reçue (Achat #${id}). Veuillez définir les prix de vente pour les produits.`,
        type: 'info',
        recipientRole: 'auditor',
        reference: id,
        createdAt: new Date().toISOString(),
        read: false
      });
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Réception traitée avec succès",
        description: "Les produits ont été ajoutés à l'inventaire et l'Audite a été notifié pour définir les prix.",
        variant: "success"
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      
      // Navigate back to reception list
      navigate('/dashboard/magasin2/reception');
    },
    onError: (error) => {
      toast({
        title: "Erreur lors du traitement de la réception",
        description: error.message || "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
      setProcessing(false);
    }
  });
  
  // Handle quantity change for an item
  const handleQuantityChange = (itemId, quantity) => {
    setReceivedQuantities(prev => ({
      ...prev,
      [itemId]: parseInt(quantity) || 0
    }));
  };
  
  // Check if there are any discrepancies between expected and received quantities
  const hasDiscrepancies = () => {
    if (!purchase?.items) return false;
    
    return purchase.items.some(item => {
      const expected = item.quantity;
      const received = receivedQuantities[item.id] || 0;
      return expected !== received;
    });
  };
  
  // Prepare items for submission
  const prepareItemsForSubmission = () => {
    if (!purchase?.items) return [];
    
    return purchase.items.map(item => ({
      id: item.id,
      product: item.product,
      category: item.category,
      quantity: receivedQuantities[item.id] || 0,
      expectedQuantity: item.quantity,
      unit: item.unit,
      price: item.confirmedPrice || item.price || 0,
      total: (receivedQuantities[item.id] || 0) * (item.confirmedPrice || item.price || 0)
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (hasDiscrepancies()) {
      setShowConfirmDialog(true);
    } else {
      processReception();
    }
  };
  
  // Process the reception
  const processReception = () => {
    setProcessing(true);
    setShowConfirmDialog(false);
    
    const items = prepareItemsForSubmission();
    
    receptionMutation.mutate({
      purchaseId: purchase.id,
      items,
      notes
    });
  };
  
  // Loading state
  if (purchaseLoading) {
    return <div className="p-6">Chargement des données...</div>;
  }
  
  // Error state
  if (purchaseError) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement de la commande: {purchaseError.message}
      </div>
    );
  }
  
  // If purchase is not found
  if (!purchase) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Livraison non trouvée</CardTitle>
            <CardDescription>
              La livraison que vous recherchez n'existe pas ou n'est plus disponible.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/dashboard/magasin2/reception">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // If purchase is already delivered
  if (purchase.status === 'delivered') {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Livraison déjà traitée</CardTitle>
            <CardDescription>
              Cette livraison a déjà été reçue et traitée le {new Date(purchase.receivedAt).toLocaleDateString()}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Détails de la livraison</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Fournisseur</p>
                    <p className="font-medium">{purchase.supplier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bon d'origine</p>
                    <p className="font-medium">#{purchase.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reçu par</p>
                    <p className="font-medium">{purchase.receivedBy}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Articles reçus</h3>
                <Table className="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Quantité attendue</TableHead>
                      <TableHead>Quantité reçue</TableHead>
                      <TableHead>Unité</TableHead>
                      <TableHead>Prix unitaire</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchase.receivedItems?.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.expectedQuantity}</TableCell>
                        <TableCell>
                          {item.quantity}
                          {item.quantity !== item.expectedQuantity && (
                            <Badge className="ml-2 bg-amber-500">Différence</Badge>
                          )}
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.price?.toFixed(2) || 0} DH</TableCell>
                        <TableCell>{item.total?.toFixed(2) || 0} DH</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {purchase.receivedNotes && (
                <div>
                  <h3 className="text-lg font-medium">Notes</h3>
                  <p className="mt-2 p-4 bg-gray-50 rounded-md">{purchase.receivedNotes}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/dashboard/magasin2/reception">
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
        <h1 className="text-3xl font-bold">Réception de Livraison #{purchase.id}</h1>
        <Button asChild variant="outline">
          <Link to="/dashboard/magasin2/reception">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
      </div>
      
      {/* Purchase Details */}
      <Card>
        <CardHeader>
          <CardTitle>Détails de la Livraison</CardTitle>
          <CardDescription>
            Informations sur la livraison programmée par le département Achat2
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Fournisseur</h3>
              <p className="font-medium">{purchase.supplier}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Bon d'origine</h3>
              <p className="font-medium">#{purchase.orderId}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date de commande</h3>
              <p className="font-medium">{new Date(purchase.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Livraison prévue</h3>
              <p className="font-medium">{new Date(purchase.deliveryDate).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Traité par</h3>
              <p className="font-medium">{purchase.processedBy}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
              <p className="font-medium">{purchase.total?.toFixed(2) || 0} DH</p>
            </div>
          </div>
          
          {purchase.notes && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
              <p className="p-3 bg-gray-50 rounded-md mt-1">{purchase.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Reception Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Réception des Articles</CardTitle>
            <CardDescription>
              Vérifiez et confirmez les quantités reçues pour chaque article
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Items Table */}
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Quantité attendue</TableHead>
                    <TableHead>Quantité reçue</TableHead>
                    <TableHead>Unité</TableHead>
                    <TableHead>Prix unitaire</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchase.items?.map(item => {
                    const receivedQty = receivedQuantities[item.id] || 0;
                    const hasDiscrepancy = receivedQty !== item.quantity;
                    const itemPrice = item.confirmedPrice || item.price || 0;
                    const itemTotal = receivedQty * itemPrice;
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min="0"
                              value={receivedQty}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              className="w-20"
                            />
                            {hasDiscrepancy && (
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{itemPrice.toFixed(2)} DH</TableCell>
                        <TableCell>{itemTotal.toFixed(2)} DH</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {hasDiscrepancies() && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-amber-700">
                    Attention: Il y a des différences entre les quantités attendues et reçues. 
                    Vous devrez confirmer ces différences avant de finaliser la réception.
                  </p>
                </div>
              )}
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes de Réception</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des notes ou commentaires sur cette réception..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/dashboard/magasin2/reception')}
              disabled={processing}
            >
              <X className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowPricingDialog(true)}
                disabled={processing}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Demander Prix
              </Button>
              <Button 
                type="submit" 
                disabled={processing}
              >
                {processing ? (
                  <>Traitement en cours...</>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Confirmer la Réception
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
      
      {/* Confirmation Dialog for Discrepancies */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer les différences de quantité</DialogTitle>
            <DialogDescription>
              Vous avez indiqué des quantités différentes de celles attendues. 
              Veuillez confirmer que ces différences sont correctes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Attendu</TableHead>
                  <TableHead>Reçu</TableHead>
                  <TableHead>Différence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchase.items?.filter(item => {
                  const receivedQty = receivedQuantities[item.id] || 0;
                  return receivedQty !== item.quantity;
                }).map(item => {
                  const receivedQty = receivedQuantities[item.id] || 0;
                  const diff = receivedQty - item.quantity;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.product}</TableCell>
                      <TableCell>{item.quantity} {item.unit}</TableCell>
                      <TableCell>{receivedQty} {item.unit}</TableCell>
                      <TableCell className={diff < 0 ? 'text-red-500' : 'text-green-500'}>
                        {diff > 0 ? '+' : ''}{diff} {item.unit}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Revérifier
            </Button>
            <Button onClick={processReception}>
              Confirmer et Continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Pricing Request Dialog */}
      <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demande de Prix à l'Audite</DialogTitle>
            <DialogDescription>
              Cette action enverra une notification au département Audite pour définir 
              les prix de vente des produits reçus.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>
              Normalement, cette demande est envoyée automatiquement lors de la confirmation 
              de la réception. Voulez-vous envoyer cette demande maintenant, avant de finaliser 
              la réception?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPricingDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => {
              // Send notification to Audite
              notificationsAPI.create({
                title: `Définition de prix requise (Préliminaire)`,
                message: `Une nouvelle livraison est en cours de réception (Achat #${id}). Veuillez préparer les prix de vente pour les produits.`,
                type: 'info',
                recipientRole: 'auditor',
                reference: id,
                createdAt: new Date().toISOString(),
                read: false
              }).then(() => {
                toast({
                  title: "Demande envoyée",
                  description: "La demande de définition de prix a été envoyée au département Audite.",
                  variant: "success"
                });
                setShowPricingDialog(false);
              });
            }}>
              Envoyer la Demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceptionManager;
