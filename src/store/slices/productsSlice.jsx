
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [
    { id: 1, name: 'Rice', categoryId: 1, quantity: 100, price: 25, threshold: 20 },
    { id: 2, name: 'Pasta', categoryId: 1, quantity: 150, price: 15, threshold: 30 },
    { id: 3, name: 'Tomato Sauce', categoryId: 2, quantity: 80, price: 10, threshold: 15 },
    { id: 4, name: 'Olive Oil', categoryId: 2, quantity: 50, price: 30, threshold: 10 },
    { id: 5, name: 'Chicken', categoryId: 3, quantity: 40, price: 50, threshold: 10 },
    { id: 6, name: 'Beef', categoryId: 3, quantity: 30, price: 70, threshold: 5 }
  ],
  loading: false,
  error: null
};

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action) => {
      const newProduct = {
        id: state.products.length + 1,
        ...action.payload
      };
      state.products.push(newProduct);
    },
    updateProduct: (state, action) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...action.payload };
      }
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    updateStock: (state, action) => {
      const { productId, change } = action.payload;
      const product = state.products.find(p => p.id === productId);
      if (product) {
        product.quantity += change;
      }
    }
  }
});

export const { addProduct, updateProduct, deleteProduct, updateStock } = productsSlice.actions;

export default productsSlice.reducer;
