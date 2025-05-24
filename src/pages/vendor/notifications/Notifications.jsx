import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, CheckCircle2, XCircle, Clock, AlertTriangle, 
  FileText, ShoppingCart, Package, Filter, Eye, Trash2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

// Mock data for notifications
const mockNotifications = [
  {
    id: 1,
    type: 'order_approved',
    title: 'Bon de commande approuvé',
    message: 'Votre bon de commande BC-2025-002 a été approuvé par Chef Pierre.',
    date: '2025-05-11T10:30:00',
    read: true,
    actionLink: '/dashboard/vendor/orders',
    actionText: 'Voir le bon',
    relatedId: 'BC-2025-002',
  },
  {
    id: 2,
    type: 'order_rejected',
    title: 'Bon de commande rejeté',
    message: 'Votre bon de commande BC-2025-003 a été rejeté par Chef Pierre. Motif: Stock suffisant, commande non nécessaire pour le moment.',
    date: '2025-05-19T14:15:00',
    read: true,
    actionLink: '/dashboard/vendor/orders',
    actionText: 'Voir le bon',
    relatedId: 'BC-2025-003',
  },
  {
    id: 3,
    type: 'order_delivered',
    title: 'Livraison effectuée',
    message: 'Le bon de commande BC-2025-004 a été livré et réceptionné par le magasin.',
    date: '2025-05-17T09:45:00',
    read: false,
    actionLink: '/dashboard/vendor/orders',
    actionText: 'Voir le bon',
    relatedId: 'BC-2025-004',
  },
  {
    id: 4,
    type: 'low_stock',
    title: 'Alerte de stock',
    message: 'Le produit "Lapin entier" est en stock bas (3 kg restants).',
    date: '2025-05-20T08:30:00',
    read: false,
    actionLink: '/dashboard/vendor/products',
    actionText: 'Voir les produits',
    relatedId: 'product-7',
  },
  {
    id: 5,
    type: 'low_stock',
    title: 'Alerte de stock',
    message: 'Le produit "Foie de veau" est en stock bas (5 kg restants).',
    date: '2025-05-20T08:30:00',
    read: false,
    actionLink: '/dashboard/vendor/products',
    actionText: 'Voir les produits',
    relatedId: 'product-6',
  },
  {
    id: 6,
    type: 'system',
    title: 'Maintenance système',
    message: 'Une maintenance système est prévue le 25 mai 2025 de 22h00 à 00h00. Le système sera indisponible pendant cette période.',
    date: '2025-05-18T11:00:00',
    read: false,
    actionLink: null,
    actionText: null,
    relatedId: null,
  },
  {
    id: 7,
    type: 'order_processing',
    title: 'Bon de commande en traitement',
    message: 'Votre bon de commande BC-2025-005 est en cours de traitement par le service achat.',
    date: '2025-05-18T15:20:00',
    read: false,
    actionLink: '/dashboard/vendor/orders',
    actionText: 'Voir le bon',
    relatedId: 'BC-2025-005',
  },
];

const Notifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
    }, 500);
  }, []);
  
  // Filter notifications based on type and read status
  const getFilteredNotifications = (readStatus) => {
    return notifications.filter(notification => {
      const matchesType = typeFilter === 'all' || notification.type === typeFilter;
      const matchesReadStatus = readStatus === 'all' || 
        (readStatus === 'unread' && !notification.read) || 
        (readStatus === 'read' && notification.read);
      
      return matchesType && matchesReadStatus;
    });
  };
  
  const unreadNotifications = getFilteredNotifications('unread');
  const readNotifications = getFilteredNotifications('read');
  const allFilteredNotifications = getFilteredNotifications('all');
  
  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true } 
        : notification
    ));
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    
    toast({
      title: "Toutes les notifications marquées comme lues",
      description: `${unreadNotifications.length} notifications ont été marquées comme lues.`,
    });
  };
  
  // Delete notification
  const deleteNotification = (notificationId) => {
    setNotifications(notifications.filter(notification => notification.id !== notificationId));
    
    toast({
      title: "Notification supprimée",
      description: "La notification a été supprimée avec succès.",
    });
  };
  
  // Delete all read notifications
  const deleteAllReadNotifications = () => {
    setNotifications(notifications.filter(notification => !notification.read));
    setShowDeleteConfirm(false);
    
    toast({
      title: "Notifications supprimées",
      description: `${readNotifications.length} notifications lues ont été supprimées.`,
    });
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Navigate to related page if action link exists
    if (notification.actionLink) {
      navigate(notification.actionLink);
    }
  };
  
  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_approved':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'order_rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'order_delivered':
        return <Package className="h-5 w-5 text-gray-500" />;
      case 'order_processing':
        return <Clock className="h-5 w-5 text-purple-500" />;
      case 'low_stock':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Consultez vos notifications et alertes système
          </p>
        </div>
        <div className="flex space-x-2">
          {unreadNotifications.length > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
          {readNotifications.length > 0 && (
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer les lus
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer les notifications lues</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer toutes les notifications lues ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAllReadNotifications}>Supprimer</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrer par type:</span>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type de notification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les notifications</SelectItem>
                <SelectItem value="order_approved">Bons approuvés</SelectItem>
                <SelectItem value="order_rejected">Bons rejetés</SelectItem>
                <SelectItem value="order_delivered">Livraisons</SelectItem>
                <SelectItem value="order_processing">Bons en traitement</SelectItem>
                <SelectItem value="low_stock">Alertes de stock</SelectItem>
                <SelectItem value="system">Système</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Notifications */}
      <Tabs defaultValue="unread" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unread">
            Non lues {unreadNotifications.length > 0 && `(${unreadNotifications.length})`}
          </TabsTrigger>
          <TabsTrigger value="read">
            Lues {readNotifications.length > 0 && `(${readNotifications.length})`}
          </TabsTrigger>
          <TabsTrigger value="all">
            Toutes {allFilteredNotifications.length > 0 && `(${allFilteredNotifications.length})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="unread" className="pt-4">
          {unreadNotifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Aucune notification non lue</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vous avez lu toutes vos notifications
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <ScrollArea className="h-[500px]">
                <CardContent className="p-0">
                  <div className="divide-y">
                    {unreadNotifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className="p-4 hover:bg-muted/50 cursor-pointer relative"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="absolute top-4 right-4">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Nouveau
                          </Badge>
                        </div>
                        <div className="flex items-start space-x-4 pr-20">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(notification.date)}
                              </span>
                              {notification.actionLink && (
                                <Button 
                                  variant="link" 
                                  size="sm" 
                                  className="h-auto p-0 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                    navigate(notification.actionLink);
                                  }}
                                >
                                  {notification.actionText}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="read" className="pt-4">
          {readNotifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Aucune notification lue</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vous n'avez pas encore de notifications lues
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <ScrollArea className="h-[500px]">
                <CardContent className="p-0">
                  <div className="divide-y">
                    {readNotifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className="p-4 hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-muted-foreground">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(notification.date)}
                              </span>
                              <div className="flex space-x-2">
                                {notification.actionLink && (
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="h-auto p-0 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(notification.actionLink);
                                    }}
                                  >
                                    {notification.actionText}
                                  </Button>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-5 w-5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="pt-4">
          {allFilteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Aucune notification</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Vous n'avez pas encore reçu de notifications
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <ScrollArea className="h-[500px]">
                <CardContent className="p-0">
                  <div className="divide-y">
                    {allFilteredNotifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 hover:bg-muted/50 cursor-pointer ${!notification.read ? 'bg-blue-50/30' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${!notification.read ? '' : 'text-muted-foreground'}`}>
                              {notification.title}
                              {!notification.read && (
                                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                                  Nouveau
                                </Badge>
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(notification.date)}
                              </span>
                              <div className="flex space-x-2">
                                {notification.actionLink && (
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="h-auto p-0 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                      navigate(notification.actionLink);
                                    }}
                                  >
                                    {notification.actionText}
                                  </Button>
                                )}
                                {notification.read && (
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
