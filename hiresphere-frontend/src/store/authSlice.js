import { createSlice } from "@reduxjs/toolkit";

const persisted = JSON.parse(localStorage.getItem("hiresphere_auth") || "null");

const initialState = persisted || {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

function persist(state) {
  localStorage.setItem("hiresphere_auth", JSON.stringify(state));
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, access, refresh } = action.payload;
      state.user = user;
      state.accessToken = access;
      state.refreshToken = refresh;
      state.isAuthenticated = true;
      persist(state);
    },
    setTokens: (state, action) => {
      const { accessToken, refreshToken } = action.payload;
      state.accessToken = accessToken;
      if (refreshToken) state.refreshToken = refreshToken;
      persist(state);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem("hiresphere_auth");
    },
  },
});

export const { setCredentials, setTokens, logout } = authSlice.actions;
export default authSlice.reducer;
