import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import '@/index.css';
import { Toaster } from "@/components/ui/toaster";
import { DataProvider } from '@/contexts/DataContext';
import { AuthProvider } from '@/contexts/ApiAuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <App />
          <Toaster />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);