// src/services/authService.ts
import { initData } from '@telegram-apps/sdk-react';
import { AuthService } from './apiClient';

export const authenticateUser = async () => {
    try {
        // Get the raw init data from Telegram
        const rawInitData = initData.raw();

        if (!rawInitData) {
            console.error('No init data available');
            return false;
        }

        // Send the init data to your backend for verification and authentication
        const response = await AuthService.webLogin(rawInitData);

        // Store the token in local storage
        if (response && response.token) {
            localStorage.setItem('token', response.token);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Authentication error:', error);
        return false;
    }
};