import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProfileProvider } from './context/ProfileContext'
import { RoleProvider } from './context/RoleContext'
import { UserProgressProvider } from './context/UserProgressContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ProfileProvider>
        <RoleProvider>
          <UserProgressProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </UserProgressProvider>
        </RoleProvider>
      </ProfileProvider>
    </AuthProvider>
  </StrictMode>,
)
