"use client";
import { Toaster } from 'react-hot-toast';

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1E1E1E',
          color: '#fff',
          border: '1px solid rgba(0,229,255,0.3)',
          borderRadius: '12px',
          padding: '16px',
        },
        success: {
          iconTheme: {
            primary: '#00E5FF',
            secondary: '#1E1E1E',
          },
        },
        error: {
          iconTheme: {
            primary: '#FF1744',
            secondary: '#1E1E1E',
          },
        },
      }}
    />
  );
};
