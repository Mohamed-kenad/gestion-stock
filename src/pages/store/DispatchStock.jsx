import React, { useState, useEffect } from 'react';
import { 
  FileOutput, Search, CheckCircle, Package, ArrowUp, User, Calendar
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Checkbox } from "@/components/ui/checkbox";

// Mock data
const mockDepartments = [
  { id: 1, name: 'Cuisine' },
  { id: 2, name: 'Pâtisserie' },
  { id: 3, name: 'Bar' },
  { id: 4, name: 'Service' },
];

const mockProducts = [
  { id: 1, name: 'Farine de blé', category: 'Ingrédients de base', quantity: 120, unit: 'kg' },
  { id: 2, name: 'Sucre', category: 'Ingrédients de base', quantity: 85, unit: 'kg' },
  { id: 3, name: 'Huile d\'olive', category: 'Huiles et graisses', quantity: 12, unit: 'L' },
  { id: 4, name: 'Tomates', category: 'Légumes', quantity: 45, unit: 'kg' },
  { id: 5, name: 'Poulet', category: 'Viandes', quantity: 60, unit: 'kg' },
  { id: 6, name: 'Pommes de terre', category: 'Légumes', quantity: 200, unit: 'kg' },
  { id: 7, name: 'Lait', category: 'Produits laitiers', quantity: 25, unit: 'L' },
  { id: 8, name: 'Œufs', category: 'Produits laitiers', quantity: 150, unit: 'unité' },
];

const mockDispatchHistory = [
  { 
    id: 'D-2025-001', 
    date: '2025-05-19', 
    department: 'Cuisine',
    requestedBy: 'Mohammed Alami',
    items: [
      { id: 4, name: 'Tomates', quantity: 5, unit: 'kg' },
      { id: 5, name: 'Poulet', quantity: 10, unit: 'kg' },
      { id: 6, name: 'Pommes de terre', quantity: 8, unit: 'kg' },
    ],
    note: 'Pour le service du midi'
  },
  { 
    id: 'D-2025-002', 
    date: '2025-05-18', 
    department: 'Pâtisserie',
    requestedBy: 'Fatima Zahra',
    items: [
      { id: 1, name: 'Farine de blé', quantity: 5, unit: 'kg' },
      { id: 2, name: 'Sucre', quantity: 3, unit: 'kg' },
      { id: 7, name: 'Lait', quantity: 2, unit: 'L' },
      { id: 8, name: 'Œufs', quantity: 24, unit: 'unité' },
    ],
    note: 'Préparation des desserts du weekend'
  },
];

