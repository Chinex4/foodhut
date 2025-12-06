import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getStoredTheme, setStoredTheme, type ThemeMode } from "@/storage/theme";

type ThemeState = {
  mode: ThemeMode;
  status: "idle" | "loading" | "succeeded" | "failed";
};

const initialState: ThemeState = {
  mode: "light",
  status: "idle",
};

export const loadThemePreference = createAsyncThunk<ThemeMode>(
  "theme/loadPreference",
  async () => {
    const stored = await getStoredTheme();
    return stored ?? "light";
  }
);

export const persistThemePreference = createAsyncThunk<ThemeMode, ThemeMode>(
  "theme/persistPreference",
  async (mode) => {
    await setStoredTheme(mode);
    return mode;
  }
);

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadThemePreference.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadThemePreference.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.mode = action.payload;
      })
      .addCase(loadThemePreference.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(persistThemePreference.fulfilled, (state, action) => {
        state.mode = action.payload;
      });
  },
});

export const { setThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
