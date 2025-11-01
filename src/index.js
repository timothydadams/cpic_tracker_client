import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App.js';
import { store } from './app/store.js';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { TooltipProvider } from 'ui/tooltip';
import { TouchProvider } from 'ui/hybrid-tooltip';

import './tailwind.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <TouchProvider>
      <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID}>
        <SnackbarProvider
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          autoHideDuration={2500}
        />
        <Provider store={store}>
          <BrowserRouter>
            <Routes>
              <Route path='/*' element={<App />} />
            </Routes>
          </BrowserRouter>
        </Provider>
      </GoogleOAuthProvider>
    </TouchProvider>
  </React.StrictMode>
);
