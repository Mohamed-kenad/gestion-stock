
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [
    { id: 1, username: 'admin', role: 'admin', name: 'Admin User', email: 'admin@example.com', active: true },
    { id: 2, username: 'vendor', role: 'vendor', name: 'Vendor User', email: 'vendor@example.com', active: true },
    { id: 3, username: 'chef', role: 'chef', name: 'Chef User', email: 'chef@example.com', active: true },
    { id: 4, username: 'purchase', role: 'purchase', name: 'Purchase Agent', email: 'purchase@example.com', active: true },
    { id: 5, username: 'store', role: 'store', name: 'Store Manager', email: 'store@example.com', active: true },
    { id: 6, username: 'cashier', role: 'cashier', name: 'Cashier', email: 'cashier@example.com', active: true },
    { id: 7, username: 'auditor', role: 'auditor', name: 'Auditor', email: 'auditor@example.com', active: true },
  ],
  roles: [
    { id: 'admin', name: 'Administrator', permissions: ['all'] },
    { id: 'vendor', name: 'Vendor', permissions: ['create_order', 'view_products'] },
    { id: 'chef', name: 'Chef', permissions: ['approve_order', 'reject_order'] },
    { id: 'purchase', name: 'Purchase Agent', permissions: ['process_purchase', 'view_orders'] },
    { id: 'store', name: 'Store Manager', permissions: ['manage_inventory', 'receive_goods'] },
    { id: 'cashier', name: 'Cashier', permissions: ['process_sales', 'view_products'] },
    { id: 'auditor', name: 'Auditor', permissions: ['view_all', 'generate_reports'] },
  ],
  loading: false,
  error: null
};

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action) => {
      const newUser = {
        id: state.users.length + 1,
        active: true,
        ...action.payload
      };
      state.users.push(newUser);
    },
    updateUser: (state, action) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...action.payload };
      }
    },
    deleteUser: (state, action) => {
      state.users = state.users.filter(u => u.id !== action.payload);
    },
    addRole: (state, action) => {
      const newRole = {
        ...action.payload
      };
      state.roles.push(newRole);
    },
    updateRole: (state, action) => {
      const index = state.roles.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.roles[index] = { ...state.roles[index], ...action.payload };
      }
    },
    deleteRole: (state, action) => {
      state.roles = state.roles.filter(r => r.id !== action.payload);
    }
  }
});

export const { addUser, updateUser, deleteUser, addRole, updateRole, deleteRole } = usersSlice.actions;

export default usersSlice.reducer;
