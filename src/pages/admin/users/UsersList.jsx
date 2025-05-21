import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Plus, Edit, Trash2, MoreHorizontal, UserPlus, Shield, Mail
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
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
  DialogTrigger,
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

// Mock data for users
const mockUsers = [
  { 
    id: 'USR001', 
    name: 'Jean Dupont', 
    email: 'jean.dupont@example.com', 
    role: 'admin', 
    department: 'Direction',
    status: 'active',
    lastLogin: '2023-05-20 14:30',
    createdAt: '2023-01-15'
  },
  { 
    id: 'USR002', 
    name: 'Marie Laurent', 
    email: 'marie.laurent@example.com', 
    role: 'chef', 
    department: 'Cuisine',
    status: 'active',
    lastLogin: '2023-05-19 09:15',
    createdAt: '2023-01-20'
  },
  { 
    id: 'USR003', 
    name: 'Pierre Martin', 
    email: 'pierre.martin@example.com', 
    role: 'vendor', 
    department: 'Achats',
    status: 'active',
    lastLogin: '2023-05-18 16:45',
    createdAt: '2023-02-05'
  },
  { 
    id: 'USR004', 
    name: 'Sophie Bernard', 
    email: 'sophie.bernard@example.com', 
    role: 'store', 
    department: 'Stock',
    status: 'inactive',
    lastLogin: '2023-04-30 11:20',
    createdAt: '2023-02-10'
  },
  { 
    id: 'USR005', 
    name: 'Thomas Petit', 
    email: 'thomas.petit@example.com', 
    role: 'cashier', 
    department: 'Caisse',
    status: 'active',
    lastLogin: '2023-05-20 10:05',
    createdAt: '2023-03-01'
  },
  { 
    id: 'USR006', 
    name: 'Julie Moreau', 
    email: 'julie.moreau@example.com', 
    role: 'auditor', 
    department: 'Audit',
    status: 'active',
    lastLogin: '2023-05-17 14:10',
    createdAt: '2023-03-15'
  },
];

// Mock data for roles
const mockRoles = [
  { id: 'admin', name: 'Administrateur' },
  { id: 'chef', name: 'Chef Cuisine' },
  { id: 'vendor', name: 'Fournisseur' },
  { id: 'store', name: 'Magasinier' },
  { id: 'cashier', name: 'Caissier' },
  { id: 'auditor', name: 'Auditeur' },
];

// Mock data for departments
const mockDepartments = [
  { id: 'direction', name: 'Direction' },
  { id: 'cuisine', name: 'Cuisine' },
  { id: 'achats', name: 'Achats' },
  { id: 'stock', name: 'Stock' },
  { id: 'caisse', name: 'Caisse' },
  { id: 'audit', name: 'Audit' },
];

const UsersList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    password: '',
    confirmPassword: '',
  });
  
  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  // Handle add user
  const handleAddUser = () => {
    // Validate form
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.department || !newUser.password) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }
    
    if (newUser.password !== newUser.confirmPassword) {
      toast({
        title: "Erreur de validation",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }
    
    // Create new user
    const newId = `USR${String(users.length + 1).padStart(3, '0')}`;
    const currentDate = new Date().toISOString().split('T')[0];
    
    const userToAdd = {
      id: newId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      status: 'active',
      lastLogin: 'Jamais',
      createdAt: currentDate,
    };
    
    setUsers([...users, userToAdd]);
    setShowAddUserDialog(false);
    
    // Reset form
    setNewUser({
      name: '',
      email: '',
      role: '',
      department: '',
      password: '',
      confirmPassword: '',
    });
    
    toast({
      title: "Utilisateur créé",
      description: `L'utilisateur ${newUser.name} a été créé avec succès.`,
    });
  };
  
  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditUserDialog(true);
  };
  
  // Handle update user
  const handleUpdateUser = () => {
    if (!selectedUser) return;
    
    const updatedUsers = users.map(user => 
      user.id === selectedUser.id ? selectedUser : user
    );
    
    setUsers(updatedUsers);
    setShowEditUserDialog(false);
    
    toast({
      title: "Utilisateur mis à jour",
      description: `Les informations de ${selectedUser.name} ont été mises à jour.`,
    });
  };
  
  // Handle delete user
  const handleDeleteUser = (userId) => {
    const userToDelete = users.find(user => user.id === userId);
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userToDelete.name} ?`)) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      
      toast({
        title: "Utilisateur supprimé",
        description: `L'utilisateur ${userToDelete.name} a été supprimé.`,
      });
    }
  };
  
  // Handle toggle user status
  const handleToggleStatus = (userId) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        return { ...user, status: newStatus };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    
    const user = updatedUsers.find(u => u.id === userId);
    const statusText = user.status === 'active' ? 'activé' : 'désactivé';
    
    toast({
      title: `Utilisateur ${statusText}`,
      description: `Le compte de ${user.name} a été ${statusText}.`,
    });
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactif</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  // Get role badge
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Admin</Badge>;
      case 'chef':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Chef</Badge>;
      case 'vendor':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Fournisseur</Badge>;
      case 'store':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Magasinier</Badge>;
      case 'cashier':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Caissier</Badge>;
      case 'auditor':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Auditeur</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez les utilisateurs du système et leurs permissions
          </p>
        </div>
        <Button onClick={() => setShowAddUserDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter un utilisateur
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                {mockRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            {filteredUsers.length} utilisateurs trouvés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Département</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                          <Shield className="h-4 w-4 mr-2" />
                          {user.status === 'active' ? 'Désactiver' : 'Activer'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
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
      
      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Créez un compte utilisateur avec les permissions appropriées.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name">Nom complet</label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Jean Dupont"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="jean.dupont@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="role">Rôle</label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="department">Département</label>
                <Select 
                  value={newUser.department} 
                  onValueChange={(value) => setNewUser({...newUser, department: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="password">Mot de passe</label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>Annuler</Button>
            <Button onClick={handleAddUser}>Créer l'utilisateur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      {selectedUser && (
        <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Modifier l'utilisateur</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l'utilisateur {selectedUser.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-name">Nom complet</label>
                  <Input
                    id="edit-name"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-email">Email</label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-role">Rôle</label>
                  <Select 
                    value={selectedUser.role} 
                    onValueChange={(value) => setSelectedUser({...selectedUser, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-department">Département</label>
                  <Select 
                    value={selectedUser.department} 
                    onValueChange={(value) => setSelectedUser({...selectedUser, department: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un département" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.name}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-status">Statut</label>
                <Select 
                  value={selectedUser.status} 
                  onValueChange={(value) => setSelectedUser({...selectedUser, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>Annuler</Button>
              <Button onClick={handleUpdateUser}>Mettre à jour</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UsersList;
