import { configureStore, createSlice } from '@reduxjs/toolkit';
import { fitloopApi } from './api';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null, // id, name, email
    measurements: null // chest, waist, hip, inseam, bmi, etc
  },
  reducers: {
    setUser: (state, action) => { state.user = action.payload; },
    setMeasurements: (state, action) => { state.measurements = action.payload; },
    logout: (state) => { state.user = null; state.measurements = null; }
  }
});

export const { setUser, setMeasurements, logout } = userSlice.actions;

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    [fitloopApi.reducerPath]: fitloopApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(fitloopApi.middleware)
});
