import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tutorialService, stepService, contentService } from '../services/apiService';

export const fetchTutorials = createAsyncThunk('tutorials/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await tutorialService.getAll(params);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tutorials');
  }
});

export const fetchTutorialById = createAsyncThunk('tutorials/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await tutorialService.getById(id);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tutorial');
  }
});

export const createTutorial = createAsyncThunk('tutorials/create', async (tutorialData, { rejectWithValue }) => {
  try {
    const { data } = await tutorialService.create(tutorialData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create tutorial');
  }
});

export const updateTutorial = createAsyncThunk('tutorials/update', async ({ id, data: tutData }, { rejectWithValue }) => {
  try {
    const { data } = await tutorialService.update(id, tutData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update tutorial');
  }
});

export const deleteTutorial = createAsyncThunk('tutorials/delete', async (id, { rejectWithValue }) => {
  try {
    await tutorialService.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete tutorial');
  }
});

export const generateTutorial = createAsyncThunk('tutorials/generate', async ({ id, outputType }, { rejectWithValue }) => {
  try {
    const { data } = await tutorialService.generate(id, { outputType });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Generation failed');
  }
});

const tutorialSlice = createSlice({
  name: 'tutorials',
  initialState: {
    list: [],
    current: null,
    generationStatus: null,
    loading: false,
    error: null,
    pagination: { page: 1, total: 0, pages: 0 },
    wizard: {
      step: 1,
      title: '',
      description: '',
      targetUrl: '',
      inputMethod: 'automated',
      steps: [],
      voiceSettings: {
        language: 'en',
        voiceType: 'female',
        voiceStyle: 'professional',
        speed: 1,
        accent: '',
      },
      outputType: null,
    },
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setWizardStep: (state, action) => { state.wizard.step = action.payload; },
    updateWizard: (state, action) => {
      state.wizard = { ...state.wizard, ...action.payload };
    },
    resetWizard: (state) => {
      state.wizard = {
        step: 1, title: '', description: '', targetUrl: '',
        inputMethod: 'automated', steps: [],
        voiceSettings: { language: 'en', voiceType: 'female', voiceStyle: 'professional', speed: 1, accent: '' },
        outputType: null,
      };
    },
    setGenerationStatus: (state, action) => { state.generationStatus = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTutorials.pending, (state) => { state.loading = true; })
      .addCase(fetchTutorials.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.tutorials;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTutorials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTutorialById.fulfilled, (state, action) => {
        state.current = action.payload.tutorial;
      })
      .addCase(createTutorial.fulfilled, (state, action) => {
        state.list.unshift(action.payload.tutorial);
        state.current = action.payload.tutorial;
      })
      .addCase(updateTutorial.fulfilled, (state, action) => {
        const idx = state.list.findIndex(t => t._id === action.payload.tutorial._id);
        if (idx !== -1) state.list[idx] = action.payload.tutorial;
        state.current = action.payload.tutorial;
      })
      .addCase(deleteTutorial.fulfilled, (state, action) => {
        state.list = state.list.filter(t => t._id !== action.payload);
        if (state.current?._id === action.payload) state.current = null;
      })
      .addCase(generateTutorial.pending, (state) => { state.generationStatus = 'queued'; })
      .addCase(generateTutorial.fulfilled, (state, action) => {
        state.generationStatus = action.payload.status;
      })
      .addCase(generateTutorial.rejected, (state, action) => {
        state.generationStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearError, setWizardStep, updateWizard, resetWizard, setGenerationStatus } = tutorialSlice.actions;
export default tutorialSlice.reducer;