const DispatchStock = () => {
  const [products, setProducts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [dispatchHistory, setDispatchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [dispatchNote, setDispatchNote] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [activeTab, setActiveTab] = useState('new');

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setProducts(mockProducts);
      setDepartments(mockDepartments);
      setDispatchHistory(mockDispatchHistory);
      setLoading(false);
    }, 800);
  }, []);

  // Open dispatch dialog
  const openDispatchDialog = () => {
    setSelectedItems(products.map(product => ({
      ...product,
      selected: false,
      dispatchQuantity: 0
    })));
    setSelectedDepartment('');
    setRequestedBy('');
    setDispatchNote('');
    setIsDispatchDialogOpen(true);
  };

  // Handle item selection
  const handleItemSelection = (itemId, selected) => {
    setSelectedItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, selected, dispatchQuantity: selected ? 1 : 0 } 
          : item
      )
    );
  };

  // Handle quantity change
  const handleQuantityChange = (itemId, quantity) => {
    const numQuantity = Number(quantity);
    setSelectedItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const validQuantity = Math.min(Math.max(0, numQuantity), item.quantity);
          return { 
            ...item, 
            dispatchQuantity: validQuantity,
            selected: validQuantity > 0
          };
        }
        return item;
      })
    );
  };

  // Handle dispatch submission
  const handleDispatchSubmit = () => {
    const itemsToDispatch = selectedItems.filter(item => item.selected && item.dispatchQuantity > 0);
    
    if (itemsToDispatch.length === 0 || !selectedDepartment || !requestedBy) {
      return;
    }

    // Create new dispatch record
    const newDispatch = {
      id: `D-2025-${dispatchHistory.length + 1}`.padStart(10, '0'),
      date: new Date().toISOString().split('T')[0],
      department: departments.find(d => d.id === Number(selectedDepartment))?.name || '',
      requestedBy,
      items: itemsToDispatch.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.dispatchQuantity,
        unit: item.unit
      })),
      note: dispatchNote
    };

    // Update dispatch history
    setDispatchHistory([newDispatch, ...dispatchHistory]);

    // Update product quantities
    setProducts(prevProducts => 
      prevProducts.map(product => {
        const dispatchedItem = itemsToDispatch.find(item => item.id === product.id);
        if (dispatchedItem) {
          return {
            ...product,
            quantity: product.quantity - dispatchedItem.dispatchQuantity
          };
        }
        return product;
      })
    );

    setIsDispatchDialogOpen(false);
    
    // Show success message
    alert(`Sortie de stock enregistrée avec succès. ID: ${newDispatch.id}`);
  };

  // Filter products for search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sortie de Stock</h1>
          <p className="text-muted-foreground">
            Gérez les sorties de produits vers les différents services
          </p>
        </div>
        <Button onClick={openDispatchDialog}>
          <ArrowUp className="h-4 w-4 mr-2" />
          Nouvelle sortie
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sorties aujourd'hui</CardTitle>
            <FileOutput className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dispatchHistory.filter(d => d.date === new Date().toISOString().split('T')[0]).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des sorties</CardTitle>
            <FileOutput className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dispatchHistory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Départements</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits disponibles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="new" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="new">Nouvelle sortie</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Produits disponibles</CardTitle>
              <CardDescription>
                Sélectionnez les produits à sortir du stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher un produit..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Quantité disponible</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell className="text-right">
                            {product.quantity} {product.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={openDispatchDialog}
                              disabled={product.quantity <= 0}
                            >
                              <ArrowUp className="h-4 w-4 mr-1" />
                              Sortir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Aucun produit trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div></div>
              <Button onClick={openDispatchDialog}>
                <ArrowUp className="h-4 w-4 mr-2" />
                Nouvelle sortie
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des sorties</CardTitle>
              <CardDescription>
                Consultez les sorties de stock précédentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Département</TableHead>
                      <TableHead>Demandé par</TableHead>
                      <TableHead>Produits</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dispatchHistory.length > 0 ? (
                      dispatchHistory.map((dispatch) => (
                        <TableRow key={dispatch.id}>
                          <TableCell className="font-medium">{dispatch.id}</TableCell>
                          <TableCell>{dispatch.date}</TableCell>
                          <TableCell>{dispatch.department}</TableCell>
                          <TableCell>{dispatch.requestedBy}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {dispatch.items.length} produits
                            </Badge>
                          </TableCell>
                          <TableCell className="truncate max-w-[200px]">
                            {dispatch.note}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Aucune sortie enregistrée
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dispatch Dialog */}
      <Dialog open={isDispatchDialogOpen} onOpenChange={setIsDispatchDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Nouvelle sortie de stock
            </DialogTitle>
            <DialogDescription>
              Sélectionnez les produits et les quantités à sortir du stock
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Département</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger id="department" className="mt-1">
                    <SelectValue placeholder="Sélectionner un département" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="requestedBy">Demandé par</Label>
                <Input
                  id="requestedBy"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  placeholder="Nom du demandeur"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="dispatchNote">Note</Label>
              <Textarea
                id="dispatchNote"
                value={dispatchNote}
                onChange={(e) => setDispatchNote(e.target.value)}
                placeholder="Informations complémentaires sur la sortie"
                className="mt-1"
              />
            </div>
            
            <div className="mt-2">
              <Label className="text-base font-medium">Produits à sortir</Label>
              <div className="border rounded-md mt-2 max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Disponible</TableHead>
                      <TableHead className="text-right">Quantité à sortir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={item.selected}
                            onCheckedChange={(checked) => handleItemSelection(item.id, checked)}
                            disabled={item.quantity <= 0}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={item.dispatchQuantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            disabled={!item.selected || item.quantity <= 0}
                            className="w-20 text-right inline-block"
                          />
                          <span className="ml-2">{item.unit}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDispatchDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleDispatchSubmit}
              disabled={
                !selectedItems.some(item => item.selected && item.dispatchQuantity > 0) || 
                !selectedDepartment || 
                !requestedBy
              }
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmer la sortie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DispatchStock;
