import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster } from "@/components/ui/sonner"
import App from './App.tsx'
import { BrowserRouter as Router } from 'react-router-dom'
createRoot(document.getElementById('root')!).render(

  <StrictMode>
      <Router>
        <Toaster position="top-right" richColors />
            <App />
      </Router>

  </StrictMode>,
)
