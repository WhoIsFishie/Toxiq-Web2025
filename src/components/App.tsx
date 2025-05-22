import { useEffect, useState } from 'react';
import { useSignal, initData, backButton, miniApp } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { authenticateUser, AuthError } from '../services/authService'; // Import AuthError
import HomeFeed from '../pages/HomeFeed';
import PostParamRedirect from './PostParamRedirect';
import RootRouteHandler from './RootRouteHandler';
import TgParamHandler from './TgParamHandler';
import LoadingScreen from '../components/LoadingScreen';
import '../themes/darkTheme.css'; // Import the dark theme CSS
import AuthMiddleware from '../middleware/AuthMiddleware';

import { BrowserRouter as Router, Routes, Route, HashRouter } from 'react-router-dom';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null); // New state for init error
  const isDark = useSignal(miniApp.isDark);

  useEffect(() => {
    // Initialize auth flow
    const initAuth = async () => {
      setIsLoading(true);
      setInitializationError(null); // Reset init error at the start
      try {
        await authenticateUser(); // Throws AuthError on failure
        setIsAuthenticated(true);
      } catch (error: any) { // Ensure error is typed as any or unknown
        setIsAuthenticated(false);
        if (error instanceof AuthError && error.message.includes("Telegram initialization data is missing")) {
          setInitializationError("Could not initialize the application. Please ensure you're running inside Telegram and try restarting.");
        } else {
          // Handle other authentication errors (e.g., token missing, network issues)
          console.error("Authentication failed in App.tsx:", error);
          // Optionally, set a generic authentication error message for the UI if needed
          // setAuthError("Authentication failed. Please try again."); 
        }
      } finally {
        setIsLoading(false);
        // Indicate to Telegram that the app is ready to display
        miniApp.ready();
      }
    };

    initAuth();
  }, []);

  // Mount back button
  useEffect(() => {
    backButton.mount();
    return () => backButton.unmount();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (initializationError) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: 'red', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <h1>Application Error</h1>
        <p>{initializationError}</p>
        {/* Optional: Add a button to attempt a reload or provide guidance */}
        {/* <button onClick={() => window.location.reload()}>Try Reloading</button> */}
      </div>
    );
  }

  return (
    <HashRouter>
      <AuthMiddleware>
        <Routes>
          {/* Route for direct post ID in URL path */}
          <Route path="/posts/:postId" element={<PostParamRedirect />} />

          {/* Special route specifically for tgWebAppStartParam */}
          <Route path="/posts/" element={<TgParamHandler />} />

          {/* Home route */}
          <Route path="/" element={<HomeFeed />} />

          {/* Catch-all route */}
          <Route path="*" element={<HomeFeed />} />
        </Routes>
      </AuthMiddleware>
    </HashRouter>
  );
}