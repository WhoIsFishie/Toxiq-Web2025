// src/components/App.tsx
import { useEffect, useState } from 'react';
import { useSignal, initData, backButton, miniApp } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { authenticateUser } from '../services/authService';
import HomeFeed from '../pages/HomeFeed';
import LoadingScreen from '../components/LoadingScreen';
import '../themes/darkTheme.css'; // Import the dark theme CSS

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isDark = useSignal(miniApp.isDark);

  useEffect(() => {
    // Initialize auth flow
    const initAuth = async () => {
      setIsLoading(true);
      const authSuccess = await authenticateUser();
      setIsAuthenticated(authSuccess);
      setIsLoading(false);
      
      // Indicate to Telegram that the app is ready to display
      miniApp.ready();
    };

    initAuth();
  }, []);

  // Mount back button
  useEffect(() => {
    backButton.mount();
    return () => backButton.unmount();
  }, []);

  return (
    <AppRoot appearance="dark">
      {isLoading ? (
        <LoadingScreen />
      ) : isAuthenticated ? (
        <HomeFeed />
      ) : (
        <div className="auth-error" style={{ 
          textAlign: 'center', 
          padding: '20px',
          color: 'var(--text-color)',
          backgroundColor: 'var(--card-background)',
          borderRadius: '8px',
          margin: '20px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
        }}>
          <h3>Authentication Failed</h3>
          <p>Please try again later</p>
        </div>
      )}
    </AppRoot>
  );
}