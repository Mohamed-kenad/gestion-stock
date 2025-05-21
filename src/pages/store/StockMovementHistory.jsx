import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, RefreshCw, Calendar, ArrowUpDown, ArrowUp, ArrowDown
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";

// Mock data - replace with actual API calls
const mockMovements = [
  { 
    id: 1, 
    productId: 1,
    productName: 'Farine de blé', 
    category: 'Ingrédients de base', 
    type: 'entry', 
    quantity: 50, 
    unit: 'kg', 
    previousQuantity: 70,
    newQuantity: 120,
    date: '2025-05-18',
    time: '09:15:22',
    reason: 'Réception de commande #12345',
    user: 'Ahmed Benali',
    userRole: 'Magasinier'
  },
  { 
    id: 2, 
    productId: 4,
    productName: 'Tomates', 
    category: 'Légumes', 
    type: 'exit', 
    quantity: 15, 
    unit: 'kg', 
    previousQuantity: 60,
    newQuantity: 45,
    date: '2025-05-20',
    time: '11:30:45',
    reason: 'Préparation cuisine',
    user: 'Fatima Zahra',
    userRole: 'Magasinier'
  },
  { 
    id: 3, 
    productId: 2,
    productName: 'Sucre', 
    category: 'Ingrédients de base', 
    type: 'entry', 
    quantity: 25, 
    unit: 'kg', 
    previousQuantity: 60,
    newQuantity: 85,
    date: '2025-05-19',
    time: '14:22:10',
    reason: 'Réception de commande #12346',
    user: 'Ahmed Benali',
    userRole: 'Magasinier'
  },
  { 
    id: 4, 
    productId: 7,
    productName: 'Lait', 
    category: 'Produits laitiers', 
    type: 'exit', 
    quantity: 10, 
    unit: 'L', 
    previousQuantity: 35,
    newQuantity: 25,
    date: '2025-05-19',
    time: '16:45:30',
    reason: 'Préparation pâtisserie',
    user: 'Fatima Zahra',
    userRole: 'Magasinier'
  },
  { 
    id: 5, 
    productId: 5,
    productName: 'Poulet', 
    category: 'Viandes', 
    type: 'exit', 
    quantity: 15, 
    unit: 'kg', 
    previousQuantity: 75,
    newQuantity: 60,
    date: '2025-05-16',
    time: '10:05:12',
    reason: 'Préparation cuisine',
    user: 'Ahmed Benali',
    userRole: 'Magasinier'
  },
  { 
    id: 6, 
    productId: 3,
    productName: 'Huile d\'olive', 
    category: 'Huiles et graisses', 
    type: 'entry', 
    quantity: 5, 
    unit: 'L', 
    previousQuantity: 7,
    newQuantity: 12,
    date: '2025-05-17',
    time: '08:30:00',
    reason: 'Réception de commande #12347',
    user: 'Fatima Zahra',
    userRole: 'Magasinier'
  },
  { 
    id: 7, 
    productId: 8,
    productName: 'Œufs', 
    category: 'Produits laitiers', 
    type: 'entry', 
    quantity: 50, 
    unit: 'unité', 
    previousQuantity: 100,
    newQuantity: 150,
    date: '2025-05-18',
    time: '13:15:40',
    reason: 'Réception de commande #12348',
    user: 'Ahmed Benali',
    userRole: 'Magasinier'
  },
  { 
    id: 8, 
    productId: 6,
    productName: 'Pommes de terre', 
    category: 'Légumes', 
    type: 'exit', 
    quantity: 20, 
    unit: 'kg', 
    previousQuantity: 220,
    newQuantity: 200,
    date: '2025-05-15',
    time: '15:50:20',
    reason: 'Préparation cuisine',
    user: 'Fatima Zahra',
    userRole: 'Magasinier'
  },
];

