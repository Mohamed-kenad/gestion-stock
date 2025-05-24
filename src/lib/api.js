// API service for interacting with JSON Server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Log the API URL being used (remove in production)
console.log('Using API URL:', API_URL);

// Helper function for API calls with error handling
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`API call failed: ${url}`, error);
    throw error;
  }
};

// Mock data for fallbacks when server is unavailable
const mockData = {
  products: [
    { 
      id: 1, 
      name: 'Riz Basmati', 
      categoryId: 1, 
      category: 'Dry Goods',
      quantity: 100, 
      price: 25, 
      threshold: 20,
      unit: 'kg',
      description: 'Riz basmati de haute qualité',
      supplier: 'Fournisseur A',
      image: '/images/products/rice.jpg'
    },
    { 
      id: 2, 
      name: 'Pâtes Penne', 
      categoryId: 1, 
      category: 'Dry Goods',
      quantity: 150, 
      price: 15, 
      threshold: 30,
      unit: 'kg',
      description: 'Pâtes penne italiennes',
      supplier: 'Fournisseur B',
      image: '/images/products/pasta.jpg'
    },
    { 
      id: 3, 
      name: 'Sauce Tomate', 
      categoryId: 2, 
      category: 'Condiments',
      quantity: 80, 
      price: 10, 
      threshold: 15,
      unit: 'bouteille',
      description: 'Sauce tomate maison',
      supplier: 'Fournisseur C',
      image: '/images/products/tomato-sauce.jpg'
    },
    { 
      id: 4, 
      name: 'Huile d\'Olive', 
      categoryId: 2, 
      category: 'Condiments',
      quantity: 50, 
      price: 30, 
      threshold: 10,
      unit: 'L',
      description: 'Huile d\'olive extra vierge',
      supplier: 'Fournisseur D',
      image: '/images/products/olive-oil.jpg'
    },
    { 
      id: 5, 
      name: 'Poulet', 
      categoryId: 3, 
      category: 'Meat',
      quantity: 40, 
      price: 50, 
      threshold: 10,
      unit: 'kg',
      description: 'Poulet fermier',
      supplier: 'Fournisseur E',
      image: '/images/products/chicken.jpg'
    },
    { 
      id: 6, 
      name: 'Bœuf', 
      categoryId: 3, 
      category: 'Meat',
      quantity: 30, 
      price: 70, 
      threshold: 5,
      unit: 'kg',
      description: 'Bœuf de qualité supérieure',
      supplier: 'Fournisseur F',
      image: '/images/products/beef.jpg'
    }
  ],
  categories: [
    { id: 1, name: 'Dry Goods', description: 'Pasta, rice, grains, etc.' },
    { id: 2, name: 'Condiments', description: 'Sauces, oils, spices, etc.' },
    { id: 3, name: 'Meat', description: 'Chicken, beef, pork, etc.' },
    { id: 4, name: 'Dairy', description: 'Milk, cheese, yogurt, etc.' },
    { id: 5, name: 'Vegetables', description: 'Fresh vegetables' },
    { id: 6, name: 'Fruits', description: 'Fresh fruits' }
  ],
  orders: [
    {
      id: 'PO-2025-001',
      title: 'Commande ingrédients de base',
      userId: 2,
      createdBy: 'Ahmed Benali',
      createdByRole: 'Vendor',
      department: 'Cuisine',
      supplier: 'Fournisseur A',
      createdAt: '2025-05-20',
      date: '2025-05-20',
      status: 'pending',
      total: 350.50,
      comments: [],
      items: [
        { id: 1, product: 'Riz Basmati', category: 'Dry Goods', quantity: 10, unit: 'kg', price: 25, total: 250 },
        { id: 2, product: 'Sauce Tomate', category: 'Condiments', quantity: 5, unit: 'bouteille', price: 10, total: 50 }
      ]
    },
    {
      id: 'PO-2025-002',
      title: 'Commande huiles et condiments',
      userId: 2,
      createdBy: 'Ahmed Benali',
      createdByRole: 'Vendor',
      department: 'Cuisine',
      supplier: 'Fournisseur B',
      createdAt: '2025-05-21',
      date: '2025-05-21',
      approvedBy: 'Karim Mansouri',
      approvedAt: '2025-05-22',
      status: 'approved',
      total: 390.00,
      comments: [
        { author: 'Karim Mansouri', date: '2025-05-22', text: 'Approuvé avec modification de quantité.' }
      ],
      items: [
        { id: 1, product: 'Pâtes Penne', category: 'Dry Goods', quantity: 15, unit: 'kg', price: 15, total: 225 },
        { id: 2, product: 'Huile d\'Olive', category: 'Condiments', quantity: 8, unit: 'L', price: 30, total: 240 }
      ]
    },
    {
      id: 'PO-2025-003',
      title: 'Commande viandes',
      userId: 2,
      createdBy: 'Fatima Zahra',
      createdByRole: 'Vendor',
      department: 'Boucherie',
      supplier: 'Fournisseur C',
      createdAt: '2025-05-22',
      date: '2025-05-22',
      status: 'processing',
      total: 1140.00,
      comments: [],
      items: [
        { id: 1, product: 'Poulet', category: 'Meat', quantity: 12, unit: 'kg', price: 50, total: 600 },
        { id: 2, product: 'Bœuf', category: 'Meat', quantity: 6, unit: 'kg', price: 70, total: 420 }
      ]
    },
    {
      id: 'PO-2025-004',
      title: 'Commande légumes',
      userId: 3,
      createdBy: 'Mohammed Alami',
      createdByRole: 'Vendor',
      department: 'Cuisine',
      supplier: 'Fournisseur D',
      createdAt: '2025-05-23',
      date: '2025-05-23',
      status: 'rejected',
      rejectedBy: 'Karim Mansouri',
      rejectedAt: '2025-05-24',
      total: 450.00,
      comments: [
        { author: 'Karim Mansouri', date: '2025-05-24', text: 'Budget dépassé pour ce mois.' }
      ],
      items: [
        { id: 1, product: 'Tomates', category: 'Vegetables', quantity: 20, unit: 'kg', price: 15, total: 300 },
        { id: 2, product: 'Oignons', category: 'Vegetables', quantity: 15, unit: 'kg', price: 10, total: 150 }
      ]
    },
    {
      id: 'PO-2025-005',
      title: 'Commande fruits',
      userId: 3,
      createdBy: 'Mohammed Alami',
      createdByRole: 'Vendor',
      department: 'Pâtisserie',
      supplier: 'Fournisseur E',
      createdAt: '2025-05-24',
      date: '2025-05-24',
      status: 'delivered',
      approvedBy: 'Karim Mansouri',
      approvedAt: '2025-05-25',
      deliveredAt: '2025-05-26',
      total: 520.00,
      comments: [],
      items: [
        { id: 1, product: 'Pommes', category: 'Fruits', quantity: 25, unit: 'kg', price: 12, total: 300 },
        { id: 2, product: 'Oranges', category: 'Fruits', quantity: 20, unit: 'kg', price: 11, total: 220 }
      ]
    }
  ],
  customers: [
    { id: 1, name: 'Restaurant Marrakech', type: 'business', email: 'contact@marrakech.com', phone: '0612345678' },
    { id: 2, name: 'Café Central', type: 'business', email: 'info@cafecentral.com', phone: '0623456789' },
    { id: 3, name: 'Hôtel Royal', type: 'business', email: 'reservation@hotelroyal.com', phone: '0634567890' },
    { id: 4, name: 'Client occasionnel', type: 'individual', email: '', phone: '' }
  ]
};

