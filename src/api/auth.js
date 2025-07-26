import axios from "axios";

const baseURL = 'https://luxsuv-v4.onrender.com'

// Get token from cookie
function getTokenFromCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.split('=').map(c => c.trim());
        if (name === 'luxsuv_token') {
            return value;
        }
    }
    return null;
}

// Get token from cookie or localStorage
function getToken() {
    // For cross-origin requests, use localStorage first
    const localToken = localStorage.getItem('luxsuv_token');
    if (localToken) {
        return localToken;
    }
    
    // Fallback to cookie (only works if same domain)
    return getTokenFromCookie();
}
// Create axios instance with interceptors
const apiClient = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include token in Authorization header
apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Adding Authorization header with token:', token.substring(0, 20) + '...');
    } else {
        console.log('No token found for request');
    }
    return config;
});

export async function  login(email, password) {
    try{
        console.log('Attempting login for:', email);
        
        const res = await apiClient.post('/login', {
            email:email,
            password:password,
        });
        
        console.log('Login response data:', res.data);
        
        // Store token from response data
        let token = null;
        
        // Try to extract token from various possible response formats
        if (res.data?.token) {
            token = res.data.token;
            console.log('Token found in response.token');
        } else if (res.data?.access_token) {
            token = res.data.access_token;
            console.log('Token found in response.access_token');
        } else if (res.data?.jwt) {
            token = res.data.jwt;
            console.log('Token found in response.jwt');
        } else {
            console.log('No token found in response data, checking cookies...');
        }
        
        if (token) {
            console.log('Storing token in localStorage:', token.substring(0, 20) + '...');
            localStorage.setItem('luxsuv_token', res.data.token);
        } else {
            console.warn('No token found in login response!');
            console.log('Full response data:', res.data);
        }
        
        if (res.status !== 200) throw new Error(
            `Error logging in: ${res.status}`
        )
        return res;
    } catch (e) {
        console.error('Login error details:', e.response?.data);
        throw new Error(e.response?.data?.error || e.message);
    }
}

export async function checkAuth() {
    try {
        console.log('Checking authentication...');
        const token = getToken();
        console.log('Token available for auth check:', token ? 'Yes' : 'No');
        
        const res = await apiClient.get('/users/me');
        console.log('Auth check response:', {
            status: res.status,
            data: res.data,
        });
        return res.data;
    } catch (error) {
        console.error('Auth check failed:', error.response?.data);
        throw new Error(error.response?.data?.error || error.message || 'Authentication failed');
    }

}

export async function logout() {
    try {
        await apiClient.post('/logout', {});
        // Clear any local token storage if needed
        localStorage.removeItem('luxsuv_token');
        // Clear cookie
        document.cookie = 'luxsuv_token=; path=/; max-age=0';
        console.log('Logout successful');
    } catch (error) {
        console.error('Logout error:', error);
    }
}

