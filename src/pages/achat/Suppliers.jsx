import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Edit, Trash2, RefreshCw, Phone, Mail, MapPin
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Mock data
const mockSuppliers = [
  { 
    id: 1, 
    name: 'Fournisseur A', 
    contact: 'Ahmed Khalid',
    email: 'contact@fournisseura.com', 
    phone: '+212 661 234 567',
    address: '123 Rue Mohammed V, Casablanca',
    category: 'Produits alimentaires',
    status: 'active',
    notes: 'Fournisseur principal pour les produits laitiers et les légumes.',
    createdAt: '2025-01-15',
    products: ['Produits laitiers', 'Légumes', 'Fruits']
  },
  { 
    id: 2, 
    name: 'Fournisseur B', 
    contact: 'Fatima Zahra',
    email: 'contact@fournisseurb.com', 
    phone: '+212 662 345 678',
    address: '45 Avenue Hassan II, Rabat',
    category: 'Fruits et légumes',
    status: 'active',
    notes: 'Spécialisé dans les fruits et légumes frais.',
    createdAt: '2025-02-10',
    products: ['Légumes', 'Fruits']
  },
  { 
    id: 3, 
    name: 'Fournisseur C', 
    contact: 'Karim Benjelloun',
    email: 'contact@fournisseurc.com', 
    phone: '+212 663 456 789',
    address: '78 Boulevard Anfa, Casablanca',
    category: 'Viandes',
    status: 'active',
    notes: 'Fournisseur de viandes fraîches et produits carnés.',
    createdAt: '2025-01-20',
    products: ['Viandes', 'Volailles']
  },
  { 
    id: 4, 
    name: 'Fournisseur D', 
    contact: 'Nadia Tazi',
    email: 'contact@fournisseurd.com', 
    phone: '+212 664 567 890',
    address: '12 Rue Ibn Battouta, Marrakech',
    category: 'Épices et condiments',
    status: 'active',
    notes: 'Spécialisé dans les épices et condiments traditionnels.',
    createdAt: '2025-03-05',
    products: ['Épices', 'Condiments', 'Herbes aromatiques']
  },
  { 
    id: 5, 
    name: 'Fournisseur E', 
    contact: 'Mohammed Alami',
    email: 'contact@fournisseure.com', 
    phone: '+212 665 678 901',
    address: '34 Avenue Mohammed VI, Tanger',
    category: 'Boissons',
    status: 'active',
    notes: 'Fournisseur de boissons alcoolisées et non-alcoolisées.',
    createdAt: '2025-02-25',
    products: ['Boissons alcoolisées', 'Boissons non-alcoolisées', 'Jus']
  },
  { 
    id: 6, 
    name: 'Fournisseur F', 
    contact: 'Samir Bennani',
    email: 'contact@fournisseurf.com', 
    phone: '+212 666 789 012',
    address: '56 Rue Moulay Ismail, Fès',
    category: 'Produits d\'entretien',
    status: 'inactive',
    notes: 'Fournisseur de produits d\'entretien et de nettoyage.',
    createdAt: '2025-01-30',
    products: ['Produits d\'entretien', 'Produits de nettoyage']
  },
];

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Supplier form
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    status: 'active',
    notes: '',
    products: []
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSuppliers(mockSuppliers);
      setLoading(false);
    }, 800);
  }, []);

  // Filter suppliers based on search term and filters
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    const matchesCategory = categoryFilter === '' || supplier.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories for filter dropdowns
  const categories = [...new Set(suppliers.map(supplier => supplier.category))];

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Open add dialog
  const openAddDialog = () => {
    setFormData({
      name: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
      category: '',
      status: 'active',
      notes: '',
      products: []
    });
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      category: supplier.category,
      status: supplier.status,
      notes: supplier.notes,
      products: supplier.products
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  // Handle add supplier
  const handleAddSupplier = () => {
    const newSupplier = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setSuppliers([...suppliers, newSupplier]);
    setIsAddDialogOpen(false);
    
    // Show success message
    alert('Fournisseur ajouté avec succès');
  };

  // Handle edit supplier
  const handleEditSupplier = () => {
    if (!selectedSupplier) return;

    const updatedSuppliers = suppliers.map(supplier => 
      supplier.id === selectedSupplier.id 
        ? { ...supplier, ...formData }
        : supplier
    );

    setSuppliers(updatedSuppliers);
    setIsEditDialogOpen(false);
    
    // Show success message
    alert('Fournisseur modifié avec succès');
  };

  // Handle delete supplier
  const handleDeleteSupplier = () => {
    if (!selectedSupplier) return;

    const updatedSuppliers = suppliers.filter(supplier => supplier.id !== selectedSupplier.id);
    setSuppliers(updatedSuppliers);
    setIsDeleteDialogOpen(false);
    
    // Show success message
    alert('Fournisseur supprimé avec succès');
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSuppliers(mockSuppliers);
      setLoading(false);
    }, 800);
  };

  // Status badge color mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Actif</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Inactif</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fournisseurs</h1>
          <p className="text-muted-foreground">
            Gérez vos fournisseurs et leurs informations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un fournisseur
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des fournisseurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fournisseurs actifs</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.filter(s => s.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fournisseurs inactifs</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.filter(s => s.status === 'inactive').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un fournisseur..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Toutes les catégories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des fournisseurs</CardTitle>
          <CardDescription>
            Gérez vos fournisseurs et leurs informations de contact
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.name}</TableCell>
                        <TableCell>{supplier.contact}</TableCell>
                        <TableCell>{supplier.email}</TableCell>
                        <TableCell>{supplier.phone}</TableCell>
                        <TableCell>{supplier.category}</TableCell>
                        <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openEditDialog(supplier)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openDeleteDialog(supplier)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Aucun fournisseur trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Supplier Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un fournisseur</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau fournisseur à votre liste
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du fournisseur</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nom du fournisseur"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Personne de contact</Label>
              <Input
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                placeholder="Nom du contact"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+212 6XX XXX XXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Ex: Produits alimentaires"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
                name="status"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Adresse complète"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Notes supplémentaires sur ce fournisseur"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddSupplier}>
              Ajouter le fournisseur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Supplier Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier un fournisseur</DialogTitle>
            <DialogDescription>
              Modifiez les informations du fournisseur
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom du fournisseur</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nom du fournisseur"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contact">Personne de contact</Label>
              <Input
                id="edit-contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                placeholder="Nom du contact"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+212 6XX XXX XXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Catégorie</Label>
              <Input
                id="edit-category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Ex: Produits alimentaires"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Statut</Label>
              <select
                id="edit-status"
                name="status"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-address">Adresse</Label>
              <Input
                id="edit-address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Adresse complète"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Notes supplémentaires sur ce fournisseur"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditSupplier}>
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Supplier Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le fournisseur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {selectedSupplier && (
            <div className="py-4">
              <p className="font-medium">{selectedSupplier.name}</p>
              <p className="text-sm text-muted-foreground">{selectedSupplier.email}</p>
              <p className="text-sm text-muted-foreground">{selectedSupplier.phone}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteSupplier}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suppliers;
