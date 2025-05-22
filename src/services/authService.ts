// src/services/authService.ts
import { initData } from '@telegram-apps/sdk-react';
import { AuthService } from './apiClient'; // Assuming handleApiError might be used or AuthService.webLogin throws structured errors

// Define a custom error class for authentication specific issues if desired
export class AuthError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'AuthError';
  }
}

export const authenticateUser = async () => {
    const rawInitData = initData.raw();

    if (!rawInitData) {
        console.error('No init data available');
        throw new AuthError('Telegram initialization data is missing. Authentication cannot proceed.');
    }

    try {
        const response = await AuthService.webLogin(rawInitData);

        if (response && response.token) {
            localStorage.setItem('token', response.token);
            return true;
        } else {
            // This case handles if webLogin succeeds (2xx) but token is missing
            console.error('Authentication failed: No token received from server.');
            throw new AuthError('Authentication failed: No token received from server.');
        }
    } catch (error: any) {
        // Errors from AuthService.webLogin (e.g. network, 500, 401) will be caught here.
        // apiClient.ts's handleApiError might have already processed `error` if it's an AxiosError.
        console.error('Authentication error during webLogin:', error);

        // Re-throw a new AuthError or the original error.
        // If error is already structured by handleApiError, it might be good to preserve it.
        // For simplicity here, we'll wrap it.
        throw new AuthError(`Authentication failed: ${error.message || 'An unknown error occurred'}`, error);
    }
};