import axios from 'axios';

// Create a new Axios instance with a custom configuration
const api = axios.create({
  // 1. Set the base URL for all requests
  baseURL: 'http://localhost:8080', // Your backend server's address
});

/*
  2. The Magic of Interceptors (for when you add login)

  Interceptors allow you to run code before a request is sent or after a response is received.
  This is the perfect place to automatically add your JWT token to the headers.
*/
api.interceptors.request.use(
  (config) => {
    // Get the token from wherever you store it (e.g., localStorage)
    const token = localStorage.getItem('jwt_token'); 
    
    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config; // Return the modified config
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Export the configured instance to be used throughout your app
export default api;