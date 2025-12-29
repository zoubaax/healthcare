import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './dark-mode-overrides.css'
import './ui-enhancements.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
