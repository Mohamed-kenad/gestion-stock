
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  categories: [
    { id: 1, name: 'Dry Goods', description: 'Pasta, rice, grains, etc.' },
    { id: 2, name: 'Condiments', description: 'Sauces, oils, spices, etc.' },
    { id: 3, name: 'Meat', description: 'Chicken, beef, pork, etc.' }
  ],
  loading: false,
  error: null
};

export const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    addCategory: (state, action) => {
      const newCategory = {
        id: state.categories.length + 1,
        ...action.payload
      };
      state.categories.push(newCategory);
    },
    updateCategory: (state, action) => {
      const index = state.categories.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = { ...state.categories[index], ...action.payload };
      }
    },
    deleteCategory: (state, action) => {
      state.categories = state.categories.filter(c => c.id !== action.payload);
    }
  }
});

export const { addCategory, updateCategory, deleteCategory } = categoriesSlice.actions;

export default categoriesSlice.reducer;
