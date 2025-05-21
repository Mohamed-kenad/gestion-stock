import React, { useState } from 'react';
import { 
  Save, Settings, RefreshCcw, Database, Globe, Mail, Bell, Shield, Clock
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useToast } from "../../../components/ui/use-toast";
import { Switch } from "../../../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

const SystemSettings = () => {
  const { toast } = useToast();
  
  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Nexus Suite',
    siteDescription: 'Système de gestion d\'inventaire et de commandes',
    language: 'fr',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  });
  
  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: 'notifications@example.com',
    smtpPassword: '********',
    senderName: 'Nexus Suite',
    senderEmail: 'notifications@example.com',
    enableSsl: true,
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    orderStatusUpdates: true,
    securityAlerts: true,
    systemUpdates: true,
    dailyReports: false,
    weeklyReports: true,
    monthlyReports: true,
  });
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: '8',
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    sessionTimeout: '30',
    twoFactorAuth: false,
    loginAttempts: '5',
    ipBlocking: true,
  });
  
  // Database settings
  const [databaseSettings, setDatabaseSettings] = useState({
    dbHost: 'localhost',
    dbPort: '3306',
    dbName: 'nexus_db',
    dbUsername: 'nexus_user',
    dbPassword: '********',
    backupFrequency: 'daily',
    backupRetention: '30',
    autoOptimize: true,
  });
  
  // Handle save settings
  const handleSaveSettings = (settingType) => {
    toast({
      title: "Paramètres enregistrés",
      description: `Les paramètres ${settingType} ont été mis à jour avec succès.`,
    });
  };
  
  // Handle test email
  const handleTestEmail = () => {
    toast({
      title: "Email de test envoyé",
      description: "Un email de test a été envoyé à l'adresse configurée.",
    });
  };
  
  // Handle database backup
  const handleDatabaseBackup = () => {
    toast({
      title: "Sauvegarde en cours",
      description: "La sauvegarde de la base de données a été lancée.",
    });
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres système</h1>
          <p className="text-muted-foreground">
            Configurez les paramètres de votre système Nexus Suite
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            Base de données
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres généraux</CardTitle>
              <CardDescription>
                Configurez les paramètres de base du système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nom du site</Label>
                  <Input 
                    id="siteName" 
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Description</Label>
                  <Input 
                    id="siteDescription" 
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select 
                    value={generalSettings.language}
                    onValueChange={(value) => setGeneralSettings({...generalSettings, language: value})}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select 
                    value={generalSettings.timezone}
                    onValueChange={(value) => setGeneralSettings({...generalSettings, timezone: value})}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Sélectionner un fuseau horaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Format de date</Label>
                  <Select 
                    value={generalSettings.dateFormat}
                    onValueChange={(value) => setGeneralSettings({...generalSettings, dateFormat: value})}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder="Sélectionner un format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Format d'heure</Label>
                  <Select 
                    value={generalSettings.timeFormat}
                    onValueChange={(value) => setGeneralSettings({...generalSettings, timeFormat: value})}
                  >
                    <SelectTrigger id="timeFormat">
                      <SelectValue placeholder="Sélectionner un format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24h</SelectItem>
                      <SelectItem value="12h">12h (AM/PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('généraux')}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer les paramètres
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres d'email</CardTitle>
              <CardDescription>
                Configurez les paramètres pour l'envoi d'emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">Serveur SMTP</Label>
                  <Input 
                    id="smtpServer" 
                    value={emailSettings.smtpServer}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpServer: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Port SMTP</Label>
                  <Input 
                    id="smtpPort" 
                    value={emailSettings.smtpPort}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">Nom d'utilisateur SMTP</Label>
                  <Input 
                    id="smtpUsername" 
                    value={emailSettings.smtpUsername}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpUsername: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">Mot de passe SMTP</Label>
                  <Input 
                    id="smtpPassword" 
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senderName">Nom de l'expéditeur</Label>
                  <Input 
                    id="senderName" 
                    value={emailSettings.senderName}
                    onChange={(e) => setEmailSettings({...emailSettings, senderName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Email de l'expéditeur</Label>
                  <Input 
                    id="senderEmail" 
                    type="email"
                    value={emailSettings.senderEmail}
                    onChange={(e) => setEmailSettings({...emailSettings, senderEmail: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enableSsl" 
                  checked={emailSettings.enableSsl}
                  onCheckedChange={(checked) => setEmailSettings({...emailSettings, enableSsl: checked})}
                />
                <Label htmlFor="enableSsl">Activer SSL/TLS</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleTestEmail}>
                Envoyer un email de test
              </Button>
              <Button onClick={() => handleSaveSettings('d\'email')}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer les paramètres
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de notifications</CardTitle>
              <CardDescription>
                Configurez les notifications système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notifications par email</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="emailNotifications" 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                    />
                    <Label htmlFor="emailNotifications">Activer les notifications par email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="lowStockAlerts" 
                      checked={notificationSettings.lowStockAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, lowStockAlerts: checked})}
                    />
                    <Label htmlFor="lowStockAlerts">Alertes de stock bas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="orderStatusUpdates" 
                      checked={notificationSettings.orderStatusUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, orderStatusUpdates: checked})}
                    />
                    <Label htmlFor="orderStatusUpdates">Mises à jour de statut des commandes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="securityAlerts" 
                      checked={notificationSettings.securityAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, securityAlerts: checked})}
                    />
                    <Label htmlFor="securityAlerts">Alertes de sécurité</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="systemUpdates" 
                      checked={notificationSettings.systemUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemUpdates: checked})}
                    />
                    <Label htmlFor="systemUpdates">Mises à jour système</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Rapports automatiques</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="dailyReports" 
                      checked={notificationSettings.dailyReports}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, dailyReports: checked})}
                    />
                    <Label htmlFor="dailyReports">Rapports quotidiens</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="weeklyReports" 
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, weeklyReports: checked})}
                    />
                    <Label htmlFor="weeklyReports">Rapports hebdomadaires</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="monthlyReports" 
                      checked={notificationSettings.monthlyReports}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, monthlyReports: checked})}
                    />
                    <Label htmlFor="monthlyReports">Rapports mensuels</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('de notifications')}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer les paramètres
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de sécurité</CardTitle>
              <CardDescription>
                Configurez les paramètres de sécurité du système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Politique de mot de passe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Longueur minimale</Label>
                    <Input 
                      id="passwordMinLength" 
                      type="number"
                      min="6"
                      max="20"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="passwordRequireUppercase" 
                      checked={securitySettings.passwordRequireUppercase}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordRequireUppercase: checked})}
                    />
                    <Label htmlFor="passwordRequireUppercase">Exiger des majuscules</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="passwordRequireNumbers" 
                      checked={securitySettings.passwordRequireNumbers}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordRequireNumbers: checked})}
                    />
                    <Label htmlFor="passwordRequireNumbers">Exiger des chiffres</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="passwordRequireSymbols" 
                      checked={securitySettings.passwordRequireSymbols}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, passwordRequireSymbols: checked})}
                    />
                    <Label htmlFor="passwordRequireSymbols">Exiger des symboles</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Paramètres de session</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Délai d'expiration de session (minutes)</Label>
                    <Input 
                      id="sessionTimeout" 
                      type="number"
                      min="5"
                      max="120"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="twoFactorAuth" 
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                    />
                    <Label htmlFor="twoFactorAuth">Authentification à deux facteurs</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Protection contre les attaques</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginAttempts">Nombre max de tentatives de connexion</Label>
                    <Input 
                      id="loginAttempts" 
                      type="number"
                      min="3"
                      max="10"
                      value={securitySettings.loginAttempts}
                      onChange={(e) => setSecuritySettings({...securitySettings, loginAttempts: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="ipBlocking" 
                      checked={securitySettings.ipBlocking}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, ipBlocking: checked})}
                    />
                    <Label htmlFor="ipBlocking">Blocage d'IP après tentatives échouées</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('de sécurité')}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer les paramètres
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Database Settings */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de base de données</CardTitle>
              <CardDescription>
                Configurez les paramètres de connexion et de sauvegarde
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dbHost">Hôte</Label>
                  <Input 
                    id="dbHost" 
                    value={databaseSettings.dbHost}
                    onChange={(e) => setDatabaseSettings({...databaseSettings, dbHost: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dbPort">Port</Label>
                  <Input 
                    id="dbPort" 
                    value={databaseSettings.dbPort}
                    onChange={(e) => setDatabaseSettings({...databaseSettings, dbPort: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dbName">Nom de la base de données</Label>
                  <Input 
                    id="dbName" 
                    value={databaseSettings.dbName}
                    onChange={(e) => setDatabaseSettings({...databaseSettings, dbName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dbUsername">Nom d'utilisateur</Label>
                  <Input 
                    id="dbUsername" 
                    value={databaseSettings.dbUsername}
                    onChange={(e) => setDatabaseSettings({...databaseSettings, dbUsername: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dbPassword">Mot de passe</Label>
                <Input 
                  id="dbPassword" 
                  type="password"
                  value={databaseSettings.dbPassword}
                  onChange={(e) => setDatabaseSettings({...databaseSettings, dbPassword: e.target.value})}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Paramètres de sauvegarde</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Fréquence de sauvegarde</Label>
                    <Select 
                      value={databaseSettings.backupFrequency}
                      onValueChange={(value) => setDatabaseSettings({...databaseSettings, backupFrequency: value})}
                    >
                      <SelectTrigger id="backupFrequency">
                        <SelectValue placeholder="Sélectionner une fréquence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Toutes les heures</SelectItem>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly">Mensuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backupRetention">Rétention des sauvegardes (jours)</Label>
                    <Input 
                      id="backupRetention" 
                      type="number"
                      min="1"
                      max="365"
                      value={databaseSettings.backupRetention}
                      onChange={(e) => setDatabaseSettings({...databaseSettings, backupRetention: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="autoOptimize" 
                    checked={databaseSettings.autoOptimize}
                    onCheckedChange={(checked) => setDatabaseSettings({...databaseSettings, autoOptimize: checked})}
                  />
                  <Label htmlFor="autoOptimize">Optimisation automatique de la base de données</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleDatabaseBackup}>
                <Database className="h-4 w-4 mr-2" />
                Lancer une sauvegarde
              </Button>
              <Button onClick={() => handleSaveSettings('de base de données')}>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer les paramètres
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
