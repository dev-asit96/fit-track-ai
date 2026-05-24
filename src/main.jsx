import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { DataProvider } from './context/DataContext.jsx'
import './index.css'

// Request persistent storage so the browser never deletes our local IndexedDB data
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().then(granted => {
    if (granted) {
      console.log("Persistent storage granted.");
    } else {
      console.warn("Persistent storage not granted. Data may be cleared if the device runs out of space.");
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <DataProvider>
        <App />
      </DataProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
window.__VITE_GEMINI_API_KEY_TEST = import.meta.env.VITE_GEMINI_API_KEY;
