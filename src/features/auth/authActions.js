import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';

const api =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:3500`
    : `https://api.cpic.dev`;

export const userLogin = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const { data } = await axios.post(
        `${api}/api/auth/login`,
        { email, password },
        config
      );
      return data;
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);
