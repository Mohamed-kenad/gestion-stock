
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  movements: [
    { 
      id: 1, 
      type: 'in', 
      date: '2025-05-16', 
      productId: 1, 
      quantity: 50, 
      orderId: 1, 
      userId: 5
    },
    { 
      id: 2, 
      type: 'out', 
      date: '2025-05-16', 
      productId: 5, 
      quantity: 5, 
      reason: 'sales', 
      reference: 'S001', 
      userId: 6
    },
    { 
      id: 3, 
      type: 'in', 
      date: '2025-05-15', 
      productId: 2, 
      quantity: 100, 
      orderId: 3, 
      userId: 5
    },
    { 
      id: 4, 
      type: 'out', 
      date: '2025-05-17', 
      productId: 3, 
      quantity: 10, 
      reason: 'sales', 
      reference: 'S002', 
      userId: 6
    }
  ],
  loading: false,
  error: null
};

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    addMovement: (state, action) => {
      const newMovement = {
        id: state.movements.length + 1,
        date: new Date().toISOString().split('T')[0],
        ...action.payload
      };
      state.movements.push(newMovement);
    }
  }
});

export const { addMovement } = inventorySlice.actions;

export default inventorySlice.reducer;
