import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { App } from './components/App.tsx';
import { HashRouter } from 'react-router-dom';

import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { ThemeProvider } from './contexts/ThemeContext';

import { Root } from '@/components/Root.tsx';
import { EnvUnsupported } from '@/components/EnvUnsupported.tsx';
import { init } from '@/init.ts';

import AuthWrapper from '@/components/AuthWrapper.tsx'; // Add this import

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.css';

// Mock the environment in case, we are outside Telegram.
import './mockEnv.ts';

const root = ReactDOM.createRoot(document.getElementById('root')!);

try {
  // Configure all application dependencies.
  init(retrieveLaunchParams().startParam === 'debug' || import.meta.env.DEV);
root.render(
  <ThemeProvider>
 
  <App />

  </ThemeProvider>
);

} catch (e) {
  root.render(<EnvUnsupported/>);
}
