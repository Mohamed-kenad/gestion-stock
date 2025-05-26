import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the current db.json file
const dbPath = path.join(__dirname, 'db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Create specific orders for chef pages
const chefOrders = [
  {
    "id": "PO-2025-101",
    "title": "Commande légumes hebdomadaire",
    "description": "Commande des légumes frais pour la semaine",
    "department": "Cuisine",
    "urgency": "normal",
    "date": "2025-05-24",
    "createdAt": "2025-05-24",
    "status": "approved",
    "userId": 2,
    "createdBy": "Vendor User",
    "createdByRole": "Vendor",
    "supplier": "Fournisseur A",
    "estimatedTotal": 850.00,
    "total": 850.00,
    "reviewDate": "2025-05-24",
    "reviewedBy": "Chef Karim",
    "reviewComment": "Approuvé sans modifications",
    "reviewAction": "approve",
    "validationNote": "Approuvé sans modifications",
    "approvedBy": "Chef Karim",
    "approvedAt": "2025-05-24",
    "purchaseStatus": "pending",
    "deliveryStatus": "pending",
    "progressPercentage": 25,
    "items": [
      {
        "id": 1,
        "product": {
          "name": "Tomates",
          "category": "Légumes",
          "price": 15,
          "unit": "kg"
        },
        "quantity": 20,
        "total": 300
      },
      {
        "id": 2,
        "product": {
          "name": "Oignons",
          "category": "Légumes",
          "price": 10,
          "unit": "kg"
        },
        "quantity": 15,
        "total": 150
      },
      {
        "id": 3,
        "product": {
          "name": "Pommes de terre",
          "category": "Légumes",
          "price": 8,
          "unit": "kg"
        },
        "quantity": 50,
        "total": 400
      }
    ]
  },
  {
    "id": "PO-2025-102",
    "title": "Commande viandes",
    "description": "Commande de viandes pour le weekend",
    "department": "Cuisine",
    "urgency": "high",
    "date": "2025-05-23",
    "createdAt": "2025-05-23",
    "status": "rejected",
    "userId": 2,
    "createdBy": "Vendor User",
    "createdByRole": "Vendor",
    "supplier": "Fournisseur B",
    "estimatedTotal": 1500.00,
    "total": 1500.00,
    "reviewDate": "2025-05-23",
    "reviewedBy": "Chef Karim",
    "reviewComment": "Prix trop élevés, veuillez trouver un autre fournisseur",
    "reviewAction": "reject",
    "validationNote": "Prix trop élevés, veuillez trouver un autre fournisseur",
    "rejectedBy": "Chef Karim",
    "rejectedAt": "2025-05-23",
    "progressPercentage": 0,
    "items": [
      {
        "id": 1,
        "product": {
          "name": "Boeuf",
          "category": "Viandes",
          "price": 80,
          "unit": "kg"
        },
        "quantity": 10,
        "total": 800
      },
      {
        "id": 2,
        "product": {
          "name": "Poulet",
          "category": "Viandes",
          "price": 35,
          "unit": "kg"
        },
        "quantity": 20,
        "total": 700
      }
    ]
  },
  {
    "id": "PO-2025-103",
    "title": "Commande produits laitiers",
    "description": "Commande hebdomadaire de produits laitiers",
    "department": "Cuisine",
    "urgency": "normal",
    "date": "2025-05-22",
    "createdAt": "2025-05-22",
    "status": "approved",
    "userId": 2,
    "createdBy": "Vendor User",
    "createdByRole": "Vendor",
    "supplier": "Fournisseur C",
    "estimatedTotal": 950.00,
    "total": 950.00,
    "reviewDate": "2025-05-22",
    "reviewedBy": "Chef Karim",
    "reviewComment": "Approuvé avec modifications de quantité",
    "reviewAction": "approve",
    "validationNote": "Approuvé avec modifications de quantité",
    "approvedBy": "Chef Karim",
    "approvedAt": "2025-05-22",
    "purchaseStatus": "completed",
    "purchasedAt": "2025-05-23",
    "purchasedBy": "Purchase Manager",
    "deliveryStatus": "in_progress",
    "progressPercentage": 75,
    "items": [
      {
        "id": 1,
        "product": {
          "name": "Lait",
          "category": "Produits laitiers",
          "price": 8,
          "unit": "L"
        },
        "quantity": 50,
        "total": 400
      },
      {
        "id": 2,
        "product": {
          "name": "Fromage",
          "category": "Produits laitiers",
          "price": 35,
          "unit": "kg"
        },
        "quantity": 15,
        "total": 525
      }
    ]
  },
  {
    "id": "PO-2025-104",
    "title": "Commande épices",
    "description": "Commande mensuelle d'épices",
    "department": "Cuisine",
    "urgency": "low",
    "date": "2025-05-21",
    "createdAt": "2025-05-21",
    "status": "approved",
    "userId": 2,
    "createdBy": "Vendor User",
    "createdByRole": "Vendor",
    "supplier": "Fournisseur D",
    "estimatedTotal": 450.00,
    "total": 450.00,
    "reviewDate": "2025-05-21",
    "reviewedBy": "Chef Karim",
    "reviewComment": "Approuvé",
    "reviewAction": "approve",
    "validationNote": "Approuvé",
    "approvedBy": "Chef Karim",
    "approvedAt": "2025-05-21",
    "purchaseStatus": "completed",
    "purchasedAt": "2025-05-22",
    "purchasedBy": "Purchase Manager",
    "deliveryStatus": "completed",
    "deliveredAt": "2025-05-23",
    "receivedBy": "Warehouse Manager",
    "progressPercentage": 100,
    "items": [
      {
        "id": 1,
        "product": {
          "name": "Cumin",
          "category": "Épices",
          "price": 30,
          "unit": "kg"
        },
        "quantity": 5,
        "total": 150
      },
      {
        "id": 2,
        "product": {
          "name": "Paprika",
          "category": "Épices",
          "price": 25,
          "unit": "kg"
        },
        "quantity": 5,
        "total": 125
      },
      {
        "id": 3,
        "product": {
          "name": "Poivre noir",
          "category": "Épices",
          "price": 35,
          "unit": "kg"
        },
        "quantity": 5,
        "total": 175
      }
    ]
  }
];

// Add or update the chef orders
chefOrders.forEach(order => {
  const existingOrderIndex = db.orders.findIndex(o => o.id === order.id);
  
  if (existingOrderIndex !== -1) {
    // Update existing order
    db.orders[existingOrderIndex] = order;
  } else {
    // Add new order
    db.orders.push(order);
  }
});

// Write the updated data back to db.json
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log('Chef orders have been added to db.json');
