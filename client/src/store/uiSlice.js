import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    modalOpen: null,
    theme: 'dark',
    notifications: [],
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload; },
    openModal: (state, action) => { state.modalOpen = action.payload; },
    closeModal: (state) => { state.modalOpen = null; },
    addNotification: (state, action) => {
      state.notifications.push({ id: Date.now(), ...action.payload });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
  },
});

export const { toggleSidebar, setSidebarOpen, openModal, closeModal, addNotification, removeNotification } = uiSlice.actions;
export default uiSlice.reducer;
