// App entry point
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'xp.css/dist/XP.css';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { OnboardingProvider } from './contexts/OnboardingContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <OnboardingProvider>
        <App />
      </OnboardingProvider>
    </AuthProvider>
  </React.StrictMode>,
);
