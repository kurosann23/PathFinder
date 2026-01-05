import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { ProfileProvider } from './context/ProfileContext'
import { RoleProvider } from './context/RoleContext'
import { UserProgressProvider } from './context/UserProgressContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
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
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
)
