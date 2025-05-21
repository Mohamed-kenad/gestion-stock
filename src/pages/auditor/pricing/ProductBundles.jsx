import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Edit, Trash, Save, X, Search, 
  ShoppingCart, Tag, DollarSign, Percent
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
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Separator } from "../../../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useToast } from "../../../components/ui/use-toast";

// Mock data for product bundles
const mockBundles = [
  {
    id: 1,
    name: "Pack Cocktail Premium",
    description: "Ensemble complet pour cocktails premium",
    products: [
      { id: 4, name: "Vodka premium", quantity: 1, unitPrice: 42.50 },
      { id: 5, name: "Rhum ambré", quantity: 1, unitPrice: 48.90 },
      { id: 6, name: "Gin London Dry", quantity: 1, unitPrice: 44.50 }
    ],
    individualTotal: 135.90,
    bundlePrice: 119.99,
    discount: 11.71,
    status: "active"
  },
  {
    id: 2,
    name: "Kit Pâtisserie Basique",
    description: "Ingrédients essentiels pour la pâtisserie",
    products: [
      { id: 1, name: "Farine de blé T55", quantity: 2, unitPrice: 4.75 },
      { id: 2, name: "Sucre en poudre", quantity: 1, unitPrice: 3.25 }
    ],
    individualTotal: 12.75,
    bundlePrice: 11.50,
    discount: 9.80,
    status: "active"
  },
  {
    id: 3,
    name: "Kit Nettoyage Cuisine",
    description: "Produits d'entretien pour cuisine professionnelle",
    products: [
      { id: 7, name: "Détergent multi-surfaces", quantity: 2, unitPrice: 5.90 },
      { id: 8, name: "Désinfectant alimentaire", quantity: 1, unitPrice: 7.90 }
    ],
    individualTotal: 19.70,
    bundlePrice: 17.50,
    discount: 11.17,
    status: "inactive"
  }
];

// Mock data for all available products
const mockProducts = [
  {
    id: 1,
    name: 'Farine de blé T55',
    category: 'Ingrédients',
    unit: 'kg',
    sellingPrice: 4.75,
    stock: 120
  },
  {
    id: 2,
    name: 'Sucre en poudre',
    category: 'Ingrédients',
    unit: 'kg',
    sellingPrice: 3.25,
    stock: 85
  },
  {
    id: 3,
    name: 'Huile d\'olive extra vierge',
    category: 'Ingrédients',
    unit: 'L',
    sellingPrice: 15.90,
    stock: 45
  },
  {
    id: 4,
    name: 'Vodka premium',
    category: 'Boissons',
    unit: 'bouteille',
    sellingPrice: 42.50,
    stock: 32
  },
  {
    id: 5,
    name: 'Rhum ambré',
    category: 'Boissons',
    unit: 'bouteille',
    sellingPrice: 48.90,
    stock: 28
  },
  {
    id: 6,
    name: 'Gin London Dry',
    category: 'Boissons',
    unit: 'bouteille',
    sellingPrice: 44.50,
    stock: 35
  },
  {
    id: 7,
    name: 'Détergent multi-surfaces',
    category: 'Entretien',
    unit: 'L',
    sellingPrice: 5.90,
    stock: 60
  },
  {
    id: 8,
    name: 'Désinfectant alimentaire',
    category: 'Entretien',
    unit: 'L',
    sellingPrice: 7.90,
    stock: 48
  }
];