// Additional mock data for chef components
const chefMockData = {
  // For ValidateOrders component
  validateOrders: [
    {
      id: 'PO-2025-010',
      title: 'Commande épices',
      userId: 4,
      createdBy: 'Rachid Tazi',
      createdByRole: 'Vendor',
      department: 'Cuisine',
      supplier: 'Fournisseur G',
      createdAt: '2025-05-25',
      date: '2025-05-25',
      status: 'pending',
      total: 420.50,
      comments: [],
      progressPercentage: 25,
      items: [
        { id: 1, product: 'Cumin', category: 'Spices', quantity: 5, unit: 'kg', price: 45, total: 225 },
        { id: 2, product: 'Paprika', category: 'Spices', quantity: 3, unit: 'kg', price: 65, total: 195 }
      ],
      validationNote: ''
    },
    {
      id: 'PO-2025-011',
      title: 'Commande produits laitiers',
      userId: 5,
      createdBy: 'Samira Kadiri',
      createdByRole: 'Vendor',
      department: 'Pâtisserie',
      supplier: 'Fournisseur H',
      createdAt: '2025-05-26',
      date: '2025-05-26',
      status: 'pending',
      total: 850.00,
      comments: [],
      progressPercentage: 25,
      items: [
        { id: 1, product: 'Lait', category: 'Dairy', quantity: 50, unit: 'L', price: 8, total: 400 },
        { id: 2, product: 'Beurre', category: 'Dairy', quantity: 15, unit: 'kg', price: 30, total: 450 }
      ],
      validationNote: ''
    }
  ],
  
  // For ApprovedOrdersTracking component
  approvedOrders: [
    {
      id: 'PO-2025-006',
      title: 'Commande huiles',
      createdBy: 'Ahmed Benali',
      createdByRole: 'Vendor',
      supplier: 'Fournisseur B',
      department: 'Cuisine',
      createdAt: '2025-05-27',
      approvedBy: 'Karim Mansouri',
      approvedAt: '2025-05-28',
      validationNote: 'Approuvé pour la cuisine principale.',
      purchaseStatus: 'completed',
      purchasedAt: '2025-05-29',
      purchasedBy: 'Nadia Tazi',
      deliveryStatus: 'in_progress',
      deliveredAt: null,
      receivedBy: null,
      totalItems: 2,
      estimatedTotal: 520.00,
      actualTotal: 520.00,
      progressPercentage: 75,
      items: [
        { id: 1, name: 'Huile d\'Olive', category: 'Condiments', quantity: 10, unit: 'L', unitPrice: 30, total: 300, status: 'purchased', receivedQuantity: 0 },
        { id: 2, name: 'Huile de Tournesol', category: 'Condiments', quantity: 20, unit: 'L', unitPrice: 11, total: 220, status: 'purchased', receivedQuantity: 0 }
      ]
    },
    {
      id: 'PO-2025-007',
      title: 'Commande légumes',
      createdBy: 'Fatima Zahra',
      createdByRole: 'Vendor',
      supplier: 'Fournisseur D',
      department: 'Cuisine',
      createdAt: '2025-05-28',
      approvedBy: 'Karim Mansouri',
      approvedAt: '2025-05-29',
      validationNote: 'Approuvé avec modification de quantité.',
      purchaseStatus: 'completed',
      purchasedAt: '2025-05-30',
      purchasedBy: 'Nadia Tazi',
      deliveryStatus: 'completed',
      deliveredAt: '2025-05-31',
      receivedBy: 'Hassan Benjelloun',
      totalItems: 3,
      estimatedTotal: 750.00,
      actualTotal: 720.50,
      progressPercentage: 100,
      items: [
        { id: 1, name: 'Tomates', category: 'Vegetables', quantity: 25, unit: 'kg', unitPrice: 15, total: 375, status: 'delivered', receivedQuantity: 25 },
        { id: 2, name: 'Oignons', category: 'Vegetables', quantity: 20, unit: 'kg', unitPrice: 10, total: 200, status: 'delivered', receivedQuantity: 20 },
        { id: 3, name: 'Poivrons', category: 'Vegetables', quantity: 15, unit: 'kg', unitPrice: 12, total: 180, status: 'delivered', receivedQuantity: 15 }
      ]
    }
  ]
};