const StockMovementHistory = () => {
  const [movements, setMovements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [date, setDate] = useState({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMovements(mockMovements);
      setLoading(false);
    }, 800);
  }, []);

  // Filter movements based on search term, filters, and date range
  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          movement.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || movement.category === categoryFilter;
    const matchesType = typeFilter === '' || movement.type === typeFilter;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'entries' && movement.type === 'entry') || 
                      (activeTab === 'exits' && movement.type === 'exit');
    
    // Date filtering
    let matchesDate = true;
    if (date.from && date.to) {
      const movementDate = new Date(movement.date);
      matchesDate = movementDate >= date.from && movementDate <= date.to;
    }
    
    return matchesSearch && matchesCategory && matchesType && matchesTab && matchesDate;
  });

  // Get unique categories for filter dropdown
  const categories = [...new Set(movements.map(movement => movement.category))];

  // Movement type badge color mapping
  const getTypeBadge = (type) => {
    switch (type) {
      case 'entry':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center">
            <ArrowDown className="h-3 w-3 mr-1" />
            Entrée
          </Badge>
        );
      case 'exit':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 flex items-center">
            <ArrowUp className="h-3 w-3 mr-1" />
            Sortie
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  // Handle refresh movements
  const handleRefresh = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setMovements(mockMovements);
      setLoading(false);
    }, 800);
  };

  // Handle export movements
  const handleExport = () => {
    alert('Exporting movements to CSV...');
    // Implement actual export functionality
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique des Mouvements</h1>
          <p className="text-muted-foreground">
            Suivez toutes les entrées et sorties de stock
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des mouvements</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movements.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées</CardTitle>
            <ArrowDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movements.filter(m => m.type === 'entry').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sorties</CardTitle>
            <ArrowUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movements.filter(m => m.type === 'exit').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Période</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {date.from && date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy")} - {format(date.to, "dd/MM/yyyy")}
                </>
              ) : (
                "Toute la période"
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="entries">Entrées</TabsTrigger>
            <TabsTrigger value="exits">Sorties</TabsTrigger>
          </TabsList>
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un produit ou une raison..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
                <SelectItem value="entry">Entrées</SelectItem>
                <SelectItem value="exit">Sorties</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Movements Table */}
          <Card>
            <CardHeader>
              <CardTitle>Mouvements de stock</CardTitle>
              <CardDescription>
                Historique complet des entrées et sorties de stock
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
                        <TableHead>Date & Heure</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Quantité</TableHead>
                        <TableHead className="text-right">Avant</TableHead>
                        <TableHead className="text-right">Après</TableHead>
                        <TableHead>Raison</TableHead>
                        <TableHead>Utilisateur</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMovements.length > 0 ? (
                        filteredMovements.map((movement) => (
                          <TableRow key={movement.id}>
                            <TableCell>
                              <div className="font-medium">{movement.date}</div>
                              <div className="text-xs text-muted-foreground">{movement.time}</div>
                            </TableCell>
                            <TableCell>{movement.productName}</TableCell>
                            <TableCell>{movement.category}</TableCell>
                            <TableCell>{getTypeBadge(movement.type)}</TableCell>
                            <TableCell className="text-right">
                              {movement.quantity} {movement.unit}
                            </TableCell>
                            <TableCell className="text-right">
                              {movement.previousQuantity} {movement.unit}
                            </TableCell>
                            <TableCell className="text-right">
                              {movement.newQuantity} {movement.unit}
                            </TableCell>
                            <TableCell>{movement.reason}</TableCell>
                            <TableCell>
                              <div>{movement.user}</div>
                              <div className="text-xs text-muted-foreground">{movement.userRole}</div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            Aucun mouvement trouvé
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
                          <PaginationLink href="#">2</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">3</PaginationLink>
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
        </TabsContent>

        <TabsContent value="entries" className="mt-0">
          {/* Same content as "all" tab but filtered for entries */}
          {/* This is handled by the filteredMovements logic */}
        </TabsContent>

        <TabsContent value="exits" className="mt-0">
          {/* Same content as "all" tab but filtered for exits */}
          {/* This is handled by the filteredMovements logic */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StockMovementHistory;
