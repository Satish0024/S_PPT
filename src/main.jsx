import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ParticipantProvider } from './context/ParticipantContext.jsx'
import './styles/index.css'
import './styles/login.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ParticipantProvider>
        <App />
      </ParticipantProvider>
    </BrowserRouter>
  </React.StrictMode>
)
