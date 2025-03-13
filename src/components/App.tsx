import { useEffect, useState } from 'react';
import { useSignal, initData, backButton, miniApp } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { authenticateUser } from '../services/authService';
import HomeFeed from '../pages/HomeFeed';
import PostParamRedirect from './PostParamRedirect';
import LoadingScreen from '../components/LoadingScreen';
import '../themes/darkTheme.css'; // Import the dark theme CSS
import PostView from '../pages/PostView';
import AuthMiddleware from '../middleware/AuthMiddleware';

import { BrowserRouter as Router, Routes, Route,HashRouter  } from 'react-router-dom';

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
    <HashRouter>
 <AuthMiddleware>
        <Routes>
          <Route path="/posts" element={<PostParamRedirect />}/>


          <Route path="/" element={<HomeFeed />} />
          <Route path="/posts/:postId" element={<PostView />} />
          {/* Catch-all route that defaults to home */}
          <Route path="*" element={<HomeFeed />} />
        </Routes>
      </AuthMiddleware>
    </HashRouter>
  );
}