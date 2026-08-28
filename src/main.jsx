import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ParticipantProvider } from './context/ParticipantContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './styles/index.css'
import './styles/login.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider>
        <ParticipantProvider>
          <App />
        </ParticipantProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
