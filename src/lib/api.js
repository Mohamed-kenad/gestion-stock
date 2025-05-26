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
  // Mock purchase requests from Magasin2 to Achat2
  magasin2PurchaseRequests: [
    {
      id: 'PR-2025-001',
      title: 'Demande d\'approvisionnement - Stock faible',
      type: 'purchase',
      status: 'pending',
      priority: 'high',
      departmentId: 'magasin2',
      createdBy: 'Magasin2 Department',
      createdAt: '2025-05-24T10:30:00.000Z',
      items: [
        {
          id: 1,
          productId: 1,
          name: 'Riz Basmati',
          quantity: 50,
          unit: 'kg',
          currentStock: 15,
          threshold: 20
        },
        {
          id: 2,
          productId: 4,
          name: 'Huile d\'Olive',
          quantity: 30,
          unit: 'L',
          currentStock: 5,
          threshold: 10
        }
      ],
      notes: 'Demande urgente pour réapprovisionner les stocks faibles.'
    },
    {
      id: 'PR-2025-002',
      title: 'Demande d\'approvisionnement - Rupture de stock',
      type: 'purchase',
      status: 'pending',
      priority: 'urgent',
      departmentId: 'magasin2',
      createdBy: 'Magasin2 Department',
      createdAt: '2025-05-25T09:15:00.000Z',
      items: [
        {
          id: 3,
          productId: 6,
          name: 'Bœuf',
          quantity: 25,
          unit: 'kg',
          currentStock: 0,
          threshold: 5
        }
      ],
      notes: 'Produit en rupture de stock. Approvisionnement urgent requis.'
    }
  ],
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

// Helper function to map order status to request status
const mapOrderStatusToRequestStatus = (orderStatus) => {
  switch (orderStatus) {
    case 'pending':
    case 'approved':
      return 'pending';
    case 'processing':
    case 'completed':
    case 'delivered':
      return 'completed';
    case 'rejected':
    case 'cancelled':
      return 'rejected';
    default:
      return 'pending';
  }
};

