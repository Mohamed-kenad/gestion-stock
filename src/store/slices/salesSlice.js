
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sales: [
    { 
      id: 1, 
      date: '2025-05-16', 
      items: [
        { productId: 1, quantity: 5, price: 30 },
        { productId: 3, quantity: 3, price: 12 }
      ], 
      total: 186, 
      paymentMethod: 'cash',
      cashierId: 6,
      customerName: 'Walk-in Customer'
    },
    { 
      id: 2, 
      date: '2025-05-17', 
      items: [
        { productId: 5, quantity: 2, price: 55 },
        { productId: 2, quantity: 1, price: 18 }
      ], 
      total: 128, 
      paymentMethod: 'card',
      cashierId: 6,
      customerName: 'Restaurant ABC'
    },
    { 
      id: 3, 
      date: '2025-05-17', 
      items: [
        { productId: 4, quantity: 1, price: 35 },
        { productId: 6, quantity: 1, price: 75 }
      ], 
      total: 110, 
      paymentMethod: 'cash',
      cashierId: 6,
      customerName: 'Walk-in Customer'
    }
  ],
  loading: false,
  error: null
};

export const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    addSale: (state, action) => {
      const newSale = {
        id: state.sales.length + 1,
        date: new Date().toISOString().split('T')[0],
        ...action.payload
      };
      state.sales.push(newSale);
    }
  }
});

export const { addSale } = salesSlice.actions;

export default salesSlice.reducer;
