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
    // First try cookie
    const tokenFromCookie = getTokenFromCookie();
    if (tokenFromCookie) {
        return tokenFromCookie;
    }
    
    // Fallback to localStorage
    return localStorage.getItem('luxsuv_token');
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
        
        // Log all cookies before login
        console.log('Cookies before login:', document.cookie);
        
        const res = await apiClient.post('/login', {
            email:email,
            password:password,
        });
        console.log('Login response:', {
            status: res.status,
            headers: Object.fromEntries(
                Object.entries(res.headers).filter(([key]) => 
                    key.toLowerCase().includes('cookie') || 
                    key.toLowerCase().includes('set-cookie')
                )
            ),
            data: res.data
        });
        
        // Log all cookies after login
        console.log('Cookies after login:', document.cookie);
        
        // Check if token is in response data and store it manually if needed
        if (res.data && res.data.token) {
            console.log('Token found in response data, storing manually');
            // Store in localStorage as fallback
            localStorage.setItem('luxsuv_token', res.data.token);
            // Try to set cookie manually
            document.cookie = `luxsuv_token=${res.data.token}; path=/; max-age=86400`;
        }
        
        // Check if token is set in cookies after login
        setTimeout(() => {
            const token = getTokenFromCookie();
            console.log('Token after login:', token ? token.substring(0, 20) + '...' : 'No token found');
            
            // Also check localStorage
            const localToken = localStorage.getItem('luxsuv_token');
            console.log('Token in localStorage:', localToken ? localToken.substring(0, 20) + '...' : 'No token in localStorage');
        }, 100);
        
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