// Generic fetch function with error handling (no mock data fallback)
async function fetchData(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // Log the error and rethrow it
    console.error(`API Error with ${endpoint}:`, error.message);
    throw error;
  }
}

// Authentication
export const authAPI = {
  login: (credentials) => fetchData('login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  register: (userData) => fetchData('users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
};

// Users
export const usersAPI = {
  getAll: () => fetchData('users'),
  getById: (id) => fetchData(`users/${id}`),
  create: (userData) => fetchData('users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  update: (id, userData) => fetchData(`users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(userData),
  }),
  delete: (id) => fetchData(`users/${id}`, {
    method: 'DELETE',
  }),
};

// Roles
export const rolesAPI = {
  getAll: () => fetchData('roles'),
  getById: (id) => fetchData(`roles/${id}`),
};

// Categories
export const categoriesAPI = {
  getAll: () => fetchData('categories'),
  getById: (id) => fetchData(`categories/${id}`),
  create: (categoryData) => fetchData('categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  }),
  update: (id, categoryData) => fetchData(`categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(categoryData),
  }),
  delete: (id) => fetchData(`categories/${id}`, {
    method: 'DELETE',
  }),
};

// Products
export const productsAPI = {
  getAll: () => fetchData('products'),
  getById: (id) => fetchData(`products/${id}`),
  getByCategory: (categoryId) => fetchData(`products?categoryId=${categoryId}`),
  create: (productData) => fetchData('products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),
  update: (id, productData) => fetchData(`products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(productData),
  }),
  delete: (id) => fetchData(`products/${id}`, {
    method: 'DELETE',
  }),
};

