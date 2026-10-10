import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import { NavigationProvider } from './context/NavigationProvider.jsx'
import { SearchProvider } from './context/SearchProvider.jsx'
import { SyncProvider } from './context/SyncContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <NavigationProvider>
          <SearchProvider>
            <SyncProvider>
              <App />
            </SyncProvider>
          </SearchProvider>
        </NavigationProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)