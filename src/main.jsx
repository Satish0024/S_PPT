import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ParticipantProvider } from './context/ParticipantContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AccessibilityProvider } from './context/AccessibilityContext.jsx'
import './styles/index.css'
import './styles/login.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <AccessibilityProvider>
          <ParticipantProvider>
            <App />
          </ParticipantProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