// Orders
export const ordersAPI = {
  getAll: () => fetchData('orders'),
  getById: (id) => fetchData(`orders/${id}`),
  getByUser: (userId) => fetchData(`orders?userId=${userId}`),
  getByStatus: (status) => fetchData(`orders?status=${status}`),
  create: (orderData) => {
    // Generate a unique ID for the order if not provided
    if (!orderData.id) {
      orderData.id = `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
    
    // Ensure the order has the necessary fields for filtering
    const enhancedOrderData = {
      ...orderData,
      status: orderData.status || 'pending', // Default status
      createdAt: orderData.createdAt || new Date().toISOString().split('T')[0],
      date: orderData.date || new Date().toISOString().split('T')[0],
    };
    
    console.log('Creating new order:', enhancedOrderData);
    
    return fetchData('orders', {
      method: 'POST',
      body: JSON.stringify(enhancedOrderData),
    });
  },
  update: (id, orderData) => fetchData(`orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(orderData),
  }),
  delete: (id) => fetchData(`orders/${id}`, {
    method: 'DELETE',
  }),
  // Helper method to add mock orders for testing
  addMockOrder: (orderData) => {
    // Add a mock order to the mock data
    const newOrder = {
      id: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      ...orderData,
      status: orderData.status || 'pending',
      createdAt: orderData.createdAt || new Date().toISOString().split('T')[0],
      date: orderData.date || new Date().toISOString().split('T')[0],
    };
    
    // Add to both regular orders and chef orders
    mockData.orders.push(newOrder);
    if (chefMockData.validateOrders) {
      chefMockData.validateOrders.push(newOrder);
    }
    
    return Promise.resolve(newOrder);
  }
};

// Inventory
export const inventoryAPI = {
  getAll: () => fetchData('inventory'),
  getById: (id) => fetchData(`inventory/${id}`),
  getByProduct: (productId) => fetchData(`inventory?productId=${productId}`),
  create: (inventoryData) => fetchData('inventory', {
    method: 'POST',
    body: JSON.stringify(inventoryData),
  }),
  update: (id, inventoryData) => fetchData(`inventory/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(inventoryData),
  }),
  delete: (id) => fetchData(`inventory/${id}`, {
    method: 'DELETE',
  }),
  // Get low stock items (below threshold)
  getLowStock: () => fetchData('inventory').then(items => 
    items.filter(item => item.quantity <= item.threshold)
  ),
  // Get out of stock items
  getOutOfStock: () => fetchData('inventory').then(items => 
    items.filter(item => item.quantity === 0)
  ),
  // Get pending receptions (approved orders waiting to be received)
  getPendingReceptions: () => fetchData('orders').then(orders => 
    orders.filter(order => order.status === 'approved')
      .map(order => ({
        id: order.id,
        orderId: order.id,
        vendorName: order.supplier,
        expectedDate: order.expectedDeliveryDate || order.date,
        status: order.status,
        productCount: order.items?.length || 0
      }))
  ),
  // Get low stock items (combined function for dashboard)
  getLowStockItems: () => fetchData('inventory').then(items => 
    items.filter(item => item.quantity <= (item.threshold || 10))
      .map(async item => {
        const product = await fetchData(`products/${item.productId}`).catch(() => ({ name: `Product #${item.productId}` }));
        return {
          id: item.id,
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          threshold: item.threshold || 10
        };
      })
  ).then(promises => Promise.all(promises)),
};