const ProductBundles = () => {
  const { toast } = useToast();
  
  const [bundles, setBundles] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // New/Edit bundle dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState(null);
  
  // Form state
  const [bundleName, setBundleName] = useState('');
  const [bundleDescription, setBundleDescription] = useState('');
  const [bundleProducts, setBundleProducts] = useState([]);
  const [bundlePrice, setBundlePrice] = useState('');
  const [bundleStatus, setBundleStatus] = useState('active');
  
  // Product selection dialog
  const [isProductSelectionOpen, setIsProductSelectionOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productQuantity, setProductQuantity] = useState(1);
  
  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setBundles(mockBundles);
      setProducts(mockProducts);
      setLoading(false);
    }, 800);
  }, []);
  
  // Filter bundles based on search term and status
  const filteredBundles = bundles.filter(bundle => {
    const matchesSearch = bundle.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         bundle.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || bundle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  // Calculate individual total price
  const calculateIndividualTotal = (products) => {
    return products.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };
  
  // Calculate discount percentage
  const calculateDiscount = (individualTotal, bundlePrice) => {
    if (!individualTotal || !bundlePrice) return 0;
    return ((individualTotal - bundlePrice) / individualTotal) * 100;
  };
  
  // Open create/edit dialog
  const handleOpenDialog = (bundle = null) => {
    if (bundle) {
      // Edit existing bundle
      setIsEditing(true);
      setSelectedBundle(bundle);
      setBundleName(bundle.name);
      setBundleDescription(bundle.description);
      setBundleProducts([...bundle.products]);
      setBundlePrice(bundle.bundlePrice.toString());
      setBundleStatus(bundle.status);
    } else {
      // Create new bundle
      setIsEditing(false);
      setSelectedBundle(null);
      setBundleName('');
      setBundleDescription('');
      setBundleProducts([]);
      setBundlePrice('');
      setBundleStatus('active');
    }
    setIsDialogOpen(true);
  };
  
  // Open product selection dialog
  const handleOpenProductSelection = () => {
    setSelectedProduct(null);
    setProductQuantity(1);
    setIsProductSelectionOpen(true);
  };
  
  // Add product to bundle
  const handleAddProduct = () => {
    if (!selectedProduct || productQuantity < 1) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un produit et une quantité valide.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if product already exists in bundle
    const existingProductIndex = bundleProducts.findIndex(item => item.id === selectedProduct.id);
    
    if (existingProductIndex >= 0) {
      // Update quantity if product already exists
      const updatedProducts = [...bundleProducts];
      updatedProducts[existingProductIndex].quantity += productQuantity;
      setBundleProducts(updatedProducts);
    } else {
      // Add new product
      setBundleProducts([
        ...bundleProducts,
        {
          id: selectedProduct.id,
          name: selectedProduct.name,
          quantity: productQuantity,
          unitPrice: selectedProduct.sellingPrice
        }
      ]);
    }
    
    setIsProductSelectionOpen(false);
    
    toast({
      title: "Produit ajouté",
      description: `${productQuantity} x ${selectedProduct.name} ajouté au pack.`,
    });
  };
  
  // Remove product from bundle
  const handleRemoveProduct = (productId) => {
    setBundleProducts(bundleProducts.filter(item => item.id !== productId));
  };
  
  // Save bundle
  const handleSaveBundle = () => {
    if (!bundleName || !bundleDescription || bundleProducts.length === 0 || !bundlePrice) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires et ajouter au moins un produit.",
        variant: "destructive",
      });
      return;
    }
    
    const individualTotal = calculateIndividualTotal(bundleProducts);
    const discount = calculateDiscount(individualTotal, parseFloat(bundlePrice));
    
    const newBundle = {
      id: isEditing ? selectedBundle.id : bundles.length + 1,
      name: bundleName,
      description: bundleDescription,
      products: [...bundleProducts],
      individualTotal: individualTotal,
      bundlePrice: parseFloat(bundlePrice),
      discount: parseFloat(discount.toFixed(2)),
      status: bundleStatus
    };
    
    if (isEditing) {
      // Update existing bundle
      setBundles(bundles.map(bundle => bundle.id === selectedBundle.id ? newBundle : bundle));
      toast({
        title: "Pack mis à jour",
        description: `Le pack "${bundleName}" a été mis à jour avec succès.`,
      });
    } else {
      // Create new bundle
      setBundles([...bundles, newBundle]);
      toast({
        title: "Pack créé",
        description: `Le pack "${bundleName}" a été créé avec succès.`,
      });
    }
    
    setIsDialogOpen(false);
  };
  
  // Delete bundle
  const handleDeleteBundle = (bundleId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce pack ?")) {
      setBundles(bundles.filter(bundle => bundle.id !== bundleId));
      toast({
        title: "Pack supprimé",
        description: "Le pack a été supprimé avec succès.",
      });
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des packs produits</h1>
        <Button onClick={() => handleOpenDialog()} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Créer un nouveau pack
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Liste des packs produits</CardTitle>
          <CardDescription>
            Gérez les packs et montages de produits avec tarification spéciale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher un pack..."
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
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
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
                    <TableHead>Nom du pack</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Produits</TableHead>
                    <TableHead>Prix individuel</TableHead>
                    <TableHead>Prix du pack</TableHead>
                    <TableHead>Économie</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBundles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        Aucun pack trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBundles.map((bundle) => (
                      <TableRow key={bundle.id}>
                        <TableCell className="font-medium">{bundle.name}</TableCell>
                        <TableCell>{bundle.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {bundle.products.map((product) => (
                              <span key={product.id} className="text-sm">
                                {product.quantity} x {product.name}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{bundle.individualTotal.toFixed(2)} DH</TableCell>
                        <TableCell className="font-medium">{bundle.bundlePrice.toFixed(2)} DH</TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">
                            {bundle.discount.toFixed(2)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {bundle.status === 'active' ? (
                            <Badge className="bg-green-500">Actif</Badge>
                          ) : (
                            <Badge className="bg-gray-500">Inactif</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleOpenDialog(bundle)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="text-red-500"
                              onClick={() => handleDeleteBundle(bundle.id)}
                            >
                              <Trash className="h-4 w-4" />
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
      
      {/* Create/Edit Bundle Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Modifier un pack" : "Créer un nouveau pack"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Modifiez les détails du pack et sa composition." 
                : "Créez un nouveau pack de produits avec une tarification spéciale."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bundle-name">Nom du pack</Label>
                <Input
                  id="bundle-name"
                  placeholder="Nom du pack"
                  value={bundleName}
                  onChange={(e) => setBundleName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bundle-status">Statut</Label>
                <Select 
                  defaultValue="active"
                  value={bundleStatus || 'active'} 
                  onValueChange={(value) => {
                    if (value && value.trim() !== '') {
                      setBundleStatus(value);
                    }
                  }}
                >
                  <SelectTrigger id="bundle-status">
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bundle-description">Description</Label>
              <Textarea
                id="bundle-description"
                placeholder="Description du pack"
                value={bundleDescription}
                onChange={(e) => setBundleDescription(e.target.value)}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Produits inclus</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleOpenProductSelection}
                >
                  <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
                </Button>
              </div>
              
              {bundleProducts.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Aucun produit ajouté au pack
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Prix unitaire</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bundleProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                          <TableCell>{product.unitPrice.toFixed(2)} DH</TableCell>
                          <TableCell>{(product.quantity * product.unitPrice).toFixed(2)} DH</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-red-500"
                              onClick={() => handleRemoveProduct(product.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">
                          Total individuel:
                        </TableCell>
                        <TableCell className="font-medium">
                          {calculateIndividualTotal(bundleProducts).toFixed(2)} DH
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bundle-price">
                  Prix du pack
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="bundle-price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-8"
                    value={bundlePrice}
                    onChange={(e) => setBundlePrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Économie</Label>
                <div className="h-10 px-3 py-2 rounded-md border border-input bg-background flex items-center">
                  <Percent className="h-4 w-4 text-gray-500 mr-2" />
                  <span>
                    {calculateDiscount(
                      calculateIndividualTotal(bundleProducts),
                      parseFloat(bundlePrice) || 0
                    ).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleSaveBundle}>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? "Mettre à jour" : "Créer le pack"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Product Selection Dialog */}
      <Dialog open={isProductSelectionOpen} onOpenChange={setIsProductSelectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un produit</DialogTitle>
            <DialogDescription>
              Sélectionnez un produit et la quantité à ajouter au pack.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product-select">Produit</Label>
              <Select 
                onValueChange={(value) => {
                  if (value && value.trim() !== '') {
                    const foundProduct = products.find(p => p.id === parseInt(value));
                    if (foundProduct) {
                      setSelectedProduct(foundProduct);
                    }
                  }
                }}
              >
                <SelectTrigger id="product-select">
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {products
                    .filter(product => {
                      return product && 
                             product.id && 
                             product.id.toString() !== '' && 
                             product.name && 
                             product.sellingPrice;
                    })
                    .map((product) => {
                      const valueStr = product.id.toString();
                      return valueStr ? (
                        <SelectItem key={product.id} value={valueStr}>
                          {product.name} - {product.sellingPrice} DH
                        </SelectItem>
                      ) : null;
                    })
                    .filter(Boolean)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product-quantity">Quantité</Label>
              <Input
                id="product-quantity"
                type="number"
                min="1"
                value={productQuantity}
                onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleAddProduct}>
              Ajouter au pack
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductBundles;
