import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { UserProgressProvider } from './context/UserProgressContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProgressProvider>
      <BrowserRouter>
    <App />
      </BrowserRouter>
    </UserProgressProvider>
  </StrictMode>,
)
