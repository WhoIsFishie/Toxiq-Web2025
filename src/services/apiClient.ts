import axios from 'axios';

// Base URL for the API
const BASE_URL = 'https://toxiq.xyz/api';

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

// Custom Error class to include status code and original data
export class ApiError extends Error {
  public status?: number;
  public data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data; // Store original error data if needed
  }
}

// Response Interceptor to handle errors globally
apiClient.interceptors.response.use(
  response => response, // Pass through successful responses
  (error: any) => { // error can be AxiosError or other types
    console.error('API Error Interceptor caught:', error.config?.url, error.response?.status, error.message);

    if (error.response) {
      // Server responded with a status code out of 2xx range
      const status = error.response.status;
      let message = `Request failed: ${status}`;
      
      const responseData = error.response.data;
      if (responseData) {
        if (typeof responseData === 'string' && responseData.length > 0) {
          message = responseData;
        } else if (responseData.message && typeof responseData.message === 'string') {
          message = responseData.message;
        } else if (responseData.error && typeof responseData.error === 'string') {
          message = responseData.error;
        } else if (Object.keys(responseData).length > 0) {
          // Fallback if data is an object but no specific message field
          try {
            message = `Request failed: ${status} - ${JSON.stringify(responseData).substring(0, 150)}`;
          } catch (e) {
            message = `Request failed: ${status} - (Error serializing response data)`;
          }
        }
      }
      
      // Example: Clear token if 401 and token exists, but do not navigate
      // if (status === 401 && localStorage.getItem('token')) {
      //   localStorage.removeItem('token');
      //   console.warn("Token removed due to 401 error. User needs to re-authenticate.");
      // }
      
      return Promise.reject(new ApiError(message, status, error.response.data));
    } else if (error.request) {
      // Request was made but no response received (e.g., network error)
      return Promise.reject(new ApiError('Network error: No response received from server.', undefined, error.request));
    } else {
      // Something happened in setting up the request that triggered an Error
      return Promise.reject(new ApiError(`Request setup error: ${error.message || 'Unknown error'}`, undefined, error));
    }
  }
);

// The old standalone handleApiError function is no longer needed
// as its logic is now integrated into the response interceptor.
/*
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
                // window.location.href = '/login'; // Removed
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

        // Instead of returning error.response.data, throw an error.
        // throw new ApiError(error.response.data?.message || `Request failed with status ${error.response.status}`, error.response.status, error.response.data);
        // This logic is now in the interceptor
        return error.response.data; // Kept for reference, but interceptor handles rejection
    } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        // throw new ApiError('Network error: No response received from server.');
        return { message: 'No response from server' };
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        // throw new ApiError(`Request setup error: ${error.message}`);
        return { message: 'An unexpected error occurred' };
    }
};
*/

export default apiClient;