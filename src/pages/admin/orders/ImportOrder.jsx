import React, { useState, useEffect } from 'react';
import { 
  FileInput, ArrowLeft, Upload, AlertCircle, CheckCircle, FileText
} from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data
const mockSuppliers = [
  { id: 1, name: 'Fournisseur A', email: 'contact@fournisseura.com', phone: '0612345678' },
  { id: 2, name: 'Fournisseur B', email: 'contact@fournisseurb.com', phone: '0623456789' },
  { id: 3, name: 'Fournisseur C', email: 'contact@fournisseurc.com', phone: '0634567890' },
  { id: 4, name: 'Fournisseur D', email: 'contact@fournisseurd.com', phone: '0645678901' },
  { id: 5, name: 'Fournisseur E', email: 'contact@fournisseure.com', phone: '0656789012' },
];

const mockDepartments = [
  { id: 1, name: 'Cuisine' },
  { id: 2, name: 'Pâtisserie' },
  { id: 3, name: 'Bar' },
  { id: 4, name: 'Service' },
];

const ImportOrder = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form fields
  const [orderTitle, setOrderTitle] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [importStep, setImportStep] = useState(1); // 1: Upload, 2: Preview, 3: Success

  useEffect(() => {
    // Simulate API calls
    setTimeout(() => {
      setSuppliers(mockSuppliers);
      setDepartments(mockDepartments);
      setLoading(false);
    }, 800);
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Check file type
    if (file.type !== 'text/csv' && 
        file.type !== 'application/vnd.ms-excel' && 
        file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setFileError('Le fichier doit être au format CSV ou Excel');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  // Handle file upload
  const handleUpload = () => {
    if (!selectedFile || !orderTitle || !selectedSupplier || !selectedDepartment) {
      return;
    }

    // Simulate file processing
    setLoading(true);
    setTimeout(() => {
      // Mock preview data
      const mockPreviewData = [
        { id: 1, name: 'Farine de blé', category: 'Ingrédients de base', quantity: 50, unit: 'kg', unitPrice: 2.5, total: 125 },
        { id: 2, name: 'Sucre', category: 'Ingrédients de base', quantity: 30, unit: 'kg', unitPrice: 1.8, total: 54 },
        { id: 3, name: 'Huile d\'olive', category: 'Huiles et graisses', quantity: 10, unit: 'L', unitPrice: 8.5, total: 85 },
        { id: 4, name: 'Tomates', category: 'Légumes', quantity: 25, unit: 'kg', unitPrice: 3.2, total: 80 },
        { id: 5, name: 'Poulet', category: 'Viandes', quantity: 15, unit: 'kg', unitPrice: 6.5, total: 97.5 },
      ];
      
      setPreviewData(mockPreviewData);
      setImportStep(2);
      setLoading(false);
    }, 1500);
  };

  // Handle confirm import
  const handleConfirmImport = () => {
    if (!previewData) return;

    // Simulate API call to save order
    setLoading(true);
    setTimeout(() => {
      // Create order object
      const order = {
        id: `PO-2025-${Math.floor(Math.random() * 1000)}`,
        title: orderTitle,
        supplier: suppliers.find(s => s.id === Number(selectedSupplier))?.name || '',
        supplierId: Number(selectedSupplier),
        department: departments.find(d => d.id === Number(selectedDepartment))?.name || '',
        departmentId: Number(selectedDepartment),
        items: previewData,
        total: previewData.reduce((sum, item) => sum + item.total, 0),
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: 'Admin', // Would come from auth context in a real app
        importedFrom: selectedFile.name
      };

      // In a real app, you would send this to the API
      console.log('Order imported:', order);
      
      setImportStep(3);
      setLoading(false);
    }, 1500);
  };

  // Calculate order total
  const orderTotal = previewData ? previewData.reduce((sum, item) => sum + item.total, 0) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Importer un Bon de Commande</h1>
          <p className="text-muted-foreground">
            Importez un bon de commande à partir d'un fichier CSV ou Excel
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/dashboard/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {importStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Importer un fichier</CardTitle>
                <CardDescription>
                  Sélectionnez un fichier CSV ou Excel contenant les produits à commander
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="orderTitle">Titre de la commande</Label>
                  <Input
                    id="orderTitle"
                    value={orderTitle}
                    onChange={(e) => setOrderTitle(e.target.value)}
                    placeholder="Ex: Commande ingrédients cuisine"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier">Fournisseur</Label>
                    <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                      <SelectTrigger id="supplier" className="mt-1">
                        <SelectValue placeholder="Sélectionner un fournisseur" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Département</Label>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger id="department" className="mt-1">
                        <SelectValue placeholder="Sélectionner un département" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(department => (
                          <SelectItem key={department.id} value={department.id.toString()}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="file">Fichier à importer</Label>
                  <div className="mt-1 border-2 border-dashed rounded-md p-6 flex flex-col items-center">
                    <FileInput className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Glissez-déposez votre fichier ici ou cliquez pour parcourir
                    </p>
                    <Input
                      id="file"
                      type="file"
                      accept=".csv,.xls,.xlsx"
                      onChange={handleFileChange}
                      className="max-w-sm"
                    />
                    {selectedFile && (
                      <p className="mt-2 text-sm">
                        Fichier sélectionné: <span className="font-medium">{selectedFile.name}</span>
                      </p>
                    )}
                  </div>
                  {fileError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erreur</AlertTitle>
                      <AlertDescription>{fileError}</AlertDescription>
                    </Alert>
                  )}
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Format attendu</AlertTitle>
                    <AlertDescription>
                      Le fichier doit contenir les colonnes suivantes: Nom du produit, Catégorie, Quantité, Unité, Prix unitaire
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button variant="outline" asChild>
                  <Link to="/dashboard/admin/orders">
                    Annuler
                  </Link>
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || !orderTitle || !selectedSupplier || !selectedDepartment}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Importer
                </Button>
              </CardFooter>
            </Card>
          )}

          {importStep === 2 && previewData && (
            <Card>
              <CardHeader>
                <CardTitle>Aperçu des données</CardTitle>
                <CardDescription>
                  Vérifiez les produits qui seront importés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead className="text-right">Quantité</TableHead>
                      <TableHead className="text-right">Prix unitaire</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.unitPrice.toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-right">
                          {item.total.toFixed(2)} €
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-medium">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {orderTotal.toFixed(2)} €
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="mt-4 flex items-center p-4 bg-muted rounded-md">
                  <div className="mr-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Détails de l'importation</p>
                    <p className="text-sm text-muted-foreground">
                      Fichier: {selectedFile?.name} | 
                      Fournisseur: {suppliers.find(s => s.id === Number(selectedSupplier))?.name} | 
                      Département: {departments.find(d => d.id === Number(selectedDepartment))?.name}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button variant="outline" onClick={() => setImportStep(1)}>
                  Retour
                </Button>
                <Button onClick={handleConfirmImport}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmer l'importation
                </Button>
              </CardFooter>
            </Card>
          )}

          {importStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Importation réussie</CardTitle>
                <CardDescription>
                  Le bon de commande a été importé avec succès
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-6">
                <div className="rounded-full bg-green-100 p-3 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-medium mb-2">Bon de commande importé</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Le bon de commande a été créé à partir du fichier {selectedFile?.name} et est maintenant en attente d'approbation.
                </p>
                <div className="flex gap-4 mt-4">
                  <Button variant="outline" asChild>
                    <Link to="/dashboard/admin/orders">
                      Voir tous les bons
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/dashboard/admin/orders/import">
                      Importer un autre bon
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ImportOrder;
