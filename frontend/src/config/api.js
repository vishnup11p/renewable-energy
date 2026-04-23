// API Configuration
// In production on Vercel, use relative URLs (same domain)
// In development, use localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

export default API_BASE_URL;
