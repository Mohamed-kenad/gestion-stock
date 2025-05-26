import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersAPI } from '../../../lib/api';
import { 
  Users, Search, Plus, Edit, Trash, ArrowUpDown, FileText
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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

const Suppliers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  
  // Form setup
  const form = useForm({
    defaultValues: {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    }
  });
  
  // Fetch suppliers
  const { 
    data: suppliers = [], 
    isLoading: suppliersLoading, 
    error: suppliersError 
  } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersAPI.getAll()
  });
  
  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => suppliersAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Fournisseur ajouté",
        description: "Le fournisseur a été ajouté avec succès.",
        variant: "success"
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout du fournisseur.",
        variant: "destructive"
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => suppliersAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Fournisseur mis à jour",
        description: "Le fournisseur a été mis à jour avec succès.",
        variant: "success"
      });
      setEditingSupplier(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du fournisseur.",
        variant: "destructive"
      });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id) => suppliersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Fournisseur supprimé",
        description: "Le fournisseur a été supprimé avec succès.",
        variant: "success"
      });
      setIsDeleteDialogOpen(false);
      setSupplierToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression du fournisseur.",
        variant: "destructive"
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data) => {
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data });
    } else {
      createMutation.mutate({
        ...data,
        createdAt: new Date().toISOString()
      });
    }
  };
  
  // Handle edit supplier
  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    form.reset({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      notes: supplier.notes
    });
  };
  
  // Handle delete supplier
  const handleDeleteSupplier = (supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };
  
  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.includes(searchTerm);
    
    return matchesSearch;
  });
  
  // Sort suppliers
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle nulls
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    // String comparison
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
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
  
  // Loading state
  if (suppliersLoading) {
    return <div className="p-6">Chargement des fournisseurs...</div>;
  }
  
  // Error state
  if (suppliersError) {
    return (
      <div className="p-6 text-red-500">
        Erreur lors du chargement des fournisseurs: {suppliersError.message}
      </div>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Fournisseurs</h1>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to="/dashboard/achat2">
              <FileText className="mr-2 h-4 w-4" />
              Tableau de Bord
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingSupplier(null);
                form.reset({
                  name: '',
                  contactPerson: '',
                  email: '',
                  phone: '',
                  address: '',
                  notes: ''
                });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un Fournisseur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier ? 'Modifier le Fournisseur' : 'Ajouter un Fournisseur'}
                </DialogTitle>
                <DialogDescription>
                  {editingSupplier 
                    ? 'Modifiez les informations du fournisseur ci-dessous.' 
                    : 'Remplissez les informations pour ajouter un nouveau fournisseur.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nom du Fournisseur</Label>
                    <Input
                      id="name"
                      placeholder="Nom du fournisseur"
                      {...form.register('name', { required: true })}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">Ce champ est requis</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="contactPerson">Personne de Contact</Label>
                    <Input
                      id="contactPerson"
                      placeholder="Nom de la personne de contact"
                      {...form.register('contactPerson')}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        {...form.register('email')}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        placeholder="+212 XXXXXXXXX"
                        {...form.register('phone')}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Textarea
                      id="address"
                      placeholder="Adresse complète"
                      {...form.register('address')}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Notes supplémentaires"
                      {...form.register('notes')}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Annuler
                    </Button>
                  </DialogClose>
                  <Button type="submit">
                    {editingSupplier ? 'Mettre à jour' : 'Ajouter'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
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
                placeholder="Rechercher par nom, contact, email ou téléphone..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fournisseurs ({sortedSuppliers.length})</CardTitle>
          <CardDescription>
            Liste des fournisseurs pour les achats
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedSuppliers.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">Aucun fournisseur trouvé</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('name')}>
                      Nom
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('contactPerson')}>
                      Contact
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('email')}>
                      Email
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => toggleSort('phone')}>
                      Téléphone
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSuppliers.map(supplier => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleEditSupplier(supplier)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-red-500"
                          onClick={() => handleDeleteSupplier(supplier)}
                        >
                          <Trash className="h-4 w-4" />
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
      
      {/* Edit Supplier Dialog */}
      <Dialog open={!!editingSupplier} onOpenChange={(open) => !open && setEditingSupplier(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le Fournisseur</DialogTitle>
            <DialogDescription>
              Modifiez les informations du fournisseur ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nom du Fournisseur</Label>
                <Input
                  id="edit-name"
                  placeholder="Nom du fournisseur"
                  {...form.register('name', { required: true })}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">Ce champ est requis</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-contactPerson">Personne de Contact</Label>
                <Input
                  id="edit-contactPerson"
                  placeholder="Nom de la personne de contact"
                  {...form.register('contactPerson')}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    placeholder="email@example.com"
                    {...form.register('email')}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Téléphone</Label>
                  <Input
                    id="edit-phone"
                    placeholder="+212 XXXXXXXXX"
                    {...form.register('phone')}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Adresse</Label>
                <Textarea
                  id="edit-address"
                  placeholder="Adresse complète"
                  {...form.register('address')}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Notes supplémentaires"
                  {...form.register('notes')}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingSupplier(null)}>
                Annuler
              </Button>
              <Button type="submit">
                Mettre à jour
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le fournisseur "{supplierToDelete?.name}"?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteMutation.mutate(supplierToDelete.id)}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suppliers;
