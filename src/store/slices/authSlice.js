
import { createSlice } from '@reduxjs/toolkit';

// Sample users for demo purposes
const initialUsers = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
  { id: 2, username: 'vendor', password: 'vendor123', role: 'vendor', name: 'Vendor User' },
  { id: 3, username: 'chef', password: 'chef123', role: 'chef', name: 'Chef User' },
  { id: 4, username: 'purchase', password: 'purchase123', role: 'purchase', name: 'Purchase Agent' },
  { id: 5, username: 'store', password: 'store123', role: 'store', name: 'Store Manager' },
  { id: 6, username: 'cashier', password: 'cashier123', role: 'cashier', name: 'Cashier' },
  { id: 7, username: 'auditor', password: 'auditor123', role: 'auditor', name: 'Auditor' },
];

// Get user data from localStorage if available
const getUserFromStorage = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch (e) {
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};

const initialState = {
  users: initialUsers,
  user: getUserFromStorage(),
  isAuthenticated: !!getUserFromStorage(),
  error: null,
  loading: false
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('user');
    },
    registerUser: (state, action) => {
      const newUser = {
        id: state.users.length + 1,
        ...action.payload,
      };
      state.users.push(newUser);
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, registerUser } = authSlice.actions;

// Thunk for login
export const login = (username, password) => (dispatch, getState) => {
  dispatch(loginStart());

  const { users } = getState().auth;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // Remove password from user object before storing
    const { password, ...userWithoutPassword } = user;
    setTimeout(() => {
      dispatch(loginSuccess(userWithoutPassword));
    }, 500); // Simulate API delay
  } else {
    setTimeout(() => {
      dispatch(loginFailure('Invalid username or password'));
    }, 500); // Simulate API delay
  }
};

export default authSlice.reducer;
