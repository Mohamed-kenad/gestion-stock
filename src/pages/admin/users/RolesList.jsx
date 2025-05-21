import React, { useState } from 'react';
import { 
  Search, Plus, Edit, Trash2, MoreHorizontal, Shield, Lock, Users
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
} from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { useToast } from "../../../components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Checkbox } from "../../../components/ui/checkbox";
import { Textarea } from "../../../components/ui/textarea";

// Mock data for roles
const mockRoles = [
  { 
    id: 'admin', 
    name: 'Administrateur', 
    description: 'Accès complet à toutes les fonctionnalités du système',
    usersCount: 2,
    permissions: [
      'users_manage', 'roles_manage', 'products_manage', 'categories_manage',
      'orders_manage', 'purchases_manage', 'inventory_manage', 'reports_view',
      'settings_manage'
    ]
  },
  { 
    id: 'chef', 
    name: 'Chef Cuisine', 
    description: 'Validation des commandes et gestion des stocks de cuisine',
    usersCount: 3,
    permissions: [
      'orders_validate', 'orders_view', 'inventory_view'
    ]
  },
  { 
    id: 'vendor', 
    name: 'Fournisseur', 
    description: 'Création et suivi des bons de commande',
    usersCount: 5,
    permissions: [
      'orders_create', 'orders_view', 'products_view'
    ]
  },
  { 
    id: 'store', 
    name: 'Magasinier', 
    description: 'Gestion des stocks et des mouvements de produits',
    usersCount: 2,
    permissions: [
      'inventory_manage', 'orders_view', 'products_view'
    ]
  },
  { 
    id: 'cashier', 
    name: 'Caissier', 
    description: 'Gestion des ventes et des encaissements',
    usersCount: 4,
    permissions: [
      'sales_manage', 'customers_view', 'products_view'
    ]
  },
  { 
    id: 'auditor', 
    name: 'Auditeur', 
    description: 'Suivi des prix, marges et analyse des données',
    usersCount: 1,
    permissions: [
      'reports_view', 'sales_view', 'purchases_view', 'inventory_view', 'pricing_manage'
    ]
  },
];

// All available permissions
const allPermissions = [
  { id: 'users_manage', name: 'Gestion des utilisateurs', category: 'Administration' },
  { id: 'roles_manage', name: 'Gestion des rôles', category: 'Administration' },
  { id: 'products_manage', name: 'Gestion des produits', category: 'Catalogue' },
  { id: 'products_view', name: 'Consultation des produits', category: 'Catalogue' },
  { id: 'categories_manage', name: 'Gestion des catégories', category: 'Catalogue' },
  { id: 'orders_create', name: 'Création des commandes', category: 'Commandes' },
  { id: 'orders_validate', name: 'Validation des commandes', category: 'Commandes' },
  { id: 'orders_manage', name: 'Gestion des commandes', category: 'Commandes' },
  { id: 'orders_view', name: 'Consultation des commandes', category: 'Commandes' },
  { id: 'purchases_manage', name: 'Gestion des achats', category: 'Achats' },
  { id: 'purchases_view', name: 'Consultation des achats', category: 'Achats' },
  { id: 'inventory_manage', name: 'Gestion des stocks', category: 'Inventaire' },
  { id: 'inventory_view', name: 'Consultation des stocks', category: 'Inventaire' },
  { id: 'sales_manage', name: 'Gestion des ventes', category: 'Ventes' },
  { id: 'sales_view', name: 'Consultation des ventes', category: 'Ventes' },
  { id: 'customers_manage', name: 'Gestion des clients', category: 'Clients' },
  { id: 'customers_view', name: 'Consultation des clients', category: 'Clients' },
  { id: 'reports_view', name: 'Consultation des rapports', category: 'Rapports' },
  { id: 'pricing_manage', name: 'Gestion des prix', category: 'Tarification' },
  { id: 'settings_manage', name: 'Paramètres système', category: 'Administration' },
];

