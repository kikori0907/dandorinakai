import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Ending from './Ending.jsx'

const params = new URLSearchParams(window.location.search);
const page = params.get('page');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {page === 'ending' ? <Ending /> : <App />}
  </StrictMode>,
)
