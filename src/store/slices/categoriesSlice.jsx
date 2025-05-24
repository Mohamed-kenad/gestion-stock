
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoriesAPI } from '../../lib/api';

// Async thunks for API calls
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await categoriesAPI.getAll();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addCategoryAsync = createAsyncThunk(
  'categories/addCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      return await categoriesAPI.create(categoryData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCategoryAsync = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, ...categoryData }, { rejectWithValue }) => {
    try {
      return await categoriesAPI.update(id, categoryData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCategoryAsync = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await categoriesAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  categories: [],
  loading: false,
  error: null
};

export const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add category
      .addCase(addCategoryAsync.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      // Update category
      .addCase(updateCategoryAsync.fulfilled, (state, action) => {
        const index = state.categories.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      // Delete category
      .addCase(deleteCategoryAsync.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c.id !== action.payload);
      });
  }
});

// No actions are exported as we're using async thunks instead

export default categoriesSlice.reducer;
