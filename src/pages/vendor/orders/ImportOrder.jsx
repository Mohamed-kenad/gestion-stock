import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, FileText, AlertCircle, CheckCircle2, 
  X, Download, Info, File, ArrowRight
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
import { Label } from "../../../components/ui/label";
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
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { useToast } from "../../../components/ui/use-toast";
import { Progress } from "../../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

// Mock data for departments
const mockDepartments = [
  { id: 1, name: 'Cuisine' },
  { id: 2, name: 'Pâtisserie' },
  { id: 3, name: 'Bar' },
  { id: 4, name: 'Service' },
  { id: 5, name: 'Entretien' },
];

// Sample template data
const sampleTemplate = [
  { product: 'Poulet', category: 'Viandes', quantity: 10, unit: 'kg' },
  { product: 'Tomates', category: 'Légumes', quantity: 5, unit: 'kg' },
  { product: 'Riz', category: 'Céréales', quantity: 15, unit: 'kg' },
  { product: 'Huile d\'olive', category: 'Huiles', quantity: 3, unit: 'L' },
  { product: 'Sel', category: 'Épices', quantity: 2, unit: 'kg' },
];

const ImportOrder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'uploading', 'processing', 'complete', 'error'
  const [validationErrors, setValidationErrors] = useState([]);
  const [orderTitle, setOrderTitle] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [urgency, setUrgency] = useState('normal');
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;
    
    // Check if file is CSV
    if (!selectedFile.name.endsWith('.csv')) {
      toast({
        title: "Format de fichier non pris en charge",
        description: "Veuillez importer un fichier CSV.",
        variant: "destructive",
      });
      return;
    }
    
    setFile(selectedFile);
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          setUploadStatus('processing');
          return 100;
        }
        return prevProgress + 10;
      });
    }, 100);
    
    // Actually read and parse the CSV file
    const reader = new FileReader();
    
    reader.onload = (event) => {
      setUploadStatus('complete');
      
      try {
        // Parse CSV content
        const csvContent = event.target.result;
        const lines = csvContent.split('\n');
        
        // Skip header row and parse data
        const header = lines[0].split(',');
        const parsedData = [];
        const errors = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '') continue; // Skip empty lines
          
          const values = lines[i].split(',');
          const row = {
            product: values[0]?.trim() || '',
            category: values[1]?.trim() || '',
            quantity: parseFloat(values[2]) || 0,
            unit: values[3]?.trim() || ''
          };
          
          // Validate row
          if (!row.product) {
            errors.push({
              row: i,
              product: `Ligne ${i}`,
              message: 'Le nom du produit est requis'
            });
          }
          
          if (row.quantity <= 0) {
            errors.push({
              row: i,
              product: row.product || `Ligne ${i}`,
              message: 'La quantité doit être supérieure à 0'
            });
          }
          
          parsedData.push(row);
        }
        
        setFileData(parsedData);
        setValidationErrors(errors);
        
        toast({
          title: errors.length > 0 ? "Fichier importé avec des avertissements" : "Fichier importé avec succès",
          description: `${parsedData.length} produits ont été importés. ${errors.length > 0 ? `${errors.length} erreurs détectées.` : ''}`,
          variant: errors.length > 0 ? "warning" : "default",
        });
        
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast({
          title: "Erreur lors de l'analyse du fichier",
          description: "Le format du fichier n'est pas valide. Veuillez télécharger le modèle et réessayer.",
          variant: "destructive",
        });
        handleRemoveFile();
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Erreur lors de la lecture du fichier",
        description: "Une erreur s'est produite lors de la lecture du fichier.",
        variant: "destructive",
      });
      handleRemoveFile();
    };
    
    // Read the file as text
    reader.readAsText(selectedFile);
  };
  
  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setFileData([]);
    setUploadProgress(0);
    setUploadStatus(null);
    setValidationErrors([]);
  };
  
  // Download template
  const handleDownloadTemplate = () => {
    // Create CSV content from the sample template
    const header = "Produit,Catégorie,Quantité,Unité\n";
    const csvContent = header + sampleTemplate.map(row => 
      `${row.product},${row.category},${row.quantity},${row.unit}`
    ).join("\n");
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link and trigger the download
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "modele_bon_commande.csv");
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Téléchargement du modèle",
      description: "Le modèle a été téléchargé.",
    });
  };
  
  // Submit imported order
  const handleSubmitOrder = () => {
    if (!orderTitle) {
      toast({
        title: "Erreur",
        description: "Veuillez spécifier un titre pour le bon de commande.",
        variant: "destructive",
      });
      return;
    }
    
    if (!department) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un département.",
        variant: "destructive",
      });
      return;
    }
    
    if (fileData.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucun produit n'a été importé.",
        variant: "destructive",
      });
      return;
    }
    
    if (validationErrors.length > 0) {
      toast({
        title: "Erreurs de validation",
        description: "Veuillez corriger les erreurs avant de soumettre le bon de commande.",
        variant: "destructive",
      });
      return;
    }
    
    // Here you would normally send the order to the server
    // For now, we'll just show a success message and redirect
    
    toast({
      title: "Bon de commande créé",
      description: "Le bon de commande a été créé avec succès à partir du fichier importé.",
    });
    
    // Redirect to orders page
    setTimeout(() => {
      navigate('/dashboard/vendor/orders');
    }, 1500);
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Importer un bon de commande</h1>
          <p className="text-muted-foreground">
            Importez un fichier Excel ou CSV contenant la liste des produits à commander
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import">Importer un fichier</TabsTrigger>
          <TabsTrigger value="template">Télécharger le modèle</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Details */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Détails du bon</CardTitle>
                <CardDescription>Informations générales sur le bon de commande</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du bon</Label>
                  <Input 
                    id="title" 
                    placeholder="Ex: Commande hebdomadaire cuisine" 
                    value={orderTitle}
                    onChange={(e) => setOrderTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Département</Label>
                  <Select value={department} onValueChange={setDepartment}>
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
                
                <div className="space-y-2">
                  <Label htmlFor="urgency">Niveau d'urgence</Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le niveau d'urgence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="normal">Normale</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="critical">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Information</AlertTitle>
                    <AlertDescription>
                      Assurez-vous que votre fichier suit le format du modèle fourni pour éviter les erreurs d'importation.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
            
            {/* File Upload */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Importer un fichier</CardTitle>
                <CardDescription>Sélectionnez un fichier Excel ou CSV à importer</CardDescription>
              </CardHeader>
              <CardContent>
                {!file ? (
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
                    <div className="mb-4">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">Déposez votre fichier ici ou cliquez pour parcourir</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Formats acceptés: Excel (.xlsx, .xls) ou CSV (.csv)
                    </p>
                    <Input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="mt-4 w-full max-w-xs"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <File className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {uploadStatus === 'uploading' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Téléchargement en cours...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}
                    
                    {uploadStatus === 'success' && validationErrors.length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erreurs de validation</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc pl-5 mt-2">
                            {validationErrors.map((error, index) => (
                              <li key={index}>
                                Ligne {error.row}: {error.product} - {error.message}
                              </li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {uploadStatus === 'success' && fileData.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Aperçu des produits importés</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Produit</TableHead>
                              <TableHead>Catégorie</TableHead>
                              <TableHead className="text-center">Quantité</TableHead>
                              <TableHead>Unité</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {fileData.map((item, index) => (
                              <TableRow key={index} className={validationErrors.some(e => e.row === index + 1) ? 'bg-destructive/10' : ''}>
                                <TableCell className="font-medium">{item.product}</TableCell>
                                <TableCell>{item.category}</TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell>{item.unit}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/dashboard/vendor/orders')}>
                  Annuler
                </Button>
                <Button 
                  onClick={handleSubmitOrder} 
                  disabled={!file || uploadStatus !== 'success' || fileData.length === 0}
                >
                  Créer le bon de commande
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="template" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Télécharger le modèle</CardTitle>
              <CardDescription>
                Utilisez notre modèle pour préparer votre fichier d'importation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Instructions</AlertTitle>
                  <AlertDescription>
                    <p>Le fichier doit contenir les colonnes suivantes :</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Produit (nom du produit)</li>
                      <li>Catégorie (catégorie du produit)</li>
                      <li>Quantité (nombre)</li>
                      <li>Unité (kg, L, unité, etc.)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead className="text-center">Quantité</TableHead>
                        <TableHead>Unité</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleTemplate.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.product}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-center">
                  <Button onClick={handleDownloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le modèle CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImportOrder;
