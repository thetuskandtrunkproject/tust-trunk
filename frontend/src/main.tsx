import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const MaintenancePage = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw', backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif', textAlign: 'center', padding: '20px' }}>
    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>We'll be back soon!</h1>
    <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Our site is currently undergoing scheduled maintenance.</p>
    <p style={{ fontSize: '1rem', marginTop: '2rem', color: '#666' }}>Thank you for your patience while we upgrade our systems.</p>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MaintenancePage />
  </StrictMode>,
)
