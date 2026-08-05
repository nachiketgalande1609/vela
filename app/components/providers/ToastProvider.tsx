'use client'
import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '4px',
          fontSize: '13px',
          background: '#111111',
          color: '#F5F5F5',
          border: '1px solid #222222',
          boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
        },
        success: { iconTheme: { primary: '#C8A97E', secondary: '#111111' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#111111' } },
      }}
    />
  )
}
