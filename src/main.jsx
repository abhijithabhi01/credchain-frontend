import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { Toaster } from '@/components/ui/toaster'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      {/* Toaster lives outside App so it's never unmounted by route changes */}
      <Toaster />
    </BrowserRouter>
  </React.StrictMode>
)
