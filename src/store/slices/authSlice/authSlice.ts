import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  phone: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('np-token'),
  phone: localStorage.getItem('np-phone'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; phone: string }>) {
      state.token = action.payload.token;
      state.phone = action.payload.phone;
      localStorage.setItem('np-token', action.payload.token);
      localStorage.setItem('np-phone', action.payload.phone);
    },
    logout(state) {
      state.token = null;
      state.phone = null;
      localStorage.removeItem('np-token');
      localStorage.removeItem('np-phone');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
