
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import categoriesReducer from './slices/categoriesSlice';
import ordersReducer from './slices/ordersSlice';
import usersReducer from './slices/usersSlice';
import inventoryReducer from './slices/inventorySlice';
import salesReducer from './slices/salesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    categories: categoriesReducer,
    orders: ordersReducer,
    users: usersReducer,
    inventory: inventoryReducer,
    sales: salesReducer,
  },
});
