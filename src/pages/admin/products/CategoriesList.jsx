import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, Search, Plus, Edit, Trash, RefreshCw
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
import { Badge } from "@/components/ui/badge";
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

// Mock data
const mockCategories = [
  { id: 1, name: 'Ingrédients de base', description: 'Produits de base pour la cuisine', productsCount: 15 },
  { id: 2, name: 'Légumes', description: 'Légumes frais et surgelés', productsCount: 28 },
  { id: 3, name: 'Viandes', description: 'Viandes fraîches et surgelées', productsCount: 12 },
  { id: 4, name: 'Produits laitiers', description: 'Lait, fromage, yaourt et autres produits laitiers', productsCount: 18 },
  { id: 5, name: 'Huiles et graisses', description: 'Huiles, beurres et autres matières grasses', productsCount: 8 },
  { id: 6, name: 'Épices', description: 'Épices et assaisonnements', productsCount: 22 },
  { id: 7, name: 'Céréales', description: 'Riz, pâtes et autres céréales', productsCount: 14 },
  { id: 8, name: 'Boissons', description: 'Boissons non alcoolisées', productsCount: 10 },
  { id: 9, name: 'Alcools', description: 'Vins, spiritueux et autres boissons alcoolisées', productsCount: 16 },
  { id: 10, name: 'Fruits', description: 'Fruits frais et surgelés', productsCount: 20 },
];

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCategories(mockCategories);
      setLoading(false);
    }, 800);
  }, []);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open add dialog
  const openAddDialog = () => {
    setCategoryName('');
    setCategoryDescription('');
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description);
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Handle add category
  const handleAddCategory = () => {
    if (!categoryName) return;

    // Create new category
    const newCategory = {
      id: categories.length + 1,
      name: categoryName,
      description: categoryDescription,
      productsCount: 0
    };

    // Update categories
    setCategories([...categories, newCategory]);
    setIsAddDialogOpen(false);
    
    // Show success message
    alert(`Catégorie "${categoryName}" ajoutée avec succès`);
  };

  // Handle edit category
  const handleEditCategory = () => {
    if (!categoryName || !selectedCategory) return;

    // Update category
    const updatedCategories = categories.map(category => 
      category.id === selectedCategory.id 
        ? { ...category, name: categoryName, description: categoryDescription }
        : category
    );

    // Update state
    setCategories(updatedCategories);
    setIsEditDialogOpen(false);
    
    // Show success message
    alert(`Catégorie "${categoryName}" mise à jour avec succès`);
  };

  // Handle delete category
  const handleDeleteCategory = () => {
    if (!selectedCategory) return;

    // Check if category has products
    if (selectedCategory.productsCount > 0) {
      alert(`Impossible de supprimer la catégorie "${selectedCategory.name}" car elle contient des produits`);
      setIsDeleteDialogOpen(false);
      return;
    }

    // Delete category
    const updatedCategories = categories.filter(category => category.id !== selectedCategory.id);
    
    // Update state
    setCategories(updatedCategories);
    setIsDeleteDialogOpen(false);
    
    // Show success message
    alert(`Catégorie "${selectedCategory.name}" supprimée avec succès`);
  };

  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCategories(mockCategories);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catégories de Produits</h1>
          <p className="text-muted-foreground">
            Gérez les catégories pour organiser vos produits
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle catégorie
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des catégories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher une catégorie..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des catégories</CardTitle>
          <CardDescription>
            Gérez les catégories de produits de votre inventaire
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
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Produits</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{category.description}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{category.productsCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openEditDialog(category)}
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openDeleteDialog(category)}
                              title="Supprimer"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Aucune catégorie trouvée
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

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une catégorie</DialogTitle>
            <DialogDescription>
              Créez une nouvelle catégorie pour vos produits
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="categoryName">Nom de la catégorie</Label>
              <Input
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Nom de la catégorie"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="categoryDescription">Description</Label>
              <Textarea
                id="categoryDescription"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Description de la catégorie"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAddCategory}
              disabled={!categoryName}
            >
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier une catégorie</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la catégorie
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="editCategoryName">Nom de la catégorie</Label>
              <Input
                id="editCategoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Nom de la catégorie"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="editCategoryDescription">Description</Label>
              <Textarea
                id="editCategoryDescription"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Description de la catégorie"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleEditCategory}
              disabled={!categoryName}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer une catégorie</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette catégorie ?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedCategory && (
              <p>
                Vous êtes sur le point de supprimer la catégorie <strong>{selectedCategory.name}</strong>.
                {selectedCategory.productsCount > 0 ? (
                  <span className="text-red-500 block mt-2">
                    Cette catégorie contient {selectedCategory.productsCount} produits. 
                    Vous devez d'abord déplacer ou supprimer ces produits.
                  </span>
                ) : (
                  <span className="block mt-2">Cette action est irréversible.</span>
                )}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={selectedCategory && selectedCategory.productsCount > 0}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoriesList;