// Sales
export const salesAPI = {
  getAll: () => fetchData('sales'),
  getById: (id) => fetchData(`sales/${id}`),
  getByCashier: (cashierId) => fetchData(`sales?cashierId=${cashierId}`),
  create: (saleData) => fetchData('sales', {
    method: 'POST',
    body: JSON.stringify(saleData),
  }),
};

// Purchases
export const purchasesAPI = {
  getAll: () => fetchData('purchases'),
  getById: (id) => fetchData(`purchases/${id}`),
  create: (purchaseData) => fetchData('purchases', {
    method: 'POST',
    body: JSON.stringify(purchaseData),
  }),
};

// Suppliers
export const suppliersAPI = {
  getAll: () => fetchData('suppliers'),
  getById: (id) => fetchData(`suppliers/${id}`),
  create: (supplierData) => fetchData('suppliers', {
    method: 'POST',
    body: JSON.stringify(supplierData),
  }),
  update: (id, supplierData) => fetchData(`suppliers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(supplierData),
  }),
  delete: (id) => fetchData(`suppliers/${id}`, {
    method: 'DELETE',
  }),
};

// Customers
export const customersAPI = {
  getAll: () => fetchData('customers'),
  getById: (id) => fetchData(`customers/${id}`),
  create: (customerData) => fetchData('customers', {
    method: 'POST',
    body: JSON.stringify(customerData),
  }),
  update: (id, customerData) => fetchData(`customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(customerData),
  }),
  delete: (id) => fetchData(`customers/${id}`, {
    method: 'DELETE',
  }),
};

