import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#7c3aed',
          colorInfo: '#7c3aed',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          borderRadius: 8,
        },
        components: {
          Layout: {
            siderBg: '#1e1b4b',
            triggerBg: '#312e81',
            headerBg: '#ffffff',
          },
          Menu: {
            darkItemBg: '#1e1b4b',
            darkItemSelectedBg: '#7c3aed',
            darkItemHoverBg: '#312e81',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)
