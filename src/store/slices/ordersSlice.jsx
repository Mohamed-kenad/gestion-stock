
import { createSlice } from '@reduxjs/toolkit';

// Order status: pending, approved, rejected, purchased, received
const initialState = {
  orders: [
    { 
      id: 1, 
      createdBy: 2, // Vendor ID
      status: 'pending', 
      date: '2025-05-18', 
      items: [
        { productId: 1, quantity: 20, price: 25 },
        { productId: 3, quantity: 15, price: 10 }
      ],
      total: 650,
      note: 'Weekly stock refill',
      history: [
        { status: 'pending', date: '2025-05-18', userId: 2 }
      ]
    },
    { 
      id: 2, 
      createdBy: 2, // Vendor ID
      status: 'approved', 
      date: '2025-05-17', 
      items: [
        { productId: 5, quantity: 10, price: 50 },
        { productId: 6, quantity: 5, price: 70 }
      ],
      total: 850,
      note: 'Urgent meat order',
      history: [
        { status: 'pending', date: '2025-05-17', userId: 2 },
        { status: 'approved', date: '2025-05-17', userId: 3 }
      ]
    },
    { 
      id: 3, 
      createdBy: 2, // Vendor ID
      status: 'purchased', 
      date: '2025-05-15', 
      items: [
        { productId: 2, quantity: 30, price: 15 },
        { productId: 4, quantity: 10, price: 30 }
      ],
      total: 750,
      note: 'Monthly pasta stock',
      history: [
        { status: 'pending', date: '2025-05-15', userId: 2 },
        { status: 'approved', date: '2025-05-15', userId: 3 },
        { status: 'purchased', date: '2025-05-16', userId: 4 }
      ]
    }
  ],
  loading: false,
  error: null
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    createOrder: (state, action) => {
      const newOrder = {
        id: state.orders.length + 1,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        history: [
          { 
            status: 'pending', 
            date: new Date().toISOString().split('T')[0], 
            userId: action.payload.createdBy 
          }
        ],
        ...action.payload
      };
      state.orders.push(newOrder);
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status, userId } = action.payload;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        order.history.push({
          status,
          date: new Date().toISOString().split('T')[0],
          userId
        });
      }
    },
    updateOrder: (state, action) => {
      const index = state.orders.findIndex(o => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], ...action.payload };
      }
    },
    deleteOrder: (state, action) => {
      state.orders = state.orders.filter(o => o.id !== action.payload);
    }
  }
});

export const { createOrder, updateOrderStatus, updateOrder, deleteOrder } = ordersSlice.actions;

export default ordersSlice.reducer;
