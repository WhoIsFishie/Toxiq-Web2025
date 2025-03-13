import axios from 'axios';

// Base URL for the API
const BASE_URL = 'https://api.toxiq.xyz/api';

// Create an axios instance with default configurations
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to add authentication token to requests
apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Authentication Service
export const AuthService = {
    // Telegram Web Login
    webLogin: async (initData: string) => {
        const response = await apiClient.post('/Auth/TG_WEB_LOGIN', { OTP: initData });
        return response.data;
    },

    // Debug Login (if needed)
    debugLogin: async (loginDto: any) => {
        const response = await apiClient.post('/Auth/DebugLogin', loginDto);
        return response.data;
    }
};

// User Service
export const UserService = {
    // Get current user profile
    getMe: async () => {
        const response = await apiClient.get('/User/GetMe');
        return response.data;
    },

    // Get user by username
    getUserByUsername: async (username: string) => {
        const response = await apiClient.get(`/User/GetUser/${username}`);
        return response.data;
    },

    // Edit user profile
    editProfile: async (profileData: any) => {
        const response = await apiClient.post('/User/EditUserProfile', profileData);
        return response.data;
    },

    // Change username
    changeUsername: async (username: string) => {
        const response = await apiClient.get(`/User/ChangeUsername?username=${username}`);
        return response.data;
    },

    // Get user's posts
    getUserPosts: async (username: string) => {
        const response = await apiClient.get(`/User/GetUserPosts/${username}`);
        return response.data;
    },

    // Get notifications
    getNotifications: async () => {
        const response = await apiClient.get('/User/GetNotification');
        return response.data;
    }
};

// Post Service
export const PostService = {
    // Get feed posts
    getFeed: async (searchFilter: any) => {
        const response = await apiClient.post('/Post/Feed', searchFilter);
        return response.data;
    },

    // Get specific post
    getPost: async (postId: string) => {
        const response = await apiClient.get(`/Post/GetPost/${postId}`);
        return response.data;
    },

    // Publish a new post
    publishPost: async (postData: any) => {
        const response = await apiClient.post('/Post/Publish', postData);
        return response.data;
    },

    // Like a post
    likePost: async (postId: string) => {
        const response = await apiClient.get(`/Post/Upvote/${postId}`);
        return response.data;
    },

    // Dislike a post
    dislikePost: async (postId: string) => {
        const response = await apiClient.get(`/Post/Downvote/${postId}`);
        return response.data;
    },

    // Remove vote
    removeVote: async (postId: string) => {
        const response = await apiClient.get(`/Post/Deletevote/${postId}`);
        return response.data;
    },

    // Add to the PostService in apiClient.ts
    getPrompt: async (promptId: string) => {
        const response = await apiClient.get(`/Post/GetPrompt/${promptId}`);
        return response.data;
    }
};

// Add to apiClient.ts or create if it doesn't exist
export const NotesService = {
    getNote: async (noteId: string) => {
        const response = await apiClient.get(`/Notes/GetNote/${noteId}`);
        return response.data;
    }
    // ...other methods
};

// Comment Service
export const CommentService = {
    // Get comments for a post
    getComments: async (commentFilter: any) => {
        const response = await apiClient.post('/Comment/GetComments', commentFilter);
        return response.data;
    },

    // Submit a comment
    submitComment: async (commentData: any) => {
        const response = await apiClient.post('/Comment/MakeComment', commentData);
        return response.data;
    },

    // Like a comment
    likeComment: async (commentId: string) => {
        const response = await apiClient.get(`/Comment/Upvote/${commentId}`);
        return response.data;
    },

    // Dislike a comment
    dislikeComment: async (commentId: string) => {
        const response = await apiClient.get(`/Comment/Downvote/${commentId}`);
        return response.data;
    }
};

// Sticker Service
export const StickerService = {
    // Get sticker pack
    getStickerPack: async (packName: string = 'pepo') => {
        const response = await apiClient.get(`/Sticker/GetPack/${packName}`);
        return response.data;
    }
};

// Error Handling Utility
export const handleApiError = (error: any) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('API Error Response:', error.response.data);
        console.error('Status Code:', error.response.status);

        // You might want to add more specific error handling based on status codes
        switch (error.response.status) {
            case 401:
                // Unauthorized - maybe clear token and redirect to login
                localStorage.removeItem('token');
                window.location.href = '/login';
                break;
            case 403:
                // Forbidden
                break;
            case 404:
                // Not Found
                break;
            case 500:
                // Server Error
                break;
            default:
                break;
        }

        return error.response.data;
    } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        return { message: 'No response from server' };
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        return { message: 'An unexpected error occurred' };
    }
};

export default apiClient;