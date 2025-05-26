import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the current db.json file
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Add sample orders for chef pages with all necessary fields for chef pages
const chefSampleOrders = [
  {
    "id": "PO-2025-002",
    "title": "Commande légumes",
    "description": "Commande hebdomadaire de légumes frais",
    "department": "Cuisine",
    "urgency": "high",
    "date": "2025-05-22",
    "createdAt": "2025-05-22",
    "status": "approved",
    "userId": 2,
    "createdBy": "Fatima Zahra",
    "createdByRole": "Vendor",
    "supplier": "Fournisseur B",
    "estimatedTotal": 750.00,
    "total": 750.00,
    "items": [
      {
        "id": 1,
        "product": "Tomates",
        "category": "Vegetables",
        "quantity": 25,
        "unit": "kg",
        "price": 15,
        "total": 375
      },
      {
        "id": 2,
        "product": "Oignons",
        "category": "Vegetables",
        "quantity": 20,
        "unit": "kg",
        "price": 10,
        "total": 200
      },
      {
        "id": 3,
        "product": "Poivrons",
        "category": "Vegetables",
        "quantity": 15,
        "unit": "kg",
        "price": 12,
        "total": 180
      }
    ],
    "reviewDate": "2025-05-23",
    "reviewedBy": "Chef User",
    "reviewComment": "Approuvé avec modification de quantité.",
    "reviewAction": "approve",
    "processingDate": "2025-05-24",
    "processingBy": "Purchase Manager",
    "purchaseStatus": "completed",
    "purchasedAt": "2025-05-25",
    "purchasedBy": "Purchase Manager",
    "deliveryStatus": "in_progress",
    "progressPercentage": 75
  },
  {
    "id": "PO-2025-003",
    "title": "Commande viandes",
    "description": "Commande de viandes pour le weekend",
    "department": "Cuisine",
    "urgency": "critical",
    "date": "2025-05-21",
    "createdAt": "2025-05-21",
    "status": "rejected",
    "userId": 2,
    "createdBy": "Vendor User",
    "createdByRole": "Vendor",
    "supplier": "Fournisseur C",
    "estimatedTotal": 1500.00,
    "total": 1500.00,
    "items": [
      {
        "id": 1,
        "product": "Boeuf",
        "category": "Meat",
        "quantity": 10,
        "unit": "kg",
        "price": 80,
        "total": 800
      },
      {
        "id": 2,
        "product": "Poulet",
        "category": "Meat",
        "quantity": 20,
        "unit": "kg",
        "price": 35,
        "total": 700
      }
    ],
    "reviewDate": "2025-05-22",
    "reviewedBy": "Chef User",
    "reviewComment": "Prix trop élevés, veuillez trouver un autre fournisseur.",
    "reviewAction": "reject"
  },
  {
    "id": "PO-2025-004",
    "title": "Commande produits laitiers",
    "description": "Commande hebdomadaire de produits laitiers",
    "department": "Cuisine",
    "urgency": "normal",
    "date": "2025-05-20",
    "createdAt": "2025-05-20",
    "status": "approved",
    "userId": 2,
    "createdBy": "Vendor User",
    "createdByRole": "Vendor",
    "supplier": "Fournisseur D",
    "estimatedTotal": 950.00,
    "total": 920.50,
    "items": [
      {
        "id": 1,
        "product": "Lait",
        "category": "Dairy",
        "quantity": 50,
        "unit": "L",
        "price": 8,
        "total": 400
      },
      {
        "id": 2,
        "product": "Fromage",
        "category": "Dairy",
        "quantity": 15,
        "unit": "kg",
        "price": 35,
        "total": 525
      }
    ],
    "reviewDate": "2025-05-21",
    "reviewedBy": "Chef User",
    "reviewComment": "Approuvé",
    "reviewAction": "approve",
    "processingDate": "2025-05-22",
    "processingBy": "Purchase Manager",
    "purchaseStatus": "completed",
    "purchasedAt": "2025-05-23",
    "purchasedBy": "Purchase Manager",
    "deliveryStatus": "completed",
    "deliveredAt": "2025-05-24",
    "receivedBy": "Warehouse Manager",
    "progressPercentage": 100
  },
  {
    "id": "PO-2025-005",
    "title": "Commande épices",
    "description": "Commande mensuelle d'épices",
    "department": "Cuisine",
    "urgency": "low",
    "date": "2025-05-19",
    "createdAt": "2025-05-19",
    "status": "approved",
    "userId": 2,
    "createdBy": "Vendor User",
    "createdByRole": "Vendor",
    "supplier": "Fournisseur E",
    "estimatedTotal": 450.00,
    "total": 450.00,
    "items": [
      {
        "id": 1,
        "product": "Cumin",
        "category": "Spices",
        "quantity": 5,
        "unit": "kg",
        "price": 30,
        "total": 150
      },
      {
        "id": 2,
        "product": "Paprika",
        "category": "Spices",
        "quantity": 5,
        "unit": "kg",
        "price": 25,
        "total": 125
      },
      {
        "id": 3,
        "product": "Poivre noir",
        "category": "Spices",
        "quantity": 5,
        "unit": "kg",
        "price": 35,
        "total": 175
      }
    ],
    "reviewDate": "2025-05-20",
    "reviewedBy": "Chef User",
    "reviewComment": "Approuvé",
    "reviewAction": "approve",
    "processingDate": "2025-05-21",
    "processingBy": "Purchase Manager",
    "purchaseStatus": "in_progress",
    "progressPercentage": 50
  }
];

// Add or update the sample orders
chefSampleOrders.forEach(sampleOrder => {
  const existingOrderIndex = db.orders.findIndex(order => order.id === sampleOrder.id);
  
  if (existingOrderIndex !== -1) {
    // Update existing order
    db.orders[existingOrderIndex] = sampleOrder;
  } else {
    // Add new order
    db.orders.push(sampleOrder);
  }
});

// Write the updated data back to db.json
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log('Chef sample data has been added to db.json');
