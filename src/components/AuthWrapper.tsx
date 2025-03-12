import React, { useEffect } from 'react';
import { AuthService } from '../services/apiClient';
import { initData, useSignal } from '@telegram-apps/sdk-react';

function AuthWrapper({ children }) {
  const initDataState = useSignal(initData.state);

  useEffect(() => {
    const telegramLogin = async () => {
      try {
        if (initDataState && initDataState.user) {
          // User is logged in to Telegram
          const initDataRaw = initData.raw();
          if (initDataRaw) {
            // Attempt Telegram web login
            const response = await AuthService.webLogin(initDataRaw);
            const { token, profile } = response;
            
            // Save the token in local storage
            localStorage.setItem('token', token);
            
            // Set the token in the headers of the apiClient
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // User is now logged in, you can update your app state accordingly
            // For example, set the user profile in your app state
            setUser(profile);
          }
        } else {
          // User is not logged in to Telegram
          // Handle this case, e.g., show a message to log in to Telegram first
        }
      } catch (error) {
        console.error('Telegram login failed:', error);
        // Handle login error, e.g., show an error message
      }
    };

    telegramLogin();
  }, [initDataState]);

  return <>{children}</>;
}

export default AuthWrapper;