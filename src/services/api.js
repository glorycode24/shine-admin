import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// This is the interceptor that attaches the token
api.interceptors.request.use(
  (config) => {
    // 👇 MAKE SURE THIS KEY IS CORRECT 👇
    // This MUST exactly match the key you use in your AuthContext's login function.
    const token = localStorage.getItem('admin_jwt_token'); 
    
    console.log("Interceptor: Found token?", token ? "Yes" : "No"); // For debugging

    if (token) {
      // If the token is found, attach it to the Authorization header
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log("Interceptor: Attaching token to header:", config.headers['Authorization']); // For debugging
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;