// Product Bundles
export const productBundlesAPI = {
  getAll: () => fetchData('productBundles'),
  getById: (id) => fetchData(`productBundles/${id}`),
  create: (bundleData) => fetchData('productBundles', {
    method: 'POST',
    body: JSON.stringify(bundleData),
  }),
  update: (id, bundleData) => fetchData(`productBundles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(bundleData),
  }),
  delete: (id) => fetchData(`productBundles/${id}`, {
    method: 'DELETE',
  }),
};

// Stock Movements
export const stockMovementsAPI = {
  // Use stockMovementsDetailed for the detailed view with notes, orderId, etc.
  getAll: () => fetchData('stockMovementsDetailed'),
  getById: (id) => fetchData(`stockMovementsDetailed/${id}`),
  getByProduct: (productId) => fetchData(`stockMovementsDetailed?productId=${productId}`),
  getByType: (type) => fetchData(`stockMovementsDetailed?type=${type}`),
  getRecent: (limit = 10) => fetchData('stockMovementsDetailed')
    .then(movements => {
      // Sort by date (most recent first)
      const sorted = [...movements].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      // Return only the requested number of movements
      return sorted.slice(0, limit);
    }),
  getByDateRange: (startDate, endDate) => fetchData('stockMovementsDetailed').then(movements => 
    movements.filter(movement => {
      const moveDate = new Date(movement.date);
      return moveDate >= new Date(startDate) && moveDate <= new Date(endDate);
    })
  ),
  create: (movementData) => fetchData('stockMovementsDetailed', {
    method: 'POST',
    body: JSON.stringify(movementData),
  }),
  // Record stock receipt (from approved orders)
  recordReceipt: (orderId, items, userId) => {
    // Create a movement for each item
    const movements = items.map(item => ({
      productId: item.productId,
      type: 'receive',
      quantity: item.receivedQuantity,
      date: new Date().toISOString().split('T')[0],
      orderId,
      userId,
      notes: `Receipt from order ${orderId}`
    }));
    
    // Create all movements
    return Promise.all(movements.map(movement => 
      fetchData('stockMovementsDetailed', {
        method: 'POST',
        body: JSON.stringify(movement),
      })
    ));
  },
  // Record stock issue (to departments)
  recordIssue: (departmentId, items, userId) => {
    // Create a movement for each item
    const movements = items.map(item => ({
      productId: item.productId,
      type: 'issue',
      quantity: -item.quantity, // Negative for outgoing
      date: new Date().toISOString().split('T')[0],
      departmentId,
      userId,
      notes: `Issued to department ${departmentId}`
    }));
    
    // Create all movements
    return Promise.all(movements.map(movement => 
      fetchData('stockMovementsDetailed', {
        method: 'POST',
        body: JSON.stringify(movement),
      })
    ));
  },
};

// Notifications
export const notificationsAPI = {
  getAll: () => fetchData('notifications'),
  getById: (id) => fetchData(`notifications/${id}`),
  getByRecipient: (recipientId) => fetchData(`notifications?recipientId=${recipientId}`),
  getUnread: (recipientId) => fetchData(`notifications?recipientId=${recipientId}&read=false`),
  create: (notificationData) => fetchData('notifications', {
    method: 'POST',
    body: JSON.stringify(notificationData),
  }),
  markAsRead: async (id) => {
    const notification = await fetchData(`notifications/${id}`);
    return fetchData(`notifications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ...notification, read: true }),
    });
  },
  // Send notification to Audite for price setting
  notifyForPricing: (productId, productName, quantity) => {
    const notification = {
      title: 'Nouveau produit à tarifer',
      message: `${quantity} unités de ${productName} ont été reçues et nécessitent un prix de vente.`,
      type: 'price_setting',
      recipientId: 4, // Audite role ID
      productId,
      date: new Date().toISOString().split('T')[0],
      read: false,
      priority: 'high'
    };
    
    return fetchData('notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  },
  // Send low stock notification
  notifyLowStock: (productId, productName, currentQuantity, threshold) => {
    const notification = {
      title: 'Stock bas',
      message: `Le produit ${productName} est en stock bas (${currentQuantity}/${threshold}).`,
      type: 'low_stock',
      recipientId: 5, // Magasinier role ID
      productId,
      date: new Date().toISOString().split('T')[0],
      read: false,
      priority: 'medium'
    };
    
    return fetchData('notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  },
  // Send out of stock notification
  notifyOutOfStock: (productId, productName) => {
    const notification = {
      title: 'Produit épuisé',
      message: `Le produit ${productName} est épuisé.`,
      type: 'out_of_stock',
      recipientId: 5, // Magasinier role ID
      productId,
      date: new Date().toISOString().split('T')[0],
      read: false,
      priority: 'high'
    };
    
    return fetchData('notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  },
  // Notify vendor that products are available
  notifyVendor: (vendorId, message, reference) => {
    const notification = {
      title: 'Produits disponibles',
      message,
      type: 'products_available',
      recipientId: vendorId,
      reference,
      date: new Date().toISOString().split('T')[0],
      read: false,
      priority: 'medium'
    };
    
    return fetchData('notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  },
};

// Bons (Discount Vouchers)
export const bonsAPI = {
  getAll: () => fetchData('bons'),
  getById: (id) => fetchData(`bons/${id}`),
  create: (bonData) => fetchData('bons', {
    method: 'POST',
    body: JSON.stringify(bonData),
  }),
  update: (id, bonData) => fetchData(`bons/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(bonData),
  }),
  delete: (id) => fetchData(`bons/${id}`, {
    method: 'DELETE',
  }),
};

export default {
  auth: authAPI,
  users: usersAPI,
  roles: rolesAPI,
  categories: categoriesAPI,
  products: productsAPI,
  orders: ordersAPI,
  inventory: inventoryAPI,
  sales: salesAPI,
  purchases: purchasesAPI,
  suppliers: suppliersAPI,
  customers: customersAPI,
  productBundles: productBundlesAPI,
  stockMovements: stockMovementsAPI,
  bons: bonsAPI,
};