// Orders
export const ordersAPI = {
  getAll: () => fetchData('orders'),
  getByDepartmentAndType: async (department, type, statuses = []) => {
    try {
      console.log(`Fetching orders for department: ${department}, type: ${type}, statuses:`, statuses);
      const response = await fetch(`${API_URL}/orders`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const orders = await response.json();
      console.log('All orders from API:', orders.length);
      
      // Strict filtering to ensure only Magasin2 purchase requests are shown in Achat2
      const filteredOrders = orders.filter(order => {
        // Explicitly check for departmentId field (not department)
        const departmentMatch = order.departmentId === department;
        
        // Explicitly check for type field
        const typeMatch = order.type === type;
        
        // Status check
        const statusMatch = statuses.length === 0 || statuses.includes(order.status);
        
        // Only return orders that have BOTH departmentId and type fields matching
        return departmentMatch && typeMatch && statusMatch;
      });
      
      console.log(`Filtered orders for ${department} ${type}:`, filteredOrders.length);
      return filteredOrders;
    } catch (error) {
      console.error(`Error fetching orders for department ${department}:`, error);
      return [];
    }
  },
  getByDepartment: async (department, type = null) => {
    try {
      console.log(`Fetching orders for department: ${department}`);
      const response = await fetch(`${API_URL}/orders`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const orders = await response.json();
      
      // Filter by department and optionally by type
      const filteredOrders = orders.filter(order => {
        const departmentMatch = order.departmentId?.toLowerCase() === department.toLowerCase();
        const typeMatch = type ? order.type?.toLowerCase() === type.toLowerCase() : true;
        
        return departmentMatch && typeMatch;
      });
      
      return filteredOrders;
    } catch (error) {
      console.error(`Error fetching orders for department ${department}:`, error);
      return [];
    }
  },
  create: async (data) => {
    console.log('Creating new order with data:', data);
    try {
      // Generate a unique ID for the order if not provided
      if (!data.id) {
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000);
        data.id = `PO-${new Date().getFullYear()}-${timestamp.toString().slice(-3)}${random}`;
      }
      
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
  update: async (id, data) => {
    console.log(`Updating order ${id} with data:`, data);
    try {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
      throw error;
    }
  },
  getVendorRequests: async (status) => {
    try {
      // Get vendor orders directly from the database
      // Note: JSON Server is case-sensitive, so we'll handle this in our code
      let url = `${API_URL}/orders`;
      
      // Don't use mock data anymore, always try to fetch from the server
      console.log('Fetching real vendor orders from database');
      
      // Try to fetch from the API
      try {
        console.log('Fetching orders from URL:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const orders = await response.json();
        console.log('All orders from API:', orders);
        
        // Filter for vendor orders (case-insensitive)
        console.log('Checking for vendor orders with createdByRole');
        const vendorOrders = orders.filter(order => {
          console.log('Order:', order.id, 'createdByRole:', order.createdByRole);
          const isVendorOrder = order.createdByRole && 
                 order.createdByRole.toLowerCase() === 'vendor';
          if (isVendorOrder) {
            console.log('Found vendor order:', order.id);
          }
          return isVendorOrder;
        });
        console.log('Filtered vendor orders:', vendorOrders.length);
        
        // Transform orders to vendor requests format
        return vendorOrders.map(order => ({
          id: order.id,
          vendorName: order.createdBy,
          department: order.department,
          status: mapOrderStatusToRequestStatus(order.status),
          requestDate: order.createdAt,
          completedDate: order.completedAt || order.deliveredAt,
          rejectedDate: order.rejectedAt,
          rejectionReason: order.reviewComment,
          items: order.items.map(item => ({
            id: item.id,
            product: item.product,
            quantity: item.quantity,
            unit: item.unit,
            provided: item.provided
          }))
        }));
      } catch (error) {
        console.error('Error fetching vendor requests from API:', error);
        // Return empty array instead of mock data
        console.log('API error - returning empty array instead of mock data');
        return [];
      }
    } catch (error) {
      console.error('Error in getVendorRequests:', error);
      return [];
    }
  },
  getById: (id) => {
    try {
      // First try to get the order directly by ID
      return fetchData(`orders/${id}`)
        .catch(error => {
          // If that fails, try to find the order by querying all orders and filtering
          console.log(`Failed to fetch order directly with ID ${id}, trying alternative method`);
          return fetchData('orders')
            .then(orders => {
              const order = orders.find(o => o.id === id);
              if (!order) {
                throw new Error(`Order with ID ${id} not found`);
              }
              return order;
            });
        });
    } catch (error) {
      console.error(`Error fetching order with ID ${id}:`, error);
      throw error;
    }
  },
  getByUser: (userId) => fetchData(`orders?userId=${userId}`),
  getByStatus: (status) => fetchData(`orders?status=${status}`),
  getByDepartment: (departmentId, type) => {
    // If using mock data and looking for Magasin2 purchase requests
    if (!API_URL && departmentId === 'magasin2' && type === 'purchase') {
      console.log('Using mock data for Magasin2 purchase requests');
      return Promise.resolve([...mockData.magasin2PurchaseRequests]);
    }
    
    // Otherwise use the API with proper filtering
    return fetchData(`orders?departmentId=${departmentId}${type ? `&type=${type}` : ''}`);
  },
  getByDepartmentAndType: (departmentId, type, status) => {
    // If using mock data and looking for Magasin2 purchase requests
    if (!API_URL && departmentId === 'magasin2' && type === 'purchase') {
      console.log('Using mock data for Magasin2 purchase requests');
      let filteredRequests = [...mockData.magasin2PurchaseRequests];
      
      // Filter by status if provided
      if (status) {
        const statusArray = Array.isArray(status) ? status : [status];
        filteredRequests = filteredRequests.filter(req => statusArray.includes(req.status));
      }
      
      return Promise.resolve(filteredRequests);
    }
    
    // Otherwise use the API
    let url = `orders?departmentId=${departmentId}`;
    if (type) url += `&type=${type}`;
    if (status && Array.isArray(status)) {
      status.forEach(s => url += `&status=${s}`);
    } else if (status) {
      url += `&status=${status}`;
    }
    return fetchData(url);
  },
  // Chef-specific API functions
  getDecisionHistory: () => {
    console.log('Fetching decision history...');
    // Get all orders first to ensure we have the latest data
    return fetchData('orders')
      .then(orders => {
        console.log('Total orders fetched for decision history:', orders.length);
        // Filter orders that have been approved or rejected by the chef
        const filteredOrders = orders.filter(order => {
          const isReviewed = order.status === 'approved' || order.status === 'rejected';
          const hasReviewAction = order.reviewAction === 'approve' || order.reviewAction === 'reject';
          const hasReviewedBy = order.reviewedBy && order.reviewedBy.includes('Chef');
          
          return isReviewed || hasReviewAction || hasReviewedBy;
        });
        
        console.log('Filtered decision history orders:', filteredOrders.length);
        return filteredOrders;
      })
      .catch(error => {
        console.error('Error fetching decision history:', error);
        // Return empty array if API fails
        return [];
      });
  },
  getApprovedOrdersTracking: () => {
    console.log('Fetching approved orders tracking...');
    // Get all orders first to ensure we have the latest data
    return fetchData('orders')
      .then(orders => {
        console.log('Total orders fetched for tracking:', orders.length);
        // Filter orders that have been approved and are in various stages of processing
        const filteredOrders = orders.filter(order => {
          // Only include orders that have been approved by the chef
          const isApproved = order.status === 'approved';
          const hasApprovedBy = order.approvedBy && order.approvedBy.includes('Chef');
          
          // Check if it's in any stage of the purchase/delivery process
          const inProcess = 
            order.purchaseStatus === 'pending' ||
            order.purchaseStatus === 'in_progress' ||
            order.purchaseStatus === 'completed' ||
            order.deliveryStatus === 'pending' ||
            order.deliveryStatus === 'in_progress' ||
            order.deliveryStatus === 'completed';
          
          return (isApproved || hasApprovedBy) && (inProcess || true); // Include all approved orders for now
        });
        
        console.log('Filtered approved orders for tracking:', filteredOrders.length);
        return filteredOrders;
      })
      .catch(error => {
        console.error('Error fetching approved orders tracking:', error);
        // Return empty array if API fails
        return [];
      });
  },
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
  update: (id, orderData) => {
    try {
      // First try to update the order directly by ID
      return fetchData(`orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(orderData),
      }).catch(error => {
        // If that fails, try to find the order by querying all orders and then update
        console.log(`Failed to update order directly with ID ${id}, trying alternative method`);
        return fetchData('orders')
          .then(orders => {
            const order = orders.find(o => o.id === id);
            if (!order) {
              throw new Error(`Order with ID ${id} not found for update`);
            }
            // Once we have the order, update it
            return fetchData(`orders/${id}`, {
              method: 'PATCH',
              body: JSON.stringify(orderData),
            });
          });
      });
    } catch (error) {
      console.error(`Error updating order with ID ${id}:`, error);
      throw error;
    }
  },
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
  getAll: async () => {
    try {
      console.log('Fetching inventory data');
      
      // First, fetch products data
      try {
        const products = await fetchData('products');
        console.log('Fetched products directly:', products.length);
        
        if (!products || products.length === 0) {
          console.error('No products found in database');
          // Try mock data as fallback
          if (mockData.products) {
            console.log('Using mock product data');
            return mockData.products;
          }
          return [];
        }
        
        // Second, fetch bons data to check which products are ready for sale
        let readyForSaleProducts = new Set();
        try {
          const bons = await fetchData('bons?status=ready_for_sale');
          console.log('Fetched ready for sale bons:', bons.length);
          
          // Extract products that have been priced by the Auditor
          bons.forEach(bon => {
            if (bon.status === 'ready_for_sale') {
              bon.products?.forEach(product => {
                if (product.readyForSale) {
                  // Use either the product ID or name as identifier
                  if (product.id) readyForSaleProducts.add(product.id.toString());
                  if (product.productId) readyForSaleProducts.add(product.productId.toString());
                  if (product.name) readyForSaleProducts.add(product.name);
                }
              });
            }
          });
          console.log('Products ready for sale:', Array.from(readyForSaleProducts));
        } catch (error) {
          console.error('Error fetching bons data:', error);
          // Continue without bons data - we'll just use product data
        }
        
        // Third, fetch inventory data if available
        let inventoryItems = [];
        try {
          inventoryItems = await fetchData('inventory');
          console.log('Fetched inventory items:', inventoryItems.length);
        } catch (error) {
          console.log('No separate inventory data found, using products directly');
          // Continue without inventory data - we'll create inventory items from products
        }
        
        // Combine product data with inventory data
        return products.map(product => {
          // Find matching inventory item if it exists
          const inventoryItem = inventoryItems.find(item => 
            item.productId?.toString() === product.id?.toString() || 
            item.product === product.name
          );
          
          // Check if this product is ready for sale (priced by Auditor)
          const isReadyForSale = 
            readyForSaleProducts.has(product.id?.toString()) || 
            readyForSaleProducts.has(product.name);
          
          return {
            id: product.id.toString(),
            productId: product.id,
            name: product.name,
            category: product.category,
            categoryId: product.categoryId,
            // Use inventory quantity if available, otherwise use product quantity
            quantity: inventoryItem?.quantity !== undefined ? inventoryItem.quantity : (product.quantity || 0),
            threshold: inventoryItem?.threshold || product.threshold || 10,
            unit: product.unit || inventoryItem?.unit || 'unité',
            price: product.price || inventoryItem?.price || 0,
            supplier: product.supplier || inventoryItem?.supplier || '',
            lastUpdated: inventoryItem?.lastUpdated || new Date().toISOString().split('T')[0],
            readyForSale: isReadyForSale, // Add this flag to indicate if product is ready for sale
            product: product
          };
        });
      } catch (error) {
        console.error('Error fetching products:', error);
        // Try to use mock data if available
        if (mockData.products) {
          console.log('Using mock product data after error');
          return mockData.products.map(product => ({
            id: product.id.toString(),
            productId: product.id,
            name: product.name,
            category: product.category,
            quantity: product.quantity || 0,
            threshold: product.threshold || 10,
            unit: product.unit || 'unité',
            price: product.price || 0,
            supplier: product.supplier || '',
            lastUpdated: new Date().toISOString().split('T')[0],
            readyForSale: false, // Default to not ready for sale
            product: product
          }));
        }
        return [];
      }
    } catch (error) {
      console.error('Error in inventoryAPI.getAll:', error);
      return [];
    }
  },
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
  getAll() {
    return fetchWithErrorHandling(`${API_URL}/bons`).catch(error => {
      console.error('Error fetching bons:', error);
      return []; // Return empty array as fallback
    });
  },
  getById(id) {
    return fetchWithErrorHandling(`${API_URL}/bons/${id}`).catch(error => {
      console.error(`Error fetching bon ${id}:`, error);
      return null; // Return null as fallback
    });
  },
  getByStatus(status) {
    return fetchWithErrorHandling(`${API_URL}/bons?status=${status}`).catch(error => {
      console.error(`Error fetching bons with status ${status}:`, error);
      return []; // Return empty array as fallback
    });
  },
  create(bonData) {
    return fetchWithErrorHandling(`${API_URL}/bons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bonData)
    }).catch(error => {
      console.error('Error creating bon:', error);
      throw error; // Re-throw to handle in component
    });
  },
  update(id, bonData) {
    return fetchWithErrorHandling(`${API_URL}/bons/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bonData)
    }).catch(error => {
      console.error(`Error updating bon ${id}:`, error);
      throw error; // Re-throw to handle in component
    });
  },
  updateStatus(id, status, notes) {
    return fetchWithErrorHandling(`${API_URL}/bons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    }).catch(error => {
      console.error(`Error updating bon status ${id}:`, error);
      throw error; // Re-throw to handle in component
    });
  },
  delete(id) {
    return fetchWithErrorHandling(`${API_URL}/bons/${id}`, {
      method: 'DELETE'
    }).catch(error => {
      console.error(`Error deleting bon ${id}:`, error);
      throw error; // Re-throw to handle in component
    });
  },
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
