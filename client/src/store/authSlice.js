import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService, userService } from '../services/apiService';
import { setAccessToken, clearAccessToken } from '../utils/api';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await authService.login(credentials);
    setAccessToken(data.accessToken);
    if (data.refreshToken) localStorage.setItem('cz_refresh_token', data.refreshToken);
    localStorage.setItem('cz_user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await authService.register(userData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    clearAccessToken();
    localStorage.removeItem('cz_user');
  } catch (err) {
    clearAccessToken();
    localStorage.removeItem('cz_user');
    return rejectWithValue(err.response?.data?.message || 'Logout failed');
  }
});

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await userService.getProfile();
    localStorage.setItem('cz_user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    // Try refresh token first before giving up
    try {
      const refreshToken = localStorage.getItem('cz_refresh_token');
      const { data: refreshData } = await authService.refreshToken(refreshToken);
      setAccessToken(refreshData.accessToken);
      const { data: profileData } = await userService.getProfile();
      localStorage.setItem('cz_user', JSON.stringify(profileData.user));
      return profileData;
    } catch {
      clearAccessToken();
      localStorage.removeItem('cz_user');
      return rejectWithValue('Session expired');
    }
  }
});

// Get persisted user from localStorage for initial state
const getPersistedUser = () => {
  try {
    const stored = localStorage.getItem('cz_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const persistedUser = getPersistedUser();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: persistedUser,
    isAuthenticated: !!persistedUser,
    loading: !!persistedUser, // loading true if we have a user so we try to refresh
    error: null,
    registrationSuccess: false,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearRegistrationSuccess: (state) => { state.registrationSuccess = false; },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem('cz_user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.registrationSuccess = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('cz_user'); // ← add this
     });
  },
});

export const { clearError, clearRegistrationSuccess, setUser } = authSlice.actions;
export default authSlice.reducer;
