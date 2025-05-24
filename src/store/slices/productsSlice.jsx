
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsAPI } from '../../lib/api';

// Async thunks for API calls
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      return await productsAPI.getAll();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addProductAsync = createAsyncThunk(
  'products/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      return await productsAPI.create(productData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProductAsync = createAsyncThunk(
  'products/updateProduct',
  async ({ id, ...productData }, { rejectWithValue }) => {
    try {
      return await productsAPI.update(id, productData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteProductAsync = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await productsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  products: [],
  loading: false,
  error: null
};

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    updateStock: (state, action) => {
      const { productId, change } = action.payload;
      const product = state.products.find(p => p.id === productId);
      if (product) {
        product.quantity += change;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add product
      .addCase(addProductAsync.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      // Update product
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      // Delete product
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
      });
  }
});

export const { updateStock } = productsSlice.actions;

export default productsSlice.reducer;