const RolesList = () => {
  const { toast } = useToast();
  
  const [roles, setRoles] = useState(mockRoles);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  // New role form state
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [],
  });
  
  // Filter roles based on search
  const filteredRoles = roles.filter(role => {
    return role.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      role.description.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Group permissions by category
  const permissionsByCategory = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});
  
  // Handle add role
  const handleAddRole = () => {
    // Validate form
    if (!newRole.name || !newRole.description) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }
    
    if (newRole.permissions.length === 0) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner au moins une permission.",
        variant: "destructive",
      });
      return;
    }
    
    // Create new role
    const roleId = newRole.name.toLowerCase().replace(/\s+/g, '_');
    
    const roleToAdd = {
      id: roleId,
      name: newRole.name,
      description: newRole.description,
      usersCount: 0,
      permissions: newRole.permissions,
    };
    
    setRoles([...roles, roleToAdd]);
    setShowAddRoleDialog(false);
    
    // Reset form
    setNewRole({
      name: '',
      description: '',
      permissions: [],
    });
    
    toast({
      title: "Rôle créé",
      description: `Le rôle ${newRole.name} a été créé avec succès.`,
    });
  };
  
  // Handle edit role
  const handleEditRole = (role) => {
    setSelectedRole(role);
    setShowEditRoleDialog(true);
  };
  
  // Handle update role
  const handleUpdateRole = () => {
    if (!selectedRole) return;
    
    const updatedRoles = roles.map(role => 
      role.id === selectedRole.id ? selectedRole : role
    );
    
    setRoles(updatedRoles);
    setShowEditRoleDialog(false);
    
    toast({
      title: "Rôle mis à jour",
      description: `Le rôle ${selectedRole.name} a été mis à jour.`,
    });
  };
  
  // Handle delete role
  const handleDeleteRole = (roleId) => {
    const roleToDelete = roles.find(role => role.id === roleId);
    
    if (roleToDelete.usersCount > 0) {
      toast({
        title: "Suppression impossible",
        description: `Ce rôle est attribué à ${roleToDelete.usersCount} utilisateur(s). Veuillez d'abord réaffecter ces utilisateurs.`,
        variant: "destructive",
      });
      return;
    }
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le rôle ${roleToDelete.name} ?`)) {
      const updatedRoles = roles.filter(role => role.id !== roleId);
      setRoles(updatedRoles);
      
      toast({
        title: "Rôle supprimé",
        description: `Le rôle ${roleToDelete.name} a été supprimé.`,
      });
    }
  };
  
  // Handle permission toggle for new role
  const handlePermissionToggle = (permissionId) => {
    setNewRole(prev => {
      const permissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId];
      
      return { ...prev, permissions };
    });
  };
  
  // Handle permission toggle for editing role
  const handleEditPermissionToggle = (permissionId) => {
    setSelectedRole(prev => {
      if (!prev) return prev;
      
      const permissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId];
      
      return { ...prev, permissions };
    });
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des rôles</h1>
          <p className="text-muted-foreground">
            Gérez les rôles et les permissions du système
          </p>
        </div>
        <Button onClick={() => setShowAddRoleDialog(true)}>
          <Shield className="h-4 w-4 mr-2" />
          Ajouter un rôle
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un rôle..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Roles List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des rôles</CardTitle>
          <CardDescription>
            {filteredRoles.length} rôles trouvés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Utilisateurs</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center w-fit">
                      <Users className="h-3 w-3 mr-1" />
                      {role.usersCount}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.length > 3 ? (
                        <>
                          {role.permissions.slice(0, 3).map(permId => {
                            const perm = allPermissions.find(p => p.id === permId);
                            return (
                              <Badge key={permId} variant="outline" className="text-xs">
                                {perm?.name}
                              </Badge>
                            );
                          })}
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 3} autres
                          </Badge>
                        </>
                      ) : (
                        role.permissions.map(permId => {
                          const perm = allPermissions.find(p => p.id === permId);
                          return (
                            <Badge key={permId} variant="outline" className="text-xs">
                              {perm?.name}
                            </Badge>
                          );
                        })
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditRole(role)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteRole(role.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Role Dialog */}
      <Dialog open={showAddRoleDialog} onOpenChange={setShowAddRoleDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau rôle</DialogTitle>
            <DialogDescription>
              Créez un rôle avec les permissions appropriées.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name">Nom du rôle</label>
              <Input
                id="name"
                value={newRole.name}
                onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                placeholder="Ex: Gestionnaire de stock"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description">Description</label>
              <Textarea
                id="description"
                value={newRole.description}
                onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                placeholder="Décrivez les responsabilités de ce rôle"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="font-medium">Permissions</label>
              <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <div key={category} className="mb-4">
                    <h4 className="font-medium mb-2 text-sm">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {permissions.map(permission => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`perm-${permission.id}`} 
                            checked={newRole.permissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <label 
                            htmlFor={`perm-${permission.id}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {permission.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRoleDialog(false)}>Annuler</Button>
            <Button onClick={handleAddRole}>Créer le rôle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Role Dialog */}
      {selectedRole && (
        <Dialog open={showEditRoleDialog} onOpenChange={setShowEditRoleDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier le rôle</DialogTitle>
              <DialogDescription>
                Modifiez les informations et permissions du rôle {selectedRole.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-name">Nom du rôle</label>
                <Input
                  id="edit-name"
                  value={selectedRole.name}
                  onChange={(e) => setSelectedRole({...selectedRole, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-description">Description</label>
                <Textarea
                  id="edit-description"
                  value={selectedRole.description}
                  onChange={(e) => setSelectedRole({...selectedRole, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="font-medium">Permissions</label>
                <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                  {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                    <div key={category} className="mb-4">
                      <h4 className="font-medium mb-2 text-sm">{category}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {permissions.map(permission => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`edit-perm-${permission.id}`} 
                              checked={selectedRole.permissions.includes(permission.id)}
                              onCheckedChange={() => handleEditPermissionToggle(permission.id)}
                            />
                            <label 
                              htmlFor={`edit-perm-${permission.id}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditRoleDialog(false)}>Annuler</Button>
              <Button onClick={handleUpdateRole}>Mettre à jour</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RolesList;
